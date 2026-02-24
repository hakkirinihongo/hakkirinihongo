import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// ✅ Sitemap DISATTIVATA per far passare il build.
// La riattiviamo dopo il deploy, con la config corretta.
export default defineConfig({
  site: 'https://hakkirinihongo.com',
  integrations: [mdx()],
});