import Link from "next/link";
import type { Project } from "@/lib/projects";
import { ProjectPreviewArt } from "./ProjectPreviewArt";

export function ProjectCard({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group block${className ? ` ${className}` : ""}`}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <ProjectPreviewArt
          accent={project.accent}
          className="h-full w-full transition-transform duration-500 ease-in-out group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 ease-in-out group-hover:bg-black/10" />

        {project.placeholder && (
          <span className="absolute top-4 left-4 rounded-full bg-black/50 px-2.5 py-1 font-mono text-[11px] tracking-wide text-white backdrop-blur-sm">
            PLACEHOLDER
          </span>
        )}

        <h3 className="absolute bottom-5 left-5 text-2xl font-semibold text-white sm:text-3xl">
          {project.title}
        </h3>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-4">
        <p className="font-serif text-[17px] text-foreground">
          {project.tagline}
        </p>
        <h4 className="shrink-0 font-mono text-[13px] tracking-wide text-muted uppercase">
          {project.label} &middot; {project.status} {project.year}
        </h4>
      </div>
    </Link>
  );
}
