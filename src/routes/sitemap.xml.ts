// sitemap.ts
import { and, eq, gt, isNull, or } from "drizzle-orm";
import env from "virtual:solid-env/client";
import { db } from "~/drizzle/db";
import { posts, squads, games, actors, companies, platforms } from "~/drizzle/schema";

const BASE_URL = env.VITE_SITE_URL

type Entry = { path: string; lastmod?: Date | null; changefreq?: string; priority?: number };

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

function toXml(entries: Entry[]) {
  const urls = entries.map(e => [
    "  <url>",
    `    <loc>${esc(BASE_URL + e.path)}</loc>`,
    e.lastmod ? `    <lastmod>${e.lastmod.toISOString()}</lastmod>` : "",
    e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : "",
    e.priority != null ? `    <priority>${e.priority.toFixed(1)}</priority>` : "",
    "  </url>",
  ].filter(Boolean).join("\n"));

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
}

export async function buildSitemap(): Promise<string> {
  const now = new Date();

  const [postRows, squadRows, gameRows, actorRows, companyRows, platformRows] = await Promise.all([
    db.select({ id: posts.postId, createdAt: posts.createdAt, editedOn: posts.editedOn })
      .from(posts).where(eq(posts.pending, false)),
    db.select({ id: squads.squadId, createdAt: squads.createdAt, editedOn: squads.editedOn })
      .from(squads)
      .where(and(eq(squads.isActive, true), or(isNull(squads.expiresAt), gt(squads.expiresAt, now)))),
    db.select({ id: games.gameId, added: games.dateAdded, modified: games.dateModified }).from(games),
    db.select({ id: actors.actorId, added: actors.dateAdded, modified: actors.dateModified }).from(actors),
    db.select({ id: companies.companyId, added: companies.dateAdded, modified: companies.dateModified }).from(companies),
    db.select({ id: platforms.platformId, added: platforms.dateAdded, modified: platforms.dateModified }).from(platforms),
  ]);

  const entries: Entry[] = [
    { path: "/", changefreq: "daily", priority: 1.0 },
    { path: "/posts", changefreq: "hourly", priority: 0.9 },
    { path: "/squads", changefreq: "hourly", priority: 0.8 },
    { path: "/games", changefreq: "daily", priority: 0.9 },

    ...postRows.map(r => ({ path: `/posts/${r.id}`, lastmod: r.editedOn ?? r.createdAt, changefreq: "weekly", priority: 0.6 })),
    ...squadRows.map(r => ({ path: `/squads/${r.id}`, lastmod: r.editedOn ?? r.createdAt, changefreq: "daily", priority: 0.5 })),
    ...gameRows.map(r => ({ path: `/games/${r.id}`, lastmod: r.modified ?? r.added, changefreq: "weekly", priority: 0.8 })),
    ...actorRows.map(r => ({ path: `/actors/${r.id}`, lastmod: r.modified ?? r.added, changefreq: "monthly", priority: 0.5 })),
    ...companyRows.map(r => ({ path: `/companies/${r.id}`, lastmod: r.modified ?? r.added, changefreq: "monthly", priority: 0.5 })),
    ...platformRows.map(r => ({ path: `/platforms/${r.id}`, lastmod: r.modified ?? r.added, changefreq: "monthly", priority: 0.5 })),
  ];

  return toXml(entries);
}

// fetch-style handler: mount this at GET /sitemap.xml
export async function GET() {
  return new Response(await buildSitemap(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=2419200",
    },
  });
}