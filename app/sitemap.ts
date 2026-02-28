import type { MetadataRoute } from "next";
import { site } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/use-cases/channel-audit",
    "/use-cases/video-seo",
    "/use-cases/revenue-forecast",
    "/use-cases/content-planner"
  ];

  return routes.map((route) => ({
    url: `${site.url}${route}`,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
    lastModified: new Date()
  }));
}
