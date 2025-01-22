// src/postcss.config.ts
import type { Config } from 'postcss-load-config';

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
} satisfies Config;