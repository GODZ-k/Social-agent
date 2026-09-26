"""Observability v3: Server shows the backend only, and a new Frontend tab shows what real users hit in the app.

Run from design/observability: python obs_v3.py
Reuses the helpers in build.py; writes screens-v3/obs-v3-<screen>.html.
"""

from pathlib import Path

import build as b
from build import BRAND, BRAND_2, DANGER, ERROR, HOURS, icon, client, segmented, legend, card_head, stat, trend, bars, line_chart

OUT = Path(__file__).parent / "screens-v3"
TABS_V2 = ["Overview", "Agents", "Server"]
TABS_V3 = ["Overview", "Agents", "Server", "Frontend"]
HOURS_PHONE = ["00:00", "", "", "", "", "", "", "", "08:00", "", "", "", "", "", "", "", "16:00", "", "", "", "", "", "", "Now"]
WARN = "var(--warning)"
OK = "var(--success)"

CSS = """
.mono { font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace; font-size: 0.8125rem; letter-spacing: 0; }
.c-narrow { display: none; }

/* Row lists: a table on wide screens, stacked cards on a phone. Columns come from --cols on the list. */
.rl { display: grid; }
.rl-head, .rl-row { display: grid; grid-template-columns: var(--cols); gap: 1rem; align-items: center; }
.rl-head { padding: 0 0 0.625rem; border-bottom: 1px solid var(--border); font-size: 0.8125rem; font-weight: 500; color: var(--muted-foreground); }
.rl-row { padding: 0.875rem 0; border-bottom: 1px solid var(--border); font-size: 0.875rem; }
.rl-row:last-child { border-bottom: 0; }
a.rl-row:hover { background: rgba(236, 238, 242, 0.6); }
.rl .r { text-align: right; justify-self: end; }
.rl .num { font-variant-numeric: tabular-nums; }
.cell-main { min-width: 0; }
.cell-main .mono { display: block; overflow-wrap: anywhere; color: var(--foreground); }
.cell-sub { display: block; margin-top: 0.25rem; font-size: 0.8125rem; color: var(--muted-foreground); }
.go-cell { color: var(--muted-foreground); justify-self: end; }

/* Small inline rate bar, used for failure rates. */
.rate { display: flex; align-items: center; gap: 0.625rem; justify-content: flex-end; }
.rate-track { width: 4.5rem; height: 0.375rem; border-radius: 999px; background: var(--secondary); overflow: hidden; flex: none; }
.rate-track span { display: block; height: 100%; border-radius: 999px; }

.state { display: inline-flex; align-items: center; gap: 0.5rem; }
.note-row { display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); font-size: 0.8125rem; color: var(--muted-foreground); flex-wrap: wrap; }
.note-row .link { margin-left: auto; }

/* Release check: before and after, side by side. */
.release { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 1.5rem; align-items: center; margin-bottom: 1.25rem; }
.release-copy { display: flex; gap: 0.875rem; align-items: flex-start; }
.compare { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
.compare > div { padding: 0.875rem 1rem; border-radius: 1rem; background: rgba(255, 255, 255, 0.7); }
.compare .type-number { font-size: 1.5rem; line-height: 1.1; margin-top: 0.25rem; }
.compare .after .type-number { color: var(--destructive); }

/* Stack trace and the steps before an error. */
.stack { padding: 1rem 1.125rem; border-radius: 1rem; background: #f3f4f7; line-height: 1.7; overflow-wrap: anywhere; }
.stack .frame { display: block; color: var(--muted-foreground); padding-left: 1rem; }
.stack .frame.app { color: var(--foreground); font-weight: 500; }
.steps { display: grid; gap: 0; }
.step { display: grid; grid-template-columns: 5.5rem 1rem minmax(0, 1fr); gap: 0.75rem; align-items: start; padding-bottom: 1rem; position: relative; }
.step:last-child { padding-bottom: 0; }
.step .t { font-size: 0.8125rem; color: var(--muted-foreground); font-variant-numeric: tabular-nums; padding-top: 0.05rem; }
.step .pin { width: 0.625rem; height: 0.625rem; border-radius: 999px; background: var(--tint-strong); margin-top: 0.4rem; justify-self: center; position: relative; z-index: 1; }
.step:not(:last-child)::after { content: ""; position: absolute; left: calc(5.5rem + 0.75rem + 0.5rem - 0.5px); top: 1.2rem; bottom: 0.2rem; width: 1px; background: var(--border); }
.step.bad .pin { background: var(--destructive); }
.facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem 1.5rem; }
.facts .v { font-weight: 500; margin-top: 0.25rem; overflow-wrap: anywhere; }

@media (max-width: 1100px) {
  .release { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 700px) {
  .rl-head { display: none; }
  .rl-row { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.625rem 1rem; padding: 1rem 0; }
  .rl-row > .cell-main { grid-column: 1 / -1; }
  .rl-row > [data-label]::before { content: attr(data-label); display: block; font-size: 0.75rem; color: var(--muted-foreground); margin-bottom: 0.125rem; }
  .rl .r { text-align: left; justify-self: start; }
  .rate { justify-content: flex-start; min-width: 0; }
  .rate-track { width: 2.5rem; }
  .go-cell { display: none; }
  .facts { grid-template-columns: minmax(0, 1fr); }
  .step { grid-template-columns: 4.75rem 1rem minmax(0, 1fr); }
  .step:not(:last-child)::after { left: calc(4.75rem + 0.75rem + 0.5rem - 0.5px); }
}
@media (max-width: 640px) {
  .c-wide { display: none; }
  .c-narrow { display: block; }
  .compare { grid-template-columns: minmax(0, 1fr); }
  .toolbar .seg { width: 100%; }
  .toolbar .seg button { flex: 1; padding: 0.375rem 0.5rem; }
  .search { min-width: 0; width: 100%; }
  .type-title { font-size: 1.75rem; }
}
"""


