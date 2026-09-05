import { useEffect } from 'react'

export type SeoOptions = {
  /** Page title (without site suffix). The site name is appended automatically. */
  title: string
  /** Meta description (150-160 characters recommended). */
  description?: string
  /** OpenGraph image — must be a public URL or absolute path. */
  image?: string
  /** Canonical URL — must be an absolute path (e.g. /products/arena-sand). */
  canonicalPath?: string
  /** `noindex` if true. */
  noindex?: boolean
  /** OpenGraph type, defaults to "website". */
  ogType?: 'website' | 'article' | 'product'
  /** Optional JSON-LD structured data — single object or array of objects. */
  jsonLd?: object | object[]
  /** Optional keywords for the meta tag. */
  keywords?: string[]
}

const SITE_NAME = 'ALMASCERAM'

function upsertMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }
  element.setAttribute('href', href)
}

let lastJsonLdKey = 0

function removePreviousJsonLd() {
  document.head.querySelectorAll('script[data-seo-jsonld]').forEach((node) => node.remove())
}

function injectJsonLd(payload: object | object[]) {
  removePreviousJsonLd()
  const items = Array.isArray(payload) ? payload : [payload]
  items.forEach((item, index) => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset['seoJsonld'] = String(++lastJsonLdKey)
    script.text = JSON.stringify(item)
    document.head.appendChild(script)
    void index
  })
}

function siteBaseUrl() {
  return window.location.origin
}

function resolveUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${siteBaseUrl()}${path.startsWith('/') ? '' : '/'}${path}`
}

/**
 * Apply SEO metadata for the current view. Title gets a site suffix,
 * missing meta tags are created, and JSON-LD payloads are mounted
 * with a stable key so re-renders replace (not duplicate) blocks.
 *
 * Designed to be called once per route — typically at the top of a
 * page component's render via a `useEffect(..., [])`.
 */
export function useSEO(options: SeoOptions) {
  const title = `${options.title} | ${SITE_NAME}`
  const description = options.description ?? ''
  const canonical = options.canonicalPath ? resolveUrl(options.canonicalPath) : window.location.href
  const image = options.image ? resolveUrl(options.image) : undefined

  useEffect(() => {
    document.title = title
    upsertMeta('description', description)
    if (options.keywords && options.keywords.length) {
      upsertMeta('keywords', options.keywords.join(', '))
    }
    upsertMeta('robots', options.noindex ? 'noindex, nofollow' : 'index, follow')
    upsertLink('canonical', canonical)

    // OpenGraph
    upsertMeta('og:title', title, 'property')
    upsertMeta('og:description', description, 'property')
    upsertMeta('og:type', options.ogType ?? 'website', 'property')
    upsertMeta('og:url', canonical, 'property')
    upsertMeta('og:site_name', SITE_NAME, 'property')
    upsertMeta('og:locale', 'fa_IR', 'property')
    if (image) upsertMeta('og:image', image, 'property')

    // Twitter card
    upsertMeta('twitter:card', image ? 'summary_large_image' : 'summary')
    upsertMeta('twitter:title', title)
    upsertMeta('twitter:description', description)
    if (image) upsertMeta('twitter:image', image)

    if (options.jsonLd) {
      injectJsonLd(options.jsonLd)
    } else {
      removePreviousJsonLd()
    }
  }, [title, description, canonical, image, options.noindex, options.ogType, JSON.stringify(options.keywords ?? []), JSON.stringify(options.jsonLd ?? null)])
}
