import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";
import typography from "@tailwindcss/typography";

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.svelte', './src/**/*.css', './index.html'],
  theme: {
    container: {
      center: true,
      screens: {
        "2xl": "1440px"
      }
    },
    extend: {
      colors: {
        neo: {
          'violet-200': '#A8A6FF',
          'violet-300': '#918efa',
          'violet-400': '#807dfa',
          'pink-200': '#FFA6F6',
          'pink-300': '#fa8cef',
          'pink-400': '#fa7fee',
          'red-200': '#FF9F9F',
          'red-300': '#fa7a7a',
          'red-400': '#f76363',
          'orange-200': '#FFC29F',
          'orange-300': '#FF965B',
          'orange-400': '#fa8543',
          'yellow-200': '#FFF066',
          'yellow-300': '#FFE500',
          'yellow-400': '#FFE500',
          'lime-200': '#B8FF9F',
          'lime-300': '#9dfc7c',
          'lime-400': '#7df752',
          'cyan-200': '#A6FAFF',
          'cyan-300': '#79F7FF',
          'cyan-400': '#53f2fc',
        },
        border: {
          DEFAULT: "hsl(var(--border-card))",
          input: "hsl(var(--border-input))"
        },
        background: {
          DEFAULT: "hsl(var(--background) / <alpha-value>)"
        },
        foreground: {
          DEFAULT: "hsl(var(--foreground) / <alpha-value>)",
          alt: "hsl(var(--foreground-alt) / <alpha-value>)"
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground))"
        },
        dark: {
          DEFAULT: "hsl(var(--dark) / <alpha-value>)",
          4: "hsl(var(--dark-04))",
          10: "hsl(var(--dark-10))",
          40: "hsl(var(--dark-40))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)"
        },
        contrast: {
          DEFAULT: "hsl(var(--contrast) / <alpha-value>)"
        }
      },
			fontFamily: {
				sans: ["Inter", ...fontFamily.sans],
				mono: ["Space Mono", ...fontFamily.mono],
				alt: ["Courier", ...fontFamily.sans]
			},
      fontSize: {
        xxs: "10px"
      },
      borderWidth: {
        6: "6px"
      },
      borderRadius: {
        card: "16px",
        "card-lg": "20px",
        "card-sm": "10px",
        input: "9px",
        button: "5px",
        "5px": "5px",
        "9px": "9px",
        "10px": "10px",
        "15px": "15px"
      },
      height: {
        input: "3rem",
        "input-sm": "2.5rem"
      },
      boxShadow: {
        mini: "var(--shadow-mini)",
        "mini-inset": "var(--shadow-mini-inset)",
        popover: "var(--shadow-popover)",
        kbd: "var(--shadow-kbd)",
        btn: "var(--shadow-btn)",
        card: "var(--shadow-card)"
      },
      opacity: {
        8: "0.08"
      },
      scale: {
        80: ".80",
        98: ".98",
        99: ".99"
      }
    },
  },
  plugins: [
    require('tailwindcss-debug-screens'),
    typography,
		plugin(function ({ theme, matchUtilities }) {
			// Square utility
			matchUtilities(
				{
					sq: (value) => ({
						width: value,
						height: value
					})
				},
				{
					values: theme("spacing")
				}
			);
		})
  ],
} satisfies Config;
