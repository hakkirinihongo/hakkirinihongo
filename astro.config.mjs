import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap'; // Importa la sitemap

export default defineConfig({
  site: 'https://hakkirinihongo.com',
  trailingSlash: 'always', // Questo risolve l'errore di reindirizzamento di Google
  integrations: [
    mdx(), 
    sitemap() // Attiva la sitemap
  ],
});
