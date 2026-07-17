"use client";

import { useId } from "react";
import type { Accent } from "@/lib/projects";

const ACCENT_STOPS: Record<Accent, [string, string]> = {
  indigo: ["#818cf8", "#312e81"],
  emerald: ["#34d399", "#065f46"],
  amber: ["#fbbf24", "#92400e"],
  rose: ["#fb7185", "#881337"],
};

const ACCENT_PATTERN: Record<Accent, "grid" | "dots" | "waves" | "lines"> = {
  indigo: "grid",
  emerald: "dots",
  amber: "waves",
  rose: "lines",
};

export function ProjectPreviewArt({
  accent,
  className,
}: {
  accent: Accent;
  className?: string;
}) {
  const id = useId();
  const gradientId = `pv-gradient-${id}`;
  const patternId = `pv-pattern-${id}`;
  const [from, to] = ACCENT_STOPS[accent];
  const pattern = ACCENT_PATTERN[accent];

  return (
    <svg
      viewBox="0 0 400 225"
      className={className}
      role="img"
      aria-label={`Abstract ${accent} preview graphic`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>

        {pattern === "grid" && (
          <pattern
            id={patternId}
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 28 0 L 0 0 0 28"
              fill="none"
              stroke="white"
              strokeOpacity="0.16"
              strokeWidth="1"
            />
          </pattern>
        )}

        {pattern === "dots" && (
          <pattern
            id={patternId}
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="3" cy="3" r="1.6" fill="white" fillOpacity="0.22" />
          </pattern>
        )}

        {pattern === "waves" && (
          <pattern
            id={patternId}
            width="60"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 10 Q 15 0 30 10 T 60 10"
              fill="none"
              stroke="white"
              strokeOpacity="0.2"
              strokeWidth="1.5"
            />
          </pattern>
        )}

        {pattern === "lines" && (
          <pattern
            id={patternId}
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="20"
              stroke="white"
              strokeOpacity="0.18"
              strokeWidth="2"
            />
          </pattern>
        )}
      </defs>

      <rect width="400" height="225" fill={`url(#${gradientId})`} />
      <rect width="400" height="225" fill={`url(#${patternId})`} />
    </svg>
  );
}