def page(title, active_tab, body, show_tabs=True, toolbar_extra=""):
    """build.page with the Frontend tab added, a subtitle that covers it, and the v3 styles."""
    html = b.page(title, active_tab, body, show_tabs, toolbar_extra)
    old_tabs = segmented(TABS_V2, active_tab)
    new_tabs = segmented(TABS_V3, active_tab)
    html = html.replace(old_tabs, new_tabs)
    html = html.replace(
        "How the server and the AI agents are doing, across every client.",
        "How the app, the server and the AI agents are doing, across every client.",
    )
    return html.replace("</head>", f"<style>{CSS}</style>\n</head>")


def chart(wide, narrow):
    """Charts are drawn twice: a wide one, and a narrow one with fewer labels so text stays readable on a phone."""
    return f'<div class="c-wide">{wide}</div><div class="c-narrow">{narrow}</div>'


def release_marker(svg, index, count, width, label="Release"):
    """Adds a dashed line at one hour of a line_chart, to show when a release went out."""
    left, top, bottom, height = 44, 8, 24, 220
    x = left + index * (width - left) / (count - 1)
    marker = (
        f'<line x1="{x:.1f}" x2="{x:.1f}" y1="{top}" y2="{height - bottom}" stroke="var(--tint-foreground)" stroke-width="1.5" stroke-dasharray="4 4"/>'
        f'<rect x="{x - 30:.1f}" y="{top - 2}" width="60" height="20" rx="10" fill="var(--tint)"/>'
        f'<text x="{x:.1f}" y="{top + 12}" text-anchor="middle" style="fill:var(--tint-foreground);font-weight:500">{label}</text>'
    )
    return svg.replace("</svg>", marker + "</svg>", 1)


def rows(cols, head, body_rows):
    """head: list of (label, align). body_rows: pre-built row html."""
    head_html = "".join(f'<span class="{align}">{label}</span>' for label, align in head)
    return f'<div class="rl" style="--cols:{cols}"><div class="rl-head">{head_html}</div>{"".join(body_rows)}</div>'


def cell(label, content, cls=""):
    return f'<span class="{cls}" data-label="{label}">{content}</span>'


def rate(failed, total, color=DANGER):
    pct = failed / total * 100 if total else 0
    fill = f'<span style="width:{max(pct, 0):.0f}%;background:{color}"></span>' if failed else ""
    return f'<span class="rate"><span class="num">{pct:.0f}%</span><span class="rate-track">{fill}</span></span>'


def dot(color):
    return f'<i class="dot" style="background:{color}"></i>'


# Overview v3: one frontend number joins the server and AI numbers, and the attention list covers all three.


