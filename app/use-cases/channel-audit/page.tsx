import { UseCasePage } from "@/components/use-case-page";
import { createMetadata, softwareAppJsonLd } from "@/lib/seo";

export const metadata = createMetadata({
  title: "YouTube Channel Audit Tool",
  description:
    "Run a full YouTube channel audit to detect growth blockers, retention dips, and ranking opportunities.",
  path: "/use-cases/channel-audit",
  keywords: ["youtube channel audit", "channel growth analysis", "youtube performance review"]
});

export default function ChannelAuditPage() {
  const jsonLd = softwareAppJsonLd(
    "YouTube Channel Audit",
    "Audit YouTube channel health with growth, retention, and SEO checks.",
    "Channel benchmark and trend analysis"
  );

  return (
    <UseCasePage
      eyebrow="USE CASE"
      title="YouTube Channel Audit"
      lead="Identify which content formats are accelerating growth and which ones are suppressing reach."
      bullets={[
        "Compare upload cadence versus view velocity",
        "Detect audience retention drop-off clusters",
        "Map top-performing content themes by quarter",
        "Pinpoint underperforming metadata patterns"
      ]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h2>Who this page serves</h2>
      <p>
        This page targets creators searching for terms like "YouTube channel audit tool" and "how to
        analyze channel performance." It captures top-of-funnel traffic with practical audit actions.
      </p>
      <h2>How to use it</h2>
      <p>
        Start with baseline metrics, compare trend deltas monthly, then prioritize fixes that influence
        discovery and retention first. That sequence compounds faster than one-off experiments.
      </p>
    </UseCasePage>
  );
}
