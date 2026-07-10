import type { Config } from "tailwindcss";
const config: Config = { content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"], theme: { extend: { colors: { "brand-soft": "#d7f3f7", "brand-ink": "#205864", "brand-accent": "#65ccd4", "brand-muted": "#80b8c3", "status-confirmed": "#237753", "status-confirmed-bg": "#d1f1de", "status-confirmed-text": "#548464", "status-declined": "#eb1c24", "brand-secondary": "#3b549c" }, boxShadow: { card: "0 8px 24px rgba(32, 88, 100, .10)" } } }, plugins: [] };
export default config;
