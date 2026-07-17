import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/lib/projects";
import { ProjectPreviewArt } from "@/components/ProjectPreviewArt";
import { DesignDecisionBlock } from "@/components/DesignDecisionBlock";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Ethan Shapiro`,
    description: project.tagline,
  };
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-[160px_1fr] sm:gap-8">
      <h2 className="font-mono text-sm tracking-wide text-accent">{label}</h2>
      <div className="max-w-2xl text-foreground">{children}</div>
    </section>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <article>
      <div className="relative aspect-[3/1] w-full overflow-hidden">
        <ProjectPreviewArt accent={project.accent} className="h-full w-full" />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="border-b border-border py-10">
          <Link
            href="/#projects"
            className="text-sm text-muted transition-colors hover:text-accent"
          >
            ← All projects
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
              {project.title}
            </h1>
            {project.placeholder && (
              <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] tracking-wide text-muted">
                PLACEHOLDER PROJECT
              </span>
            )}
          </div>
          <p className="mt-3 max-w-2xl text-lg text-muted">
            {project.tagline}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <Section label="SITUATION">
          <p>{project.situation}</p>
        </Section>

        <Section label="TASK">
          <p>{project.task}</p>
        </Section>

        <Section label="THE DATA">
          <p>{project.dataChallenges}</p>
        </Section>

        <Section label="ACTION">
          <p>{project.action}</p>
        </Section>

        <Section label="TRADE-OFFS">
          <p>{project.tradeoffs}</p>
        </Section>

        <section className="py-8">
          <h2 className="font-mono text-sm tracking-wide text-accent">
            DESIGN DECISIONS
          </h2>
          <div className="mt-4">
            <DesignDecisionBlock
              decisions={project.designDecisions}
              accent={project.accent}
            />
          </div>
        </section>

        <Section label="DEPLOYMENT">
          <p>{project.deployment}</p>
        </Section>

        <Section label="RESULT">
          <p>{project.impact}</p>
        </Section>

        {(project.links.repo || project.links.demo) && (
          <div className="flex gap-4 border-t border-border py-10">
            {project.links.repo && (
              <a
                href={project.links.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent"
              >
                View repo
              </a>
            )}
            {project.links.demo && (
              <a
                href={project.links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                View live demo
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
