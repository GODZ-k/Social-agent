// Builds the run-progress design screens from the existing web-v2 screens, so they inherit the
// real tokens, the SVG sprite, the shell and the responsive CSS rather than restating any of it.
// Only <main> is replaced, plus a small block of extra CSS for the stepped list and the run hero.
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const outDir = path.join(root, "design", "run-progress");
fs.mkdirSync(outDir, { recursive: true });

const base = (p) => fs.readFileSync(path.join(root, "design", "web-v2", p), "utf8");
const overviewBase = base(path.join("screens-s03", "s03-v3-overview.html"));
const strategyBase = base(path.join("screens-s20", "s20a-strategy-draft.html"));

// The scan screen already owns the done/now/later language; copied verbatim so the three long jobs
// read identically. The .run-* rules are the only new ones, and they borrow the loop track's
// vocabulary (brand-2 behind, brand on the live one) rather than inventing a meter.
const EXTRA_CSS = `
<style>
.scan-step { display: flex; gap: 0.875rem; align-items: flex-start; padding: 0.875rem 0; }
.scan-dot { display: grid; place-items: center; width: 1.625rem; height: 1.625rem; border-radius: 999px; flex: none; }
.scan-dot.done { background: rgba(23, 138, 94, 0.12); color: var(--success); }
.scan-dot.now { background: var(--tint); color: var(--tint-foreground); }
.scan-dot.later { background: var(--secondary); color: #b3bac6; }
.scan-dot .i { width: 0.875rem; height: 0.875rem; }
.spinner { width: 0.875rem; height: 0.875rem; border-radius: 999px; border: 2px solid var(--tint-strong); border-top-color: var(--brand); animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spinner { animation: none; } }

/* The run hero on the overview: the one thing happening, and how far along it is. */
.run-hero { display: grid; gap: 1.125rem; padding: 1.5rem; border-radius: 1.375rem; background: var(--tint); margin-bottom: 1.25rem; }
.run-top { display: flex; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
.run-icon { display: grid; place-items: center; width: 2.75rem; height: 2.75rem; border-radius: 999px; background: var(--card); box-shadow: var(--elevation-raised); flex: none; }
.run-icon .spinner { width: 1.125rem; height: 1.125rem; }
.run-lead { flex: 1 1 18rem; min-width: 0; }
.run-now { margin-top: 0.25rem; color: var(--muted-foreground); }
.run-now b { font-weight: 500; color: var(--foreground); }
.run-meter { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 0.375rem; }
.run-meter span { height: 0.5rem; border-radius: 999px; background: var(--card); }
.run-meter span.done { background: var(--brand-2); }
.run-meter span.now { position: relative; overflow: hidden; background: var(--brand); }
/* One sweep across the live segment: the only motion, and it is what says "still working". */
.run-meter span.now::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%); transform: translateX(-100%); animation: sweep 1.9s ease-in-out infinite; }
@keyframes sweep { to { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) { .run-meter span.now::after { display: none; } }
.run-foot { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--muted-foreground); }
.run-foot .i { width: 0.9375rem; height: 0.9375rem; color: var(--tint-foreground); flex: none; }
.run-foot .count { margin-left: auto; font-weight: 500; color: var(--tint-foreground); white-space: nowrap; }
@media (max-width: 560px) {
  .run-action, .run-action .btn { width: 100%; }
  .run-foot { flex-wrap: wrap; }
  .run-foot .count { margin-left: 0; width: 100%; }
}

/* The strategy page's full list, for whoever asked to watch. */
.run-wrap { max-width: 42rem; margin: 0 auto; }
.run-panel { padding: 1.5rem; border-radius: 1.375rem; background: var(--card); box-shadow: var(--elevation-raised); }
.run-head { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; flex-wrap: wrap; }
.run-list { margin-top: 0.5rem; }
.run-list .scan-step:not(:last-child) { border-bottom: 1px solid var(--border); }
.run-later { color: var(--muted-foreground); }
.run-note { display: flex; gap: 0.5rem; align-items: flex-start; margin-top: 1.25rem; color: var(--muted-foreground); font-size: 0.8125rem; }
.run-note .i { width: 0.9375rem; height: 0.9375rem; flex: none; margin-top: 0.125rem; }
</style>
`;

function screen(baseHtml, title, mainHtml) {
  let html = baseHtml.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  html = html.replace("</head>", `${EXTRA_CSS}</head>`);
  return html.replace(/<main([^>]*)>[\s\S]*<\/main>/, `<main$1>\n${mainHtml}\n</main>`);
}

const icon = (name) => `<svg class="i" aria-hidden="true"><use href="#i-${name}"/></svg>`;

