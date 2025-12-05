/** @type {import("prettier").Config} */

export default {
  singleQuote: true,
  semi: true,
  tabWidth: 2,
  printWidth: 100,
  trailingComma: 'es5',
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
};
