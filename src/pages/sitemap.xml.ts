import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() || 'https://hakkirinihongo.com').replace(/\/$/, '');

  const postModules = import.meta.glob('../content/articoli/**/*.mdx', { eager: true });

  const articleUrls = Object.entries(postModules).map(([path, mod]: any) => {
    const frontmatter = mod.frontmatter ?? {};
    const fallbackSlug = path.split('/').pop()?.replace('.mdx', '') ?? '';
    const slug = frontmatter.slug ?? fallbackSlug;

    const lastmod = frontmatter.updated ?? frontmatter.date ?? new Date().toISOString();

    return {
      loc: `${base}/articoli/${slug}/`,
      lastmod: new Date(lastmod).toISOString()
    };
  });

  const staticUrls = [
    { loc: `${base}/`, lastmod: new Date().toISOString() },
    { loc: `${base}/articoli/`, lastmod: new Date().toISOString() },
    { loc: `${base}/contatti/`, lastmod: new Date().toISOString() },
    { loc: `${base}/chi-siamo/`, lastmod: new Date().toISOString() },
    { loc: `${base}/chi-siamo-metodo/`, lastmod: new Date().toISOString() },
    { loc: `${base}/articoli/c/concetti-e-distinzioni/`, lastmod: new Date().toISOString() },
    { loc: `${base}/articoli/c/dissezionamenti-grammaticali/`, lastmod: new Date().toISOString() },
    { loc: `${base}/articoli/c/giapponese-di-nicchia/`, lastmod: new Date().toISOString() },
    { loc: `${base}/articoli/c/storia-della-grammatica/`, lastmod: new Date().toISOString() },
  ];

  const urls = [...staticUrls, ...articleUrls]
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
