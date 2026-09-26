"""Builds the observability mockups in design/observability/screens from shell.css and the content below.

Run: python design/observability/build.py
Each output is one self-contained HTML file (CSS and icons inlined), ready to import into Figma.
"""

from pathlib import Path

SRC = Path(__file__).parent
OUT = SRC / "screens"
CSS = (SRC / "shell.css").read_text(encoding="utf-8")

BRAND = "var(--brand)"
BRAND_2 = "var(--brand-2)"
ERROR = "var(--error-fill)"
DANGER = "var(--destructive)"

# Lucide paths, drawn once per page as a sprite.
ICONS = {
    "calendar": '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    "filter": '<path d="M3 6h18M7 12h10M10 18h4"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    "chevron-right": '<path d="m9 18 6-6-6-6"/>',
    "external": '<path d="M15 3h6v6M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    "activity": '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    "settings": '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    "sun": '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2m-7.07-17.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    "check": '<path d="M20 6 9 17l-5-5"/>',
    "x": '<path d="M18 6 6 18M6 6l12 12"/>',
    "arrow-up": '<path d="m5 12 7-7 7 7M12 19V5"/>',
    "arrow-down": '<path d="M12 5v14M19 12l-7 7-7-7"/>',
    "arrow-left": '<path d="m12 19-7-7 7-7M19 12H5"/>',
    "rotate": '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    "copy": '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    "search": '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    "alert": '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    "bot": '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/>',
    "globe": '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
    "file": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M16 13H8M16 17H8"/>',
    "database": '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5M3 12a9 3 0 0 0 18 0"/>',
    "workflow": '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
    "book": '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
}

CLIENTS = {
    "Four Barrel Coffee": ("FB", "#8a4b2a"),
    "Tartine Bakery": ("TB", "#c2410c"),
    "Meow Meow Tweet": ("MM", "#0f766e"),
    "Don Angie": ("DA", "#9f1239"),
}


def icon(name, cls="i"):
    return f'<svg class="{cls}" aria-hidden="true"><use href="#i-{name}"/></svg>'


def sprite():
    symbols = "".join(
        f'<symbol id="i-{name}" viewBox="0 0 24 24">{paths}</symbol>' for name, paths in ICONS.items()
    )
    return f'<svg width="0" height="0" style="position:absolute">{symbols}</svg>'


def client(name):
    initials, color = CLIENTS[name]
    return f'<span class="who"><span class="mini-avatar" style="background:{color}">{initials}</span>{name}</span>'


def segmented(options, active, small=False):
    buttons = "".join(
        f'<button class="{"on" if option == active else ""}">{option}</button>' for option in options
    )
    size = " sm" if small else ""
    return f'<div class="seg{size}" role="radiogroup">{buttons}</div>'


def legend(items):
    spans = "".join(
        f'<span><i class="dot" style="background:{color}"></i>{label}{f" <b>{value}</b>" if value else ""}</span>'
        for label, color, value in items
    )
    return f'<div class="legend">{spans}</div>'


def card_head(title, description, figure=None, figure_label=None):
    right = ""
    if figure:
        right = f'<div class="figure"><div class="type-number">{figure}</div><div class="type-label">{figure_label}</div></div>'
    return (
        f'<div class="card-head"><div><h2 class="type-heading">{title}</h2>'
        f'<p class="type-label">{description}</p></div>{right}</div>'
    )


def sparkline(values, color=BRAND):
    width, height = 88, 30
    peak, low = max(values), min(values)
    span = (peak - low) or 1
    step = width / (len(values) - 1)
    points = " ".join(f"{i * step:.1f},{height - 3 - (v - low) / span * (height - 6):.1f}" for i, v in enumerate(values))
    return (
        f'<svg class="spark" viewBox="0 0 {width} {height}" aria-hidden="true">'
        f'<polyline points="{points}" fill="none" stroke="{color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>'
    )


def trend(text, direction, tone="muted"):
    """A signed change with an arrow; tone says whether the change is good, bad or just information."""
    arrow = icon("arrow-up" if direction == "up" else "arrow-down")
    return f'<span class="trend {tone}">{arrow}{text}</span>'


