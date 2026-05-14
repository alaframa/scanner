// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './app/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './lib/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                bg: '#0a0a0a',
                surface: '#111111',
                elevated: '#1a1a1a',
                accent: '#f0ff44',
                success: '#44ff88',
                danger: '#ff4444',
                warning: '#ff8c00',
                border: '#2a2a2a',
            },
            fontFamily: {
                mono: ['JetBrains Mono', 'monospace'],
                sans: ['IBM Plex Sans', 'sans-serif'],
            },
            animation: {
                'flash-success': 'successFlash 600ms ease-out forwards',
            },
        },
    },
    plugins: [],
}

export default config