def overview():
    requests = [180, 160, 150, 140, 150, 170, 230, 300, 380, 420, 410, 440, 460, 470, 455, 480, 500, 490, 470, 450, 430, 400, 380, 360]
    errors = [1, 1, 0, 1, 0, 1, 2, 1, 2, 3, 2, 1, 2, 9, 6, 2, 1, 2, 1, 1, 2, 1, 1, 1]
    wide = line_chart(HOURS, [(BRAND, requests, True), (DANGER, [e * 10 for e in errors], False)], 600, lambda v: f"{v:.0f}", width=620, focus=(13, "Today, 13:00", [("Requests", BRAND, "470"), ("Errors", DANGER, "9")]))
    narrow = line_chart(HOURS_PHONE, [(BRAND, requests, True), (DANGER, [e * 10 for e in errors], False)], 600, lambda v: f"{v:.0f}", height=200, width=340)
    attention = [
        ("rgba(207, 63, 87, 0.06)", "var(--destructive)", "alert", "New error on Approvals since the last release",
         "5 people saw a blank page after pressing Approve. 25 Sep, 6:12 PM", "View error"),
        ("rgba(207, 63, 87, 0.06)", "var(--destructive)", "alert", "Business discovery failed for Don Angie",
         "The research could not be saved. 22 Sep, 9:14 PM", "View run"),
        ("rgba(183, 116, 10, 0.07)", "var(--warning)", "activity", "Starting a scan was slow for 12 minutes",
         "POST /api/v1/scans took over 2 s at p95. 22 Sep, 8:40 PM", "View route"),
    ]
    attention_html = "".join(
        f'<a href="#" style="display:flex;gap:0.875rem;align-items:flex-start;padding:1rem;border-radius:1rem;background:{bg}">'
        f'<span style="color:{fg};margin-top:0.2rem">{icon(ic)}</span>'
        f'<div style="flex:1;min-width:0"><p style="font-weight:500">{title}</p><p class="type-label" style="margin-top:0.25rem">{sub}</p></div>'
        f'<span class="link" style="flex:none">{link}{icon("chevron-right")}</span></a>'
        for bg, fg, ic, title, sub, link in attention
    )
    users_delta = '<span class="badge badge-danger">1 new error</span><a class="link" href="#">Frontend' + icon("chevron-right") + "</a>"
    body = f"""
<section class="panel" style="display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1.25rem;flex-wrap:wrap">
  <div style="display:flex;align-items:center;gap:0.875rem">
    <span class="dot" style="width:0.625rem;height:0.625rem;background:var(--warning);box-shadow:0 0 0 5px rgba(183, 116, 10, 0.14)"></span>
    <div><p class="type-heading">The server is fine; the app has a new error</p>
    <p class="type-label" style="margin-top:0.25rem">1 error in the app, 1 failed agent run and 1 slow route in the last 24 hours. Checked 1 min ago.</p></div>
  </div>
  <a class="link" href="#">See what needs attention{icon("chevron-right")}</a>
</section>
<div class="grid g4">
  {stat("API error rate", "0.4%", trend("0.1 pts", "down", "good") + " vs previous 24 hours", spark=errors, spark_color=DANGER)}
  {stat("People who hit an error", "6", users_delta, "of 38", spark=[0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 3, 4, 3, 2], spark_color=DANGER)}
  {stat("AI cost", "$3.82", trend("$0.40", "up") + " vs previous 24 hours", spark=[3.4, 4.1, 3.9, 5.2, 4.6, 3.4, 3.82])}
  {stat("Agent runs", "48", '<span class="badge badge-danger">1 failed</span> 47 finished', spark=[4, 6, 5, 7, 6, 8, 5, 7])}
</div>
<div class="grid g21">
  <section class="panel">{card_head("API requests", "Calls to the API per hour, and how many failed.", "8,412", "Total requests")}
    <div class="card-tools">{legend([("Requests", BRAND, "8.4K"), ("Errors", DANGER, "34")])}</div>
    {chart(wide, narrow)}
  </section>
  <section class="panel">{card_head("AI cost", "What the agents cost per day.", "$28.40", "Last 7 days")}
    {b.column_chart(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"], [3.4, 4.1, 3.9, 5.2, 4.6, 3.4, 3.82], lambda v: f"${v:g}", 6)}
  </section>
</div>
<div class="grid g2">
  <section class="panel">{card_head("Top clients by AI cost", "Who the agents worked for today.", "$3.53", "Top 4 clients")}
    {bars([("Four Barrel Coffee", [1.42], ""), ("Tartine Bakery", [0.96], ""), ("Meow Meow Tweet", [0.71], ""), ("Don Angie", [0.44], "")], [BRAND], b.money)}
    <div style="margin-top:1rem"><a class="link" href="#">All clients{icon("chevron-right")}</a></div>
  </section>
  <section class="panel">{card_head("Needs attention", "Problems from the last 24 hours, newest first.", "3", "Open")}
    <div style="display:grid;gap:0.75rem">{attention_html}</div>
    <div class="resolved">{icon("check")}<span>3 problems cleared on their own in the last 24 hours.</span><a class="link" href="#">History{icon("chevron-right")}</a></div>
  </section>
</div>"""
    return page("Observability", "Overview", body)


# Server v3: the API process only. Routes, background queues, the services it calls, grouped server errors, slow requests, logs.