def stat(label, value, delta, unit="", spark=None, spark_color=BRAND):
    unit_html = f"<small>{unit}</small>" if unit else ""
    spark_html = sparkline(spark, spark_color) if spark else ""
    return (
        f'<div class="panel stat"><div class="stat-top"><div class="type-label">{label}</div>{spark_html}</div>'
        f'<div class="value type-number">{value}{unit_html}</div><div class="delta">{delta}</div></div>'
    )


def bars(rows, colors, total_format=str, head=None, bar_px=380):
    """rows: (label, [segment values], note[, row colors]). White label inside the fill when it fits, ink label after it when not."""
    peak = max(sum(row[1]) for row in rows)
    html = f'<div class="bars">{head or ""}'
    for row in rows:
        label, values, note = row[:3]
        row_colors = row[3] if len(row) > 3 else colors
        total = sum(values)
        width = max(total / peak * 100, 1.2)
        segments = "".join(
            f'<span style="width:{value / total * 100:.2f}%;background:{color}"></span>'
            for value, color in zip(values, row_colors)
            if value
        )
        note_html = f'<span class="note">{note}</span>' if note else ""
        label_px = len(label) * 7.6 + 28
        fits = width / 100 * bar_px >= label_px
        label_html = (
            f'<div class="lbl on">{label}{note_html}</div>'
            if fits
            else f'<div class="lbl" style="left:calc({width:.2f}% + 2px)">{label}{note_html}</div>'
        )
        html += (
            f'<div class="bar-row"><div class="bar">'
            f'<div class="fill" style="width:{width:.2f}%">{segments}</div>{label_html}</div>'
            f'<div class="bar-total">{total_format(total)}</div></div>'
        )
    return html + "</div>"


def bars_head(items, right="Total"):
    return f'<div class="bars-head">{legend(items)}<span class="type-label">{right}</span></div>'


def line_chart(labels, series, y_max, y_format, height=220, width=460, focus=None):
    """series: (color, values, filled). Straight segments: the data is hourly, not a curve.
    focus: (index, title, [(label, color, text)]) draws the hover state at that point."""
    left, bottom, top = 44, 24, 8
    plot_w, plot_h = width - left, height - bottom - top
    step = plot_w / (len(labels) - 1)

    def point(i, v):
        return left + i * step, top + plot_h - v / y_max * plot_h

    svg = f'<svg class="chart" viewBox="0 0 {width} {height}" role="img">'
    for k in range(5):
        y = top + plot_h - k / 4 * plot_h
        svg += f'<line class="grid-line" x1="{left}" x2="{width}" y1="{y:.1f}" y2="{y:.1f}"/>'
        svg += f'<text x="{left - 10}" y="{y + 4:.1f}" text-anchor="end">{y_format(y_max * k / 4)}</text>'
    for i, label in enumerate(labels):
        if label:
            x, _ = point(i, 0)
            svg += f'<text x="{x:.1f}" y="{height - 4}" text-anchor="middle">{label}</text>'
    for color, values, filled in series:
        points = " ".join(f"{x:.1f},{y:.1f}" for x, y in (point(i, v) for i, v in enumerate(values)))
        if filled:
            base = top + plot_h
            svg += f'<polygon points="{left},{base} {points} {left + plot_w},{base}" fill="{color}" fill-opacity="0.12"/>'
        svg += f'<polyline points="{points}" fill="none" stroke="{color}" stroke-width="2.25" stroke-linejoin="round" stroke-linecap="round"/>'
    if not focus:
        return svg + "</svg>"
    index, title, rows = focus
    x, _ = point(index, 0)
    svg += f'<line x1="{x:.1f}" x2="{x:.1f}" y1="{top}" y2="{top + plot_h}" stroke="var(--foreground)" stroke-opacity="0.25" stroke-dasharray="3 3"/>'
    for color, values, _ in series:
        _, y = point(index, values[index])
        svg += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="4.5" fill="var(--card)" stroke="{color}" stroke-width="2.25"/>'
    svg += "</svg>"
    items = "".join(
        f'<div class="tip-row"><i class="dot" style="background:{color}"></i><span>{label}</span><b>{text}</b></div>'
        for label, color, text in rows
    )
    left_pct = x / width * 100
    tip = f'<div class="tooltip" style="left:calc({left_pct:.1f}% + 14px)"><div class="tip-title">{title}</div>{items}</div>'
    return f'<div class="chart-wrap">{svg}{tip}</div>'


