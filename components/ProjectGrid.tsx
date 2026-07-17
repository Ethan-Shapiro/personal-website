import { projects } from "@/lib/projects";
import { ProjectCard } from "./ProjectCard";

export function ProjectGrid() {
  return (
    <section id="projects" className="mx-auto max-w-[1600px] px-6 py-20">
      <div className="mb-12">
        <h2 className="text-sm font-mono tracking-wide text-accent">
          SELECTED WORK
        </h2>
        <p className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
          End-to-end systems, not just notebooks
        </p>
        <p className="mt-3 max-w-2xl text-muted">
          Projects carried from real data through a shipped system. Every
          case study covers the data, the trade-offs, how it deployed, and
          what it demonstrated.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-12 gap-y-16 lg:grid-cols-2">
        {projects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            className={i % 2 === 1 ? "lg:mt-24" : undefined}
          />
        ))}
      </div>
    </section>
  );
}
