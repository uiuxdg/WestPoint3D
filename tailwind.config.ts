import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/pages/**/*.{ts,tsx}",
  ],
  // Tailwind's `blocklist` is typed as string[] (exact class names), not patterns.
  // Keeping this empty avoids TypeScript errors; we instead fix the underlying
  // corrupted class candidate source.
  theme: {
    /**
     * Treat tablets (esp. portrait) as "mobile" layout.
     * We do this by bumping `md` up to 1024px so `md:` styles
     * only apply at true desktop widths.
     */
    screens: {
      sm: "640px",
      md: "1024px",
      lg: "1280px",
      xl: "1536px",
      "2xl": "1920px",
    },
    extend: {},
  },
  plugins: [],
} satisfies Config;

