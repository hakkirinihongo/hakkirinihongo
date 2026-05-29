import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() || 'https://hakkirinihongo.com').replace(/\/$/, '');

  const postModules = import.meta.glob('../content/articoli/**/*.mdx', { eager: true });
  const englishPostModules = import.meta.glob('../content/en/**/*.mdx', { eager: true });

  const now = new Date().toISOString();

  const articleUrls = Object.entries(postModules).map(([path, mod]: any) => {
    const frontmatter = mod.frontmatter ?? {};
    const fallbackSlug = path.split('/').pop()?.replace('.mdx', '') ?? '';
    const slug = frontmatter.slug ?? fallbackSlug;
    const lastmod = frontmatter.updated ?? frontmatter.date ?? now;

    return {
      loc: `${base}/articoli/${slug}/`,
      lastmod: new Date(lastmod).toISOString()
    };
  });

  const englishArticleUrls = Object.entries(englishPostModules).map(([path, mod]: any) => {
    const frontmatter = mod.frontmatter ?? {};
    const fallbackSlug = path.split('/').pop()?.replace('.mdx', '') ?? '';
    const slug = frontmatter.slug ?? fallbackSlug;
    const lastmod = frontmatter.updated ?? frontmatter.date ?? now;

    return {
      loc: `${base}/en/articles/${slug}/`,
      lastmod: new Date(lastmod).toISOString()
    };
  });

  const staticUrls = [
    { loc: `${base}/`, lastmod: now },
    { loc: `${base}/articoli/`, lastmod: now },
    { loc: `${base}/contatti/`, lastmod: now },
    { loc: `${base}/chi-siamo/`, lastmod: now },
    { loc: `${base}/chi-siamo-metodo/`, lastmod: now },

    { loc: `${base}/articoli/jlpt/`, lastmod: now },
    { loc: `${base}/articoli/series/`, lastmod: now },

    { loc: `${base}/articoli/c/concetti-e-distinzioni/`, lastmod: now },
    { loc: `${base}/articoli/c/dissezionamenti-grammaticali/`, lastmod: now },
    { loc: `${base}/articoli/c/giapponese-di-nicchia/`, lastmod: now },
    { loc: `${base}/articoli/c/storia-della-grammatica/`, lastmod: now },

    { loc: `${base}/en/`, lastmod: now },
    { loc: `${base}/en/articles/`, lastmod: now },
    { loc: `${base}/en/about/`, lastmod: now },
    { loc: `${base}/en/contact/`, lastmod: now },

    { loc: `${base}/en/articles/jlpt/`, lastmod: now },
    { loc: `${base}/en/articles/series/`, lastmod: now },

    { loc: `${base}/en/articles/c/concepts-and-distinctions/`, lastmod: now },
    { loc: `${base}/en/articles/c/grammar-dissections/`, lastmod: now },
    { loc: `${base}/en/articles/c/niche-japanese/`, lastmod: now },
    { loc: `${base}/en/articles/c/history-of-grammar/`, lastmod: now },
  ];

  const urls = [...staticUrls, ...articleUrls, ...englishArticleUrls]
    .filter((item) => item.loc)
    .sort((a, b) => a.loc.localeCompare(b.loc));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, lastmod }) => `<url>
<loc>${loc}</loc>
<lastmod>${lastmod}</lastmod>
</url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
};