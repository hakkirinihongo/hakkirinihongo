import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import netlify from '@astrojs/netlify';

export default defineConfig({
  site: 'https://hakkirinihongo.com',
  trailingSlash: 'always',
  integrations: [
    mdx()
  ],
  adapter: netlify(),
});
