import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://hakkirinihongo.com',
  trailingSlash: 'never', // Rimuove la slash finale dagli URL
  integrations: [sitemap()],
  build: {
    format: 'file', // Genera 'about.html' invece di 'about/index.html'
  },
});
