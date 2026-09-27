"""Observability v3: OBS-2 Agents and OBS-3 Run detail, made responsive with the v3 patterns.

Run from design/observability: python obs_v3_agents.py
Same content as build.agents() and build.run_detail() (approved desktop designs); tables become v3 row lists,
charts get a narrow phone version, and the run waterfall stacks its bar under the step name on a phone.
Writes screens-v3/obs-v3-agents.html and screens-v3/obs-v3-run-detail.html.
"""

import build as b
import obs_v3 as v3
from build import BRAND, BRAND_2, ERROR, HOURS, icon, client, segmented, legend, card_head, stat, trend, bars, bars_head, line_chart
from obs_v3 import HOURS_PHONE, chart, rows, cell

CSS = """
/* Recent runs: the task leads on a phone, above its facts. */
.run-ask { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--muted-foreground); }

/* Run waterfall: name, bar, time, cost on one line; on a phone the bar drops under the name. */
.wf { display: grid; gap: 0.125rem; }
.wf-row, .wf-head { display: grid; grid-template-columns: minmax(0, 17.5rem) minmax(0, 1fr) 4.5rem 3.5rem; gap: 1rem; align-items: center; padding: 0.625rem 0.75rem; border-radius: 0.875rem; }
.wf-head { padding-top: 0; padding-bottom: 0.5rem; }
.wf-row.failed { background: var(--tint); }
.wf-name { display: flex; align-items: center; gap: 0.625rem; min-width: 0; padding-left: calc(var(--depth) * 1.75rem); }
.wf-name b { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.wf-mark { display: grid; place-items: center; width: 1.5rem; height: 1.5rem; border-radius: 999px; flex: none; }
.wf-mark.ok { background: rgba(23, 138, 94, 0.12); color: var(--success); }
.wf-mark.bad { background: rgba(207, 63, 87, 0.12); color: var(--destructive); }
.wf-track { position: relative; height: 0.625rem; border-radius: 999px; background: var(--secondary); }
.wf-track span { position: absolute; top: 0; bottom: 0; border-radius: 999px; }
.wf-axis { position: relative; height: 1rem; }
.wf-axis span { position: absolute; transform: translateX(-50%); white-space: nowrap; }
.wf-axis span:first-child { transform: none; }
.wf-axis span:last-child { transform: translateX(-100%); }
.wf .r { text-align: right; }

.facts4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; margin-bottom: 1.25rem; }
.facts4 .v { font-weight: 500; margin-top: 0.25rem; }
.kv td { white-space: normal; overflow-wrap: anywhere; }
.kv td:first-child { white-space: nowrap; padding-right: 1rem; }

/* Tablet: the three stats stay in a row, and each run puts its task on top with labelled facts below. */
@media (min-width: 701px) and (max-width: 1100px) {
  .g3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .runs .rl-head { display: none; }
  .runs .rl-row { grid-template-columns: 8.5rem minmax(0, 1fr) minmax(0, 1fr) 5rem 3.5rem 1rem; gap: 0.625rem 1rem; padding: 1rem 0; }
  .runs .rl-row > .cell-main { order: -1; grid-column: 1 / -1; }
  .runs .rl-row > [data-label]::before { content: attr(data-label); display: block; font-size: 0.75rem; color: var(--muted-foreground); margin-bottom: 0.125rem; }
  .runs .run-ask { white-space: normal; color: var(--foreground); font-weight: 500; }
  .runs .go-cell { align-self: center; }
}
/* The waterfall stacks once the card is too narrow for a readable bar next to the name. */
@media (max-width: 900px) {
  .wf-row { grid-template-columns: minmax(0, 1fr) auto auto; grid-template-areas: "name time cost" "track track track"; gap: 0.5rem 0.75rem; padding: 0.75rem; }
  .wf-row .wf-name { grid-area: name; padding-left: calc(var(--depth) * 1rem); }
  .wf-row .wf-track { grid-area: track; }
  .wf-row .wf-time { grid-area: time; }
  .wf-row .wf-cost { grid-area: cost; min-width: 2.75rem; }
  .wf-name { gap: 0.5rem; }
  .wf-name b { white-space: normal; }
  .wf-head { grid-template-columns: minmax(0, 1fr); padding: 0 0.75rem 0.25rem; }
  .wf-head > :not(.wf-axis) { display: none; }
}
@media (max-width: 700px) {
  .runs .rl-row > .cell-main { order: -1; }
  .run-ask { white-space: normal; color: var(--foreground); font-weight: 500; }
  .wf-name .badge { padding-left: 0.375rem; padding-right: 0.375rem; }
  .wf-kind { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .facts4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .runs .rl-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .models .rl-row { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  /* Bars: the name sits above a thin bar, so long names never clip on a narrow card. */
  .bar { display: grid; grid-template-rows: auto 0.625rem; height: auto; background: none; overflow: visible; border-radius: 0; }
  .bar::after { content: ""; grid-row: 2; grid-column: 1; border-radius: 999px; background: var(--secondary); }
  .bar .fill { grid-row: 2; grid-column: 1; height: 0.625rem; border-radius: 999px; position: relative; z-index: 1; }
  .bar .lbl, .bar .lbl.on { grid-row: 1; grid-column: 1; position: static; padding: 0 0 0.375rem; color: var(--foreground); white-space: normal; }
  .bar-row { align-items: end; }
  .bar-total { line-height: 1.2; }
  .page-header .toolbar-end { width: 100%; }
  .page-header .toolbar-end .btn { flex: 1 1 12rem; justify-content: center; }
}
"""