// ─── 1. Overview, a run in progress ──────────────────────────────────────────
// One hero, not one tile per phase: the order never varies, so the heading holds still for the
// whole run and only the step line and the meter move. Everything under it is the overview the
// page really renders at this point, which is what tells the client the workspace is already theirs.
const overviewMain = `
<header class="page-header">
  <div><h1 class="type-title">Tartinebakery</h1><p>Local bakery, <a class="link" href="#">tartinebakery.com</a></p></div>
  <div class="toolbar-end"><button class="btn sm btn-outline pressable">${icon("pencil")}Ask for changes</button></div>
</header>

<section class="run-hero" aria-labelledby="run-heading">
  <div class="run-top">
    <span class="run-icon" aria-hidden="true"><span class="spinner"></span></span>
    <div class="run-lead">
      <h2 class="type-heading" id="run-heading">Getting your first week ready</h2>
      <p class="run-now"><b>Reading your market</b> &middot; about 4 minutes left</p>
    </div>
    <div class="run-action"><button class="btn btn-default pressable">Watch it${icon("arrow-right")}</button></div>
  </div>
  <div class="run-meter" role="img" aria-label="Step 3 of 5: reading your market">
    <span class="done"></span><span class="done"></span><span class="now"></span><span></span><span></span>
  </div>
  <p class="run-foot">${icon("clock")}<span>You can leave this page. It keeps going, and your plan is here when you come back.</span><span class="count">Step 3 of 5</span></p>
</section>

<section class="panel" style="margin-bottom:1.25rem" aria-labelledby="loop-heading">
  <!-- PROPOSED COPY. LoopPanel's STAGE_SUBTITLE has no line for a strategy still being worked out:
       "onboarding" says it is reading the website, "strategy" says the strategy is ready to review.
       Both are false here, so this needs a stage or a subtitle the code does not have yet (D-10). -->
  <div class="card-head"><div><h2 class="type-heading" id="loop-heading">Where the agent is</h2><p class="type-label">It has your answers and is working out what to post. Next: a plan to read.</p></div></div>
  <div class="loop">
    <div class="loop-step done"><div class="track"></div><p>Onboard</p></div>
    <div class="loop-step now"><div class="track"></div><p>Strategy</p></div>
    <div class="loop-step"><div class="track"></div><p>Create</p></div>
    <div class="loop-step"><div class="track"></div><p>Approve</p></div>
    <div class="loop-step"><div class="track"></div><p>Publish</p></div>
    <div class="loop-step"><div class="track"></div><p>Learn</p></div>
  </div>
</section>

<section class="panel" style="margin-bottom:1.25rem" aria-labelledby="week-heading">
  <div class="week-head">
    <div><h2 class="type-heading" id="week-heading">This week</h2><p class="type-label" style="margin-top:0.25rem">28 September to 4 October</p></div>
    <a class="btn sm btn-outline pressable" href="#">${icon("calendar-days")}<span>Open calendar</span>${icon("arrow-right")}</a>
  </div>
  <div class="week-legend"><span class="hint">${icon("sparkles")}Your posts land here once your plan is ready</span></div>
  <div class="week">
    <div class="day today"><div class="label"><span>Today</span><b>28</b></div><div class="items"><span class="empty">Nothing planned</span></div></div>
    <div class="day"><div class="label"><span>Tue</span><b>29</b></div><div class="items"><span class="empty">Nothing planned</span></div></div>
    <div class="day"><div class="label"><span>Wed</span><b>30</b></div><div class="items"><span class="empty">Nothing planned</span></div></div>
    <div class="day"><div class="label"><span>Thu</span><b>1</b></div><div class="items"><span class="empty">Nothing planned</span></div></div>
    <div class="day"><div class="label"><span>Fri</span><b>2</b></div><div class="items"><span class="empty">Nothing planned</span></div></div>
    <div class="day"><div class="label"><span>Sat</span><b>3</b></div><div class="items"><span class="empty">Nothing planned</span></div></div>
    <div class="day"><div class="label"><span>Sun</span><b>4</b></div><div class="items"><span class="empty">Nothing planned</span></div></div>
  </div>
</section>

<!-- Wording and shape taken from StatTiles: the first two always carry a number, the last two
     read as pending until an account is connected. -->
<div class="grid g4 stats">
  <div class="panel stat"><div class="type-label">Needs approval</div><div class="value type-number">0</div><div class="delta">Nothing waiting</div></div>
  <div class="panel stat"><div class="type-label">Scheduled</div><div class="value type-number">0</div><div class="delta">Nothing queued</div></div>
  <div class="panel stat"><div class="type-label">Followers</div><p class="pending-value">Shows up once an account is connected.</p></div>
  <div class="panel stat"><div class="type-label">Engagement</div><p class="pending-value">Starts a day after the first post goes out.</p></div>
</div>

<section class="panel kit-summary" style="display:grid;grid-template-columns:minmax(0,1fr) 20rem;gap:2rem">
  <div>
    <div class="card-head"><div><h2 class="type-heading">Brand kit</h2><p class="type-label">What every post starts from.</p></div></div>
    <p style="max-width:52ch">Tartinebakery sells directly through tartinebakery.com. Friendly and straightforward, with a small, consistent colour palette.</p>
    <div class="form-grid" style="margin-top:1.25rem">
      <div><p class="type-label">Written for</p><p style="margin-top:0.25rem">Local customers, 25&ndash;45, who find brands on Instagram</p></div>
      <div><p class="type-label">Sounds</p><div class="pills" style="margin-top:0.375rem"><span class="badge badge-neutral">Friendly</span><span class="badge badge-neutral">Straightforward</span><span class="badge badge-neutral">Confident</span></div></div>
    </div>
    <p style="margin-top:1.25rem"><a class="link" href="#">Edit the brand kit${icon("chevron-right")}</a></p>
  </div>
  <div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);height:4rem;border-radius:1rem;overflow:hidden"><span style="background:var(--brand)"></span><span style="background:#f2f5fa"></span><span style="background:#1c2433"></span><span style="background:#f2b441"></span></div>
    <p class="type-label" style="margin-top:0.75rem">Poppins for headings, Inter for text</p>
  </div>
</section>

<nav class="tabbar material" aria-label="Workspace">
  <a href="#" class="on" aria-current="page">${icon("house")}Overview</a>
  <a href="#">${icon("compass")}Strategy</a>
  <a href="#">${icon("grid")}Content</a>
  <a href="#">${icon("check-circle")}Approvals</a>
  <a href="#">${icon("dots")}More</a>
</nav>
`;

