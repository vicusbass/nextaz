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
  site: 'https://nextaz.ro',

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
          'https://nextaz.ro/cart/',
          'https://nextaz.ro/checkout/',
          'https://nextaz.ro/payment/failure/',
          'https://nextaz.ro/payment/success/',
          'https://nextaz.ro/setari-cookies/',
        ].includes(page),
    }),
  ],

  adapter: vercel(),
});