def page(title, active_tab, body, show_tabs=True):
    html = v3.page(title, active_tab, body, show_tabs)
    return html.replace("</head>", f"<style>{CSS}</style>\n</head>")


def agents():
    input_tokens = [40, 55, 52, 60, 58, 72, 90, 120, 110, 95, 130, 150, 140, 120, 100, 95, 110, 90, 80, 70, 60, 55, 40, 30]
    output_tokens = [3, 4, 4, 5, 5, 6, 8, 9, 9, 8, 10, 12, 11, 10, 8, 8, 9, 7, 6, 6, 5, 4, 3, 2]
    p50 = [38, 40, 42, 39, 41, 44, 46, 43, 41, 40, 39, 42, 44, 41, 40, 43, 42, 40, 39, 41, 42, 40, 41, 39]
    p95 = [98, 104, 110, 101, 99, 118, 124, 112, 105, 103, 108, 116, 121, 110, 104, 112, 109, 106, 101, 108, 112, 105, 110, 104]

    models = [
        ("claude-opus-5", BRAND, "1.3M", "51.0K", "0", "$0.41"),
        ("claude-sonnet-5", BRAND_2, "152.7K", "72.3K", "0", "$0.15"),
        ("gpt-4.1-mini", "var(--tint-strong)", "1.3K", "43", "0", "$0.02"),
    ]
    model_rows = [
        f'<div class="rl-row"><span class="cell-main"><span class="who" style="font-weight:500"><i class="dot" style="background:{color}"></i>{model}</span></span>'
        + cell("Input", tokens_in, "r num")
        + cell("Output", tokens_out, "r num")
        + cell("Cached", cached, "r num")
        + cell("Cost", f'<span class="num" style="font-weight:500">{cost}</span>', "r")
        + "</div>"
        for model, color, tokens_in, tokens_out, cached, cost in models
    ]
    models_html = rows(
        "minmax(0,1fr) 4.5rem 4.5rem 4rem 4rem",
        [("Model", ""), ("Input", "r"), ("Output", "r"), ("Cached", "r"), ("Cost", "r")],
        model_rows,
    ).replace('class="rl"', 'class="rl models"', 1)

    runs = [
        ("25 Sep, 1:31 AM", "Account Manager", "Write the intake questions for Four Barrel Coffee", "Four Barrel Coffee", True, "$0.01"),
        ("25 Sep, 1:28 AM", "Audience Researcher", "Find who buys specialty sourdough in the Mission", "Tartine Bakery", True, "$0.06"),
        ("25 Sep, 1:15 AM", "Brand Analyst", "Read tartinebakery.com and draft the brand kit", "Tartine Bakery", True, "$0.02"),
        ("25 Sep, 1:04 AM", "Growth Consultant", "Research competitors near Don Angie", "Don Angie", False, "$0.19"),
        ("25 Sep, 12:52 AM", "Account Manager", "Review the answers from Meow Meow Tweet", "Meow Meow Tweet", True, "$0.01"),
        ("25 Sep, 12:40 AM", "Audience Researcher", "Find the audience for natural deodorant", "Meow Meow Tweet", True, "$0.05"),
    ]
    ok_badge = f'<span class="badge badge-success">{icon("check")}OK</span>'
    error_badge = f'<span class="badge badge-danger">{icon("x")}Error</span>'
    run_rows = [
        f'<a class="rl-row" href="#">'
        + cell("Started", started, "muted num")
        + cell("Agent", f'<span class="who">{icon("bot")}{agent}</span>')
        + f'<span class="cell-main"><span class="run-ask">{ask}</span></span>'
        + cell("Client", client(name))
        + cell("Status", ok_badge if ok else error_badge)
        + cell("Cost", cost, "r num")
        + f'<span class="go-cell">{icon("chevron-right")}</span></a>'
        for started, agent, ask, name, ok, cost in runs
    ]
    runs_html = rows(
        "7.75rem 10.5rem minmax(0,1fr) 11rem 5rem 3.5rem 1rem",
        [("Started", ""), ("Agent", ""), ("Asked to", ""), ("Client", ""), ("Status", ""), ("Cost", "r"), ("", "")],
        run_rows,
    ).replace('class="rl"', 'class="rl runs"', 1)

    latency_series = [(BRAND_2, p95, False), (BRAND, p50, True)]
    latency_chart = chart(
        line_chart(HOURS, latency_series, 140, lambda v: f"{v:.0f} s"),
        line_chart(HOURS_PHONE, latency_series, 140, lambda v: f"{v:.0f} s", height=200, width=340),
    )
    usage_series = [(BRAND, input_tokens, True), (BRAND_2, output_tokens, False)]
    usage_chart = chart(
        line_chart(HOURS, usage_series, 160, lambda v: f"{v:.0f}K"),
        line_chart(HOURS_PHONE, usage_series, 160, lambda v: f"{v:.0f}K", height=200, width=340),
    )

    body = f"""
<div class="grid g3">
  {stat("Agent runs", "40", trend("8", "up") + " vs previous 24 hours", spark=[1, 2, 2, 3, 2, 4, 3, 5, 4, 3, 2, 2])}
  {stat("Model cost", "$0.58", trend("$0.12", "up") + " vs previous 24 hours", spark=[2, 3, 3, 5, 4, 6, 5, 7, 6, 4, 3, 3])}
  {stat("Tokens", "1.6M", "1.5M input, 123.4K output", spark=input_tokens)}
</div>
<div class="grid g2">
  <section class="panel">{card_head("Model usage and cost", "Tokens and cost for each model.", "$0.58", "Total cost")}
    {models_html}
  </section>
  <section class="panel">{card_head("Usage by agent", "Which agents use the most.", "1.6M", "Total tokens")}
    <div class="card-tools">{segmented(["Tokens", "Cost"], "Tokens", True)}</div>
    {bars([("Audience Researcher", [852.4, 35.3], ""), ("Growth Consultant", [470.1, 33.8], ""), ("Account Manager", [160.8, 30.4], ""), ("Brand Analyst", [31.2, 3.9], "")], [BRAND, BRAND_2], lambda v: f"{v:.1f}K", bars_head([("Input", BRAND, ""), ("Output", BRAND_2, "")]))}
  </section>
</div>
<div class="grid g2">
  <section class="panel">{card_head("Runs and errors", "How often each agent ran, and how often it failed.", "118", "Total runs")}
    <div class="card-tools">{segmented(["Agents", "Workflows", "Tools"], "Agents", True)}</div>
    {bars([("Account Manager", [27, 1], ""), ("Brand Analyst", [5, 1], ""), ("Growth Consultant", [3, 0], ""), ("Audience Researcher", [3, 0], "")], [BRAND, ERROR], str, bars_head([("Completed", BRAND, ""), ("Errors", ERROR, "")]))}
  </section>
  <section class="panel">{card_head("Latency", "How long a run takes, per hour.", "41.4 s", "Typical run")}
    <div class="card-tools">{segmented(["Agents", "Workflows", "Tools"], "Agents", True)}{legend([("Typical (p50)", BRAND, "41.4 s"), ("Slowest 5% (p95)", BRAND_2, "110.8 s")])}</div>
    {latency_chart}
  </section>
</div>
<div class="grid g2">
  <section class="panel">{card_head("Usage over time", "Input and output tokens per hour.", "1.6M", "Total tokens")}
    <div class="card-tools">{segmented(["Tokens", "Cost"], "Tokens", True)}{legend([("Input", BRAND, "1.5M"), ("Output", BRAND_2, "123.4K")])}</div>
    {usage_chart}
  </section>
  <section class="panel">{card_head("Cost by client", "Who the AI spend was for.", "$0.58", "Total cost")}
    {bars([("Four Barrel Coffee", [0.22], ""), ("Tartine Bakery", [0.16], ""), ("Meow Meow Tweet", [0.12], ""), ("Don Angie", [0.08], "")], [BRAND], b.money)}
  </section>
</div>
<section class="panel">{card_head("Recent runs", "Every agent run, newest first. Open one to see each step.")}
  {runs_html}
  <div style="margin-top:1rem"><a class="link" href="#">All runs{icon("chevron-right")}</a></div>
</section>"""
    return page("Observability: agents", "Agents", body)