def column_chart(labels, values, y_format, y_max, highlight_last=True, height=270, width=340):
    left, bottom, top = 40, 24, 8
    plot_w, plot_h = width - left, height - bottom - top
    slot = plot_w / len(values)
    svg = f'<svg class="chart" viewBox="0 0 {width} {height}" role="img">'
    for k in range(5):
        y = top + plot_h - k / 4 * plot_h
        svg += f'<line class="grid-line" x1="{left}" x2="{width}" y1="{y:.1f}" y2="{y:.1f}"/>'
        svg += f'<text x="{left - 10}" y="{y + 4:.1f}" text-anchor="end">{y_format(y_max * k / 4)}</text>'
    for i, (label, value) in enumerate(zip(labels, values)):
        bar_w = slot * 0.56
        x = left + i * slot + (slot - bar_w) / 2
        h = value / y_max * plot_h
        last = highlight_last and i == len(values) - 1
        fill = BRAND if last else "var(--tint-strong)"
        svg += f'<rect x="{x:.1f}" y="{top + plot_h - h:.1f}" width="{bar_w:.1f}" height="{h:.1f}" rx="8" fill="{fill}"/>'
        svg += f'<text x="{x + bar_w / 2:.1f}" y="{height - 4}" text-anchor="middle">{label}</text>'
    return svg + "</svg>"


HOURS = ["00:00", "", "", "", "04:00", "", "", "", "08:00", "", "", "", "12:00", "", "", "", "16:00", "", "", "", "20:00", "", "", "Now"]


def page(title, active_tab, body, show_tabs=True, toolbar_extra=""):
    tabs = segmented(["Overview", "Agents", "Server"], active_tab) if show_tabs else ""
    toolbar = ""
    if show_tabs:
        toolbar = (
            f'<div class="toolbar">{tabs}<div class="toolbar-end">'
            f'<span class="type-label">Updated 1 min ago</span>'
            f'<span class="switch-row"><span class="switch on"><span></span></span>Auto refresh</span>'
            f'<span class="toolbar-sep"></span>'
            f'<button class="btn sm btn-outline pressable">{icon("calendar")}Last 24 hours{icon("chevron-down", "i chev")}</button>'
            f'<button class="btn sm btn-outline pressable">{icon("filter")}Add filter</button>{toolbar_extra}</div></div>'
        )
    return f"""<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..700&family=Instrument+Sans:wght@400..700&display=swap" rel="stylesheet">
<style>{CSS}</style>
</head>
<body>
{sprite()}
<header class="topbar"><div class="topbar-inner material">
  <a class="logo" href="#"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="9" width="4.5" height="10" rx="2.25" fill="currentColor" opacity=".55"/><rect x="9.75" y="4" width="4.5" height="15" rx="2.25" fill="currentColor"/><rect x="16.5" y="7" width="4.5" height="12" rx="2.25" fill="currentColor" opacity=".8"/></svg>Cadence</a>
  <div class="topbar-end">
    <button class="btn icon pressable" aria-label="Theme">{icon("sun")}</button>
    <span class="badge badge-outline">Admin</span>
    <span class="avatar">SA</span>
  </div>
</div></header>
<nav class="rail material" aria-label="Admin">
  <a href="#">{icon("users")}Clients</a>
  <a href="#" class="on" aria-current="page">{icon("activity")}Observability</a>
  <div class="sep"></div>
  <a href="#">{icon("settings")}Settings</a>
</nav>
<main>
{"" if not show_tabs else '<header class="page-header"><div><h1 class="type-title">Observability</h1><p>How the server and the AI agents are doing, across every client.</p></div></header>'}
{toolbar}
{body}
</main>
</body>
</html>"""


def money(v):
    return f"${v:.2f}"


def compact(v):
    if v >= 1_000_000:
        return f"{v / 1_000_000:.1f}M"
    if v >= 1_000:
        return f"{v / 1_000:.1f}K"
    return f"{v:g}"


