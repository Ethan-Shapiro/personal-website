const SKILL_GROUPS = [
  {
    label: "Modeling",
    skills: ["Python", "scikit-learn", "PyTorch", "XGBoost", "Statistics"],
  },
  {
    label: "Data Engineering",
    skills: ["SQL", "Spark", "Airflow", "dbt", "Kafka"],
  },
  {
    label: "Deployment & MLOps",
    skills: ["Docker", "FastAPI", "CI/CD", "AWS", "Monitoring & drift"],
  },
];

export function SkillsSection() {
  return (
    <section id="skills" className="mx-auto max-w-[1600px] px-6 py-16">
      <h2 className="font-mono text-sm tracking-wide text-accent">SKILLS</h2>

      <div className="mt-6 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
        {SKILL_GROUPS.map((group) => (
          <div key={group.label}>
            <h3 className="text-sm font-semibold text-foreground">
              {group.label}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
