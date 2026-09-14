// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://maceo-narbonnet.github.io',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
