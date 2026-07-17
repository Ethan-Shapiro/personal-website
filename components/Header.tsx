import Link from "next/link";
import { EthanLLM } from "./EthanLLM";

const NAV_LINKS = [
  { href: "/#projects", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/#skills", label: "Skills" },
  { href: "/#contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4">
        <Link
          href="/"
          className="whitespace-nowrap font-mono text-sm font-semibold tracking-wide text-foreground"
        >
          Ethan Shapiro
        </Link>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <nav className="flex flex-wrap gap-x-5 gap-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <EthanLLM />
        </div>
      </div>
    </header>
  );
}