def overview():
    requests = [180, 160, 150, 140, 150, 170, 230, 300, 380, 420, 410, 440, 460, 470, 455, 480, 500, 490, 470, 450, 430, 400, 380, 360]
    errors = [1, 1, 0, 1, 0, 1, 2, 1, 2, 3, 2, 1, 2, 9, 6, 2, 1, 2, 1, 1, 2, 1, 1, 1]
    body = f"""
<section class="panel" style="display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1.25rem;flex-wrap:wrap">
  <div style="display:flex;align-items:center;gap:0.875rem">
    <span class="dot" style="width:0.625rem;height:0.625rem;background:var(--success);box-shadow:0 0 0 5px rgba(23, 138, 94, 0.14)"></span>
    <div><p class="type-heading">Everything is running normally</p>
    <p class="type-label" style="margin-top:0.25rem">1 agent run failed and 1 route was slow in the last 24 hours. Checked 1 min ago.</p></div>
  </div>
  <a class="link" href="#">See what needs attention{icon("chevron-right")}</a>
</section>
<div class="grid g4">
  {stat("Requests", "8.4K", trend("6.2%", "up") + " vs previous 24 hours", spark=requests)}
  {stat("Error rate", "0.4%", trend("0.1 pts", "down", "good") + " vs previous 24 hours", spark=errors, spark_color=DANGER)}
  {stat("AI cost", "$3.82", trend("$0.40", "up") + " vs previous 24 hours", spark=[3.4, 4.1, 3.9, 5.2, 4.6, 3.4, 3.82])}
  {stat("Agent runs", "48", '<span class="badge badge-danger">1 failed</span> 47 finished', spark=[4, 6, 5, 7, 6, 8, 5, 7])}
</div>
<div class="grid g21">
  <section class="panel">{card_head("Requests", "Calls to the API per hour, and how many failed.", "8,412", "Total requests")}
    <div class="card-tools">{legend([("Requests", BRAND, "8.4K"), ("Errors", DANGER, "34")])}</div>
    {line_chart(HOURS, [(BRAND, requests, True), (DANGER, [e * 10 for e in errors], False)], 600, lambda v: f"{v:.0f}", width=620, focus=(13, "Today, 13:00", [("Requests", BRAND, "470"), ("Errors", DANGER, "9")]))}
  </section>
  <section class="panel">{card_head("AI cost", "What the agents cost per day.", "$28.40", "Last 7 days")}
    {column_chart(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"], [3.4, 4.1, 3.9, 5.2, 4.6, 3.4, 3.82], lambda v: f"${v:g}", 6)}
  </section>
</div>
<div class="grid g2">
  <section class="panel">{card_head("Top clients by AI cost", "Who the agents worked for today.", "$3.53", "Top 4 clients")}
    {bars([("Four Barrel Coffee", [1.42], ""), ("Tartine Bakery", [0.96], ""), ("Meow Meow Tweet", [0.71], ""), ("Don Angie", [0.44], "")], [BRAND], money)}
    <div style="margin-top:1rem"><a class="link" href="#">All clients{icon("chevron-right")}</a></div>
  </section>
  <section class="panel">{card_head("Needs attention", "Problems from the last 24 hours, newest first.", "2", "Open")}
    <div style="display:grid;gap:0.75rem">
      <a href="#" style="display:flex;gap:0.875rem;align-items:flex-start;padding:1rem;border-radius:1rem;background:rgba(207, 63, 87, 0.06)">
        <span style="color:var(--destructive);margin-top:0.2rem">{icon("alert")}</span>
        <div style="flex:1;min-width:0"><p style="font-weight:500">Business discovery failed for Don Angie</p>
        <p class="type-label" style="margin-top:0.25rem">The research could not be saved. 22 Sep, 9:14 PM</p></div>
        <span class="link">View run{icon("chevron-right")}</span></a>
      <a href="#" style="display:flex;gap:0.875rem;align-items:flex-start;padding:1rem;border-radius:1rem;background:rgba(183, 116, 10, 0.07)">
        <span style="color:var(--warning);margin-top:0.2rem">{icon("activity")}</span>
        <div style="flex:1;min-width:0"><p style="font-weight:500">Starting a scan was slow for 12 minutes</p>
        <p class="type-label" style="margin-top:0.25rem">POST /api/v1/scans took over 2 s at p95. 22 Sep, 8:40 PM</p></div>
        <span class="link">View route{icon("chevron-right")}</span></a>
    </div>
    <div class="resolved">{icon("check")}<span>3 problems cleared on their own in the last 24 hours.</span><a class="link" href="#">History{icon("chevron-right")}</a></div>
  </section>
</div>"""
    return page("Observability", "Overview", body)


