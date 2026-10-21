import type { MetadataRoute } from "next";
import { mainNav, siteUrl, visitCta } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [...mainNav, visitCta].map((item) => ({
    url: `${siteUrl}${process.env.NEXT_PUBLIC_BASE_PATH || ""}${item.href}`,
    changeFrequency: item.href === "/" ? "weekly" : "monthly",
    priority: item.href === "/" ? 1 : 0.7,
  }));
}