def server():
    requests = [180, 160, 150, 140, 150, 170, 230, 300, 380, 420, 410, 440, 460, 470, 455, 480, 500, 490, 470, 450, 430, 400, 380, 360]
    errors = [1, 1, 0, 1, 0, 1, 2, 1, 2, 3, 2, 1, 2, 9, 6, 2, 1, 2, 1, 1, 2, 1, 1, 1]
    p50 = [80, 82, 79, 78, 84, 86, 90, 88, 85, 84, 83, 86, 88, 92, 90, 86, 84, 83, 85, 86, 84, 82, 83, 85]
    p95 = [320, 330, 310, 300, 340, 360, 390, 380, 370, 365, 360, 380, 420, 610, 520, 390, 370, 360, 365, 372, 368, 360, 375, 380]
    req_series = [(BRAND, requests, True), (DANGER, [e * 10 for e in errors], False)]
    lat_series = [(BRAND_2, p95, False), (BRAND, p50, True)]
    req_chart = chart(
        line_chart(HOURS, req_series, 600, lambda v: f"{v:.0f}", focus=(13, "Today, 13:00", [("Requests", BRAND, "470"), ("Errors", DANGER, "9")])),
        line_chart(HOURS_PHONE, req_series, 600, lambda v: f"{v:.0f}", height=200, width=340),
    )
    lat_chart = chart(
        line_chart(HOURS, lat_series, 800, lambda v: f"{v:.0f} ms"),
        line_chart(HOURS_PHONE, lat_series, 800, lambda v: f"{v:.0f}", height=200, width=340),
    )

    routes = [
        ("POST", "/api/v1/brands/:brandId/research", 1100, 29, "30.0 s", True),
        ("POST", "/api/v1/scans", 3400, 5, "2.1 s", True),
        ("GET", "/api/v1/oauth/:platform/callback", 11, 3, "1.4 s", True),
        ("GET", "/api/v1/brands", 2900, 2, "96 ms", False),
        ("POST", "/api/v1/brands/:brandId/questionnaire/submit", 64, 0, "610 ms", False),
        ("GET", "/api/v1/me/overview", 1800, 0, "140 ms", False),
    ]
    route_rows = [
        f'<a class="rl-row" href="#"><span class="cell-main"><span class="who"><span class="method{" post" if m == "POST" else ""}">{m}</span><span class="mono" style="min-width:0">{r}</span></span></span>'
        + cell("Requests", b.compact(n), "r num")
        + cell("Errors", f'<span class="num" style="{"color:var(--destructive);font-weight:500" if e else ""}">{e}</span>', "r")
        + cell("Error rate", rate(e, n), "r")
        + cell("p95", f'<span class="num" style="{"color:var(--warning);font-weight:500" if slow else ""}">{d}</span>', "r")
        + f'<span class="go-cell">{icon("chevron-right")}</span></a>'
        for m, r, n, e, d, slow in routes
    ]
    routes_html = rows(
        "minmax(0,1fr) 5rem 4rem 8rem 5rem 1rem",
        [("Route", ""), ("Requests", "r"), ("Errors", "r"), ("Error rate", "r"), ("p95", "r"), ("", "")],
        route_rows,
    )

    queues = [
        ("Brand scans", "One at a time, so Firecrawl stays under 10 requests a minute.", "2", "1", "3 min 10 s", "31", "2", WARN),
        ("Business research", "Starts when a client submits the questionnaire.", "0", "1", "0 s", "9", "1", OK),
    ]
    queue_rows = [
        f'<div class="rl-row"><span class="cell-main"><span class="who" style="font-weight:500">{dot(tone)}{name}</span><span class="cell-sub">{sub}</span></span>'
        + cell("Waiting", waiting, "r num")
        + cell("Running", running, "r num")
        + cell("Longest wait", wait, "r num")
        + cell("Done", done, "r num")
        + cell("Failed", f'<span class="num" style="color:var(--destructive);font-weight:500">{failed}</span>', "r")
        + "</div>"
        for name, sub, waiting, running, wait, done, failed, tone in queues
    ]
    queues_html = rows(
        "minmax(0,1fr) 5rem 5rem 7rem 5rem 5rem",
        [("Queue", ""), ("Waiting", "r"), ("Running", "r"), ("Longest wait", "r"), ("Done", "r"), ("Failed", "r")],
        queue_rows,
    )

    services = [
        ("Firecrawl", "Reads websites and searches the web", "412", 6, "8.2 s", "Rate limited 14 times", WARN),
        ("Postgres (Neon)", "The database", "6.2K", 3, "42 ms", "3 inserts timed out", WARN),
        ("Anthropic", "Model calls for the agents", "96", 0, "38 s", "", OK),
        ("OpenAI", "Model calls for the agents", "12", 0, "4.1 s", "", OK),
        ("Instagram", "Connecting accounts", "11", 4, "1.2 s", "4 token exchanges refused", DANGER),
        ("Clerk", "Checks who is signed in", "8.4K", 0, "6 ms", "", OK),
    ]
    service_rows = [
        f'<div class="rl-row"><span class="cell-main"><span class="who" style="font-weight:500">{dot(tone)}{name}</span><span class="cell-sub">{note or sub}</span></span>'
        + cell("Calls", calls, "r num")
        + cell("Failed", f'<span class="num" style="{"color:var(--destructive);font-weight:500" if failed else ""}">{failed}</span>', "r")
        + cell("p95", p, "r num")
        + "</div>"
        for name, sub, calls, failed, p, note, tone in services
    ]
    services_html = rows(
        "minmax(0,1fr) 5rem 5rem 5rem",
        [("Service", ""), ("Calls", "r"), ("Failed", "r"), ("p95", "r")],
        service_rows,
    )

    server_errors = [
        ("brand_research insert timed out after 30 s", "POST /api/v1/brands/:brandId/research", "29", "3", "1:31 AM"),
        ("Instagram token exchange failed: 400 invalid_grant", "GET /api/v1/oauth/:platform/callback", "3", "2", "12:48 AM"),
        ("Firecrawl scrape failed: 502 Bad Gateway", "POST /api/v1/scans", "2", "2", "22 Sep, 11:02 PM"),
    ]
    error_rows = [
        f'<a class="rl-row" href="#"><span class="cell-main"><span class="mono">{msg}</span><span class="cell-sub mono">{route}</span></span>'
        + cell("Times", f'<span class="num" style="font-weight:500">{times}</span>', "r")
        + cell("Clients", clients, "r num")
        + cell("Last seen", last, "r num")
        + f'<span class="r"><span class="link">Trace{icon("external")}</span></span></a>'
        for msg, route, times, clients, last in server_errors
    ]
    errors_html = rows(
        "minmax(0,1fr) 4rem 4rem 8.5rem 3.75rem",
        [("Error", ""), ("Times", "r"), ("Clients", "r"), ("Last seen", "r"), ("", "r")],
        error_rows,
    )

    slow = [
        ("POST", "/api/v1/brands/:brandId/research", "30.0 s", "Don Angie", "1:31 AM", "Waiting on the database insert"),
        ("POST", "/api/v1/scans", "4.8 s", "Four Barrel Coffee", "12:40 AM", "Waiting on Firecrawl"),
        ("GET", "/api/v1/oauth/:platform/callback", "2.2 s", "Tartine Bakery", "12:48 AM", "Waiting on Instagram"),
    ]
    slow_rows = [
        f'<div class="rl-row"><span class="cell-main"><span class="who"><span class="method{" post" if m == "POST" else ""}">{m}</span><span class="mono" style="min-width:0">{r}</span></span><span class="cell-sub">{why}</span></span>'
        + cell("Took", f'<span class="num" style="font-weight:500">{d}</span>', "r")
        + cell("Client", client(c))
        + cell("When", t, "r num")
        + f'<span class="r"><a class="link" href="#">Trace{icon("external")}</a></span></div>'
        for m, r, d, c, t, why in slow
    ]
    slow_html = rows(
        "minmax(0,1fr) 4.5rem 11rem 5rem 3.75rem",
        [("Request", ""), ("Took", "r"), ("Client", ""), ("When", "r"), ("", "r")],
        slow_rows,
    )

    logs = [
        ("1:32:10 AM", "warning", "Warning", "Firecrawl rate limit reached. Retrying in 6 s."),
        ("1:30:22 AM", "neutral", "Info", "Scan finished for tartinebakery.com in 41 s."),
        ("1:28:44 AM", "danger", "Error", "Research could not be saved: the insert timed out after 30 s."),
        ("1:25:01 AM", "neutral", "Info", "Business discovery started for Don Angie."),
    ]
    log_rows = [
        f'<div class="rl-row"><span class="muted num" style="font-size:0.8125rem">{t}</span><span class="badge badge-{v}">{lv}</span>'
        f'<span class="cell-main">{msg}</span><span class="r"><a class="link" href="#">Trace{icon("external")}</a></span></div>'
        for t, v, lv, msg in logs
    ]
    logs_html = f'<div class="rl" style="--cols:6.5rem 5rem minmax(0,1fr) 3.75rem">{"".join(log_rows)}</div>'

    body = f"""
<div class="grid g4">
  {stat("Requests", "8.4K", trend("6.2%", "up") + " vs previous 24 hours", spark=requests)}
  {stat("Server errors", "0.4%", "34 requests ended in a 5xx", spark=errors, spark_color=DANGER)}
  {stat("p95 latency", "380", trend("12 ms", "up", "bad") + " vs previous 24 hours", "ms", spark=p95, spark_color=BRAND_2)}
  {stat("Uptime", "99.98%", "Last 30 days")}
</div>
<div class="grid g2">
  <section class="panel">{card_head("Requests over time", "Requests and server errors per hour.", "8,412", "Total requests")}
    <div class="card-tools">{legend([("Requests", BRAND, "8.4K"), ("Server errors", DANGER, "34")])}</div>
    {req_chart}
  </section>
  <section class="panel">{card_head("Latency", "How long a request takes, per hour.", "85 ms", "Typical request")}
    <div class="card-tools">{legend([("Typical (p50)", BRAND, "85 ms"), ("Slowest 5% (p95)", BRAND_2, "380 ms")])}</div>
    {lat_chart}
  </section>
</div>
<section class="panel" style="margin-bottom:1.25rem">{card_head("Routes", "Every endpoint, with how often it fails and how slow it gets. Open one for its requests.")}
  <div class="card-tools">{segmented(["Most errors", "Slowest", "Busiest"], "Most errors", True)}<span class="type-label">p95 over 1 s is marked</span></div>
  {routes_html}
</section>
<section class="panel" style="margin-bottom:1.25rem">{card_head("Background jobs", "Work the API does after it has answered.", "3", "Waiting or running")}
  {queues_html}
</section>
<section class="panel" style="margin-bottom:1.25rem">{card_head("Services the API calls", "Outside services, and how they answered.", "13", "Failed calls")}
  {services_html}
</section>
<section class="panel" style="margin-bottom:1.25rem">{card_head("Server errors", "Requests that ended in a 5xx, grouped by cause. Most frequent first.", "3", "Causes")}
  {errors_html}
</section>
<section class="panel" style="margin-bottom:1.25rem">{card_head("Slowest requests", "The three longest requests, and what they waited on.")}
  {slow_html}
</section>
<section class="panel">{card_head("Logs", "What the server wrote down, newest first.")}
  <div class="card-tools">{segmented(["All", "Info", "Warnings", "Errors"], "All", True)}<span class="search">{icon("search")}Search logs</span></div>
  {logs_html}
  <div style="margin-top:1rem"><a class="link" href="#">Open all logs in SigNoz{icon("external")}</a></div>
</section>"""
    extra = f'<button class="btn sm btn-outline pressable">Open in SigNoz{icon("external")}</button>'
    return page("Observability: server", "Server", body, toolbar_extra=extra)