def agents():
    input_tokens = [40, 55, 52, 60, 58, 72, 90, 120, 110, 95, 130, 150, 140, 120, 100, 95, 110, 90, 80, 70, 60, 55, 40, 30]
    output_tokens = [3, 4, 4, 5, 5, 6, 8, 9, 9, 8, 10, 12, 11, 10, 8, 8, 9, 7, 6, 6, 5, 4, 3, 2]
    p50 = [38, 40, 42, 39, 41, 44, 46, 43, 41, 40, 39, 42, 44, 41, 40, 43, 42, 40, 39, 41, 42, 40, 41, 39]
    p95 = [98, 104, 110, 101, 99, 118, 124, 112, 105, 103, 108, 116, 121, 110, 104, 112, 109, 106, 101, 108, 112, 105, 110, 104]
    models = [("claude-opus-5", BRAND, "1.3M", "51.0K", "0", "$0.41"), ("claude-sonnet-5", BRAND_2, "152.7K", "72.3K", "0", "$0.15"), ("gpt-4.1-mini", "var(--tint-strong)", "1.3K", "43", "0", "$0.02")]
    model_rows = "".join(
        f'<tr><td><span class="who"><i class="dot" style="background:{c}"></i>{m}</span></td><td class="r num">{i}</td><td class="r num">{o}</td><td class="r num">{ca}</td><td class="r num" style="font-weight:500">{cost}</td></tr>'
        for m, c, i, o, ca, cost in models
    )
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
    run_rows = "".join(
        f'<tr><td class="muted num">{t}</td><td><span class="who">{icon("bot")}{a}</span></td><td class="trunc">{inp}</td><td>{client(c)}</td>'
        f'<td>{ok_badge if ok else error_badge}</td>'
        f'<td class="r num">{cost}</td><td class="go">{icon("chevron-right")}</td></tr>'
        for t, a, inp, c, ok, cost in runs
    )
    body = f"""
<div class="grid g3">
  {stat("Agent runs", "40", trend("8", "up") + " vs previous 24 hours", spark=[1, 2, 2, 3, 2, 4, 3, 5, 4, 3, 2, 2])}
  {stat("Model cost", "$0.58", trend("$0.12", "up") + " vs previous 24 hours", spark=[2, 3, 3, 5, 4, 6, 5, 7, 6, 4, 3, 3])}
  {stat("Tokens", "1.6M", "1.5M input, 123.4K output", spark=input_tokens)}
</div>
<div class="grid g2">
  <section class="panel">{card_head("Model usage and cost", "Tokens and cost for each model.", "$0.58", "Total cost")}
    <table class="table"><thead><tr><th>Model</th><th class="r">Input</th><th class="r">Output</th><th class="r">Cached</th><th class="r">Cost</th></tr></thead><tbody>{model_rows}</tbody></table>
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
    {line_chart(HOURS, [(BRAND_2, p95, False), (BRAND, p50, True)], 140, lambda v: f"{v:.0f} s")}
  </section>
</div>
<div class="grid g2">
  <section class="panel">{card_head("Usage over time", "Input and output tokens per hour.", "1.6M", "Total tokens")}
    <div class="card-tools">{segmented(["Tokens", "Cost"], "Tokens", True)}{legend([("Input", BRAND, "1.5M"), ("Output", BRAND_2, "123.4K")])}</div>
    {line_chart(HOURS, [(BRAND, input_tokens, True), (BRAND_2, output_tokens, False)], 160, lambda v: f"{v:.0f}K")}
  </section>
  <section class="panel">{card_head("Cost by client", "Who the AI spend was for.", "$0.58", "Total cost")}
    {bars([("Four Barrel Coffee", [0.22], ""), ("Tartine Bakery", [0.16], ""), ("Meow Meow Tweet", [0.12], ""), ("Don Angie", [0.08], "")], [BRAND], money)}
  </section>
</div>
<section class="panel">{card_head("Recent runs", "Every agent run, newest first. Open one to see each step.")}
  <div class="table-wrap"><table class="table"><thead><tr><th>Started</th><th>Agent</th><th>Asked to</th><th>Client</th><th>Status</th><th class="r">Cost</th><th></th></tr></thead><tbody>{run_rows}</tbody></table></div>
  <div style="margin-top:1rem"><a class="link" href="#">All runs{icon("chevron-right")}</a></div>
</section>"""
    return page("Observability: agents", "Agents", body)


