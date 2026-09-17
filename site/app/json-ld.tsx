/**
 * Structured data. This is the highest-value SEO work for a research site:
 * it is what lets Google connect the page to a person with a Scholar profile,
 * and to individual papers, rather than treating it as anonymous prose.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is not HTML — the only character that can break
      // out of a script element is "<", so escape it.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
