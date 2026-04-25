import type { MetadataRoute } from "next";

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://bizmapai.com").replace(
    /\/$/,
    ""
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const routes = [
    "",
    "/landing",
    "/login",
    "/onboarding",
    "/privacy",
    "/terms",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