# Frontend: what real people hit in the web app. Errors, failed API calls, failed actions, and whether the last release made it worse.


def frontend():
    sessions_err = [0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 4, 5, 4, 3, 3, 2]
    series = [(DANGER, sessions_err, True)]
    wide = release_marker(line_chart(HOURS, series, 6, lambda v: f"{v:.0f}", width=620), 18, 24, 620)
    narrow_svg = line_chart(HOURS_PHONE, series, 6, lambda v: f"{v:.0f}", height=220, width=340)
    narrow = release_marker(narrow_svg, 18, 24, 340)

    issues = [
        ("TypeError: Cannot read properties of undefined (reading 'platforms')", "/c/:clientId/approvals", "Blank page after pressing Approve", "5", "14", "25 Sep, 6:12 PM", "12 min ago", True),
        ("ChunkLoadError: Loading chunk 812 failed", "/onboarding", "Tab opened before the release, needs a reload", "3", "4", "25 Sep, 6:07 PM", "2 h ago", True),
        ("Hydration failed: server and browser rendered different text", "/c/:clientId/calendar", "Post times shown in the wrong time zone, then corrected", "2", "9", "21 Sep, 10:30 AM", "5 h ago", False),
        ("RangeError: Invalid time value", "/c/:clientId/strategy", "Best times card did not load", "1", "2", "24 Sep, 3:18 PM", "1 day ago", False),
    ]
    new_badge = '<span class="badge badge-danger" style="margin-top:0.5rem">New in this release</span>'
    issue_rows = [
        f'<a class="rl-row" href="#"><span class="cell-main"><span class="mono">{msg}</span>'
        f'<span class="cell-sub"><span class="mono" style="display:inline;color:var(--muted-foreground)">{where}</span>. {effect}</span>'
        f'{new_badge if new else ""}</span>'
        + cell("People", f'<span class="num" style="font-weight:500">{users}</span>', "r")
        + cell("Times", times, "r num")
        + cell("First seen", first, "r num")
        + cell("Last seen", last, "r num")
        + f'<span class="go-cell">{icon("chevron-right")}</span></a>'
        for msg, where, effect, users, times, first, last, new in issues
    ]
    issues_html = rows(
        "minmax(0,1fr) 3.75rem 3.5rem 8.5rem 6rem 1rem",
        [("Error and page", ""), ("People", "r"), ("Times", "r"), ("First seen", "r"), ("Last seen", "r"), ("", "")],
        issue_rows,
    )

    calls = [
        ("POST", "/api/v1/brands/:brandId/research", ("danger", "500"), "Submitting the questionnaire", "6", "3"),
        ("GET", "/api/v1/me/overview", ("warning", "Timed out"), "Opening the client dashboard", "7", "4"),
        ("POST", "/api/v1/brands/:brandId/social-accounts/connect", ("danger", "502"), "Connecting Instagram", "4", "2"),
    ]
    call_rows = [
        f'<div class="rl-row"><span class="cell-main"><span class="who"><span class="method{" post" if m == "POST" else ""}">{m}</span><span class="mono" style="min-width:0">{r}</span></span><span class="cell-sub">{doing}</span></span>'
        + cell("Status", f'<span class="badge badge-{s[0]}">{s[1]}</span>')
        + cell("Failed", f'<span class="num" style="font-weight:500">{n}</span>', "r")
        + cell("People", users, "r num")
        + f'<span class="r"><a class="link" href="#">Trace{icon("external")}</a></span></div>'
        for m, r, s, doing, n, users in calls
    ]
    calls_html = rows(
        "minmax(0,1fr) 6rem 5rem 5rem 3.75rem",
        [("Call and what the person was doing", ""), ("Status", ""), ("Failed", "r"), ("People", "r"), ("", "r")],
        call_rows,
    )

    actions = [
        ("Connect Instagram", "Instagram refused the account: not a business or creator account", 11, 4),
        ("Submit questionnaire", "Research could not start: server error 500", 9, 3),
        ("Start brand scan", "The website blocked the reader", 18, 2),
        ("Approve post", "Blank page after pressing Approve", 64, 5),
        ("Generate posts", "", 14, 0),
        ("Save brand kit", "", 22, 0),
    ]
    actions = sorted(actions, key=lambda a: -a[3] / a[2])
    action_rows = [
        f'<div class="rl-row"><span class="cell-main"><span style="font-weight:500">{name}</span><span class="cell-sub">{reason or "No failures"}</span></span>'
        + cell("Tried", tried, "r num")
        + cell("Failed", f'<span class="num" style="{"color:var(--destructive);font-weight:500" if failed else ""}">{failed}</span>', "r")
        + cell("Failure rate", rate(failed, tried), "r")
        + "</div>"
        for name, reason, tried, failed in actions
    ]
    actions_html = rows(
        "minmax(0,1fr) 5rem 5rem 9rem",
        [("Action and most common reason", ""), ("Tried", "r"), ("Failed", "r"), ("Failure rate", "r")],
        action_rows,
    )

    body = f"""
<section class="panel tinted release">
  <div class="release-copy">
    <span style="color:var(--tint-foreground);margin-top:0.2rem">{icon("alert")}</span>
    <div><p class="type-heading">The release of 25 Sep, 6:05 PM made things worse</p>
    <p class="type-label" style="margin-top:0.375rem;color:var(--foreground);opacity:0.8">More sessions hit an error since it went out, and 2 errors are new. Most come from the Approvals page.</p>
    <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:0.75rem"><a class="link" href="#">See the 2 new errors{icon("chevron-right")}</a><a class="link" href="#">Compare releases{icon("chevron-right")}</a></div></div>
  </div>
  <div class="compare">
    <div><div class="type-label">Before, 24 hours</div><div class="type-number num">1.2%</div><div class="type-label">of sessions hit an error</div></div>
    <div class="after"><div class="type-label">Since the release</div><div class="type-number num">6.8%</div><div class="type-label">of sessions hit an error</div></div>
  </div>
</section>
<div class="grid g4">
  {stat("People who hit an error", "6", trend("4", "up", "bad") + " of 38 people who used the app", spark=[0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 3, 4, 3, 2], spark_color=DANGER)}
  {stat("Error-free sessions", "96.2%", trend("2.4 pts", "down", "bad") + " vs previous 24 hours", spark=[99, 99, 98, 99, 99, 98, 99, 95, 93, 94], spark_color=DANGER)}
  {stat("Failed API calls", "17", "From 3.1K calls the app made")}
  {stat("Failed actions", "14", "Out of 138 things people tried")}
</div>
<div class="grid g21">
  <section class="panel">{card_head("Sessions with an error", "Per hour. The dashed line is the last release.", "23", "Sessions")}
    {chart(wide, narrow)}
  </section>
  <section class="panel">{card_head("Where errors happen", "Pages, by people affected.", "4", "Pages")}
    {bars([("Approvals", [5], ""), ("Onboarding", [3], ""), ("Calendar", [2], ""), ("Strategy", [1], "")], [ERROR], str)}
    <p class="type-label" style="margin-top:1rem">A person can hit more than one page.</p>
  </section>
</div>
<section class="panel" style="margin-bottom:1.25rem">{card_head("Errors people hit", "Grouped by cause, most people first. Open one for where it happens and what the person did.", "4", "Unresolved")}
  <div class="card-tools">{segmented(["Unresolved", "New", "Fixed"], "Unresolved", True)}</div>
  {issues_html}
  <div class="note-row">{icon("check")}<span>11 errors from browser extensions and bots are hidden.</span><a class="link" href="#">Show them{icon("chevron-right")}</a></div>
</section>
<section class="panel" style="margin-bottom:1.25rem">{card_head("Failed actions", "Things people tried to do that did not work, worst rate first.", "14", "Failed")}
  {actions_html}
</section>
<section class="panel">{card_head("Failed API calls", "Calls the app made that came back with an error or no answer.", "17", "Failed")}
    {calls_html}
  <div class="note-row"><span>24 calls ended with 401 because a sign-in expired. People were sent to sign in again, so they are hidden.</span></div>
</section>"""
    extra = (
        f'<button class="btn sm btn-outline pressable">All releases{icon("chevron-down", "i chev")}</button>'
    )
    return page("Observability: frontend", "Frontend", body, toolbar_extra=extra)


