import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() || 'https://hakkirinihongo.com').replace(/\/$/, '');

  // Articoli di grammatica avanzata
  const postModules = import.meta.glob('../content/articoli/**/*.mdx', { eager: true });
  const englishPostModules = import.meta.glob('../content/en/**/*.mdx', { eager: true });

  // Articoli della biblioteca di grammatica di base
  const basicGrammarModules = import.meta.glob('../content/grammatica-base/**/*.mdx', { eager: true });
  const englishBasicGrammarModules = import.meta.glob('../content/basic-grammar/**/*.mdx', { eager: true });

  // Esercizi
  const exerciseModules = import.meta.glob('../data/esercizi/*.json', { eager: true });
  const englishExerciseModules = import.meta.glob('../data/exercises/*.json', { eager: true });

  const now = new Date().toISOString();

  // ARTICOLI AVANZATI ITALIANI
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

  // ARTICOLI AVANZATI INGLESI
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

  // GRAMMATICA DI BASE ITALIANA
  const basicGrammarUrls = Object.entries(basicGrammarModules).map(([path, mod]: any) => {
    const frontmatter = mod.frontmatter ?? {};
    const fallbackSlug = path.split('/').pop()?.replace('.mdx', '') ?? '';
    const slug = frontmatter.slug ?? fallbackSlug;
    const lastmod = frontmatter.updated ?? frontmatter.date ?? now;

    return {
      loc: `${base}/grammatica-di-base/${slug}/`,
      lastmod: new Date(lastmod).toISOString()
    };
  });

  // GRAMMATICA DI BASE INGLESE
  const englishBasicGrammarUrls = Object.entries(englishBasicGrammarModules).map(([path, mod]: any) => {
    const frontmatter = mod.frontmatter ?? {};
    const fallbackSlug = path.split('/').pop()?.replace('.mdx', '') ?? '';
    const slug = frontmatter.slug ?? fallbackSlug;
    const lastmod = frontmatter.updated ?? frontmatter.date ?? now;

    return {
      loc: `${base}/en/basic-japanese-grammar/${slug}/`,
      lastmod: new Date(lastmod).toISOString()
    };
  });

  // ESERCIZI ITALIANI
  const exerciseUrls = Object.entries(exerciseModules).map(([path, mod]: any) => {
    const data = mod.default ?? mod;
    const fallbackSlug = path.split('/').pop()?.replace('.json', '') ?? '';
    const slug = data.slug ?? fallbackSlug;
    const lastmod = data.updated ?? data.date ?? now;

    return {
      loc: `${base}/esercizi/${slug}/`,
      lastmod: new Date(lastmod).toISOString()
    };
  });

  // ESERCIZI INGLESI
  const englishExerciseUrls = Object.entries(englishExerciseModules).map(([path, mod]: any) => {
    const data = mod.default ?? mod;
    const fallbackSlug = path.split('/').pop()?.replace('.json', '') ?? '';
    const slug = data.slug ?? fallbackSlug;
    const lastmod = data.updated ?? data.date ?? now;

    return {
      loc: `${base}/en/exercises/${slug}/`,
      lastmod: new Date(lastmod).toISOString()
    };
  });

  // PAGINE STATICHE ITALIANE E INGLESI
  const staticUrls = [
    { loc: `${base}/`, lastmod: now },
    { loc: `${base}/articoli/`, lastmod: now },
    { loc: `${base}/grammatica-di-base/`, lastmod: now },
    { loc: `${base}/esercizi/`, lastmod: now },
    { loc: `${base}/contatti/`, lastmod: now },
    { loc: `${base}/chi-siamo/`, lastmod: now },
    { loc: `${base}/chi-siamo-metodo/`, lastmod: now },

    { loc: `${base}/articoli/jlpt/`, lastmod: now },
    { loc: `${base}/articoli/serie/`, lastmod: now },

    { loc: `${base}/articoli/c/concetti-e-distinzioni/`, lastmod: now },
    { loc: `${base}/articoli/c/dissezionamenti-grammaticali/`, lastmod: now },
    { loc: `${base}/articoli/c/giapponese-di-nicchia/`, lastmod: now },
    { loc: `${base}/articoli/c/storia-della-grammatica/`, lastmod: now },
    { loc: `${base}/articoli/c/kanji-funzionali/`, lastmod: now },

    { loc: `${base}/en/`, lastmod: now },
    { loc: `${base}/en/articles/`, lastmod: now },
    { loc: `${base}/en/basic-japanese-grammar/`, lastmod: now },
    { loc: `${base}/en/exercises/`, lastmod: now },
    { loc: `${base}/en/about/`, lastmod: now },
    { loc: `${base}/en/contact/`, lastmod: now },

    { loc: `${base}/en/articles/jlpt/`, lastmod: now },
    { loc: `${base}/en/articles/series/`, lastmod: now },

    { loc: `${base}/en/articles/c/concepts-and-distinctions/`, lastmod: now },
    { loc: `${base}/en/articles/c/grammar-dissections/`, lastmod: now },
    { loc: `${base}/en/articles/c/niche-japanese/`, lastmod: now },
    { loc: `${base}/en/articles/c/history-of-grammar/`, lastmod: now },
    { loc: `${base}/en/articles/c/functional-kanji/`, lastmod: now },
  ];

  // UNIONE DI TUTTI GLI INDIRIZZI
  const urls = [
    ...staticUrls,
    ...articleUrls,
    ...englishArticleUrls,
    ...basicGrammarUrls,
    ...englishBasicGrammarUrls,
    ...exerciseUrls,
    ...englishExerciseUrls
  ]
    .filter((item) => item.loc)
    .sort((a, b) => a.loc.localeCompare(b.loc));

  // GENERAZIONE DELLA SITEMAP XML
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
