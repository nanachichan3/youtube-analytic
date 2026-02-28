import Link from "next/link";
import { githubUrl } from "@/lib/links";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "#how", label: "How it works" },
  { href: githubUrl, label: "GitHub" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand-mark">
        <span className="brand-dot" aria-hidden="true" />
        ViewPulse
      </Link>
      <nav className="site-nav" aria-label="Primary">
        {navLinks.map((item) => (
          <a key={item.href} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noreferrer" : undefined}>
            {item.label}
          </a>
        ))}
      </nav>
      <a className="cta-link" href={githubUrl} target="_blank" rel="noreferrer">
        Open Source →
      </a>
    </header>
  );
}
