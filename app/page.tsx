import { createMetadata, softwareAppJsonLd } from "@/lib/seo";
import { HomeClient } from "@/components/HomeClient";

export const metadata = createMetadata({
  title: "YouTube History Analyzer — See Your Watch Patterns",
  description:
    "Open-source YouTube history analyzer. Upload your Google Takeout export and analyze viewing patterns locally on your device with zero server-side data processing.",
  path: "",
  keywords: [
    "youtube history analyzer",
    "youtube watch history analytics",
    "google takeout youtube",
    "personal youtube statistics",
    "youtube viewing habits"
  ]
});

export default function HomePage() {
  const jsonLd = softwareAppJsonLd(
    "YouTube History Analyzer by Self Degree",
    "Upload your Google Takeout export to analyze personal YouTube viewing history. Private, instant, client-side.",
    "Personal YouTube watch history analytics"
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
