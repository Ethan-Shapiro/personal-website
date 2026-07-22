import { ETHANLLM_SYSTEM_PROMPT } from "@/lib/ethanllm-context";

type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

const MAX_MESSAGE_LENGTH = 500;
const MAX_QUOTE_LENGTH = 400;
const MAX_HISTORY_MESSAGES = 12;

// Gemini's OpenAI-compatible endpoint — same request/response shape as
// OpenAI's chat completions API, so the rest of this file doesn't need to
// know it's talking to Gemini under the hood.
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

// Gemini can return 503 ("model overloaded") under high demand, especially
// right after a new model launch — this clears on retry, so retry a couple
// times with backoff before giving up.
const RETRYABLE_STATUSES = new Set([429, 503]);
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 400;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  let lastResponse: Response;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    lastResponse = await fetch(url, init);
    if (!RETRYABLE_STATUSES.has(lastResponse.status)) return lastResponse;
    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
    }
  }
  return lastResponse!;
}

// gemini-3.6-flash is the current model (cheaper than 3.5-flash), but — like
// any freshly-launched model — can 503 under high demand. Fall back to the
// older, stable flash-lite tier rather than surfacing an error when that
// happens.
const PRIMARY_MODEL = "gemini-3.6-flash";
const FALLBACK_MODEL = "gemini-3.1-flash-lite";

// Despite response_format: json_object, models occasionally wrap the JSON in
// a markdown code fence or add a conversational preamble ("Here is the JSON
// requested: ```json ... ```"). Try a straight parse first, then fall back
// to pulling out the first {...} substring before giving up.
function parseModelJSON(raw: string): { answer?: string; followUps?: string[] } | null {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

async function callGemini(model: string, apiKey: string, payload: object): Promise<Response> {
  return fetchWithRetry(GEMINI_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ ...payload, model }),
  });
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "EthanLLM isn't configured yet — missing GEMINI_API_KEY." },
      { status: 500 },
    );
  }

  let body: { message?: unknown; history?: unknown; quote?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const message =
    typeof body.message === "string"
      ? body.message.slice(0, MAX_MESSAGE_LENGTH).trim()
      : "";
  if (!message) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const history: ChatMessage[] = Array.isArray(body.history)
    ? body.history
        .filter(
          (m): m is ChatMessage =>
            typeof m === "object" &&
            m !== null &&
            typeof (m as { content?: unknown }).content === "string",
        )
        .slice(-MAX_HISTORY_MESSAGES)
        .map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content.slice(0, MAX_MESSAGE_LENGTH),
        }))
    : [];

  const quote =
    typeof body.quote === "string" && body.quote.trim()
      ? body.quote.trim().slice(0, MAX_QUOTE_LENGTH)
      : undefined;

  const userContent = quote
    ? `The visitor highlighted this text on my site: "${quote}"\n\nTheir question: ${message}`
    : message;

  const primaryModel = process.env.GEMINI_MODEL || PRIMARY_MODEL;
  const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || FALLBACK_MODEL;

  const payload = {
    messages: [
      { role: "system", content: ETHANLLM_SYSTEM_PROMPT },
      ...history,
      { role: "user", content: userContent },
    ],
    temperature: 0.8,
    max_tokens: 400,
    response_format: { type: "json_object" },
    // Gemini 3.x models "think" before answering by default, and those
    // reasoning tokens count against max_tokens — for a short chat-widget
    // answer that just burns the budget before any visible text is
    // written, producing a truncated response. This isn't a task that
    // benefits from reasoning, so turn it off.
    reasoning_effort: "none",
  };

  let upstream: Response;
  try {
    upstream = await callGemini(primaryModel, apiKey, payload);

    if (!upstream.ok && fallbackModel && fallbackModel !== primaryModel) {
      console.error(
        `EthanLLM: ${primaryModel} failed with ${upstream.status}, falling back to ${fallbackModel}`,
      );
      upstream = await callGemini(fallbackModel, apiKey, payload);
    }
  } catch (err) {
    console.error("EthanLLM: failed to reach Gemini", err);
    return Response.json(
      { error: "EthanLLM couldn't reach its brain just now — try again in a bit." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    const errText = await upstream.text();
    console.error("EthanLLM: upstream error", upstream.status, errText);
    const message =
      upstream.status === 503
        ? "EthanLLM's model is getting hit hard right now — give it a few seconds and try again."
        : "EthanLLM is having trouble answering right now.";
    return Response.json({ error: message }, { status: 502 });
  }

  const data = await upstream.json();
  const raw: string = data?.choices?.[0]?.message?.content ?? "{}";
  const parsed = parseModelJSON(raw) ?? {};

  if (!parsed.answer) {
    console.error("EthanLLM: model response wasn't valid JSON, raw content:", raw);
  }

  return Response.json({
    answer:
      typeof parsed.answer === "string" && parsed.answer.trim()
        ? parsed.answer.trim()
        : "Hmm, I'm not sure how to answer that one.",
    followUps: Array.isArray(parsed.followUps)
      ? parsed.followUps.filter((q): q is string => typeof q === "string").slice(0, 3)
      : [],
  });
}
