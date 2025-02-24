/** @type {import('tailwindcss').Config} */

// Based on instructions found here: https://www.material-tailwind.com/docs/react/guide/next
const withMT = require('@material-tailwind/react/utils/withMT');

export default withMT({
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)'
      }
    }
  },
  plugins: []
});
