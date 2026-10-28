// Generates the CloudResume architecture diagram (static SVG, no JS at runtime).
// Run: node architecture.gen.mjs > architecture.svg
//
// The README embeds PNG renders rather than the SVG, because GitHub serves raw .svg as
// text/plain with nosniff. Regenerate both after any change here — they are 2x renders of
// the viewBox, and the dark one comes from emulating prefers-color-scheme rather than a
// separate stylesheet:
//
//   CHROME=/path/to/chrome   # any Chromium; Playwright's is at $PLAYWRIGHT_BROWSERS_PATH
//   $CHROME --headless --no-sandbox --hide-scrollbars --force-color-profile=srgb \
//     --force-device-scale-factor=2 --window-size=1320,1120 \
//     --screenshot=architecture-light.png file://$PWD/architecture.svg
//   $CHROME --headless --no-sandbox --hide-scrollbars --force-color-profile=srgb \
//     --force-device-scale-factor=2 --window-size=1320,1120 \
//     --blink-settings=preferredColorScheme=0 \
//     --screenshot=architecture-dark.png file://$PWD/architecture.svg
//
// --window-size must track H and W below, or the render will letterbox.

const W = 1320;
const H = 1120;

// ---- palette (AWS-style category coloring, original values) ---------------
const cat = {
  client:   { fill: '#7C8898', ink: '#FFFFFF', name: 'Client' },
  edge:     { fill: '#6C4CE0', ink: '#FFFFFF', name: 'Networking & Delivery' },
  security: { fill: '#D64550', ink: '#FFFFFF', name: 'Security & Identity' },
  storage:  { fill: '#4C9A63', ink: '#FFFFFF', name: 'Storage' },
  compute:  { fill: '#E07B29', ink: '#FFFFFF', name: 'Compute' },
  database: { fill: '#3D5AC4', ink: '#FFFFFF', name: 'Database' },
  integ:    { fill: '#C23E86', ink: '#FFFFFF', name: 'Messaging & Integration' },
  mgmt:     { fill: '#157A8C', ink: '#FFFFFF', name: 'Management' },
  cicd:     { fill: '#3A4552', ink: '#FFFFFF', name: 'CI/CD (GitHub)' },
};

const B = 56, r = 13;

