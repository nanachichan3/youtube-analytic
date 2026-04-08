import { UseCasePage } from "@/components/use-case-page";
import { createMetadata, softwareAppJsonLd } from "@/lib/seo";
import { DatingCardClient } from "@/components/DatingCardClient";

export const metadata = createMetadata({
  title: "AI Dating Card from YouTube History",
  description:
    "Generate a Tinder-style dating card based on your YouTube watch history. See your personality, interests, and ideal partner type as inferred from what you watch.",
  path: "/use-cases/dating-card",
  keywords: [
    "youtube dating card",
    "ai dating profile from youtube",
    "watch history personality",
    "youtube personality test",
    "tinder card generator"
  ]
});

export default function DatingCardPage() {
  const jsonLd = softwareAppJsonLd(
    "ViewPulse Dating Card",
    "Generate a playful AI dating profile card from your YouTube watch history.",
    "AI dating card generation from viewing patterns"
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DatingCardClient />
    </>
  );
}