def error_detail():
    hourly = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 3, 2, 3, 1]
    series = [(DANGER, hourly, True)]
    wide = release_marker(line_chart(HOURS, series, 4, lambda v: f"{v:.0f}", width=1100), 18, 24, 1100)
    narrow = release_marker(line_chart(HOURS_PHONE, series, 4, lambda v: f"{v:.0f}", height=220, width=340), 18, 24, 340)

    steps = [
        ("6:41:02 PM", "", "Opened <span class=\"mono\">/c/:clientId/approvals</span>", ""),
        ("6:41:03 PM", "", "Loaded posts: <span class=\"mono\">GET /api/v1/brands/:brandId/posts</span> 200", f'<a class="link" href="#">Trace{icon("external")}</a>'),
        ("6:41:09 PM", "", "Pressed Approve on a post for Instagram", ""),
        ("6:41:09 PM", "bad", "The page broke and showed “Something went wrong”", ""),
    ]
    steps_html = "".join(
        f'<div class="step {cls}"><span class="t">{t}</span><span class="pin"></span><span style="min-width:0;overflow-wrap:anywhere">{what} {link}</span></div>'
        for t, cls, what, link in steps
    )
    people = [("Tartine Bakery", "6 times", "12 min ago"), ("Meow Meow Tweet", "4 times", "1 h ago"), ("Four Barrel Coffee", "2 times", "3 h ago"), ("Don Angie", "2 times", "5 h ago")]
    people_rows = [
        f'<div class="rl-row"><span class="cell-main">{client(c)}</span>' + cell("Hit it", n, "r num") + cell("Last", last, "r num") + "</div>"
        for c, n, last in people
    ]
    people_html = rows("minmax(0,1fr) 4.5rem 6rem", [("Client", ""), ("Hit it", "r"), ("Last", "r")], people_rows)

    body = f"""
<a class="btn sm btn-ghost pressable" href="#" style="margin-left:-0.75rem;margin-bottom:0.5rem;color:var(--muted-foreground)">{icon("arrow-left")}Frontend</a>
<header class="page-header">
  <div style="min-width:0;flex:1 1 32rem"><div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.625rem"><span class="badge badge-danger">Unresolved</span><span class="badge badge-tint">New in the release of 25 Sep, 6:05 PM</span></div>
  <h1 class="mono" style="font-size:1.25rem;line-height:1.4;font-weight:600;overflow-wrap:anywhere">TypeError: Cannot read properties of undefined (reading 'platforms')</h1>
  <p>People see a blank page with “Something went wrong” right after pressing Approve on the Approvals page.</p></div>
  <div class="toolbar-end"><button class="btn btn-outline pressable">Open in SigNoz{icon("external")}</button><button class="btn btn-default pressable">{icon("check")}Mark as fixed</button></div>
</header>
<div class="grid g4">
  {stat("People", "5", "Across 4 clients")}
  {stat("Times", "14", "About 3 an hour since the release")}
  {stat("First seen", "6:12 PM", "25 Sep, 7 min after the release")}
  {stat("Last seen", "12 min ago", "Still happening")}
</div>
<section class="panel" style="margin-bottom:1.25rem">{card_head("When it happened", "Times per hour. The dashed line is the release.")}
  {chart(wide, narrow)}
</section>
<div class="grid g21">
  <div style="display:grid;gap:1.25rem;align-content:start;min-width:0">
    <section class="panel">{card_head("What the person did", "The last steps before the error, from the most recent time.")}
      <div class="steps">{steps_html}</div>
    </section>
    <section class="panel">{card_head("Where in the code", "Our code first. Library lines are folded.")}
      <div class="stack mono">TypeError: Cannot read properties of undefined (reading 'platforms')
        <span class="frame app">at PostSidePanel (features/approvals/post-side-panel.tsx:48:31)</span>
        <span class="frame app">at ApprovalStack (features/approvals/approval-stack.tsx:112:9)</span>
        <span class="frame">14 lines from react-dom, folded</span></div>
    </section>
  </div>
  <div style="display:grid;gap:1.25rem;align-content:start;min-width:0">
    <section class="panel">{card_head("Details", "Where it shows up.")}
      <div class="facts">
        <div><div class="type-label">Page</div><div class="v mono">/c/:clientId/approvals</div></div>
        <div><div class="type-label">Release</div><div class="v">25 Sep, 6:05 PM</div></div>
        <div><div class="type-label">Devices</div><div class="v">11 desktop, 3 phone</div></div>
        <div><div class="type-label">Session replay</div><div class="v muted" style="font-weight:400">Not recorded</div></div>
      </div>
      <h3 class="type-heading" style="font-size:1rem;margin:1.25rem 0 0.75rem">Browsers</h3>
      {bars([("Chrome", [9], ""), ("Safari", [4], ""), ("Edge", [1], "")], [BRAND], str, bar_px=260)}
    </section>
    <section class="panel">{card_head("Who hit it", "Clients whose people saw this error.")}
      {people_html}
    </section>
  </div>
</div>"""
    return page("Observability: frontend error", "Frontend", body, show_tabs=False)


def main():
    OUT.mkdir(exist_ok=True)
    pages = {"overview": overview(), "server": server(), "frontend": frontend(), "error-detail": error_detail()}
    for name, html in pages.items():
        (OUT / f"obs-v3-{name}.html").write_text(html, encoding="utf-8")
        print(f"wrote screens-v3/obs-v3-{name}.html")


if __name__ == "__main__":
    main()
