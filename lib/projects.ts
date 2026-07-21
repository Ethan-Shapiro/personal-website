export type Accent = "indigo" | "emerald" | "amber" | "rose" | "sky";

export type Status = "Concept" | "Prototype" | "Shipped";

export type DesignDecision = {
  title: string;
  rationale: string;
};

export type Project = {
  slug: string;
  title: string;
  label: string;
  tagline: string;
  tags: string[];
  accent: Accent;
  status: Status;
  year: number;
  placeholder: boolean;
  situation: string;
  task: string;
  dataChallenges: string;
  action: string;
  tradeoffs: string;
  designDecisions: DesignDecision[];
  deployment: string;
  impact: string;
  links: {
    repo?: string;
    demo?: string;
  };
};

export const projects: Project[] = [
  {
    slug: "atc-routing-agent",
    title: "Autonomous ATC Routing Agent",
    label: "ATC Agent",
    tagline: "Real controllers hand off traffic between roles — so do these agents.",
    tags: ["LangGraph", "MCP + RAG", "PostGIS", "FastAPI", "Airflow"],
    accent: "sky",
    status: "Prototype",
    year: 2026,
    placeholder: false,
    situation:
      "Air traffic control is a real-time handoff chain — Clearance Delivery, Ground, Tower, Approach — where every decision has to be grounded in exact regulations and exact geometry, not vibes. Most agent demos either hardcode the domain logic or let the LLM estimate things it has no business estimating, like whether two runways physically intersect.",
    task: "Build a multi-agent system simulating the real 4-role ATC handoff chain around Santa Barbara Municipal Airport (KSBA), with every agent grounded in live geospatial data and the actual FAA rulebook — and route anything requiring exact math to a deterministic tool instead of leaving it to the model.",
    dataChallenges:
      "Live flight telemetry has to be polled from the OpenSky Network within its rate limits (a configurable poll interval plus an active daily-credit-budget guard), written into a PostGIS schema, and checked for proximity conflicts — while the full FAA rulebook (JO 7110.65 and JO 7360.1) needs to be searchable well enough for an agent to cite the actual regulation behind a decision, not a paraphrase.",
    action:
      "Built a 4-role LangGraph orchestration (Clearance Delivery → Ground → Tower → Approach for departures, reversed for arrivals) where each role hands off to an explicitly named next role rather than an implicit lookup, so both directions work without special-casing. Every reasoning node calls an MCP server exposing query_radar (live PostGIS aircraft state) and query_faa_rules (a FAISS index over the FAA rulebook) tools. A live dashboard, served directly from the FastAPI app, visualizes the airport diagram and scenario playback, including exactly which tools were called for each decision.",
    tradeoffs:
      "Anchored the whole design on one rule: LLMs cannot do math. Tower's runway-intersection check — whether it's safe to clear traffic onto a runway that physically crosses another — is a real PostGIS distance query against seeded runway geometry, not model inference. That means giving up some flexibility in edge cases the deterministic check doesn't cover, in exchange for a safety-critical decision that's actually verified correct instead of merely plausible-sounding.",
    designDecisions: [
      {
        title: "Deterministic guardrails for anything requiring exact math",
        rationale:
          "Tower's runway-conflict check calls a real geospatial query rather than asking the model to estimate a distance or threshold — live-verified correct in both directions (must-hold and should-clear cases), not just the happy path.",
      },
      {
        title: "Explicitly named handoffs, not an implicit “next” lookup",
        rationale:
          "Each role hands off by naming the specific next role rather than following a generic sequence pointer, so the same graph handles departures (Clearance → Ground → Tower → Approach) and arrivals (reversed) without special-casing either direction.",
      },
    ],
    deployment:
      "An MCP server and FAISS-backed RAG pipeline ground every agent decision in the real FAA rulebook and live radar state. A PostGIS + OpenSky Network pipeline ingests flight telemetry with a rate-limit-aware credit budget, with Airflow handling minute-scale housekeeping outside the hot path. The whole stack runs in Docker/Docker Compose, with FastAPI serving the live scenario dashboard.",
    impact:
      "Most of the core is built and live-verified end to end: the geospatial pipeline, the FAA-rulebook RAG and MCP server, the 4-role LangGraph orchestration, and Tower's deterministic safety check. Still growing — live auto-triggering off real state transitions (currently reached via a manual trigger endpoint), a coordination-scoring rework, and an optional phraseology fine-tune are on the roadmap.",
    links: {},
  },
  {
    slug: "telemetry-anomaly-detection",
    title: "Real-Time Telemetry Anomaly Detection Pipeline",
    label: "Telemetry Pipeline",
    tagline: "Catching sensor anomalies in the stream, not after the fact.",
    tags: ["Kafka/Redpanda", "Isolation Forest", "TimescaleDB", "Grafana", "Docker"],
    accent: "indigo",
    status: "Shipped",
    year: 2026,
    placeholder: false,
    situation:
      "Streaming sensor telemetry (fuel pressure, engine temperature) is noisy by nature — duplicate readings, out-of-order timestamps, and value spikes are the norm, not the exception. Catching a real anomaly inside that noise in real time, rather than after a batch job runs, is what actually matters for a monitoring system.",
    task: "Build an end-to-end streaming pipeline that ingests noisy sensor telemetry, scores each reading for anomalies as it arrives, and visualizes results live — while handling the real distributed-systems problems a naive version would ignore.",
    dataChallenges:
      "A Python producer simulates sensor telemetry with realistic dirty-data injection: duplicate events, out-of-order timestamps, and artificial value spikes. Because readings stream through a Kafka-compatible broker to multiple consumer instances, deduplication and ordering can't be solved with a simple in-memory check — they have to hold up across restarts and multiple consumers.",
    action:
      "Built a Python producer emitting sensor telemetry into Redpanda (a Kafka-compatible broker), a stream processor that deduplicates events and scores each reading with a pre-trained Isolation Forest model, and a TimescaleDB sink writing clean, labeled data to a time-partitioned hypertable. An auto-provisioned Grafana dashboard refreshes every 5 seconds to visualize results live, with the whole stack orchestrated via Docker/docker-compose.",
    tradeoffs:
      "Deduplication needed to be both fast and actually correct across multiple consumer instances — an in-memory cache alone is fast but not durable or coordinated, and a database constraint alone is correct but too slow to check on every message. Used both: an in-memory TTL cache handles the common case quickly, with a unique database constraint as the real correctness guarantee underneath it.",
    designDecisions: [
      {
        title: "Per-sensor z-scores instead of raw values",
        rationale:
          "The Isolation Forest was first trained on raw sensor values (fuel pressure ~3000psi, engine temperature ~650°F) and flagged 100% of readings as anomalies — the learned baseline didn't generalize across sensors with wildly different physical units. Scoring on a rolling per-sensor z-score instead let one model generalize across sensor types.",
      },
      {
        title: "Two-layer deduplication, not one",
        rationale:
          "An in-memory TTL cache catches duplicates fast, but isn't durable or shared across consumer instances. A unique database constraint is the real correctness guarantee underneath it — the cache is a speed optimization, not the safety net.",
      },
    ],
    deployment:
      "Orchestrated with Docker/docker-compose (Redpanda, TimescaleDB, Grafana). The consumer explicitly handles SIGTERM/SIGINT so it leaves its Kafka consumer group cleanly on shutdown, instead of leaving a “zombie” member that stalls rebalancing for tens of seconds.",
    impact:
      "A working demonstration of real streaming-systems judgment, not just a model in a notebook: the pipeline handles out-of-order data, deduplicates correctly across consumers, and recovers cleanly from restarts — the kind of correctness problems that only show up once data is actually moving in real time.",
    links: {},
  },
  {
    slug: "agentic-support-bridge",
    title: "Agentic Enterprise Support Bridge",
    label: "Support Agent",
    tagline: "A Slack bot that escalates instead of hallucinating.",
    tags: ["Agentic AI", "RAG", "Pinecone", "FastAPI", "Slack + Jira"],
    accent: "emerald",
    status: "Shipped",
    year: 2026,
    placeholder: false,
    situation:
      "Employee IT-support questions either sit unanswered or require a human to look up the same internal docs over and over. An AI agent could answer the easy ones instantly — but a confidently wrong answer to an IT question is worse than no answer at all, so the failure mode had to be “ask a human” instead of “guess.”",
    task: "Build a Slack bot that answers employee support questions from an internal knowledge base with a hard guarantee against hallucination, and automatically escalates anything it can't answer confidently into a real Jira ticket.",
    dataChallenges:
      "The internal knowledge base has to be embedded into Pinecone before the agent can retrieve from it, and that seeding process is long enough to hit rate limits partway through. A naive script would either restart from scratch or double-embed rows on every retry.",
    action:
      "Built the core agent with Pydantic AI (an agent framework) and Gemini, backed by Pinecone for retrieval, with exactly two tools: search_internal_docs and escalate_to_jira. Hard rules in the system prompt forbid the agent from answering out of its own training knowledge — every factual claim has to come from a retrieved document, or the question gets escalated. Built a FastAPI webhook that receives Slack's Events API callbacks, verifies them with HMAC signatures, and acknowledges immediately before processing in the background so Slack doesn't time out; the escalation path creates a real Jira issue with project, priority, and description when the agent isn't confident.",
    tradeoffs:
      "Deliberately traded a lower “answer rate” for zero fabricated answers: the system prompt hard-forbids answering from the model's own general knowledge, so anything not clearly grounded in a retrieved document gets escalated to a human instead of guessed at. For internal support tooling, a wrong answer erodes trust faster than a slower, correctly-routed one.",
    designDecisions: [
      {
        title: "Escalate instead of hallucinate",
        rationale:
          "The agent's system prompt hard-forbids answering from its own training knowledge — every claim must trace back to a retrieved document, or the question becomes a real Jira ticket instead of a guessed answer. A deliberate hallucination-safety pattern, not just a RAG pipeline for its own sake.",
      },
      {
        title: "Immediate ack, background processing",
        rationale:
          "Slack times out webhook responses quickly, so the FastAPI handler acknowledges the event immediately and runs the actual retrieval and escalation logic in the background, instead of blocking Slack's callback on model inference latency.",
      },
    ],
    deployment:
      "A FastAPI webhook (HMAC-verified) in front of the Pydantic AI agent, calling Gemini and Pinecone. The Pinecone knowledge-base seeding script is resumable — if interrupted by a rate limit, re-running it skips rows already embedded instead of restarting from scratch or double-embedding.",
    impact:
      "A working, safe-by-default support agent: the full loop — Slack question in, grounded answer or Jira escalation out — runs end to end, with the hallucination guardrail as the actual point of the project rather than an afterthought.",
    links: {},
  },
  {
    slug: "lol-win-predictor",
    title: "League of Legends Post-Draft Win Predictor",
    label: "LoL Win Predictor",
    tagline: "A credible win-probability signal, scoped to where it's real.",
    tags: ["PyTorch", "Transformers", "Riot API", "Feature Engineering"],
    accent: "amber",
    status: "Shipped",
    year: 2025,
    placeholder: false,
    situation:
      "Champion select is widely believed to shape who wins a League of Legends match, but most public “draft predictor” tools claim to forecast the winner before the draft even happens — a much harder, noisier problem than the accuracy numbers they report can actually support.",
    task: "Build a model that predicts the match winner immediately after champion select locks in — not before — using real ranked-match data, and be explicit about that framing so the accuracy number means what it claims to mean.",
    dataChallenges:
      "Champion-selection data from the Riot API captures rank, player, and pick information, but the signal that actually differentiates outcomes isn't the picks themselves — it's what differentiates two players on the same champion across rank tiers, which has to be engineered as a feature rather than read off the raw data.",
    action:
      "Used the Riot API to collect match data, engineered features from rank, player, and champion-selection differences, and trained a transformer-based model to predict the winner immediately after champion select, reaching 57.34% accuracy.",
    tradeoffs:
      "Scoped the prediction strictly to post-draft: 57.34% accuracy is a strong, credible result for a prediction made after champion select locks in, but the same number framed as a pre-draft claim would be much weaker and less credible. Keeping the framing honest mattered more than a punchier-sounding but overstated headline.",
    designDecisions: [
      {
        title: "Post-draft, not pre-draft",
        rationale:
          "The model always predicts after champion select locks in. Framing the same 57.34% accuracy as a pre-draft prediction would overstate what the underlying signal can actually support — the honest framing is a deliberate choice, not a limitation to hide.",
      },
      {
        title: "One model output, two uses",
        rationale:
          "The same win-probability output doubles as a matchmaking-quality signal — how balanced a given lobby is right after lock-in — rather than only being read as a pure win/loss prediction.",
      },
    ],
    deployment:
      "A data and modeling pipeline (Riot API → feature engineering → transformer training) rather than a hosted service — built to validate the modeling approach and framing, not as a deployed product.",
    impact:
      "A post-draft win-probability signal accurate enough (57.34%) to be credible on its own terms, and honest about the boundary of what it can claim — a smaller, truer result instead of a bigger, unsupported one.",
    links: {},
  },
  {
    slug: "valorant-meta-sentiment-tracker",
    title: "VALORANT Agent Meta & Sentiment Tracker",
    label: "Meta Tracker",
    tagline: "Where community “meta” talk diverges from what's actually winning.",
    tags: ["Sentiment Analysis", "Riot API", "Statistical Modeling", "Reddit API"],
    accent: "rose",
    status: "Shipped",
    year: 2026,
    placeholder: false,
    situation:
      "VALORANT players constantly argue about which agents are “meta” (strong) based on forum sentiment and vibes, but that community perception doesn't always track what's actually happening in ranked matches.",
    task: "Quantify, with real data instead of vibes, where community sentiment about agent strength diverges from actual ranked win-rate performance — across multiple game patches, since both balance and mood shift every patch.",
    dataChallenges:
      "Joining two very different, messy real-world sources: roughly 5,000 unstructured Reddit comments needing sentiment scoring, and 160,000+ agent picks pulled from Riot's official match API, aligned across 11 separate game patches that each shifted the underlying balance.",
    action:
      "Built an end-to-end pipeline joining Reddit sentiment (scored with VADER) with real ranked match data from Riot's API across 11 patches, then built a statistical model ranking each agent's win rate against its sentiment score relative to its patch-mates, to surface where the two diverged most.",
    tradeoffs:
      "Used VADER, a fast lexicon-based sentiment scorer, over a heavier transformer-based sentiment model — the goal was ranking thousands of comments per patch against each other, not maximizing precision on any single comment, so speed and scale mattered more than nuance.",
    designDecisions: [
      {
        title: "Ranked within each patch, not against an all-time baseline",
        rationale:
          "Both game balance and community mood shift with every patch, so an agent's win-rate/sentiment gap is only meaningful measured against its patch-mates — comparing across patches would conflate balance changes with meta-discourse changes.",
      },
      {
        title: "Lexicon-based sentiment over a heavier model",
        rationale:
          "VADER trades per-comment nuance for speed at scale — appropriate here since the output that mattered was a relative ranking across thousands of comments per patch, not a precise sentiment score for any one comment.",
      },
    ],
    deployment:
      "A data pipeline and analysis project (Reddit + Riot API ingestion → sentiment scoring → statistical ranking), not a hosted service.",
    impact:
      "Found the widest perception gap in the whole dataset in patch 12.02: an agent with a 63% win rate carrying a sentiment score of -0.06 — a case where the community's read on an agent's strength was almost exactly backwards.",
    links: {},
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