// ---- icon glyphs (original, simple primitives — not AWS's copyrighted artwork)
const icons = {
  user: `<circle cx="0" cy="-6" r="7" fill="currentColor"/><path d="M -12 15 Q 0 -3 12 15 Z" fill="currentColor"/>`,
  globe: `<circle cx="0" cy="0" r="14" fill="none" stroke="currentColor" stroke-width="2.4"/>
    <ellipse cx="0" cy="0" rx="6" ry="14" fill="none" stroke="currentColor" stroke-width="2.2"/>
    <line x1="-14" y1="0" x2="14" y2="0" stroke="currentColor" stroke-width="2.2"/>
    <path d="M -12 -7 Q 0 -3 12 -7" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M -12 7 Q 0 3 12 7" fill="none" stroke="currentColor" stroke-width="2"/>`,
  shield: `<path d="M0 -14 L12 -9 V2 C12 9 6 14 0 16 C-6 14 -12 9 -12 2 V-9 Z" fill="none" stroke="currentColor" stroke-width="2.4"/>
    <path d="M-5 0 L-1 5 L6 -6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  cloud: `<path d="M-13 6 A7 7 0 0 1 -11 -8 A9 9 0 0 1 6 -11 A8 8 0 0 1 14 3 A6 6 0 0 1 12 15 H-9 A6 6 0 0 1 -13 6 Z" fill="none" stroke="currentColor" stroke-width="2.4"/>`,
  door: `<rect x="-11" y="-13" width="22" height="26" rx="2" fill="none" stroke="currentColor" stroke-width="2.3"/>
    <line x1="-11" y1="-13" x2="3" y2="-16" stroke="currentColor" stroke-width="2.1"/>
    <line x1="-11" y1="13" x2="3" y2="16" stroke="currentColor" stroke-width="2.1"/>
    <line x1="11" y1="-13" x2="3" y2="-16" stroke="currentColor" stroke-width="2.1"/>
    <line x1="11" y1="13" x2="3" y2="16" stroke="currentColor" stroke-width="2.1"/>
    <circle cx="4" cy="0" r="1.6" fill="currentColor"/>`,
  bucket: `<path d="M-12 -9 L-10 12 A11 3 0 0 0 10 12 L12 -9" fill="none" stroke="currentColor" stroke-width="2.3"/>
    <ellipse cx="0" cy="-9" rx="12" ry="3.2" fill="none" stroke="currentColor" stroke-width="2.3"/>`,
  lambda: `<path d="M-9 14 L-1.5 -14 M-1.5 -14 L2 -14 M-4.5 2 L7 14 M-4.5 2 L-9.6 14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  db: `<ellipse cx="0" cy="-9" rx="12" ry="4.2" fill="none" stroke="currentColor" stroke-width="2.3"/>
    <path d="M-12 -9 V9 A12 4.2 0 0 0 12 9 V-9" fill="none" stroke="currentColor" stroke-width="2.3"/>
    <path d="M-12 0 A12 4.2 0 0 0 12 0" fill="none" stroke="currentColor" stroke-width="2"/>`,
  queue: `<rect x="-13" y="-6" width="9" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="2.1"/>
    <rect x="-2" y="-8" width="9" height="16" rx="1.5" fill="none" stroke="currentColor" stroke-width="2.1"/>
    <rect x="9" y="-6" width="9" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="2.1"/>`,
  mail: `<rect x="-13" y="-9" width="26" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2.3"/>
    <path d="M-13 -8 L0 3 L13 -8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>`,
  clock: `<circle cx="0" cy="0" r="14" fill="none" stroke="currentColor" stroke-width="2.3"/>
    <path d="M0 -8 V0 L6 4" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>
    <path d="M11 -11 A14 14 0 0 1 13 -2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  eye: `<path d="M-14 0 C-9 -9 9 -9 14 0 C9 9 -9 9 -14 0 Z" fill="none" stroke="currentColor" stroke-width="2.2"/>
    <circle cx="0" cy="0" r="4.5" fill="none" stroke="currentColor" stroke-width="2.2"/>`,
  key: `<circle cx="-6" cy="-6" r="6" fill="none" stroke="currentColor" stroke-width="2.3"/>
    <path d="M-1.5 -1 L13 13 M9 9 L13 5 M5 13 L9 9" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>`,
  cert: `<rect x="-12" y="-13" width="24" height="19" rx="2" fill="none" stroke="currentColor" stroke-width="2.3"/>
    <path d="M-7 -6 H7 M-7 -1 H1" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>
    <circle cx="6" cy="9" r="4" fill="none" stroke="currentColor" stroke-width="2.1"/>
    <path d="M3 12 L2 17 L6 15 L10 17 L9 12" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>`,
  pulse: `<path d="M-14 1 H-7 L-3 -9 L2 10 L6 1 H14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  git: `<circle cx="0" cy="4" r="5" fill="none" stroke="currentColor" stroke-width="2.2"/>
    <circle cx="-11" cy="-10" r="4.2" fill="none" stroke="currentColor" stroke-width="2.1"/>
    <circle cx="11" cy="-10" r="4.2" fill="none" stroke="currentColor" stroke-width="2.1"/>
    <path d="M0 -1 V-6 M0 -6 Q0 -10 -7 -10 M0 -6 Q0 -10 7 -10" fill="none" stroke="currentColor" stroke-width="2.1"/>`,
};

function mknode(id, cx, cy, label, sub, category, iconKey, size = B, sub2 = null) {
  return { id, cx, cy, label, sub, category, iconKey, size, sub2 };
}
const N = {};
function add(...a) { const n = mknode(...a); N[n.id] = n; return n; }

// ---- layout ----------------------------------------------------------------
// Row A (y=260): request-flow entry
add('visitor', 90, 260, 'Visitor', 'browser', 'client', 'user', 50);
add('r53', 260, 260, 'Route 53', 'DNS · DNSSEC', 'edge', 'globe');
add('waf', 470, 140, 'WAF', 'managed rules', 'security', 'shield', 46);
add('cf', 470, 260, 'CloudFront', 'OAC · signed /files/*', 'edge', 'cloud');
add('apigw', 470, 400, 'API Gateway', 'EDGE · custom domain', 'edge', 'door', B, 'throttle 10/20 · 2/5');
add('s3', 680, 260, 'S3', 'site + data', 'storage', 'bucket');
add('lsend', 890, 330, 'λ sendMessage', 'POST /contact', 'compute', 'lambda', 50);
add('ltrack', 890, 450, 'λ trackVisitors', 'GET /visitors', 'compute', 'lambda', 50);
add('ses', 1130, 330, 'SES', 'mail · DKIM/SPF/DMARC', 'integ', 'mail');
add('ddb', 1130, 450, 'DynamoDB', '3 tables', 'database', 'db');
add('ldownload', 890, 570, 'λ downloadResume', 'GET /download', 'compute', 'lambda', 50);
add('ssm', 1130, 570, 'SSM', 'signing key', 'mgmt', 'key', 46);
add('health', 260, 150, 'R53 Health Check', 'HTTPS /index.html', 'edge', 'pulse', 46);
add('acm', 592, 560, 'ACM', 'site + api cert', 'security', 'cert', 46);
add('logs', 890, 150, 'S3 Access Logs', 'site + CloudFront', 'storage', 'bucket', 50);

// Row B (y=750): event-driven automation
add('eventbridge', 260, 750, 'EventBridge', 'rate(6h)', 'integ', 'clock');
add('lupdate', 470, 750, 'λ updateContributions', 'merges GH graphs', 'compute', 'lambda', 50);
add('sqs', 650, 750, 'SQS', 'invalidation queue', 'integ', 'queue', 50);
add('linvalidate', 890, 750, 'λ cloudfrontInvalidation', 'batch 15 / 5s window', 'compute', 'lambda', 50);

// Row C (y=950): observability + CI/CD
add('cw', 680, 950, 'CloudWatch', 'logs + metrics', 'mgmt', 'eye');
add('iam', 890, 950, 'IAM', 'least-privilege roles', 'security', 'key', 46);
add('gha', 90, 950, 'GitHub Actions', 'OIDC, no static keys', 'cicd', 'git');
add('tfstate', 300, 950, 'Terraform State', 'S3 backend · lock file', 'storage', 'bucket', 50);

// ---- edges ------------------------------------------------------------------
const E = [];
function edge(from, to, type, label, labelPos, opts = {}) {
  E.push({ from, to, type, label, labelPos, ...opts });
}

edge('visitor', 'r53', 'sync', null);
edge('r53', 'cf', 'sync', 'alias A', { x: 365, y: 244 });
edge('r53', 'apigw', 'sync', 'alias A · api.*', { x: 350, y: 386 });
edge('waf', 'cf', 'sync', null, null, { short: true });
edge('cf', 's3', 'sync', 'origin fetch', { x: 575, y: 244 });
edge('apigw', 'lsend', 'sync', null);
edge('apigw', 'ltrack', 'sync', null);
edge('lsend', 'ses', 'sync', 'send email', { x: 1010, y: 314 });
edge('ltrack', 'ddb', 'sync', 'put / get item', { x: 1010, y: 434 });
edge('apigw', 'ldownload', 'sync', null);
edge('ldownload', 'ssm', 'sync', 'GetParameter', { x: 1010, y: 554 });
edge('ldownload', 'ddb', 'sync', 'record download', { x: 1000, y: 516 }, { path: 'download-ddb' });

edge('eventbridge', 'lupdate', 'event', 'invoke', { x: 365, y: 734 });
edge('s3', 'sqs', 'event', 'ObjectCreated', { x: 730, y: 445 }, { path: 'straight' });
edge('sqs', 'linvalidate', 'event', 'event source map', { x: 770, y: 734 });
edge('lupdate', 's3', 'sync', 'PutObject contributions.json', { x: 900, y: 414 }, { path: 'return-right' });
edge('linvalidate', 'cf', 'event', 'CreateInvalidation (async)', { x: 145, y: 405 }, { path: 'return-left' });

edge('gha', 's3', 'sync', 'sync build --delete', { x: 300, y: 340 }, { path: 'cicd-deploy' });
edge('gha', null, 'sync', 'terraform apply → AWS', { x: 130, y: 700 }, { path: 'cicd-boundary' });

edge('health', 'cf', 'sync', 'HTTPS probe', { x: 346, y: 134 }, { path: 'health-probe' });
edge('acm', 'cf', 'sync', 'TLS cert', { x: 504, y: 520 }, { path: 'acm-cf' });
edge('acm', 'apigw', 'sync', null, null, { path: 'acm-api' });
edge('gha', 'tfstate', 'sync', 'state + lock', { x: 196, y: 986 }, { path: 'tf-state' });

const logSources = ['lsend', 'ltrack', 'ldownload', 'lupdate', 'linvalidate', 'waf'];

// ---- helpers ------------------------------------------------------------------
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

function badge(n) {
  const half = n.size / 2;
  const c = cat[n.category];
  const labelY = n.cy + half + 17;
  const subY = labelY + 15;
  const sub = n.sub ? `<text x="${n.cx}" y="${subY}" class="sub" text-anchor="middle">${esc(n.sub)}</text>` : '';
  const sub2 = n.sub2 ? `<text x="${n.cx}" y="${subY + 13}" class="sub" text-anchor="middle">${esc(n.sub2)}</text>` : '';
  return `
  <g class="node">
    <rect x="${n.cx - half}" y="${n.cy - half}" width="${n.size}" height="${n.size}" rx="${r}" class="badge" fill="${c.fill}"/>
    <g transform="translate(${n.cx} ${n.cy})" color="${c.ink}" class="icon">${icons[n.iconKey]}</g>
    <text x="${n.cx}" y="${labelY}" class="label" text-anchor="middle">${esc(n.label)}</text>
    ${sub}
    ${sub2}
  </g>`;
}

function edgePath(e) {
  const a = N[e.from];
  const b = e.to ? N[e.to] : null;
  const ah = a.size / 2, bh = b ? b.size / 2 : 0;
  if (e.short) return `M ${a.cx} ${a.cy + ah} L ${b.cx} ${b.cy - bh}`;
  switch (e.path) {
    case 'straight':
      return `M ${a.cx} ${a.cy + ah} L ${b.cx} ${b.cy - bh}`;
    case 'return-right':
      // lupdate -> s3: dip below the automation row, rise in a clear side channel, step
      // left into S3's bottom-right corner.
      return `M ${a.cx} ${a.cy + ah} L ${a.cx} 820 L 760 820 L 760 344 L ${b.cx + 16} 344 L ${b.cx + 16} ${b.cy + bh}`;
    case 'return-left':
      // linvalidate -> cf: dip below the automation row, run to the far-left margin
      // (clear of every node), rise, then in to CloudFront's bottom-left.
      return `M ${a.cx} ${a.cy + ah} L ${a.cx} 855 L 30 855 L 30 344 L ${b.cx - 16} 344 L ${b.cx - 16} ${b.cy + bh}`;
    case 'download-ddb':
      // ldownload -> ddb: leave from the top, run under trackVisitors' caption, and enter
      // DynamoDB's left edge below the trackVisitors arrow so the two do not stack.
      return `M ${a.cx} ${a.cy - ah} L ${a.cx} 520 L 1040 520 L 1040 465 L ${b.cx - bh} 465`;
    case 'cicd-deploy':
      // gha -> s3: right, up a clear column (between Visitor and Route53), then right
      // into S3's bottom-left corner — clear of Route53's caption and the WAF column.
      return `M ${a.cx + ah} ${a.cy} L 180 ${a.cy} L 180 350 L ${b.cx - 16} 350 L ${b.cx - 16} ${b.cy + bh}`;
    case 'health-probe':
      // health -> cf: right, down a clear column between the alias A caption and the WAF
      // log run, then into CloudFront's left edge above the Route 53 alias arrow.
      return `M ${a.cx + ah} ${a.cy} L 405 ${a.cy} L 405 240 L ${b.cx - bh} 240`;
    case 'acm-cf':
      // acm -> cf: left to a trunk column, up past API Gateway's outbound lines, into
      // CloudFront's right edge below the origin-fetch arrow.
      return `M ${a.cx - ah} ${a.cy} L 538 ${a.cy} L 538 280 L ${b.cx + bh} 280`;
    case 'acm-api':
      // branch off the trunk above into API Gateway's right edge
      return `M 538 420 L ${b.cx + bh} 420`;
    case 'tf-state':
      // below the cicd-deploy departure so the two do not share a segment
      return `M ${a.cx + ah} 964 L ${b.cx - bh} 964`;
    case 'cicd-boundary':
      // gha -> the AWS request-flow boundary (represents "provisions everything above")
      return `M ${a.cx} ${a.cy - ah} L ${a.cx} 640`;
    default: {
      if (Math.abs(a.cy - b.cy) < 2) return `M ${a.cx + ah} ${a.cy} L ${b.cx - bh} ${b.cy}`;
      const midX = (a.cx + b.cx) / 2;
      return `M ${a.cx + ah} ${a.cy} L ${midX} ${a.cy} L ${midX} ${b.cy} L ${b.cx - bh} ${b.cy}`;
    }
  }
}

function edgeSvg(e) {
  const cls = e.type === 'event' ? 'edge edge-event' : 'edge edge-sync';
  const marker = e.type === 'event' ? 'url(#arrow-event)' : 'url(#arrow-sync)';
  const d = edgePath(e);
  let labelSvg = '';
  if (e.label && e.labelPos) {
    const { x, y } = e.labelPos;
    const w = e.label.length * 6.1 + 10;
    labelSvg = `<g class="edge-label">
      <rect x="${x - w / 2}" y="${y - 10}" width="${w}" height="15" class="edge-label-bg"/>
      <text x="${x}" y="${y + 1}" text-anchor="middle" class="edge-text">${esc(e.label)}</text>
    </g>`;
  }
  return `<path d="${d}" class="${cls}" marker-end="${marker}" fill="none"/>${labelSvg}`;
}

// explicit, collision-checked routes from each log source into a shared bus line,
// which then makes a single drop into CloudWatch (avoids stacking arrowheads).
const cwNode = N['cw'];
const busY = cwNode.cy - 40; // 790
function logLine(fromId) {
  const a = N[fromId];
  const routes = {
    waf:         `M ${a.cx + a.size/2} ${a.cy} L 558 ${a.cy} L 558 ${busY} L ${cwNode.cx} ${busY}`,
    lsend:       `M ${a.cx + a.size/2} ${a.cy} L 980 ${a.cy} L 980 ${busY} L ${cwNode.cx} ${busY}`,
    ltrack:      `M ${a.cx + a.size/2} ${a.cy} L 1000 ${a.cy} L 1000 ${busY} L ${cwNode.cx} ${busY}`,
    ldownload:   `M ${a.cx + a.size/2} ${a.cy} L 1020 ${a.cy} L 1020 ${busY} L ${cwNode.cx} ${busY}`,
    lupdate:     `M ${a.cx + a.size/2} ${a.cy} L 562 ${a.cy} L 562 ${busY} L ${cwNode.cx} ${busY}`,
    linvalidate: `M ${a.cx} ${a.cy + a.size/2} L ${a.cx} ${busY} L ${cwNode.cx} ${busY}`,
  };
  // no marker here — these feed into the shared trunk below, which carries the one arrowhead
  return `<path d="${routes[fromId]}" class="edge edge-log" fill="none"/>`;
}
function logTrunk() {
  return `<path d="M ${cwNode.cx} ${busY} L ${cwNode.cx} ${cwNode.cy - cwNode.size/2}" class="edge edge-log" marker-end="url(#arrow-log)" fill="none"/>`;
}

// CloudFront and S3 server access logs land in one bucket. Same trunk idiom as the
// CloudWatch bus: the CloudFront feeder merges into S3's run, which carries the arrowhead.
function logBucketLines() {
  const lg = N['logs'], s3 = N['s3'], cf = N['cf'];
  return `<path d="M ${cf.cx + 20} ${cf.cy - cf.size / 2} L ${cf.cx + 20} 212 L ${s3.cx} 212" class="edge edge-log" fill="none"/>
<path d="M ${s3.cx} ${s3.cy - s3.size / 2} L ${s3.cx} ${lg.cy} L ${lg.cx - lg.size / 2} ${lg.cy}" class="edge edge-log" marker-end="url(#arrow-log)" fill="none"/>
<g class="edge-label"><rect x="${(s3.cx + lg.cx) / 2 - 56}" y="${lg.cy - 20}" width="112" height="15" class="edge-label-bg"/>
<text x="${(s3.cx + lg.cx) / 2}" y="${lg.cy - 9}" text-anchor="middle" class="edge-text">server access logs</text></g>`;
}

const zones = [
  { x: 20, y: 90, w: 1280, h: 550, label: 'REQUEST PATH' },
  { x: 20, y: 670, w: 1280, h: 200, label: 'EVENT-DRIVEN AUTOMATION' },
  { x: 20, y: 890, w: 1280, h: 160, label: 'OBSERVABILITY & DEPLOYMENT' },
];

const legendItems = Object.values(cat);

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="ui-sans-serif, -apple-system, Segoe UI, Roboto, sans-serif">
<style>
  :root {
    --bg: #F6F7F9; --panel: #FFFFFF; --zone-border: #D7DCE3; --zone-label: #8891A0;
    --ink: #1B2430; --muted: #5B6472; --line: #9AA3B2; --line-event: #A96BC4;
    --label-bg: #F6F7F9; --log-line: #C7CDD6;
  }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #10151C; --panel: #161D27; --zone-border: #2A3442; --zone-label: #6B7686;
      --ink: #E7ECF3; --muted: #8B96A5; --line: #6B7686; --line-event: #B487CB;
      --label-bg: #10151C; --log-line: #333E4C; }
  }
  svg { background: var(--bg); }
  .zone-rect { fill: none; stroke: var(--zone-border); stroke-width: 1.5; stroke-dasharray: 5 5; }
  .zone-label { fill: var(--zone-label); font-size: 11px; letter-spacing: 2px; font-weight: 600; }
  .label { fill: var(--ink); font-size: 12.5px; font-weight: 600; }
  .sub { fill: var(--muted); font-size: 10px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .edge-sync { stroke: var(--line); stroke-width: 1.8; }
  .edge-event { stroke: var(--line-event); stroke-width: 1.8; stroke-dasharray: 5 4; }
  .edge-log { stroke: var(--log-line); stroke-width: 1.3; stroke-dasharray: 1.5 3; }
  .edge-text { fill: var(--muted); font-size: 10px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .edge-label-bg { fill: var(--label-bg); opacity: 0.92; }
  .badge { filter: drop-shadow(0 1px 2px rgba(0,0,0,0.18)); }
  .title { fill: var(--ink); font-size: 21px; font-weight: 700; }
  .subtitle { fill: var(--muted); font-size: 12.5px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .legend-text { fill: var(--muted); font-size: 10.5px; }
  .legend-key { fill: var(--muted); font-size: 10px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
</style>
<defs>
  <marker id="arrow-sync" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0 0 L10 5 L0 10 Z" fill="var(--line)"/>
  </marker>
  <marker id="arrow-event" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0 0 L10 5 L0 10 Z" fill="var(--line-event)"/>
  </marker>
  <marker id="arrow-log" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M0 0 L10 5 L0 10 Z" fill="var(--log-line)"/>
  </marker>
</defs>

<text x="30" y="34" class="title">CloudResume — Serverless Architecture</text>
<text x="30" y="56" class="subtitle">v9 · single AWS account · us-east-1 · fully serverless, no idle compute</text>

${zones.map(z => `<rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="14" class="zone-rect"/><text x="${z.x + 14}" y="${z.y + 20}" class="zone-label">${esc(z.label)}</text>`).join('\n')}

${E.map(edgeSvg).join('\n')}
${logSources.map(logLine).join('\n')}
${logTrunk()}
${logBucketLines()}

${Object.values(N).map(badge).join('\n')}

<g transform="translate(30, ${H - 22})">
  <line x1="0" y1="-4" x2="26" y2="-4" class="edge-sync" marker-end="url(#arrow-sync)"/>
  <text x="32" y="0" class="legend-text">request / response</text>
  <line x1="190" y1="-4" x2="216" y2="-4" class="edge-event" marker-end="url(#arrow-event)"/>
  <text x="222" y="0" class="legend-text">async event</text>
  <line x1="340" y1="-4" x2="366" y2="-4" class="edge-log" marker-end="url(#arrow-log)"/>
  <text x="372" y="0" class="legend-text">logs / metrics</text>
  <text x="520" y="0" class="legend-text">API throttle (rps / burst): 10/20 on every method, 2/5 on GET /download</text>
</g>
</svg>`;

process.stdout.write(svg);
