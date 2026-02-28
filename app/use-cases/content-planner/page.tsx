import { UseCasePage } from "@/components/use-case-page";
import { createMetadata, softwareAppJsonLd } from "@/lib/seo";

export const metadata = createMetadata({
  title: "YouTube Content Planner",
  description:
    "Plan YouTube videos around high-intent topics, search demand, and competitor content gaps.",
  path: "/use-cases/content-planner",
  keywords: ["youtube content planner", "youtube topic research", "youtube keyword planning"]
});

export default function ContentPlannerPage() {
  const jsonLd = softwareAppJsonLd(
    "YouTube Content Planner",
    "Plan SEO-driven YouTube content calendars based on audience demand signals.",
    "Editorial planning for long-tail search capture"
  );

  return (
    <UseCasePage
      eyebrow="USE CASE"
      title="YouTube Content Planner"
      lead="Prioritize topics that satisfy audience demand and strengthen your search footprint."
      bullets={[
        "Build a topic map by search intent and funnel stage",
        "Cluster related videos for stronger session depth",
        "Track publishing consistency against growth windows",
        "Spot competitor gaps you can capture quickly"
      ]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h2>Topical authority strategy</h2>
      <p>
        This page targets informational queries around "YouTube content planning" and "topic research,"
        helping attract early-stage creators researching strategy frameworks.
      </p>
      <h2>Compounding growth loop</h2>
      <p>
        Turn analytics into planning inputs every week. That operating rhythm keeps your roadmap anchored in
        validated demand instead of assumptions.
      </p>
    </UseCasePage>
  );
}
