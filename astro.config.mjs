// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

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
