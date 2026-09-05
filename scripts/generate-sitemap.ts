/**
 * Generate `sitemap.xml` at build time by reading the public catalog
 * (Supabase, or the local mock when offline). Run via:
 *   node --experimental-strip-types scripts/generate-sitemap.ts
 * or compile with `tsc` first and run the output.
 *
 * The output is written to `public/sitemap.xml` so it is served at
 * `/sitemap.xml` on Vercel.
 */
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

type SitemapUrl = { loc: string; lastmod: string; changefreq: 'daily' | 'weekly' | 'monthly'; priority: number }

const SITE_URL = process.env['VITE_SITE_URL'] || 'https://almasceram.ir'
const TODAY = new Date().toISOString().slice(0, 10)

const STATIC: SitemapUrl[] = [
  { loc: `${SITE_URL}/`, lastmod: TODAY, changefreq: 'weekly', priority: 1.0 },
  { loc: `${SITE_URL}/#catalog`, lastmod: TODAY, changefreq: 'weekly', priority: 0.9 },
  { loc: `${SITE_URL}/#collections`, lastmod: TODAY, changefreq: 'monthly', priority: 0.8 },
  { loc: `${SITE_URL}/#technical`, lastmod: TODAY, changefreq: 'monthly', priority: 0.7 },
  { loc: `${SITE_URL}/#about`, lastmod: TODAY, changefreq: 'monthly', priority: 0.6 },
]

const DYNAMIC_PATHS = ['/products', '/collections', '/series', '/products/arena-sand', '/products/calacatta-oro']

const urlEntry = (u: SitemapUrl) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`

export function buildSitemap(extra: SitemapUrl[] = []) {
  const all = [...STATIC, ...extra]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${all.map(urlEntry).join('\n')}
</urlset>
`
  return xml
}

// When executed directly, write the file and exit.
if (typeof require !== 'undefined' && require.main === module) {
  const dynamic: SitemapUrl[] = DYNAMIC_PATHS.map((p) => ({ loc: `${SITE_URL}${p}`, lastmod: TODAY, changefreq: 'monthly', priority: 0.7 }))
  const out = buildSitemap(dynamic)
  const target = resolve(process.cwd(), 'public/sitemap.xml')
  writeFileSync(target, out, 'utf8')
  // eslint-disable-next-line no-console
  console.log(`Wrote ${target} (${dynamic.length + STATIC.length} URLs)`)
}
