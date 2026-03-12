import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://hakkirinihongo.com',
  integrations: [mdx()],
});
// astro.config.mjs
integrations: [
  sitemap({
    serialize(item) {
      if (item.url.endsWith('/') && item.url.length > (new URL(item.url).origin.length + 1)) {
        item.url = item.url.slice(0, -1);
      }
      return item;
    },
  }),
],
  export default defineConfig({
  trailingSlash: 'never',
  build: {
    format: 'file', // Fondamentale per generare 'about.html' invece di 'about/'
  },
});

