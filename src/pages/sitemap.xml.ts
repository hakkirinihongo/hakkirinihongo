import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() || 'https://hakkirinihongo.com').replace(/\/$/, '');

  // stessi articoli usati dal tuo sistema di routing
  const postModules = import.meta.glob('../content/articoli/**/*.mdx', { eager: true });

  const articleUrls = Object.entries(postModules).map(([path, mod]: any) => {
    const frontmatter = mod.frontmatter ?? {};
    const fallbackSlug = path.split('/').pop().replace('.mdx', '');
    const slug = frontmatter.slug ?? fallbackSlug;

    return `${base}/articoli/${slug}/`;
  });

  const staticUrls = [
    `${base}/`,
    `${base}/articoli/`,
    `${base}/chi-siamo/`,
    `${base}/chi-siamo-metodo/`,
    `${base}/articoli/c/concetti-e-distinzioni/`,
    `${base}/articoli/c/dissezionamenti-grammaticali/`,
    `${base}/articoli/c/giapponese-di-nicchia/`,
    `${base}/articoli/c/storia-della-grammatica/`,
  ];

  const urls = [...staticUrls, ...articleUrls];

  const now = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (loc) => `<url>
<loc>${loc}</loc>
<lastmod>${now}</lastmod>
</url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  });
};
