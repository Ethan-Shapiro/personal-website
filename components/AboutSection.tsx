import { contactLinks } from "@/lib/contact";

const OUTSIDE_OF_WORK = [
  "traveling",
  "surfing",
  "trying new restaurants",
  "hot yoga (like really really hot — 115°, 40% humidity)",
];

export function AboutSection() {
  return (
    <section id="about" className="mx-auto max-w-[1600px] px-6 py-16">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr] sm:gap-8">
        <h2 className="font-mono text-sm tracking-wide text-accent">
          ABOUT
        </h2>
        <div className="max-w-2xl">
          <p className="text-lg text-foreground">
            I think a lot about data, systems, and where AI is actually
            useful versus just novel. Currently having the most fun building
            agents that make life easier — for me, and for my family.
          </p>

          <p className="mt-4 text-muted">
            Outside of data, models, and being a data science student, I&apos;m:
          </p>
          <ul className="mt-3 space-y-1.5">
            {OUTSIDE_OF_WORK.map((item) => (
              <li
                key={item}
                className="flex items-baseline gap-2 text-foreground"
              >
                <span className="text-accent">·</span>
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-muted">
            To talk data, agents, or the best hot yoga studio near you,
            reach out on{" "}
            {contactLinks.map((link, i) => (
              <span key={link.label}>
                <a
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    link.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                >
                  {link.label}
                </a>
                {i < contactLinks.length - 2
                  ? ", "
                  : i === contactLinks.length - 2
                    ? ", or "
                    : ""}
              </span>
            ))}
            {" "}— can&apos;t wait to meet you.
          </p>
        </div>
      </div>
    </section>
  );
}
