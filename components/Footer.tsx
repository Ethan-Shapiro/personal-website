import { contactLinks } from "@/lib/contact";

export function Footer() {
  return (
    <footer id="contact" className="border-t border-border">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-6 py-16 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-mono text-sm tracking-wide text-accent">
            CONTACT
          </h2>
          <p className="mt-2 max-w-md text-foreground">
            Open to data science and ML engineering roles. The fastest way to
            reach me is email.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {contactLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={
                link.href.startsWith("http") ? "noopener noreferrer" : undefined
              }
              className="font-mono text-sm text-muted transition-colors hover:text-accent"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-[1600px] px-6 pb-8 text-xs text-muted">
        © {new Date().getFullYear()} Ethan Shapiro.
      </div>
    </footer>
  );
}