def server():
    requests = [180, 160, 150, 140, 150, 170, 230, 300, 380, 420, 410, 440, 460, 470, 455, 480, 500, 490, 470, 450, 430, 400, 380, 360]
    errors = [1, 1, 0, 1, 0, 1, 2, 1, 2, 3, 2, 1, 2, 9, 6, 2, 1, 2, 1, 1, 2, 1, 1, 1]
    p50 = [80, 82, 79, 78, 84, 86, 90, 88, 85, 84, 83, 86, 88, 92, 90, 86, 84, 83, 85, 86, 84, 82, 83, 85]
    p95 = [320, 330, 310, 300, 340, 360, 390, 380, 370, 365, 360, 380, 420, 610, 520, 390, 370, 360, 365, 372, 368, 360, 375, 380]
    reqs = [
        ("1:33:14 AM", "POST", "/api/v1/scans", ("success", "200"), "240 ms", "Four Barrel Coffee"),
        ("1:32:50 AM", "GET", "/api/v1/brands", ("success", "200"), "48 ms", "Tartine Bakery"),
        ("1:31:02 AM", "POST", "/api/v1/brands/:brandId/research", ("danger", "500"), "30.0 s", "Don Angie"),
        ("1:29:40 AM", "GET", "/api/v1/me/overview", ("success", "200"), "62 ms", "Meow Meow Tweet"),
        ("1:26:18 AM", "GET", "/api/v1/brands/:brandId", ("warning", "404"), "22 ms", "Tartine Bakery"),
        ("1:24:55 AM", "POST", "/api/v1/brands/:brandId/questionnaire", ("success", "200"), "410 ms", "Four Barrel Coffee"),
    ]
    req_rows = "".join(
        f'<tr><td class="muted num">{t}</td><td><span class="method{" post" if m == "POST" else ""}">{m}</span></td><td>{r}</td>'
        f'<td><span class="badge badge-{s[0]}">{s[1]}</span></td><td class="r num">{d}</td><td>{client(c)}</td>'
        f'<td class="r"><a class="link" href="#">Trace{icon("external")}</a></td></tr>'
        for t, m, r, s, d, c in reqs
    )
    logs = [
        ("1:32:10 AM", "warning", "Warning", "Firecrawl rate limit reached. Retrying in 6 s."),
        ("1:30:22 AM", "neutral", "Info", "Scan finished for tartinebakery.com in 41 s."),
        ("1:28:44 AM", "danger", "Error", "Research could not be saved: the insert timed out after 30 s."),
        ("1:25:01 AM", "neutral", "Info", "Business discovery started for Don Angie."),
    ]
    log_rows = "".join(
        f'<div style="display:grid;grid-template-columns:6.5rem 5rem minmax(0,1fr) auto;gap:1rem;align-items:center;padding:0.75rem 0;border-bottom:1px solid var(--border)">'
        f'<span class="muted num" style="font-size:0.8125rem">{t}</span><span class="badge badge-{v}">{lv}</span><span>{msg}</span>'
        f'<a class="link" href="#">Trace{icon("external")}</a></div>'
        for t, v, lv, msg in logs
    )
    body = f"""
<div class="grid g4">
  {stat("Requests", "8.4K", trend("6.2%", "up") + " vs previous 24 hours", spark=requests)}
  {stat("Error rate", "0.4%", "34 failed requests", spark=errors, spark_color=DANGER)}
  {stat("p95 latency", "380", trend("12 ms", "up", "bad") + " vs previous 24 hours", "ms", spark=p95, spark_color=BRAND_2)}
  {stat("Uptime", "99.98%", "Last 30 days")}
</div>
<div class="grid g2">
  <section class="panel">{card_head("Requests by route", "Which endpoints are busy, and which fail.", "8.4K", "Total requests")}
    {bars([("POST /api/v1/scans", [3395, 5], ""), ("GET /api/v1/brands", [2898, 2], ""), ("GET /api/v1/me/overview", [1800, 0], ""), ("POST /brands/:brandId/research", [1071, 29], "")], [BRAND, ERROR], compact, bars_head([("Completed", BRAND, ""), ("Errors", ERROR, "")]))}
  </section>
  <section class="panel">{card_head("Latency", "How long a request takes, per hour.", "85 ms", "Typical request")}
    <div class="card-tools">{legend([("Typical (p50)", BRAND, "85 ms"), ("Slowest 5% (p95)", BRAND_2, "380 ms")])}</div>
    {line_chart(HOURS, [(BRAND_2, p95, False), (BRAND, p50, True)], 800, lambda v: f"{v:.0f}")}
  </section>
</div>
<div class="grid g2">
  <section class="panel">{card_head("Requests over time", "Requests and errors per hour.", "8,412", "Total requests")}
    <div class="card-tools">{legend([("Requests", BRAND, "8.4K"), ("Errors", DANGER, "34")])}</div>
    {line_chart(HOURS, [(BRAND, requests, True), (DANGER, [e * 10 for e in errors], False)], 600, lambda v: f"{v:.0f}")}
  </section>
  <section class="panel">{card_head("How requests ended", "Grouped by status code.", "98.8%", "Succeeded")}
    {bars([("2xx  Succeeded", [8316], "", ["var(--success)"]), ("4xx  Bad request or not found", [62], "", ["var(--warning)"]), ("5xx  Server error", [34], "", ["var(--destructive)"])], [], compact)}
  </section>
</div>
<section class="panel" style="margin-bottom:1.25rem">{card_head("Recent requests", "The latest calls to the API. Open a trace in SigNoz for the full detail.")}
  <div class="table-wrap"><table class="table"><thead><tr><th>Time</th><th>Method</th><th>Route</th><th>Status</th><th class="r">Duration</th><th>Client</th><th></th></tr></thead><tbody>{req_rows}</tbody></table></div>
</section>
<section class="panel">{card_head("Logs", "What the server wrote down, newest first.")}
  <div class="card-tools">{segmented(["All", "Info", "Warnings", "Errors"], "All", True)}<span class="search">{icon("search")}Search logs</span></div>
  {log_rows}
  <div style="margin-top:1rem"><a class="link" href="#">Open all logs in SigNoz{icon("external")}</a></div>
</section>"""
    extra = f'<button class="btn sm btn-outline pressable">Open in SigNoz{icon("external")}</button>'
    return page("Observability: server", "Server", body, toolbar_extra=extra)


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
    icons = {"Step": "workflow", "Agent": "bot", "Tool": "globe"}
    rows = ""
    for state, name, kind, start, dur, cost, depth in steps:
        failed = state == "failed"
        color = "var(--destructive)" if failed else (BRAND if depth == 0 else BRAND_2)
        mark = (
            f'<span style="display:grid;place-items:center;width:1.5rem;height:1.5rem;border-radius:999px;background:rgba(207, 63, 87, 0.12);color:var(--destructive)">{icon("x")}</span>'
            if failed
            else f'<span style="display:grid;place-items:center;width:1.5rem;height:1.5rem;border-radius:999px;background:rgba(23, 138, 94, 0.12);color:var(--success)">{icon("check")}</span>'
        )
        row_bg = "background:var(--tint);" if failed else ""
        rows += (
            f'<div style="display:grid;grid-template-columns:minmax(0,15rem) minmax(0,1fr) 4.5rem 3.5rem;gap:1rem;align-items:center;padding:0.625rem 0.75rem;border-radius:0.875rem;{row_bg}">'
            f'<div style="display:flex;align-items:center;gap:0.625rem;padding-left:{depth * 1.75}rem;min-width:0">{mark}'
            f'<span style="font-weight:500;white-space:nowrap">{name}</span><span class="badge badge-neutral">{icon(icons[kind])}{kind}</span></div>'
            f'<div style="position:relative;height:0.625rem;border-radius:999px;background:rgba(236, 238, 242, 0.7)">'
            f'<span style="position:absolute;top:0;bottom:0;left:{start / total * 100:.2f}%;width:{dur / total * 100:.2f}%;border-radius:999px;background:{color}"></span></div>'
            f'<span class="r num" style="text-align:right">{dur:.1f} s</span><span class="num muted" style="text-align:right">{cost or ""}</span></div>'
        )
    axis = "".join(
        f'<span style="position:absolute;left:{t / total * 100:.2f}%;transform:translateX(-50%);white-space:nowrap">{t} s</span>' for t in (0, 25, 50, 75, 100)
    )
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
  <div style="display:grid;grid-template-columns:minmax(0,15rem) minmax(0,1fr) 4.5rem 3.5rem;gap:1rem;padding:0 0.75rem 0.5rem">
    <span></span><div class="type-label" style="position:relative;height:1rem">{axis}</div><span class="type-label" style="text-align:right">Time</span><span class="type-label" style="text-align:right">Cost</span></div>
  <div style="display:grid;gap:0.125rem">{rows}</div>
