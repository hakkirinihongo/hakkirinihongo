import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap'; // [AGGIUNTO]

export default defineConfig({
  site: 'https://hakkirinihongo.com',
  trailingSlash: 'always', // [AGGIUNTO] Forza la barra finale su tutti gli URL
  integrations: [
    mdx(), 
    sitemap() // [AGGIUNTO] Genera automaticamente la mappa per Google
  ],
});
