import { getEducation, getExperience, getPublications, getSite } from './content';
import { absolute, SITE_URL } from './seo';
import type { Lang } from './i18n';

const PERSON_ID = `${SITE_URL}/#person`;

/** Person graph: name, affiliation, and the sameAs links that tie the site to
 *  Google Scholar, GitHub and LinkedIn. */
export function personSchema(lang: Lang) {
  const site = getSite();
  const experience = getExperience();
  const education = getEducation();

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: site.name,
    alternateName: site.nameZh,
    url: absolute(lang, '/'),
    image: `${SITE_URL}/images/profile.jpg`,
    jobTitle: (lang === 'zh' ? site.titleZh : site.title) ?? site.title,
    email: `mailto:${site.email}`,
    description: (lang === 'zh' ? site.taglineZh : site.tagline) ?? site.tagline,
    worksFor: { '@type': 'Organization', name: site.org, url: site.orgUrl },
    address: { '@type': 'PostalAddress', addressLocality: 'San Francisco', addressRegion: 'CA', addressCountry: 'US' },
    alumniOf: [...new Set(education.map((e) => e.school))].map((school) => ({
      '@type': 'CollegeOrUniversity',
      name: school,
    })),
    knowsAbout: site.interests,
    sameAs: [site.links.github, site.links.scholar, site.links.linkedin],
    hasOccupation: experience.flatMap((job) =>
      job.roles.map((role) => ({
        '@type': 'Role',
        roleName: role.title,
        startDate: role.start,
        ...(role.end !== 'present' ? { endDate: role.end } : {}),
        'worksFor': { '@type': 'Organization', name: job.org },
      })),
    ),
  };
}

/** One ScholarlyArticle per paper, wrapped in an ItemList so the ordering of
 *  the page is explicit. Each links out to the canonical paper URL. */
export function publicationsSchema(lang: Lang) {
  const pubs = getPublications();
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: lang === 'zh' ? '潘传宇的论文' : 'Publications by Chuanyu Pan',
    numberOfItems: pubs.length,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    itemListElement: pubs.map((pub, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'ScholarlyArticle',
        name: pub.title,
        headline: pub.title,
        abstract: pub.abstract,
        datePublished: pub.date.toISOString().slice(0, 10),
        image: `${SITE_URL}${pub.thumb}`,
        author: pub.authors.map((a) => ({
          '@type': 'Person',
          name: a.replace(/\*$/, ''),
          ...(a.replace(/\*$/, '') === getSite().me ? { '@id': PERSON_ID } : {}),
        })),
        isPartOf: { '@type': 'Periodical', name: pub.venue },
        ...(pub.links.paper ? { url: pub.links.paper, sameAs: pub.links.paper } : {}),
        ...(pub.links.code ? { codeRepository: pub.links.code } : {}),
      },
    })),
  };
}

/** Lets Google show the site's sections as sitelinks. */
export function siteSchema(lang: Lang) {
  const site = getSite();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: absolute(lang, '/'),
    name: site.name,
    inLanguage: lang === 'zh' ? 'zh-CN' : 'en',
    publisher: { '@id': PERSON_ID },
  };
}