def waterfall_row(state, name, kind, start, duration, cost, depth, total):
    failed = state == "failed"
    kind_icons = {"Step": "workflow", "Agent": "bot", "Tool": "globe"}
    color = "var(--destructive)" if failed else (BRAND if depth == 0 else BRAND_2)
    mark = f'<span class="wf-mark bad">{icon("x")}</span>' if failed else f'<span class="wf-mark ok">{icon("check")}</span>'
    return (
        f'<div class="wf-row{" failed" if failed else ""}" style="--depth:{depth}">'
        f'<div class="wf-name">{mark}<b>{name}</b><span class="badge badge-neutral">{icon(kind_icons[kind])}<span class="wf-kind">{kind}</span></span></div>'
        f'<div class="wf-track"><span style="left:{start / total * 100:.2f}%;width:{duration / total * 100:.2f}%;background:{color}"></span></div>'
        f'<span class="wf-time r num">{duration:.1f} s</span><span class="wf-cost r num muted">{cost}</span></div>'
    )


def run_detail():
    total = 102.0
    steps = [
        ("done", "Read brand", "Step", 0.0, 4.2, "$0.00", 0),
        ("done", "Growth Consultant", "Agent", 4.2, 38.4, "$0.19", 0),
        ("done", "Web search", "Tool", 6.0, 8.3, "", 1),
        ("done", "Read page", "Tool", 16.0, 12.0, "", 1),
        ("done", "Audience Researcher", "Agent", 42.6, 28.6, "$0.12", 0),
        ("failed", "Save research", "Step", 71.2, 30.8, "$0.00", 0),
    ]
    step_rows = "".join(waterfall_row(*step, total) for step in steps)
    axis = "".join(f'<span style="left:{t / total * 100:.2f}%">{t} s</span>' for t in (0, 25, 50, 75, 100))
    copy = f'<button class="btn icon" aria-label="Copy">{icon("copy")}</button>'
    body = f"""
<a class="btn sm btn-ghost pressable" href="#" style="margin-left:-0.75rem;margin-bottom:0.5rem;color:var(--muted-foreground)">{icon("arrow-left")}Agents</a>
<header class="page-header">
  <div><div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap"><h1 class="type-title">Business discovery</h1><span class="badge badge-danger">Failed</span></div>
  <p>For Don Angie (donangie.com). Started 22 Sep, 9:14 PM because the owner approved the questionnaire.</p></div>
  <div class="toolbar-end"><button class="btn btn-outline pressable">View trace in SigNoz{icon("external")}</button><button class="btn btn-default pressable">{icon("rotate")}Run again</button></div>
</header>
<section class="panel tinted" style="display:flex;gap:0.875rem;align-items:flex-start;margin-bottom:1.25rem">
  <span style="color:var(--tint-foreground);margin-top:0.2rem">{icon("alert")}</span>
  <div><p style="font-weight:500">The research was written, but it could not be saved.</p>
  <p class="type-label" style="margin-top:0.25rem;color:var(--foreground);opacity:0.8">The database took longer than 30 s to store it. Run it again; if it fails twice, check the database status in SigNoz.</p></div>
</section>
<div class="grid g4">
  {stat("Duration", "1 min 42 s", "Longest step: Growth Consultant")}
  {stat("Steps", "4 of 5", '<span class="badge badge-danger">1 failed</span> Save research')}
  {stat("Tokens", "184K", "142K input, 42K output")}
  {stat("Cost", "$0.31", "Across 3 model calls")}
</div>
<section class="panel" style="margin-bottom:1.25rem">{card_head("Steps", "What the run did, in order. Bars show when each step ran.")}
  <div class="wf-head"><span></span><div class="type-label wf-axis">{axis}</div><span class="type-label r">Time</span><span class="type-label r">Cost</span></div>
  <div class="wf">{step_rows}</div>
</section>
<div class="grid g21">
  <section class="panel">{card_head("Save research", "The failed step.")}
    <div class="facts4">
      <div><div class="type-label">Type</div><div class="v">Step</div></div>
      <div><div class="type-label">Duration</div><div class="v num">30.8 s</div></div>
      <div><div class="type-label">Started at</div><div class="v num">71.2 s</div></div>
      <div><div class="type-label">Tries</div><div class="v num">1 of 1</div></div>
    </div>
    <div style="display:flex;gap:0.75rem;padding:1rem;border-radius:1rem;background:rgba(207, 63, 87, 0.08);color:var(--destructive);margin-bottom:1.25rem">{icon("alert")}<p style="min-width:0;overflow-wrap:anywhere">brand_research insert timed out after 30 s.</p></div>
    <div class="card-tools" style="margin-bottom:0.5rem">{segmented(["Input", "Output"], "Input", True)}</div>
    <table class="table kv"><tbody>
      <tr><td class="muted">Brand</td><td class="r">Don Angie</td></tr>
      <tr><td class="muted">Research sections</td><td class="r num">14</td></tr>
      <tr><td class="muted">Sources read</td><td class="r num">9 pages</td></tr>
      <tr><td class="muted">Saves to</td><td class="r">brand_research</td></tr>
    </tbody></table>
  </section>
  <section class="panel">{card_head("About this run", "IDs to share when reporting it.")}
    <table class="table kv"><tbody>
      <tr><td class="muted">Run ID</td><td class="r"><span class="who" style="justify-content:flex-end">run_8f92a10b{copy}</span></td></tr>
      <tr><td class="muted">Trace ID</td><td class="r"><span class="who" style="justify-content:flex-end">tr_01ha94bc72{copy}</span></td></tr>
      <tr><td class="muted">Client</td><td class="r">{client("Don Angie")}</td></tr>
      <tr><td class="muted">Workflow</td><td class="r">business-discovery</td></tr>
    </tbody></table>
    <h3 class="type-heading" style="font-size:1rem;margin:1.25rem 0 0.75rem">Cost by agent</h3>
    {bars([("Growth Consultant", [0.19], ""), ("Audience Researcher", [0.12], "")], [BRAND], b.money)}
  </section>
</div>"""
    return page("Observability: run detail", "Agents", body, show_tabs=False)


def main():
    v3.OUT.mkdir(exist_ok=True)
    pages = {"agents": agents(), "run-detail": run_detail()}
    for name, html in pages.items():
        (v3.OUT / f"obs-v3-{name}.html").write_text(html, encoding="utf-8")
        print(f"wrote screens-v3/obs-v3-{name}.html")


if __name__ == "__main__":
    main()
