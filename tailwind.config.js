/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Charred paper, not neutral black.
           The previous scale was a cool near-neutral, which read simply as
           "dark". The brief asks for warm dark brown and muted earth tones —
           aged manuscript, dark wood, ash — so every step now carries a brown
           bias. Contrast re-verified against the new 950: 400 is 5.1:1 and 300
           is 8.7:1, both above AA. */
        ink: {
          50: "#FAF7F1",
          100: "#F0EBE1",
          200: "#D8D0C2",
          300: "#B5AA98",
          400: "#8B7F6E", // lightest tone safe for body text (5.1:1 on ink-950)
          500: "#5F5445", // decorative / large text only
          600: "#3D352B",
          700: "#29231C",
          800: "#1D1914",
          850: "#17140F",
          900: "#12100D",
          950: "#0B0907", // page background — charred, not black
        },
        /* Gilt — the TYPOGRAPHIC accent. Eyebrows, rules, numerals, borders,
           chapter marks. Rare by design: gold reads as valuable only while it
           stays scarce. 8.8:1 on ink-950 at the 500 step. */
        gilt: {
            200: '#F2E0AE',
            300: '#EACB84',
            400: '#E2B75E',
            500: '#D9A441',
            600: '#B5862F',
            700: '#8A6522',
            800: '#5C4316',
        },
        /* Ember — the ENERGY accent. The phoenix, its sparks, primary actions.
           Gold and fire together, which is the whole brief: a dark codex
           illuminated by embers and gold. */
        ember: {
          50: "#FFF4EC",
          100: "#FFE3D0",
          200: "#FFC6A3",
          300: "#FFA26B",
          400: "#FF8340", // 8.0:1 on ink-950 — safe for accent body text
          500: "#F96A1B", // 6.5:1 — primary accent
          600: "#DB520B",
          700: "#B03D08",
          800: "#7E2C07",
          900: "#4A1A05",
          950: "#2A0E03",
        },
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        heading: ['"Cormorant Garamond"', "Georgia", "serif"],
        accent: ['"EB Garamond"', "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", '"Cascadia Code"', "Consolas", "monospace"],
      },

      /* One modular scale. Nothing in the app should use a raw text-* size.
         Retuned for Cormorant Garamond: it caps at weight 700, carries a small
         x-height (so display sizes run larger than the old Outfit values), and
         a Garamond is destroyed by tight tracking — hence letter-spacing near
         zero where the sans-serif scale used -0.045em. */
      fontSize: {
        meta: ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.08em", fontWeight: "700" }],
        eyebrow: ["0.75rem", { lineHeight: "1", letterSpacing: "0.22em", fontWeight: "700" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.6" }],
        body: ["0.9375rem", { lineHeight: "1.7" }],
        "body-lg": ["1.0625rem", { lineHeight: "1.7" }],
        "title-3": ["1.25rem", { lineHeight: "1.3", letterSpacing: "0", fontWeight: "600" }],
        "title-2": ["clamp(1.5rem, 2.6vw, 2.25rem)", { lineHeight: "1.15", letterSpacing: "-0.008em", fontWeight: "600" }],
        "title-1": ["clamp(2.25rem, 5vw, 4rem)", { lineHeight: "1.06", letterSpacing: "-0.01em", fontWeight: "600" }],
        "display-2": ["clamp(2.75rem, 8vw, 6rem)", { lineHeight: "0.98", letterSpacing: "-0.012em", fontWeight: "700" }],
        "display-1": ["clamp(3.75rem, 12vw, 10.5rem)", { lineHeight: "0.92", letterSpacing: "-0.015em", fontWeight: "700" }],
        /* Narrative voice — EB Garamond italic, for ledes and pull quotes. */
        lede: ["clamp(1.125rem, 1.8vw, 1.5rem)", { lineHeight: "1.55", fontWeight: "400" }],
      },

      spacing: {
        gutter: "clamp(1.25rem, 5vw, 4rem)",
        section: "clamp(5rem, 12vh, 9rem)",
      },

      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      /* Elevation ladder — use e1..e4, never an ad-hoc shadow-[...]. */
      boxShadow: {
        e1: "0 1px 2px rgba(0,0,0,0.40)",
        e2: "0 4px 16px -2px rgba(0,0,0,0.50)",
        e3: "0 16px 40px -8px rgba(0,0,0,0.60)",
        e4: "0 32px 80px -16px rgba(0,0,0,0.70)",
        glow: "0 0 0 1px rgba(249,106,27,0.25), 0 12px 48px -12px rgba(249,106,27,0.40)",
        "glow-lg": "0 0 0 1px rgba(249,106,27,0.30), 0 24px 90px -20px rgba(249,106,27,0.50)",
        hairline: "inset 0 1px 0 0 rgba(255,255,255,0.06)",
        /* Elevation + top hairline in one token — Tailwind can't stack two shadow-* classes. */
        card: "0 4px 16px -2px rgba(0,0,0,0.50), inset 0 1px 0 0 rgba(255,255,255,0.06)",
        "card-hover": "0 16px 40px -8px rgba(0,0,0,0.60), inset 0 1px 0 0 rgba(255,255,255,0.09)",
      },

      backgroundImage: {
        "ember-sheen": "linear-gradient(100deg, #FFC6A3 0%, #FF8340 40%, #F96A1B 70%, #DB520B 100%)",
        /* Gold leaf. Section headings take this; the hero keeps ember, so fire
           belongs to the phoenix and gold belongs to the manuscript. */
        "gilt-sheen": "linear-gradient(100deg, #F2E0AE 0%, #D9A441 45%, #B5862F 100%)",
        "ember-halo": "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(249,106,27,0.12), transparent 70%)",
        "dot-grid": "radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)",
      },

      transitionTimingFunction: {
        expo: "cubic-bezier(0.16, 1, 0.3, 1)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "scroll-hint": {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "35%": { opacity: "1" },
          "100%": { transform: "translateY(14px)", opacity: "0" },
        },
        sheen: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },

      animation: {
        "slow-spin": "spin 10s linear infinite",
        float: "float 6s ease-in-out infinite",
        "scroll-hint": "scroll-hint 1.8s cubic-bezier(0.16,1,0.3,1) infinite",
        sheen: "sheen 6s linear infinite",
      },
    },
  },
  plugins: [],
}