</section>
<div class="grid g21">
  <section class="panel">{card_head("Save research", "The failed step.")}
    <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem;margin-bottom:1.25rem">
      <div><div class="type-label">Type</div><div style="font-weight:500;margin-top:0.25rem">Step</div></div>
      <div><div class="type-label">Duration</div><div class="num" style="font-weight:500;margin-top:0.25rem">30.8 s</div></div>
      <div><div class="type-label">Started at</div><div class="num" style="font-weight:500;margin-top:0.25rem">71.2 s</div></div>
      <div><div class="type-label">Tries</div><div class="num" style="font-weight:500;margin-top:0.25rem">1 of 1</div></div>
    </div>
    <div style="display:flex;gap:0.75rem;padding:1rem;border-radius:1rem;background:rgba(207, 63, 87, 0.08);color:var(--destructive);margin-bottom:1.25rem">{icon("alert")}<p>brand_research insert timed out after 30 s.</p></div>
    <div class="card-tools" style="margin-bottom:0.5rem">{segmented(["Input", "Output"], "Input", True)}</div>
    <table class="table"><tbody>
      <tr><td class="muted">Brand</td><td class="r">Don Angie</td></tr>
      <tr><td class="muted">Research sections</td><td class="r num">14</td></tr>
      <tr><td class="muted">Sources read</td><td class="r num">9 pages</td></tr>
      <tr><td class="muted">Saves to</td><td class="r">brand_research</td></tr>
    </tbody></table>
  </section>
  <section class="panel">{card_head("About this run", "IDs to share when reporting it.")}
    <table class="table"><tbody>
      <tr><td class="muted">Run ID</td><td class="r"><span class="who">run_8f92a10b<button class="btn icon" aria-label="Copy">{icon("copy")}</button></span></td></tr>
      <tr><td class="muted">Trace ID</td><td class="r"><span class="who">tr_01ha94bc72<button class="btn icon" aria-label="Copy">{icon("copy")}</button></span></td></tr>
      <tr><td class="muted">Client</td><td class="r">{client("Don Angie")}</td></tr>
      <tr><td class="muted">Workflow</td><td class="r">business-discovery</td></tr>
    </tbody></table>
    <h3 class="type-heading" style="font-size:1rem;margin:1.25rem 0 0.75rem">Cost by agent</h3>
    {bars([("Growth Consultant", [0.19], ""), ("Audience Researcher", [0.12], "")], [BRAND], money)}
  </section>
</div>"""
    return page("Observability: run detail", "Agents", body, show_tabs=False)


def main():
    OUT.mkdir(exist_ok=True)
    pages = {"overview": overview(), "agents": agents(), "server": server(), "run-detail": run_detail()}
    for name, html in pages.items():
        (OUT / f"{name}.html").write_text(html, encoding="utf-8")
        print(f"wrote screens/{name}.html")


if __name__ == "__main__":
    main()
