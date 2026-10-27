/**
 * Client-Side Open Graph Image Generator
 * Produces crisp, dynamic 1200x630 SVG data URIs for task previews with 0 network calls.
 * Uses the exact Vantage Loop / Corbel design system:
 * - Fonts: Urbanist & JetBrains Mono
 * - Colors: Slate Obsidian (#0c1216, #172129), Soft Cerulean (#79b6e3), Mint (#6fd3b0), Warm Coral (#f08c7d)
 * - Strict adherence to AGENTS.md (uniform 1px borders, subtle gradients, no neon or asymmetric borders)
 */

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Splits text into lines for SVG <text> elements
 */
function wrapText(text, maxCharsPerLine = 48, maxLines = 2) {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  } else if (currentLine) {
    if (lines.length > 0) {
      lines[lines.length - 1] = lines[lines.length - 1].slice(0, maxCharsPerLine - 3) + '...';
    }
  }
  return lines;
}

/**
 * Generates raw SVG markup for a task card using app colors and fonts
 */
export function generateTaskOgSvg(task) {
  if (!task) return '';

  const taskId = escapeXml(task.id || 'TASK-ITEM');
  const rawTitle = task.title || 'Work Item Specification';
  const titleLines = wrapText(rawTitle, 44, 2).map(escapeXml);
  
  // App color tokens (Corbel design system)
  const isLoophole = task.type === 'loophole';
  const typeLabel = isLoophole ? 'Loophole' : 'Enhancement';
  const typeBg = isLoophole ? 'rgba(240, 140, 125, 0.12)' : 'rgba(111, 211, 176, 0.12)';
  const typeColor = isLoophole ? '#f08c7d' : '#6fd3b0';
  const typeBorder = isLoophole ? 'rgba(240, 140, 125, 0.28)' : 'rgba(111, 211, 176, 0.28)';

  const priority = (task.priority || 'medium').toLowerCase();
  let priorityColor = '#a7b3bb';
  let priorityBg = 'rgba(255, 255, 255, 0.05)';
  let priorityBorder = 'rgba(255, 255, 255, 0.1)';
  if (priority === 'high' || priority === 'urgent') {
    priorityColor = '#f08c7d';
    priorityBg = 'rgba(240, 140, 125, 0.10)';
    priorityBorder = 'rgba(240, 140, 125, 0.24)';
  } else if (priority === 'medium') {
    priorityColor = '#e8b86d';
    priorityBg = 'rgba(232, 184, 109, 0.10)';
    priorityBorder = 'rgba(232, 184, 109, 0.24)';
  } else if (priority === 'low') {
    priorityColor = '#6fd3b0';
    priorityBg = 'rgba(111, 211, 176, 0.10)';
    priorityBorder = 'rgba(111, 211, 176, 0.24)';
  }

  const priorityLabel = escapeXml(priority.toUpperCase());
  const stageLabel = escapeXml((task.status || 'ideation').replace('_', ' ').toUpperCase());

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&amp;family=Urbanist:wght@500;600;700;800&amp;display=swap');
      .font-sans { font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .font-mono { font-family: 'JetBrains Mono', monospace; }
    </style>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0c1216" />
      <stop offset="50%" stop-color="#11181f" />
      <stop offset="100%" stop-color="#172129" />
    </linearGradient>
    <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#2563EB" />
    </linearGradient>
    <filter id="ambient" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="80" result="blur" />
    </filter>
  </defs>

  <!-- Background Base (Corbel dark slate obsidian #0c1216) -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />

  <!-- Corbel Ambient Mesh Glows (Soft muted sapphire & mint, no neon) -->
  <circle cx="200" cy="140" r="220" fill="rgba(70, 140, 200, 0.16)" filter="url(#ambient)" />
  <circle cx="1040" cy="480" r="240" fill="rgba(46, 160, 128, 0.12)" filter="url(#ambient)" />

  <!-- Uniform Subtle Card Frame (1px border all around, strictly following AGENTS.md) -->
  <rect x="36" y="36" width="1128" height="558" rx="20" fill="rgba(23, 33, 41, 0.65)" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />

  <!-- Top Header Branding Row -->
  <g transform="translate(84, 84)">
    <!-- App Logo Squircle -->
    <rect width="48" height="48" rx="14" fill="url(#logoGrad)" />
    <rect x="0.75" y="0.75" width="46.5" height="46.5" rx="13.25" stroke="rgba(255, 255, 255, 0.22)" stroke-width="1.2" fill="none" />
    <circle cx="24" cy="24" r="12.5" stroke="rgba(255, 255, 255, 0.35)" stroke-width="2.5" fill="none" />
    <path d="M24 11.5 C30.9 11.5 36.5 17.1 36.5 24 C36.5 30.9 30.9 36.5 24 36.5" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M18 24.5 L22 28.5 L30.5 19.5" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <circle cx="34" cy="14" r="2.6" fill="#34D399" />

    <!-- App Name with Corbel Typography -->
    <text x="64" y="33" fill="#ededeb" class="font-sans" font-size="24" font-weight="800" letter-spacing="0.5">
      Issue Tracker
    </text>
    <text x="236" y="33" fill="#79b6e3" class="font-sans" font-size="14" font-weight="700" letter-spacing="1.5">
      WORKSPACE
    </text>
  </g>

  <!-- Task Badges Row (Task ID + Type Pill) -->
  <g transform="translate(84, 185)">
    <!-- Task ID Capsule -->
    <rect width="160" height="40" rx="10" fill="rgba(121, 182, 227, 0.12)" stroke="rgba(121, 182, 227, 0.28)" stroke-width="1" />
    <text x="80" y="26" fill="#79b6e3" class="font-mono" font-size="18" font-weight="700" text-anchor="middle" letter-spacing="0.5">
      ${taskId}
    </text>

    <!-- Type Pill -->
    <g transform="translate(176, 0)">
      <rect width="160" height="40" rx="10" fill="${typeBg}" stroke="${typeBorder}" stroke-width="1" />
      <text x="80" y="25" fill="${typeColor}" class="font-sans" font-size="14" font-weight="700" text-anchor="middle" letter-spacing="0.5">
        ${typeLabel}
      </text>
    </g>
  </g>

  <!-- Main Headline Title (Multi-line) -->
  <g transform="translate(84, 275)">
    ${titleLines.map((line, idx) => `<text x="0" y="${idx * 58 + 48}" fill="#ededeb" class="font-sans" font-size="42" font-weight="700">
      ${line}
    </text>`).join('\n    ')}
  </g>

  <!-- Footer Metadata Tags Row (Priority + Stage + Environment) -->
  <g transform="translate(84, 490)">
    <!-- Priority Pill -->
    <rect x="0" y="0" width="200" height="42" rx="10" fill="${priorityBg}" stroke="${priorityBorder}" stroke-width="1" />
    <text x="20" y="26" fill="#a7b3bb" class="font-sans" font-size="13" font-weight="500">
      Priority:
    </text>
    <text x="80" y="26" fill="${priorityColor}" class="font-sans" font-size="14" font-weight="700">
      ${priorityLabel}
    </text>

    <!-- Stage Pill -->
    <g transform="translate(216, 0)">
      <rect x="0" y="0" width="200" height="42" rx="10" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.10)" stroke-width="1" />
      <circle cx="20" cy="21" r="4.5" fill="#6fd3b0" />
      <text x="34" y="26" fill="#ededeb" class="font-sans" font-size="13.5" font-weight="600">
        ${stageLabel}
      </text>
    </g>

    <!-- Project Domain Pill -->
    <g transform="translate(432, 0)">
      <rect x="0" y="0" width="240" height="42" rx="10" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />
      <text x="20" y="26" fill="#a7b3bb" class="font-mono" font-size="13" font-weight="500">
        balakamal.github.io
      </text>
    </g>
  </g>
</svg>`;
}

/**
 * Returns a self-contained data:image/svg+xml URI suitable for <img src="..." />
 */
export function getTaskOgDataUri(task) {
  const svg = generateTaskOgSvg(task);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
