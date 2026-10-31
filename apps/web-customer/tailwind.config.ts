import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: { 700: "var(--brand-700)", 900: "var(--brand-900)" },
        primary: "var(--primary)",
        surface: "var(--surface)",
        page: "var(--bg)",
        muted: "var(--text-muted)",
        ink: "var(--text)",
        "ink-strong": "var(--text-strong)",
        "hero-mint": "var(--hero-mint)",
        "deposit-tint": "var(--deposit-tint)",
        "withdraw-tint": "var(--withdraw-tint)",
        whatsapp: "var(--whatsapp)"
      },
      borderRadius: { card: "16px", input: "12px" }
    }
  },
  plugins: []
};

export default config;
