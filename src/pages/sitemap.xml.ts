import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() || 'https://hakkirinihongo.com').replace(/\/$/, '');

  // ✅ Metti qui gli URL principali del sito.
  // Per ora ne inseriamo pochi e sicuri. Poi li allarghiamo.
  const urls = [
    `${base}/`,
    `${base}/articoli/`,
    `${base}/chi-siamo/`,
    `${base}/chi-siamo-metodo/`,
    `${base}/articoli/c/concetti-e-distinzioni/`,
    `${base}/articoli/c/dissezionamenti-grammaticali/`,
    `${base}/articoli/c/giapponese-di-nicchia/`,
    `${base}/articoli/c/storia-della-grammatica/`,
    `${base}/articoli/ato-de-ato-ni-ato-wa/`,
  ];

  const now = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (loc) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
