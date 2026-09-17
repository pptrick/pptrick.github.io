/**
 * The site's origin, in one place.
 *
 * It appears in canonical links, hreflang alternates, Open Graph URLs, the
 * sitemap, robots.txt and the structured data, so a move to a custom domain
 * has to change all of them together or the copies disagree — a canonical
 * pointing at one host while the sitemap lists another is worse than either
 * alone. Changing this constant, and adding a CNAME file next to it in
 * public/, is the whole switch.
 *
 * No trailing slash: every caller appends a path that starts with one.
 */
export const SITE_URL = 'https://pptrick.github.io';
