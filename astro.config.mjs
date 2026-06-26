// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import svelte from '@astrojs/svelte';

import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.nextaz.ro',

  image: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },

  // Server-only secrets. Declared as `secret` so they are loaded from the
  // runtime environment (Vercel in prod, `.env` in dev) and never inlined
  // into the build bundle. All optional: consumers already guard for absence.
  env: {
    schema: {
      SUPABASE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      SUPABASE_SERVICE_ROLE_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESEND_TEMPLATE_CUSTOMER_CONFIRMATION: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      RESEND_TEMPLATE_ADMIN_NOTIFICATION: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      MAILERLITE_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      NETOPIA_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      NETOPIA_POS_SIGNATURE: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      NETOPIA_PUBLIC_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      NETOPIA_SANDBOX: envField.string({ context: 'server', access: 'secret', optional: true }),
      AXIOM_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      AXIOM_DATASET: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },

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