// ─── 2 and 3. Strategy page, the full list for whoever asked to watch ────────
function strategyMain(phase) {
  const researching = phase === "research";
  const steps = researching
    ? [
        ["done", "Read your website", "14 pages, your colours and how you sound"],
        ["done", "Your answers", "7 questions, approved by your account manager"],
        ["now", "Reading your market", "Competitors, and what their customers say"],
        ["later", "Who your customers are", "Segments, what they need, the words they use"],
        ["later", "Writing your plan", "Themes, how often to post and the best times"],
      ]
    : [
        ["done", "Read your website", "14 pages, your colours and how you sound"],
        ["done", "Your answers", "7 questions, approved by your account manager"],
        ["done", "Reading your market", "9 sources read"],
        ["done", "Who your customers are", "3 groups found"],
        ["now", "Writing your plan", "Themes, how often to post and the best times"],
      ];

  const rows = steps
    .map(([state, title, detail]) => {
      const mark =
        state === "done"
          ? `<span class="scan-dot done">${icon("check")}</span>`
          : state === "now"
            ? '<span class="scan-dot now"><span class="spinner"></span></span>'
            : '<span class="scan-dot later"></span>';
      const titleClass = state === "later" ? ' class="run-later"' : ' style="font-weight:500"';
      return `<div class="scan-step">${mark}<div style="flex:1"><p${titleClass}>${title}</p><p class="type-label" style="margin-top:0.125rem">${detail}</p></div></div>`;
    })
    .join("");

  const lead = researching
    ? ["Researching your business", "About 4 minutes left"]
    : ["Writing your first week", "About a minute left"];

  return `
<header class="page-header"><div><h1 class="type-title">Strategy</h1><p>What the agent will post, how often and why.</p></div><div class="toolbar-end"></div></header>

<div class="run-wrap">
  <section class="run-panel" aria-live="polite">
    <div class="run-head">
      <p class="type-heading" style="font-size:1rem">${lead[0]}</p>
      <span class="type-label">${lead[1]}</span>
    </div>
    <div class="run-list">${rows}</div>
    <p class="run-note">${icon("clock")}<span>You can leave this page. It keeps going, and your plan is here when you come back.</span></p>
  </section>
  <p class="type-label" style="margin-top:1rem;text-align:center">Nothing is published without you. This only plans what to post.</p>
</div>
`;
}

const files = [
  ["rp1-overview-running.html", screen(overviewBase, "Overview: a run in progress", overviewMain)],
  ["rp2-strategy-researching.html", screen(strategyBase, "Strategy: researching", strategyMain("research"))],
  ["rp3-strategy-writing.html", screen(strategyBase, "Strategy: writing the plan", strategyMain("strategy"))],
];

for (const [name, html] of files) {
  fs.writeFileSync(path.join(outDir, name), html);
  console.log(`  ${path.relative(root, path.join(outDir, name))}  ${html.length} bytes`);
}
