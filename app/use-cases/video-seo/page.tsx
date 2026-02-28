import { UseCasePage } from "@/components/use-case-page";
import { createMetadata, softwareAppJsonLd } from "@/lib/seo";

export const metadata = createMetadata({
  title: "YouTube Video SEO Analyzer",
  description:
    "Optimize YouTube titles, descriptions, tags, and CTR signals with a dedicated video SEO analyzer.",
  path: "/use-cases/video-seo",
  keywords: ["youtube video seo", "youtube title optimization", "youtube keyword tool"]
});

export default function VideoSeoPage() {
  const jsonLd = softwareAppJsonLd(
    "YouTube Video SEO Analyzer",
    "Improve YouTube video discoverability through metadata and intent alignment.",
    "Video-level keyword and CTR optimization"
  );

  return (
    <UseCasePage
      eyebrow="USE CASE"
      title="YouTube Video SEO Analyzer"
      lead="Optimize each upload for search intent, click-through quality, and session depth."
      bullets={[
        "Score title and keyword alignment",
        "Detect missing semantic terms in descriptions",
        "Suggest stronger internal linking from playlists",
        "Compare metadata quality against top competitors"
      ]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h2>Traffic intent capture</h2>
      <p>
        This page is tuned for transactional search intent around "YouTube SEO tool" and "video SEO
        analyzer," helping attract users ready to optimize active campaigns.
      </p>
      <h2>Execution model</h2>
      <p>
        Standardize your video checklist: intent keyword, hook clarity, thumbnail cohesion, and description
        depth. Consistency across those four factors improves long-term ranking resilience.
      </p>
    </UseCasePage>
  );
}
