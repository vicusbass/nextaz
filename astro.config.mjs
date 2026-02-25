// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sanity from '@sanity/astro';
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';

import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.nextaz.ro',

  vite: {
    plugins: [tailwindcss()],
    // server: {
    //   allowedHosts: ['unhomologous-shirly-deliverly.ngrok-free.dev'],
    // },
  },

  integrations: [
    sanity({
      projectId: '5fmpwxu0',
      dataset: 'production',
      useCdn: false,
    }),
    react(),
    svelte(),
    sitemap({
      filter: (page) =>
        ![
          'https://www.nextaz.ro/cart/',
          'https://www.nextaz.ro/checkout/',
          'https://www.nextaz.ro/payment/failure/',
          'https://www.nextaz.ro/payment/success/',
          'https://www.nextaz.ro/setari-cookies/',
        ].includes(page),
    }),
  ],

  adapter: vercel(),
});
