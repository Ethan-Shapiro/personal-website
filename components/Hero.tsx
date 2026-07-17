import { experience } from "@/lib/experience";

export function Hero() {
  return (
    <section className="mx-auto max-w-[1600px] px-6 pt-20 pb-16 sm:pt-28">
      <div className="grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-2">
        <div>
          <p className="font-mono text-sm tracking-wide text-accent">
            DATA SCIENTIST &amp; ML ENGINEER
          </p>

          <h1 className="mt-6 font-serif text-4xl leading-[1.1] tracking-tight text-foreground sm:text-5xl">
            I&apos;m Ethan, a data scientist who{" "}
            <em className="italic">builds</em>.
          </h1>

          <p className="mt-6 max-w-md text-lg text-muted">
            I turn messy, real-world data into models, and models into deployed
            systems people actually use. This site is a walkthrough of how I
            think, not just what I scored.
          </p>
        </div>

        <div className="lg:pt-1">
          <ul className="divide-y divide-border border-t border-border">
            {experience.map((item) => (
              <li
                key={`${item.year}-${item.org}`}
                className="grid grid-cols-[auto_1fr] gap-x-6 py-3 sm:grid-cols-[4rem_1fr_1.2fr] sm:gap-x-8"
              >
                <span className="font-mono text-sm text-muted">
                  {item.year}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {item.org}
                </span>
                <span className="col-start-2 text-sm text-muted sm:col-start-3">
                  {item.role}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
