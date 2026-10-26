import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Open Graph & Social Sharing Plugin for Vite
 * 1. Dynamically transforms HTML for /task/:taskId routes for social bots & crawlers
 * 2. Generates dynamic 1200x630 SVG Open Graph preview cards at /api/og/:taskId
 */
function ogTagsPlugin() {
  return {
    name: 'og-tags-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const ogImageMatch = req.url && req.url.match(/^\/api\/og\/([a-zA-Z0-9_-]+)/);
        if (ogImageMatch) {
          const taskId = decodeURIComponent(ogImageMatch[1]).toUpperCase();
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0c1216" />
      <stop offset="100%" stop-color="#172129" />
    </linearGradient>
    <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#2563EB" />
    </linearGradient>
    <linearGradient id="textGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#79b6e3" />
      <stop offset="100%" stop-color="#6fd3b0" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="60" result="blur" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />

  <!-- Ambient Glowing Orbs -->
  <circle cx="200" cy="150" r="180" fill="#0284C7" opacity="0.18" filter="url(#glow)" />
  <circle cx="1050" cy="480" r="220" fill="#10B981" opacity="0.14" filter="url(#glow)" />

  <!-- Border Frame -->
  <rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="2" />

  <!-- Header Branding -->
  <g transform="translate(80, 80)">
    <!-- Logo Squircle -->
    <rect width="56" height="56" rx="16" fill="url(#brandGrad)" />
    <circle cx="28" cy="28" r="14" stroke="rgba(255, 255, 255, 0.35)" stroke-width="3" fill="none" />
    <path d="M28 14 C35.7 14 42 20.3 42 28" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M21 28.5 L26 33.5 L36 23" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <circle cx="40" cy="17" r="3" fill="#34D399" />

    <!-- Brand Name -->
    <text x="76" y="38" fill="#EDEDEB" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" letter-spacing="1">
      ISSUE TRACKER
    </text>
    <text x="320" y="38" fill="#79B6E3" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" letter-spacing="2">
      ENTERPRISE
    </text>
  </g>

  <!-- Task ID Capsule Pill -->
  <g transform="translate(80, 190)">
    <rect width="210" height="52" rx="14" fill="rgba(121, 182, 227, 0.16)" stroke="rgba(121, 182, 227, 0.36)" stroke-width="1.5" />
    <text x="105" y="34" fill="#79B6E3" font-family="'JetBrains Mono', monospace" font-size="24" font-weight="700" text-anchor="middle" letter-spacing="1">
      ${taskId}
    </text>
  </g>

  <!-- Main Headline -->
  <g transform="translate(80, 290)">
    <text x="0" y="44" fill="#EDEDEB" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800">
      Work Item Specification &amp; Backlog
    </text>
    <text x="0" y="100" fill="#A7B3BB" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="500">
      Collaborative issue tracking, architecture reviews, and sprint execution.
    </text>
  </g>

  <!-- Footer Tags & Status -->
  <g transform="translate(80, 480)">
    <!-- Stage Pill -->
    <rect x="0" y="0" width="180" height="42" rx="12" fill="rgba(255, 255, 255, 0.06)" stroke="rgba(255, 255, 255, 0.1)" />
    <circle cx="24" cy="21" r="5" fill="#34D399" />
    <text x="40" y="27" fill="#EDEDEB" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600">
      Active Sprint
    </text>

    <!-- Verified Pill -->
    <rect x="200" y="0" width="220" height="42" rx="12" fill="rgba(255, 255, 255, 0.06)" stroke="rgba(255, 255, 255, 0.1)" />
    <text x="220" y="27" fill="#A7B3BB" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500">
      TLS 1.3 End-to-End
    </text>
  </g>
</svg>`;
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          res.end(svg);
          return;
        }
        next();
      });
    },
    transformIndexHtml(html, ctx) {
      const url = ctx.originalUrl || ctx.url || '';
      const taskMatch = url.match(/\/(?:task|tasks|tickets)\/([a-zA-Z0-9_-]+)/i);
      if (taskMatch) {
        const taskId = decodeURIComponent(taskMatch[1]).toUpperCase();
        return html
          .replace(/<title>.*?<\/title>/i, `<title>[${taskId}] Task Details | Issue Tracker</title>`)
          .replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="[${taskId}] Work Item • Issue Tracker" />`)
          .replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="View task specifications, implementation checklist, and discussion for work item ${taskId} on Issue Tracker." />`)
          .replace(/<meta property="og:image" content=".*?" \/>/i, `<meta property="og:image" content="/api/og/${taskId}" />`)
          .replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="[${taskId}] Work Item • Issue Tracker" />`)
          .replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="View task specifications, implementation checklist, and discussion for work item ${taskId} on Issue Tracker." />`)
          .replace(/<meta name="twitter:image" content=".*?" \/>/i, `<meta name="twitter:image" content="/api/og/${taskId}" />`);
      }
      return html;
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), ogTagsPlugin()],
  base: process.env.BASE_URL || (process.env.NODE_ENV === 'production' ? '/issue-tracker/' : '/'),
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
});
