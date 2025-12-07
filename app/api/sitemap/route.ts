import { NextResponse } from "next/server"

const BASE_URL = "https://www.porkyfarm.app"

export async function GET() {
  const pages = [
    { url: "/", priority: "1.0", changefreq: "weekly" },
    { url: "/auth/login", priority: "0.8", changefreq: "monthly" },
    { url: "/auth/register", priority: "0.8", changefreq: "monthly" },
    { url: "/pricing", priority: "0.7", changefreq: "monthly" },
    { url: "/faq", priority: "0.6", changefreq: "monthly" },
    { url: "/guide", priority: "0.6", changefreq: "monthly" },
    { url: "/support", priority: "0.5", changefreq: "monthly" },
    { url: "/blog", priority: "0.7", changefreq: "weekly" },
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  })
}
