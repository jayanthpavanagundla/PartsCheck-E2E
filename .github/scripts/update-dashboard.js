// Called by .github/workflows/e2e.yml after the Allure report is generated.
// Appends this run to <SITE_DIR>/runs.json, prunes old archived reports and
// rebuilds <SITE_DIR>/index.html (self-contained, inline CSS).
const fs = require("fs");
const path = require("path");

const env = process.env;
const siteDir = env.SITE_DIR || "ghp";
const reportDir = env.REPORT_DIR || "allure-report";
const slug = env.SUITE_SLUG;
const runDir = env.RUN_DIR;
const keepRuns = parseInt(env.KEEP_RUNS || "30", 10);

const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
};

const fmtDuration = (ms) => {
  const s = Math.round((ms || 0) / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// --- 1. Record this run ---------------------------------------------------------
const summary = readJson(path.join(reportDir, "widgets", "summary.json"), {});
const st = summary.statistic || {};
const failed = (st.failed || 0) + (st.broken || 0);
const total = st.total || 0;

const run = {
  id: runDir,
  suite: env.SUITE,
  slug,
  env: env.TARGET_ENV,
  status: failed > 0 || total === 0 ? "failed" : "passed",
  passed: st.passed || 0,
  failed,
  skipped: (st.skipped || 0) + (st.unknown || 0),
  total,
  duration: (summary.time && summary.time.duration) || 0,
  sha: (env.GITHUB_SHA || "").slice(0, 7),
  branch: env.GITHUB_HEAD_REF || env.GITHUB_REF_NAME || "",
  trigger: env.GITHUB_EVENT_NAME || "",
  actor: env.GITHUB_ACTOR || "",
  runUrl: `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`,
  report: `reports/${slug}/${runDir}/`,
  timestamp: new Date().toISOString(),
};

const runsFile = path.join(siteDir, "runs.json");
let runs = [run, ...readJson(runsFile, [])];

// --- 2. Prune: keep the newest KEEP_RUNS per suite --------------------------------
const kept = [];
const perSuite = {};
for (const r of runs) {
  perSuite[r.slug] = (perSuite[r.slug] || 0) + 1;
  if (perSuite[r.slug] <= keepRuns) kept.push(r);
}
runs = kept;

const reportsRoot = path.join(siteDir, "reports");
if (fs.existsSync(reportsRoot)) {
  const keepDirs = new Set(runs.map((r) => `${r.slug}/${r.id}`));
  for (const s of fs.readdirSync(reportsRoot)) {
    const suiteDir = path.join(reportsRoot, s);
    if (!fs.statSync(suiteDir).isDirectory()) continue;
    for (const d of fs.readdirSync(suiteDir)) {
      if (d !== "latest" && !keepDirs.has(`${s}/${d}`)) {
        fs.rmSync(path.join(suiteDir, d), { recursive: true, force: true });
      }
    }
  }
}

fs.mkdirSync(siteDir, { recursive: true });
fs.writeFileSync(runsFile, JSON.stringify(runs, null, 2));

// --- 3. Build index.html ---------------------------------------------------------
const icons = {
  check: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  cross: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  minus: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 12h12"/></svg>',
  list: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>',
  clock: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  branch: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 7v10M18 10c0 4-6 3-12 7"/></svg>',
  window: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/></svg>',
  history: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></svg>',
  arrow: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  refresh: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 12a8 8 0 1 1-2.3-5.7L20 8"/><path d="M20 3v5h-5"/></svg>',
};

const badge = (status) =>
  status === "passed"
    ? `<span class="badge ok">${icons.check.replace(/22/g, "14")} Passed</span>`
    : `<span class="badge bad">${icons.cross.replace(/22/g, "14")} Failed</span>`;

const time = (iso) => `<time data-ts="${esc(iso)}">${esc(iso.replace("T", " ").slice(0, 19))} UTC</time>`;

// One "latest" card per suite, newest suite first.
const latestBySuite = [];
const seen = new Set();
for (const r of runs) {
  if (!seen.has(r.slug)) {
    seen.add(r.slug);
    latestBySuite.push(r);
  }
}

const latestCard = (r) => `
  <section class="card latest">
    <div class="card-head">
      <div class="title-wrap">
        <div class="icon-box">${icons.window}</div>
        <div>
          <div class="title-row"><h2>Latest ${esc(r.suite)} Run</h2>${badge(r.status)}</div>
          <div class="muted">${time(r.timestamp)} &middot; ${esc(r.env)}</div>
        </div>
      </div>
      <a class="link" href="#history" data-suite="${esc(r.slug)}">View All ${esc(r.suite)} Runs ${icons.arrow}</a>
    </div>
    <div class="stats">
      <div class="stat"><span class="dot green">${icons.check}</span><div><b>${r.passed}</b><span>Passed</span></div></div>
      <div class="stat"><span class="dot red">${icons.cross}</span><div><b>${r.failed}</b><span>Failed</span></div></div>
      <div class="stat"><span class="dot amber">${icons.minus}</span><div><b>${r.skipped}</b><span>Skipped</span></div></div>
      <div class="stat"><span class="dot grey">${icons.list}</span><div><b>${r.total}</b><span>Total</span></div></div>
    </div>
    <div class="card-foot">
      <div class="meta">
        <span>${icons.clock} Duration: ${fmtDuration(r.duration)}</span>
        <span>${icons.branch} Build: <a href="${esc(r.runUrl)}">${esc(r.sha)}</a> (${esc(r.branch)})</span>
      </div>
      <a class="btn" href="./${esc(r.report)}" target="_blank" rel="noopener">View Report ${icons.arrow}</a>
    </div>
  </section>`;

const rows = runs
  .map(
    (r) => `
        <tr data-suite="${esc(r.slug)}">
          <td>${time(r.timestamp)}</td>
          <td>${esc(r.suite)}</td>
          <td>${badge(r.status)}</td>
          <td>${esc(r.env)}</td>
          <td>${r.passed}</td>
          <td>${r.failed}</td>
          <td>${r.skipped}</td>
          <td>${r.total}</td>
          <td>${fmtDuration(r.duration)}</td>
          <td class="actions"><a href="./${esc(r.report)}" target="_blank" rel="noopener">Report</a></td>
        </tr>`,
  )
  .join("");

const suiteOptions = latestBySuite.map((r) => `<option value="${esc(r.slug)}">${esc(r.suite)}</option>`).join("");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Test Automation Dashboard</title>
<style>
  :root { --bg:#f4f7fc; --card:#fff; --line:#e3e8f0; --text:#0f1b2d; --muted:#5b6b82; --blue:#1a56f0;
          --green:#16a34a; --green-bg:#dcfce7; --red:#ef4444; --red-bg:#fee2e2; --amber:#f5b301; --grey-bg:#e8edf4; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--text); font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif; line-height:1.45; }
  a { color:var(--blue); text-decoration:none; font-weight:600; }
  a:hover { text-decoration:underline; }
  main { max-width:1440px; margin:auto; padding:32px 16px 48px; }
  .page-head { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
  h1 { margin:0; font-size:38px; font-weight:800; letter-spacing:-.5px; }
  .muted { color:var(--muted); }
  .updated { display:flex; align-items:center; gap:20px; font-size:14px; color:var(--muted); }
  .icon-btn { width:52px; height:52px; border-radius:10px; border:1px solid var(--line); background:#fff; display:grid; place-items:center; cursor:pointer; color:var(--text); box-shadow:0 1px 3px rgba(15,27,45,.08); }
  .card { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:26px 28px; margin-bottom:28px; box-shadow:0 1px 3px rgba(15,27,45,.04); }
  .latest { background:#f8faff; border-color:#cfdaee; }
  .card-head { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; flex-wrap:wrap; }
  .title-wrap { display:flex; gap:20px; align-items:center; }
  .icon-box { width:60px; height:60px; border-radius:10px; background:#dfe8fb; color:var(--blue); display:grid; place-items:center; flex:none; }
  .title-row { display:flex; align-items:center; gap:18px; flex-wrap:wrap; }
  h2 { margin:0; font-size:24px; font-weight:700; }
  .link { display:inline-flex; align-items:center; gap:8px; font-size:17px; margin-top:12px; }
  .badge { display:inline-flex; align-items:center; gap:6px; padding:4px 12px; border-radius:999px; font-size:15px; font-weight:500; white-space:nowrap; }
  .badge svg { padding:2px; border-radius:50%; color:#fff; }
  .badge.ok { background:var(--green-bg); color:#15803d; } .badge.ok svg { background:var(--green); }
  .badge.bad { background:var(--red-bg); color:#b91c1c; } .badge.bad svg { background:var(--red); }
  .stats { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin:24px 0; padding-bottom:26px; border-bottom:1px solid var(--line); }
  .stat { background:#fff; border-radius:8px; padding:22px 30px; display:flex; align-items:center; gap:28px; box-shadow:0 1px 2px rgba(15,27,45,.04); }
  .stat b { display:block; font-size:30px; font-weight:700; line-height:1.1; }
  .stat span:not(.dot) { color:var(--muted); font-size:17px; }
  .dot { width:58px; height:58px; border-radius:50%; display:grid; place-items:center; color:#fff; flex:none; }
  .dot.green { background:var(--green); } .dot.red { background:var(--red); } .dot.amber { background:var(--amber); }
  .dot.grey { background:var(--grey-bg); color:#334155; }
  .card-foot { display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; }
  .meta { display:flex; gap:48px; color:var(--muted); font-size:17px; flex-wrap:wrap; }
  .meta span { display:inline-flex; align-items:center; gap:10px; }
  .btn { display:inline-flex; align-items:center; gap:10px; background:var(--blue); color:#fff; padding:14px 26px; border-radius:8px; font-size:18px; }
  .btn:hover { background:#1446c9; text-decoration:none; }
  .hist-head { display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:18px; }
  .hist-head h2 { display:flex; align-items:center; gap:14px; }
  .filters { display:flex; gap:10px; }
  select { appearance:none; padding:11px 40px 11px 16px; border:1px solid var(--line); border-radius:8px; background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='3'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 14px center; font:inherit; font-size:15px; font-weight:600; color:var(--text); cursor:pointer; }
  .table-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; font-size:16px; min-width:860px; }
  th { text-align:left; background:#eef2f8; color:#334155; font-weight:600; padding:14px 20px; }
  td { padding:13px 20px; border-bottom:1px solid var(--line); white-space:nowrap; }
  .actions a { font-weight:700; }
  .empty { padding:40px; text-align:center; color:var(--muted); }
  @media (max-width:900px) {
    .stats { grid-template-columns:repeat(2,1fr); }
    h1 { font-size:28px; }
    .stat { padding:16px; gap:16px; }
    .card { padding:18px; }
  }
  @media (max-width:480px) { .stats { grid-template-columns:1fr; } .meta { gap:12px; } .btn { width:100%; justify-content:center; } }
</style>
</head>
<body>
<main>
  <div class="page-head">
    <div>
      <h1>Test Automation Dashboard</h1>
      <div class="muted" style="font-size:18px">Monitor and access the latest PartsCheck E2E automation runs.</div>
    </div>
    <div class="updated">
      <div>Last updated<br>${time(run.timestamp)}</div>
      <button class="icon-btn" title="Refresh" onclick="location.reload()">${icons.refresh}</button>
    </div>
  </div>

  ${runs.length ? latestCard(runs[0]) : ""}

  <section class="card" id="history">
    <div class="hist-head">
      <h2>${icons.history} Historical E2E Runs</h2>
      <div class="filters">
        <select id="suiteFilter" aria-label="Suite"><option value="all">All suites</option>${suiteOptions}</select>
        <select id="limit" aria-label="Number of runs">
          <option value="10">Last 10 runs</option><option value="25">Last 25 runs</option><option value="1000">All runs</option>
        </select>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Run Time</th><th>Suite</th><th>Status</th><th>Env</th><th>Passed</th><th>Failed</th><th>Skipped</th><th>Total</th><th>Duration</th><th>Actions</th></tr></thead>
        <tbody id="rows">${rows}</tbody>
      </table>
      ${runs.length ? "" : '<div class="empty">No runs yet.</div>'}
    </div>
  </section>
</main>

<script>
  // Show timestamps in the viewer's local time.
  document.querySelectorAll("time[data-ts]").forEach(function (t) {
    var d = new Date(t.dataset.ts);
    if (!isNaN(d)) t.textContent = d.toLocaleString(undefined, { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit" });
  });
  var suiteSel = document.getElementById("suiteFilter"), limitSel = document.getElementById("limit");
  function applyFilter() {
    var n = 0, max = +limitSel.value, s = suiteSel.value;
    document.querySelectorAll("#rows tr").forEach(function (tr) {
      var show = (s === "all" || tr.dataset.suite === s) && n < max;
      if (show) n++;
      tr.style.display = show ? "" : "none";
    });
  }
  suiteSel.onchange = limitSel.onchange = applyFilter;
  document.querySelectorAll("a[data-suite]").forEach(function (a) {
    a.addEventListener("click", function () { suiteSel.value = a.dataset.suite; limitSel.value = "1000"; applyFilter(); });
  });
  applyFilter();
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(siteDir, "index.html"), html);

// --- 4. Expose stats to the workflow --------------------------------------------
if (env.GITHUB_OUTPUT) {
  fs.appendFileSync(
    env.GITHUB_OUTPUT,
    [
      `status=${run.status}`,
      `passed=${run.passed}`,
      `failed=${run.failed}`,
      `skipped=${run.skipped}`,
      `total=${run.total}`,
      `duration=${fmtDuration(run.duration)}`,
    ].join("\n") + "\n",
  );
}
console.log(`Dashboard updated: ${run.suite} ${run.status} (${run.passed}/${run.total})`);
