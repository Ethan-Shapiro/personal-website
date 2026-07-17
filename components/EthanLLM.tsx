"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ETHANLLM_STARTER_QUESTIONS } from "@/lib/ethanllm-context";

type Message = { role: "user" | "assistant"; content: string };
type SelectionInfo = { text: string; x: number; y: number };

const MAX_TURNS = 20;
const TYPING_CHARS_PER_TICK = 2;
const TYPING_INTERVAL_MS = 15;

function IconRefresh({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 4.5v4h-4M4 15.5v-4h4M4.5 8a5.5 5.5 0 0 1 9.4-3.6L16 6M15.5 12a5.5 5.5 0 0 1-9.4 3.6L4 14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClose({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconInfo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M10 9v4.5M10 6.75v.01"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSend({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 15.5V4.5M10 4.5L5 9.5M10 4.5l5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TypingDots({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-1${className ? ` ${className}` : ""}`}
      aria-label="EthanLLM is thinking"
    >
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" style={{ animationDelay: "0ms" }} />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" style={{ animationDelay: "200ms" }} />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" style={{ animationDelay: "400ms" }} />
    </div>
  );
}

function ChipButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
    >
      <span className="text-accent">↳</span>
      {label}
    </button>
  );
}

export function EthanLLM() {
  const [isOpen, setIsOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [followUps, setFollowUps] = useState<string[]>(ETHANLLM_STARTER_QUESTIONS);
  const [pendingQuote, setPendingQuote] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | null>(null);
  const [mounted, setMounted] = useState(false);
  const [typingContent, setTypingContent] = useState<string | null>(null);
  const [displayedLength, setDisplayedLength] = useState(0);

  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const turnCount = useRef(0);
  const pendingFollowUpsRef = useRef<string[]>([]);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTokenRef = useRef(0);

  // Site-wide "highlight text to ask about it" support.
  useEffect(() => {
    function handleMouseUp(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-ethanllm-panel]")) {
        setSelectionInfo(null);
        return;
      }

      const sel = window.getSelection();
      const text = sel?.toString().trim() ?? "";
      if (!sel || sel.isCollapsed || text.length < 3 || text.length > 400) {
        setSelectionInfo(null);
        return;
      }

      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setSelectionInfo({
        text,
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }

    function handleMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target?.closest("[data-ethanllm-selection-trigger]")) {
        setSelectionInfo(null);
      }
    }

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading, displayedLength]);

  // Reveals typingContent a few characters at a time, like it's being typed
  // live. Once the reveal catches up to the full answer, commits it to the
  // message list and surfaces the follow-up chips that were held back until now.
  //
  // The `token` guard exists because this effect can double-invoke (React
  // Strict Mode re-runs effects once in dev, and Fast Refresh can too) —
  // without it, two intervals racing to finalize the same answer would push
  // it into `messages` twice.
  useEffect(() => {
    if (typingContent === null) return;
    const content = typingContent;
    const token = ++typingTokenRef.current;

    typingIntervalRef.current = setInterval(() => {
      if (typingTokenRef.current !== token) {
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        return;
      }
      setDisplayedLength((len) => {
        const next = Math.min(len + TYPING_CHARS_PER_TICK, content.length);
        if (next >= content.length && typingTokenRef.current === token) {
          if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
          typingTokenRef.current = -1; // mark this session as finalized
          setMessages((prev) => [...prev, { role: "assistant", content }]);
          setFollowUps(pendingFollowUpsRef.current);
          setTypingContent(null);
        }
        return next;
      });
    }, TYPING_INTERVAL_MS);

    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [typingContent]);

  useEffect(() => {
    // Standard SSR-safe portal pattern: document.body doesn't exist on the server,
    // so the portal only mounts after the client-side effect runs.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  function askAboutSelection() {
    if (!selectionInfo) return;
    setPendingQuote(selectionInfo.text);
    setIsOpen(true);
    window.getSelection()?.removeAllRanges();
    setSelectionInfo(null);
  }

  function resetConversation() {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    typingTokenRef.current = -1;
    setMessages([]);
    setFollowUps(ETHANLLM_STARTER_QUESTIONS);
    setPendingQuote(null);
    setError(null);
    setTypingContent(null);
    setDisplayedLength(0);
    turnCount.current = 0;
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading || typingContent !== null) return;

    if (turnCount.current >= MAX_TURNS) {
      setError(
        "That's a lot of questions! Let's continue this over email — check the Contact section.",
      );
      return;
    }

    const quote = pendingQuote ?? undefined;
    const nextMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInputValue("");
    setPendingQuote(null);
    setFollowUps([]);
    setError(null);
    setIsLoading(true);
    turnCount.current += 1;

    try {
      const res = await fetch("/api/ethanllm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history: messages, quote }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong — try again?");
        setIsLoading(false);
        return;
      }

      pendingFollowUpsRef.current = Array.isArray(data.followUps) ? data.followUps : [];
      setDisplayedLength(0);
      setTypingContent(data.answer);
    } catch {
      setError("Couldn't reach EthanLLM — check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(inputValue);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-mono text-xs tracking-wide text-muted transition-colors hover:border-accent hover:text-accent"
      >
        <span className="text-accent">✦</span> ETHANLLM
      </button>

      {mounted &&
        selectionInfo &&
        createPortal(
          <button
            type="button"
            data-ethanllm-selection-trigger
            onClick={askAboutSelection}
            style={{
              left: selectionInfo.x,
              top: Math.max(selectionInfo.y - 44, 8),
            }}
            className="fixed z-50 -translate-x-1/2 rounded-full bg-foreground px-3 py-1.5 font-mono text-xs whitespace-nowrap text-background shadow-lg transition-opacity"
          >
            Ask EthanLLM about this →
          </button>,
          document.body,
        )}

      {mounted &&
        isOpen &&
        createPortal(
          <div
            ref={panelRef}
            data-ethanllm-panel
            className="fixed inset-x-4 top-20 bottom-4 z-50 flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl sm:inset-x-auto sm:top-20 sm:right-6 sm:bottom-6 sm:w-[400px]"
          >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold tracking-wide text-foreground">
                ETHANLLM
              </span>
              <button
                type="button"
                onClick={() => setShowInfo((v) => !v)}
                aria-label="About EthanLLM"
                className="text-muted transition-colors hover:text-accent"
              >
                <IconInfo className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={resetConversation}
                aria-label="Reset conversation"
                className="text-muted transition-colors hover:text-accent"
              >
                <IconRefresh className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                className="text-muted transition-colors hover:text-accent"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>
          </div>

          {showInfo && (
            <p className="border-b border-border bg-background px-4 py-2.5 text-xs text-muted">
              EthanLLM is a real, live chat backed by an LLM — grounded in facts about Ethan, not
              scripted. Ask anything, or highlight text anywhere on the site to ask about it.
            </p>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 && !isLoading && typingContent === null ? (
              <p className="font-serif text-2xl text-foreground">Ask me anything.</p>
            ) : (
              <div className="flex flex-col gap-5">
                {messages.map((m, i) =>
                  m.role === "user" ? (
                    <p key={i} className="text-sm font-medium text-foreground">
                      {m.content}
                    </p>
                  ) : (
                    <p key={i} className="font-serif text-lg text-foreground">
                      {m.content}
                    </p>
                  ),
                )}
                {typingContent !== null && (
                  <p className="font-serif text-lg text-foreground">
                    {typingContent.slice(0, displayedLength)}
                    <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[3px] animate-pulse bg-foreground" />
                  </p>
                )}
              </div>
            )}

            {isLoading && <TypingDots className="mt-5" />}

            {error && <p className="mt-5 text-sm text-red-500">{error}</p>}

            {!isLoading && typingContent === null && followUps.length > 0 && (
              <div className="mt-5 flex flex-col">
                {followUps.map((q) => (
                  <ChipButton key={q} label={q} onClick={() => sendMessage(q)} />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border p-3">
            {pendingQuote && (
              <div className="mb-2 flex items-start gap-2 rounded-md border border-border bg-background px-3 py-2">
                <span className="text-accent">&ldquo;</span>
                <p className="flex-1 text-xs text-muted italic">{pendingQuote}</p>
                <button
                  type="button"
                  onClick={() => setPendingQuote(null)}
                  aria-label="Clear quote"
                  className="text-muted transition-colors hover:text-accent"
                >
                  <IconClose className="h-3 w-3" />
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={pendingQuote ? "Ask about this quote..." : "Ask me anything..."}
                disabled={isLoading || typingContent !== null}
                className="w-full flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || typingContent !== null || !inputValue.trim()}
                aria-label="Send"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-opacity disabled:opacity-40"
              >
                <IconSend className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>,
          document.body,
        )}
    </>
  );
}
