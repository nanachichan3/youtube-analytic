import Link from "next/link";
import type { ReactNode } from "react";

type UseCasePageProps = {
  eyebrow: string;
  title: string;
  lead: string;
  bullets: string[];
  children?: ReactNode;
};

export function UseCasePage({ eyebrow, title, lead, bullets, children }: UseCasePageProps) {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lead">{lead}</p>
        <div className="hero-actions">
          <a href="https://self-degree.com/en/tools" target="_blank" rel="noreferrer">
            Try with Self Degree Tools
          </a>
          <Link href="/">See all use cases</Link>
        </div>
      </section>
      <section className="content-grid">
        <article className="glass-panel">
          <h2>What you can do</h2>
          <ul>
            {bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </article>
        <article className="glass-panel prose-panel">{children}</article>
      </section>
      <section className="promo-panel">
        <h2>Build the full creator growth engine</h2>
        <p>
          Pair this workflow with learning paths, mentoring, and execution support inside Self Degree.
        </p>
        <a href="https://self-degree.com/en/directory/roadmaps" target="_blank" rel="noreferrer">
          Visit Self Degree Roadmaps
        </a>
      </section>
    </main>
  );
}
