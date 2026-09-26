"""Builds the redesigned apps/web screens in design/web-v2/screens.

Run: python design/web-v2/build.py
Reuses the tokens, components and chart helpers from design/observability so both sets stay one system.
"""

import importlib.util
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE / "screens"
spec = importlib.util.spec_from_file_location("obs", HERE.parent / "observability" / "build.py")
obs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(obs)

icon, sprite, segmented, legend, card_head, bars, bars_head = obs.icon, obs.sprite, obs.segmented, obs.legend, obs.card_head, obs.bars, obs.bars_head
CSS = obs.CSS + (HERE / "app.css").read_text(encoding="utf-8")
BRAND, BRAND_2 = obs.BRAND, obs.BRAND_2

obs.ICONS.update({
    "house": '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    "compass": '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
    "grid": '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    "check-circle": '<path d="M21.8 10A10 10 0 1 1 17 3.3"/><path d="m9 11 3 3L22 4"/>',
    "calendar-days": '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
    "chart": '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
    "sparkles": '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M21 5h-4"/>',
    "chevrons": '<path d="m7 15 5 5 5-5M7 9l5-5 5 5"/>',
    "instagram": '<rect width="20" height="20" x="2" y="2" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    "facebook": '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    "tiktok": '<path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>',
    "linkedin": '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>',
    "image": '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    "pencil": '<path d="M21.2 6.8a2.8 2.8 0 0 0-4-4L3.8 16.2 2 22l5.8-1.8z"/>',
    "target": '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    "dots": '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    "chat": '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    "chevron-left": '<path d="m15 18-6-6 6-6"/>',
    "clock": '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    "plus": '<path d="M5 12h14M12 5v14"/>',
    "arrow-right": '<path d="M5 12h14M12 5l7 7-7 7"/>',
    "send": '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    "trash": '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    "lock": '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    "play": '<path d="m6 3 14 9-14 9z"/>',
    "layers": '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    "refresh": '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M8 16H3v5"/>',
    "users-round": '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
    "palette": '<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2a10 10 0 0 0 0 20 2 2 0 0 0 2-2 2 2 0 0 1 2-2h2a4 4 0 0 0 4-4A10 10 0 0 0 12 2z"/>',
    "bell": '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
})

INK, HIGHLIGHT, PAPER = "#1c2433", "#f2b441", "#f2f5fa"

# Posts the agent drafted for Tartinebakery (same data the running app shows).
POSTS = [
    ("New from the kiln, take 6", "New from the kiln", "image", "Needs approval", "Fri 9 Oct, 5:00 PM", "yellow"),
    ("At the wheel, take 5", "At the wheel", "carousel", "Needs approval", "Wed 7 Oct, 1:00 PM", "blue"),
    ("Studio notes, take 4", "Studio notes", "reel", "Needs approval", "Mon 5 Oct, 9:00 AM", "yellow"),
    ("On the table, take 3", "On the table", "image", "Needs approval", "Sat 3 Oct, 5:00 PM", "ink"),
    ("New from the kiln, take 2", "New from the kiln", "carousel", "Needs approval", "Thu 1 Oct, 1:00 PM", "yellow"),
    ("At the wheel, take 1", "At the wheel", "reel", "Scheduled", "Tue 29 Sep, 9:00 AM", "blue"),
]
KIND_ICON = {"image": "image", "carousel": "layers", "reel": "play"}


def art(title, variant, kind=None, size_class="", font_size="2.1rem"):
    """Brand-coloured post artwork: a shape in one brand colour, the headline in ink."""
    if variant == "yellow":
        shape = f'<div class="shape" style="left:-10%;right:-10%;top:-30%;height:75%;background:{HIGHLIGHT};transform:rotate(-12deg)"></div>'
        colour = INK
    elif variant == "ink":
        shape = f'<div class="shape" style="inset:0;background:{INK}"></div><div class="shape" style="right:-25%;top:-15%;width:80%;aspect-ratio:1;border-radius:999px;background:{BRAND}"></div>'
        colour = "#fff"
    else:
        shape = f'<div class="shape" style="inset:0;background:{BRAND}"></div><div class="shape" style="right:-20%;top:-20%;width:75%;aspect-ratio:1;border-radius:999px;background:{INK}"></div>'
        colour = "#fff"
    kind_html = f'<span class="kind">{icon(KIND_ICON[kind])}</span>' if kind else ""
    return f'<div class="art {size_class}">{shape}{kind_html}<p class="headline" style="color:{colour};font-size:{font_size}">{title}</p></div>'


def thumb(variant):
    return art("", variant, size_class="thumb")


STATUS_BADGE = {
    "Needs approval": f'<span class="badge badge-warning">{icon("clock")}Needs approval</span>',
    "Scheduled": f'<span class="badge badge-tint">{icon("calendar")}Scheduled</span>',
    "Published": f'<span class="badge badge-success">{icon("check")}Published</span>',
}

RAIL = [("", "Overview", "house"), ("strategy", "Strategy", "compass"), ("content", "Content", "grid"),
        ("approvals", "Approvals", "check-circle"), ("calendar", "Calendar", "calendar-days"), ("analytics", "Analytics", "chart")]


def rail(active):
    items = ""
    for key, label, name in RAIL:
        count = '<span class="count">5</span>' if key == "approvals" else ""
        on = ' class="on" aria-current="page"' if key == active else ""
        items += f'<a href="#"{on}>{icon(name)}{label}{count}</a>'
    settings_on = ' class="on" aria-current="page"' if active == "settings" else ""
    return f'<nav class="rail material" aria-label="Workspace">{items}<div class="sep"></div><a href="#"{settings_on}>{icon("settings")}Settings</a></nav>'


def topbar(workspace=True):
    switch = ""
    agent = ""
    if workspace:
        switch = f'<span class="topbar-sep"></span><button class="client-switch pressable"><span class="client-mark">T</span><span class="client-name">Tartinebakery</span>{icon("chevrons", "i chev")}</button>'
        agent = f'<button class="btn sm btn-tint pressable ask-agent" aria-label="Ask the agent">{icon("sparkles")}<span>Ask the agent</span></button>'
    return f"""<header class="topbar"><div class="topbar-inner material">
  <a class="logo" href="#"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="9" width="4.5" height="10" rx="2.25" fill="currentColor" opacity=".55"/><rect x="9.75" y="4" width="4.5" height="15" rx="2.25" fill="currentColor"/><rect x="16.5" y="7" width="4.5" height="12" rx="2.25" fill="currentColor" opacity=".8"/></svg>Cadence</a>
  {switch}
  <div class="topbar-end">{agent}<button class="btn icon pressable" aria-label="Theme">{icon("sun")}</button><span class="avatar">T</span></div>
</div></header>"""


def page(title, body, active=None, workspace=True, overlay=""):
    nav = rail(active) if workspace else ""
    main_style = "" if workspace else ' class="solo"'
    theme = "brand-tartine" if workspace else ""
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
<body class="{theme}">
{sprite()}
{topbar(workspace)}
{nav}
<main{main_style}>
{body}
</main>
{overlay}
</body>
</html>"""


def header(title, description, actions=""):
    return f'<header class="page-header"><div><h1 class="type-title">{title}</h1><p>{description}</p></div><div class="toolbar-end">{actions}</div></header>'


# ---------- Onboarding ----------

def onboarding():
    steps = [
        ("Reads your website", "Pages, colours, typefaces and the way you write. About a minute."),
        ("Drafts a brand kit", "You check it and fix anything that sounds wrong before anything is planned."),
        ("Plans your first month", "Themes, how often to post and when. Nothing goes out without your approval."),
    ]
    cards = "".join(
        f'<div class="step-card"><div class="step-num">{i}</div><p style="font-weight:500">{t}</p><p class="type-label" style="margin-top:0.375rem">{d}</p></div>'
        for i, (t, d) in enumerate(steps, 1)
    )
    body = f"""
<section style="max-width:44rem;margin:4rem auto 0;text-align:center">
  <span class="badge badge-tint" style="margin:0 auto 1.25rem">{icon("sparkles")}Step 1 of 3</span>
  <h1 class="type-title" style="font-size:2.75rem">Start with your website</h1>
  <p style="margin:0.75rem auto 0;max-width:34rem;color:var(--muted-foreground)">Paste the address. The agent reads it and drafts a brand kit you can edit before anything is planned.</p>
  <div class="material" style="display:flex;align-items:center;gap:0.625rem;margin:2rem auto 0;max-width:36rem;padding:0.5rem 0.5rem 0.5rem 1.25rem;border-radius:999px">
    {icon("globe")}<span style="flex:1;text-align:left;color:var(--muted-foreground)">yourbusiness.com</span>
    <button class="btn lg btn-default pressable">Read this site{icon("arrow-right")}</button>
  </div>
  <p class="type-label" style="margin-top:0.875rem">{icon("lock")} It only reads public pages. You can change everything it finds.</p>
</section>
<section class="steps3" style="max-width:56rem;margin:3.5rem auto 0;text-align:left">{cards}</section>"""
    return page("Onboarding", body, workspace=False)


def onboarding_v3(state="empty"):
    """S01 v3: one job (paste a website), what happens next, and the approval promise. state: empty | typed | error."""
    if state == "error":
        form_class, typed = "url-form error", 'tartine bakery<span class="caret"></span>'
        message = f'<p class="field-message error" role="alert">{icon("alert")}That doesn&#39;t look like a website address. Try something like tartinebakery.com.</p>'
    elif state == "typed":
        form_class, typed = "url-form focus", 'tartinebakery.com<span class="caret"></span>'
        message = f'<p class="field-message">{icon("check")}Looks right. We&#39;ll read tartinebakery.com and the pages it links to.</p>'
    else:
        form_class, typed = "url-form", '<span class="prefix">yourbusiness.com</span>'
        message = f'<p class="field-message">{icon("lock")}Only public pages are read. Nothing is posted anywhere.</p>'
    steps = [
        ("now", "Read your website", "Pages, colours, typefaces and how you write.", "clock", "About a minute"),
        ("", "Check your brand kit", "Fix anything that sounds wrong. Posts start from it.", "pencil", "About 3 minutes"),
        ("", "Get your first month", "Themes, how often to post and the best times.", "calendar", "Ready to approve"),
    ]
    cards = "".join(
        f'<div class="step-card {now}"><div class="step-num">{i}</div><p style="font-weight:600">{title}</p>'
        f'<p class="type-label" style="margin-top:0.25rem">{text}</p><p class="meta">{icon(meta_icon)}{meta}</p></div>'
        for i, (now, title, text, meta_icon, meta) in enumerate(steps, 1)
    )
    body = f"""
<section class="start">
  <h1 class="type-title">Start with your website</h1>
  <p class="lede">Paste your address. The agent reads it and drafts your brand kit, so your first posts sound like you.</p>
  <form class="{form_class}" onsubmit="return false">
    <span class="typed">{icon("globe")}<span>{typed}</span></span>
    <button class="btn lg btn-default pressable" type="submit">Read my website{icon("arrow-right")}</button>
  </form>
  {message}
</section>
<section class="journey" aria-label="What happens next">{cards}</section>
<p class="promise">{icon("check-circle")}Nothing is published until you approve it.</p>"""
    return page("Onboarding: website step", body, workspace=False)


def flow(step):
    """The three onboarding steps, shared by every onboarding screen."""
    names = ["Read your website", "Check your brand kit", "Get your first month"]
    parts = []
    for i, name in enumerate(names, 1):
        cls = "on" if i == step else ""
        mark = icon("check") if i < step else str(i)
        parts.append(f'<span class="{cls}"><span class="dot">{mark}</span><span class="label">{name}</span></span>')
    return '<nav class="flow" aria-label="Onboarding steps">' + '<span class="line"></span>'.join(parts) + "</nav>"


def onboarding_scanning_v3(state="running"):
    """S02 v3: named progress on the left, the brand kit filling in on the right. state: running | failed."""
    if state == "failed":
        body = f"""
{flow(1)}
<section class="fail">
  <div style="width:3.5rem;height:3.5rem;border-radius:999px;background:rgba(183,116,10,0.14);color:var(--warning);display:grid;place-items:center;margin:0 auto 1.25rem">{icon("alert")}</div>
  <h1 class="type-title" style="font-size:2rem">We couldn&rsquo;t read meowmeowtweet.com</h1>
  <p style="margin-top:0.75rem;color:var(--muted-foreground)">The site didn&rsquo;t answer within 30 seconds. It may be down, or it may block automated visits. Nothing was saved.</p>
  <div class="fail-options">
    <div class="option"><span class="icon-wrap">{icon("refresh")}</span><div style="flex:1;min-width:12rem"><p style="font-weight:500">Try again</p><p class="type-label">Sites that are slow to wake up often work the second time.</p></div><button class="btn btn-default pressable">Try again</button></div>
    <div class="option"><span class="icon-wrap">{icon("globe")}</span><div style="flex:1;min-width:12rem"><p style="font-weight:500">Use a different address</p><p class="type-label">For example your shop page or a link-in-bio site.</p></div><button class="btn btn-outline pressable">Change address</button></div>
    <div class="option"><span class="icon-wrap">{icon("pencil")}</span><div style="flex:1;min-width:12rem"><p style="font-weight:500">Fill in the brand kit yourself</p><p class="type-label">About 5 minutes. You can add the website later.</p></div><button class="btn btn-outline pressable">Fill it in</button></div>
  </div>
</section>"""
        return page("Onboarding: scan failed", body, workspace=False)

    steps = [
        ("done", "Found your website", "meowmeowtweet.com, 14 pages", "4 s"),
        ("done", "Read the pages", "Home, Shop, About and 11 product pages", "18 s"),
        ("now", "Working out how you sound", "Reading product descriptions and the About page", ""),
        ("later", "Drafting your brand kit", "Colours, typefaces, audience and tone together", ""),
    ]
    rows = ""
    for st, title, detail, took in steps:
        mark = icon("check") if st == "done" else ('<span class="spinner"></span>' if st == "now" else "")
        title_style = "font-weight:500" if st != "later" else "color:var(--muted-foreground)"
        took_html = f'<span class="type-label" style="margin-left:auto">{took}</span>' if took else ""
        rows += f'<div class="scan-step"><span class="scan-dot {st}">{mark}</span><div style="flex:1"><p style="{title_style}">{title}</p><p class="type-label" style="margin-top:0.125rem">{detail}</p></div>{took_html}</div>'
    colours = "".join(f'<span class="swatch" style="width:1.75rem;height:1.75rem;border-radius:0.5rem;background:{c}" title="{c}"></span>' for c in ["#f25c54", "#fdf6ec", "#2d2a32", "#9bc53d"])
    found = f'<span class="found">{icon("check")}Found</span>'
    kit = f"""
<div class="kit-row"><span class="type-label">Name</span><div style="display:flex;justify-content:space-between;gap:0.5rem"><span style="font-weight:500">Meow Meow Tweet</span>{found}</div></div>
<div class="kit-row"><span class="type-label">Colours</span><div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem"><span style="display:flex;gap:0.375rem">{colours}</span>{found}</div></div>
<div class="kit-row"><span class="type-label">Typefaces</span><div style="display:flex;justify-content:space-between;gap:0.5rem"><span><span style="font-weight:500">Fraunces</span> <span class="muted">for headings,</span> <span style="font-weight:500">Karla</span> <span class="muted">for text</span></span>{found}</div></div>
<div class="kit-row"><span class="type-label">What you sell</span><div style="display:flex;justify-content:space-between;gap:0.5rem"><span>Natural deodorant and body care</span>{found}</div></div>
<div class="kit-row"><span class="type-label">How you sound</span><div style="display:flex;gap:0.5rem;align-items:center"><span class="spinner"></span><span class="type-label">Reading now</span></div></div>
<div class="kit-row"><span class="type-label">Who it&rsquo;s for</span><div class="bone" style="width:70%"></div></div>"""
    body = f"""
{flow(1)}
<section class="scan-head">
  <p class="type-label">Reading your website</p>
  <h1 class="type-title" style="margin-top:0.25rem">meowmeowtweet.com</h1>
</section>
<div class="scan-grid">
  <section class="panel" aria-live="polite">
    <div style="display:flex;justify-content:space-between;align-items:baseline"><p class="type-heading" style="font-size:1rem">Step 3 of 4</p><span class="type-label">About 30 seconds left</span></div>
    <div class="overall" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"><span style="width:60%"></span></div>
    <div class="scan-list">{rows}</div>
  </section>
  <section class="panel">
    {card_head("Your brand kit so far", "It fills in as the agent reads. You can change all of it next.")}
    {kit}
  </section>
</div>
<div style="max-width:62rem;margin:1.25rem auto 0;display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap">
  <div class="leave-note" style="flex:1;min-width:16rem">{icon("clock")}<span>You can leave this page. The scan keeps going, and your brand kit waits for you when you come back.</span></div>
  <button class="btn btn-ghost pressable" style="color:var(--muted-foreground)">Use a different website</button>
</div>"""
    return page("Onboarding: scanning", body, workspace=False)



def onboarding_scanning_v4(state="running"):
    """S02 v4 (client-clarity pass): named progress on the left, the brand kit filling in on the right. state: running | failed."""
    if state == "failed":
        body = f"""
{flow(1)}
<section class="fail">
  <div style="width:3.5rem;height:3.5rem;border-radius:999px;background:rgba(183,116,10,0.14);color:var(--warning);display:grid;place-items:center;margin:0 auto 1.25rem">{icon("alert")}</div>
  <h1 class="type-title" style="font-size:2rem">We couldn&rsquo;t read meowmeowtweet.com</h1>
  <p style="margin-top:0.75rem;color:var(--muted-foreground)">The site didn&rsquo;t answer within 30 seconds. It may be down, or it may block automated visits. Nothing was saved.</p>
  <div class="fail-options">
    <div class="option"><span class="icon-wrap">{icon("refresh")}</span><div style="flex:1;min-width:12rem"><p style="font-weight:500">Try again</p><p class="type-label">Sites that are slow to wake up often work the second time.</p></div><button class="btn btn-default pressable">Try again</button></div>
    <div class="option"><span class="icon-wrap">{icon("globe")}</span><div style="flex:1;min-width:12rem"><p style="font-weight:500">Use a different address</p><p class="type-label">For example your shop page or a link-in-bio site.</p></div><button class="btn btn-outline pressable">Change address</button></div>
    <div class="option"><span class="icon-wrap">{icon("pencil")}</span><div style="flex:1;min-width:12rem"><p style="font-weight:500">Fill in the brand kit yourself</p><p class="type-label">About 5 minutes. You can add the website later.</p></div><button class="btn btn-outline pressable">Fill it in</button></div>
  </div>
</section>"""
        return page("Onboarding: scan failed", body, workspace=False)

    steps = [
        ("done", "Found your website", "meowmeowtweet.com, 14 pages", "4 s"),
        ("done", "Read the pages", "Home, Shop, About and 11 product pages", "18 s"),
        ("now", "Working out how you sound", "Reading product descriptions and the About page", ""),
        ("later", "Drafting your brand kit", "Putting your colours, fonts and tone together", ""),
    ]
    rows = ""
    for st, title, detail, took in steps:
        mark = icon("check") if st == "done" else ('<span class="spinner"></span>' if st == "now" else "")
        title_style = "font-weight:500" if st != "later" else "color:var(--muted-foreground)"
        took_html = ""
        rows += f'<div class="scan-step"><span class="scan-dot {st}">{mark}</span><div style="flex:1"><p style="{title_style}">{title}</p><p class="type-label" style="margin-top:0.125rem">{detail}</p></div>{took_html}</div>'
    colours = "".join(f'<span class="swatch" style="width:1.75rem;height:1.75rem;border-radius:0.5rem;background:{c}" title="{c}"></span>' for c in ["#f25c54", "#fdf6ec", "#2d2a32", "#9bc53d"])
    found = f'<span class="found">{icon("check")}Found</span>'
    kit = f"""
<div class="kit-row"><span class="type-label">Name</span><div style="display:flex;justify-content:space-between;gap:0.5rem"><span style="font-weight:500">Meow Meow Tweet</span>{found}</div></div>
<div class="kit-row"><span class="type-label">Colours</span><div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem"><span style="display:flex;gap:0.375rem">{colours}</span>{found}</div></div>
<div class="kit-row"><span class="type-label">Typefaces</span><div style="display:flex;justify-content:space-between;gap:0.5rem"><span><span style="font-weight:500">Fraunces</span> <span class="muted">for headings,</span> <span style="font-weight:500">Karla</span> <span class="muted">for text</span></span>{found}</div></div>
<div class="kit-row"><span class="type-label">What you sell</span><div style="display:flex;justify-content:space-between;gap:0.5rem"><span>Natural deodorant and body care</span>{found}</div></div>
<div class="kit-row"><span class="type-label">How you sound</span><div style="display:flex;gap:0.5rem;align-items:center"><span class="spinner"></span><span class="type-label">Reading now</span></div></div>
<div class="kit-row"><span class="type-label">Who it&rsquo;s for</span><div class="bone" style="width:70%"></div></div>"""
    body = f"""
{flow(1)}
<section class="scan-head">
  <p class="type-label">Reading your website</p>
  <h1 class="type-title" style="margin-top:0.25rem">meowmeowtweet.com</h1>
</section>
<div class="scan-grid">
  <section class="panel scan-progress" aria-live="polite">
    <div style="display:flex;justify-content:space-between;align-items:baseline"><p class="type-heading" style="font-size:1rem">Reading your pages</p><span class="type-label">About 30 seconds left</span></div>
    <div class="overall" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"><span style="width:60%"></span></div>
    <div class="scan-list">{rows}</div>
  </section>
  <section class="panel kit-panel">
    {card_head("Your brand kit so far", "Your colours, fonts and how you sound. It fills in as the agent reads, and you can change all of it next.")}
    {kit}
  </section>
</div>
<div style="max-width:62rem;margin:1.25rem auto 0;display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap">
  <div class="leave-note" style="flex:1;min-width:16rem">{icon("clock")}<span>You can leave this page. The scan keeps going, and your brand kit waits for you when you come back.</span></div>
  <button class="btn btn-ghost pressable" style="color:var(--muted-foreground)">Use a different website</button>
</div>"""
    return page("Onboarding: scanning", body, workspace=False)


def research_running():
    """S19 a: research after the questionnaire. Step names match the workflow's gather, diagnose, profile, save."""
    steps = [
        ("done", "Reading about your market", "Your website, your answers, 212 reviews and 3 similar brands"),
        ("now", "Finding what holds sales back", "Comparing what customers say with what the website offers"),
        ("later", "Getting to know your best customers", "Who they are, what they want, the words they use"),
        ("later", "Writing it up", "A short brief your strategy is built on"),
    ]
    rows = ""
    for st, title, detail in steps:
        mark = icon("check") if st == "done" else ('<span class="spinner"></span>' if st == "now" else "")
        title_style = "font-weight:500" if st != "later" else "color:var(--muted-foreground)"
        rows += f'<div class="scan-step"><span class="scan-dot {st}">{mark}</span><div style="flex:1"><p style="{title_style}">{title}</p><p class="type-label" style="margin-top:0.125rem">{detail}</p></div></div>'
    expect = [
        ("alert", "What holds sales back", "The one thing to fix first", "55%"),
        ("target", "What your posts should do", "One clear job for your social media", "75%"),
        ("users", "Your best customers", "2 to 4 groups, in their own words", "65%"),
        ("globe", "Brands like yours", "What works for them, and where you can win", "60%"),
    ]
    expect_rows = "".join(
        f'<div class="expect-row"><span class="icon-wrap">{icon(i)}</span><div><p style="font-weight:500">{t}</p><p class="type-label">{d}</p><div class="bone" style="width:{w}"></div></div></div>'
        for i, t, d, w in expect
    )
    body = f"""
{flow(3)}
<section class="scan-head">
  <p class="type-label">Researching your market</p>
  <h1 class="type-title" style="margin-top:0.25rem">Meow Meow Tweet</h1>
</section>
<div class="scan-grid">
  <section class="panel scan-progress" aria-live="polite">
    <div style="display:flex;justify-content:space-between;align-items:baseline"><p class="type-heading" style="font-size:1rem">Finding what holds sales back</p><span class="type-label">About 3 minutes left</span></div>
    <div class="overall" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100"><span style="width:40%"></span></div>
    <div class="scan-list">{rows}</div>
  </section>
  <section class="panel kit-panel">
    {card_head("What you&rsquo;ll get", "A short brief in plain words. Your first month of posts is planned from it.")}
    {expect_rows}
  </section>
</div>
<div style="max-width:62rem;margin:1.25rem auto 0">
  <div class="leave-note">{icon("clock")}<span>You can leave this page. Research keeps going, and your strategist starts on your first month as soon as it&rsquo;s done.</span></div>
</div>"""
    return page("Onboarding: research running", body, workspace=False)


def research_findings():
    """The research in plain words: shared by S19b (onboarding) and S21 (workspace)."""
    segments = [
        ("Ingredient checkers", "25&ndash;40, read every label, switched after a rash from big brands.", "evidence", "&ldquo;Finally one that doesn&rsquo;t sting.&rdquo; (review)"),
        ("Shop owners", "Small natural-goods stores deciding what to stock next.", "evidence", "&ldquo;We found you on Instagram first.&rdquo; (your answer)"),
        ("Gift buyers", "Buy the trial sets for someone else around holidays.", "hypothesis", ""),
    ]
    seg_html = "".join(
        f'<div class="segment"><div style="display:flex;justify-content:space-between;gap:0.5rem;align-items:center"><p style="font-weight:600">{n}</p><span class="basis {b}">{"From reviews and answers" if b == "evidence" else "Our guess, to test"}</span></div><p class="type-label" style="margin-top:0.25rem">{s}</p>'
        + (f'<p class="quote-line">{q}</p>' if q else "")
        + "</div>"
        for n, s, b, q in segments
    )
    rivals = [("Native", "Big budget, scent-led posts; little on ingredients"), ("Schmidt&rsquo;s", "Strong in stores; slow on Instagram replies"), ("Ethique", "Plastic-free story; posts twice a week")]
    rival_html = "".join(f'<div class="kv" style="grid-template-columns:7rem minmax(0,1fr)"><span style="font-weight:500">{n}</span><span class="type-label">{note}</span></div>' for n, note in rivals)
    return f"""<div class="learn-grid">
  <section class="panel wide">
    <p class="type-label">What your posts should do</p>
    <p class="lever">Show the ingredients up close so new people trust Meow Meow Tweet enough to try it, and shop owners see a brand their customers ask for.</p>
  </section>
  <section class="panel">
    {card_head("What holds sales back", "The one thing to fix first.")}
    <span class="pill-kind">{icon("alert")}Trust</span>
    <p style="margin-top:0.75rem">People who try it love it (4.8 stars from 212 reviews), but few people have heard of it. Most first orders come from a friend&rsquo;s tip, not from what they saw online.</p>
  </section>
  <section class="panel">
    {card_head("Your best customers", "Who to talk to, in their own words.")}
    {seg_html}
  </section>
  <section class="panel">
    {card_head("Brands like yours", "What they do, and the gap they leave.")}
    {rival_html}
  </section>
  <section class="panel">
    {card_head("Where you can win", "What none of them do well.")}
    <p>Nobody shows how the product is made. Short, honest &ldquo;made by hand&rdquo; posts and real ingredient close-ups are open ground.</p>
  </section>
</div>"""


def research_done():
    """S19 b: what the research found, in the owner's words, before the strategy."""
    cta = f'<button class="btn lg btn-default pressable">See your first month{icon("arrow-right")}</button>'
    body = f"""
<div class="learn-page">
{flow(3)}
<section class="learn-head">
  <p class="type-label">Research done</p>
  <h1 class="type-title" style="margin-top:0.25rem">Here&rsquo;s what we learned</h1>
  <p style="margin-top:0.5rem;color:var(--muted-foreground)">Your strategist used this to plan your first month. It&rsquo;s ready for you.</p>
</section>
{research_findings()}
<div class="learn-foot">
  <div class="confidence">{icon("check-circle")}<span>Based on your answers, your website, 212 reviews and 3 brands. <a href="#" style="color:var(--foreground);text-decoration:underline">See the 14 sources</a></span></div>
  {cta}
</div>
<div class="bottom-bar"><p class="type-label">Your first month is ready.</p>{cta}</div>
</div>"""
    return page("Onboarding: research done", body, workspace=False)


def research_failed():
    """S19 c: research stopped; the answers are safe, so trying again costs the owner nothing."""
    body = f"""
{flow(3)}
<section class="fail">
  <div style="width:3.5rem;height:3.5rem;border-radius:999px;background:rgba(183,116,10,0.14);color:var(--warning);display:grid;place-items:center;margin:0 auto 1.25rem">{icon("alert")}</div>
  <h1 class="type-title" style="font-size:2rem">Research stopped halfway</h1>
  <p style="margin-top:0.75rem;color:var(--muted-foreground)">A search service didn&rsquo;t answer. Your brand kit and your answers are saved, so nothing needs to be filled in again.</p>
  <div class="fail-options">
    <div class="option"><span class="icon-wrap">{icon("refresh")}</span><div style="flex:1;min-width:12rem"><p style="font-weight:500">Try again</p><p class="type-label">Starts where it stopped. About 3 minutes.</p></div><button class="btn btn-default pressable">Try again</button></div>
    <div class="option"><span class="icon-wrap">{icon("pencil")}</span><div style="flex:1;min-width:12rem"><p style="font-weight:500">Check your answers</p><p class="type-label">Change anything before it runs again.</p></div><button class="btn btn-outline pressable">Your answers</button></div>
  </div>
</section>"""
    return page("Onboarding: research failed", body, workspace=False)


MEOW = {"coral": "#f25c54", "cream": "#fdf6ec", "ink": "#2d2a32", "leaf": "#9bc53d"}


def meow_art(title, font_size="1.35rem"):
    """Post artwork in Meow Meow Tweet's found colours."""
    return (
        f'<div class="art" style="background:{MEOW["cream"]}">'
        f'<div class="shape" style="right:-18%;top:-12%;width:70%;aspect-ratio:1;border-radius:999px;background:{MEOW["coral"]}"></div>'
        f'<div class="shape" style="left:8%;top:8%;width:22%;aspect-ratio:1;border-radius:999px;background:{MEOW["leaf"]}"></div>'
        f'<p class="headline" style="color:{MEOW["ink"]};font-size:{font_size}">{title}</p></div>'
    )


def kit_card(title, rows, action="Edit", extra=""):
    body = "".join(f'<div class="kv"><span class="type-label">{k}</span><div>{v}</div></div>' for k, v in rows)
    button = f'<button class="btn sm btn-ghost pressable">{icon("pencil")}{action}</button>' if action else ""
    return f'<section class="panel kit-card"><div class="kit-card-head"><h2 class="type-heading">{title}</h2>{button}</div>{body}{extra}</section>'


def found_on(where):
    return f'<p class="source" style="margin-top:0.25rem">{icon("globe")}Found on {where}</p>'


def brand_kit_review():
    """S17a: what the scan found, one card per part, read first and edit only what is wrong."""
    swatches = "".join(
        f'<span style="display:inline-flex;align-items:center;gap:0.375rem;margin:0 0.75rem 0.375rem 0"><span class="swatch" style="width:1.5rem;height:1.5rem;border-radius:0.5rem;background:{c}"></span><span class="type-label" style="color:var(--foreground)">{n}</span></span>'
        for n, c in [("Coral", MEOW["coral"]), ("Cream", MEOW["cream"]), ("Ink", MEOW["ink"]), ("Leaf", MEOW["leaf"])]
    )
    tone = "".join(f'<span class="pill{" on" if t in ("Playful", "Warm", "Witty") else ""}">{t}</span>' for t in ["Playful", "Warm", "Witty", "Friendly", "Straightforward", "Confident", "Expert", "Calm", "Bold"])
    platforms = "".join(
        f'<div class="platform{" on" if on else ""}">{icon(i)}<div style="min-width:0"><p style="font-weight:500">{n}</p><p class="type-label">{note}</p></div><span class="box">{icon("check") if on else ""}</span></div>'
        for n, i, on, note in [
            ("Instagram", "instagram", True, "@meowmeowtweet, linked on your site"),
            ("Facebook", "facebook", True, "Meow Meow Tweet, linked on your site"),
            ("TikTok", "tiktok", False, "Not found on your site"),
            ("LinkedIn", "linkedin", False, "Not found on your site"),
        ]
    )
    business = kit_card("The business", [
        ("Name", '<span style="font-weight:500">Meow Meow Tweet</span>'),
        ("Type of business", "Natural body care shop"),
        ("What you do", '<span>Handmade natural deodorant and body care, sold online and in 40 shops across the US.</span>' + found_on("your About page")),
        ("Tagline", '<span class="muted">Not found</span>'),
    ], extra=f'<div class="check-flag">{icon("alert")}<span><b style="font-weight:600">Please check:</b> your site has no tagline. Add one line about what you&rsquo;re known for, or leave it empty.</span></div>')
    audience = kit_card("Who it&rsquo;s for", [
        ("Your customers", "People 25&ndash;40 who shop for natural, plastic-free products and care about ingredients" + found_on("your product pages")),
    ])
    voice = f"""<section class="panel kit-card editing"><div class="kit-card-head"><h2 class="type-heading">How you sound</h2><span class="badge badge-tint">Editing</span></div>
  <p class="type-label" style="margin-bottom:0.75rem">Pick up to three. Every caption is written this way.</p>
  <div class="pills">{tone}</div>
  <div style="margin-top:1rem;padding:0.875rem 1rem;border-radius:1rem;background:#f7f8fa"><p class="type-label">Example caption in this voice</p><p style="margin-top:0.375rem">&ldquo;Our lavender stick just came back. It smells like a nap in a field, minus the bees.&rdquo;</p></div>
  <div style="display:flex;justify-content:flex-end;gap:0.5rem;margin-top:1rem"><button class="btn sm btn-ghost pressable">Cancel</button><button class="btn sm btn-default pressable">Done</button></div>
</section>"""
    look = kit_card("How you look", [
        ("Colours", f'<div style="display:flex;flex-wrap:wrap">{swatches}</div>' + found_on("your homepage")),
        ("Typefaces", '<span><b style="font-weight:500">Fraunces</b> for headings, <b style="font-weight:500">Karla</b> for text</span>'),
    ])
    where = f"""<section class="panel kit-card"><div class="kit-card-head"><div><h2 class="type-heading">Where should we post?</h2><p class="type-label" style="margin-top:0.25rem">Your plan is made for these. You connect them in the next step.</p></div></div><div class="platform-grid">{platforms}</div></section>"""
    side = f"""<aside class="sticky-side">
  {meow_art("Back in stock: the lavender stick")}
  <div>
    <p style="font-weight:500">A post in your brand</p>
    <p class="type-label" style="margin-top:0.25rem">Changes as you edit.</p>
    <div class="desktop-only"><button class="btn btn-default pressable" style="width:100%;margin-top:1rem">Looks right, continue{icon("arrow-right")}</button>
    <p class="type-label" style="margin-top:0.625rem;text-align:center">You can change all of this later in Settings.</p></div>
  </div>
</aside>"""
    body = f"""
{flow(2)}
<section class="review-head">
  <h1 class="type-title">Here&rsquo;s what we found</h1>
  <p style="margin-top:0.5rem;color:var(--muted-foreground);max-width:40rem">Your brand kit: your colours, fonts and how you sound. Every post starts from it, so fix anything that isn&rsquo;t right.</p>
</section>
<div class="review">
  <div>{business}{audience}{voice}{look}{where}</div>
  {side}
</div>
<div class="bottom-bar"><p class="type-label">You can change all of this later in Settings.</p><button class="btn lg btn-default pressable">Looks right, continue{icon("arrow-right")}</button></div>"""
    return page("Onboarding: check your brand kit", body, workspace=False)


def connect_accounts(connected=False):
    """S17b and S17c: connect now or skip. Nothing is forced; skipping only means approved posts wait."""
    if connected:
        instagram_action = '<span class="badge badge-success" style="margin-left:auto">' + icon("check") + "Connected as @meowmeowtweet</span>"
        heading = "Instagram is connected"
        lede = "Approved posts will go out on Instagram at their times. Connect Facebook too, or carry on."
        primary = f'<button class="btn lg btn-default pressable">Continue{icon("arrow-right")}</button>'
        skip = '<button class="btn btn-ghost pressable" style="color:var(--muted-foreground)">Connect Facebook later</button>'
    else:
        instagram_action = '<button class="btn btn-default pressable" style="margin-left:auto">Connect Instagram</button>'
        heading = "Connect where you want to post"
        lede = "Connecting lets approved posts go out on their own. You can do it now or later; nothing is posted without your approval either way."
        primary = ""
        skip = '<button class="btn btn-outline pressable">Skip, connect later</button>'
    accounts = f"""
<section class="panel account"><span class="logo-badge" style="background:#d6336c">{icon("instagram")}</span><div style="flex:1;min-width:12rem"><p style="font-weight:600">Instagram</p><p class="type-label">Needs an Instagram business or creator account.</p></div>{instagram_action}</section>
<section class="panel account"><span class="logo-badge" style="background:#1877f2">{icon("facebook")}</span><div style="flex:1;min-width:12rem"><p style="font-weight:600">Facebook</p><p class="type-label">Posts to your Facebook Page.</p></div><button class="btn btn-outline pressable" style="margin-left:auto">Connect Facebook</button></section>"""
    skip_note = "" if connected else f'<p class="source" style="margin:0.25rem 0 0 0.9rem">{icon("clock")}You can still approve posts. They wait, and go out once you connect.</p>'
    body = f"""
{flow(2)}
<section class="connect-wrap">
  <h1 class="type-title" style="font-size:2rem">{heading}</h1>
  <p style="margin-top:0.5rem;color:var(--muted-foreground)">{lede}</p>
  <div style="margin-top:1.75rem">{accounts}</div>
  <div class="panel" style="margin-top:1rem;background:var(--tint);box-shadow:none">
    <p style="font-weight:600">What Cadence can do once connected</p>
    <div class="promise-list">
      <p>{icon("check")}Publish the posts you approve, at the times you approve.</p>
      <p>{icon("check")}Read likes, saves and reach so the plan gets better.</p>
      <p>{icon("check")}You can disconnect any time in Settings.</p>
      <p style="color:var(--muted-foreground)">{icon("x")}It never messages your followers or changes your profile.</p>
    </div>
  </div>
  <div class="footer-actions"><div>{skip}{skip_note}</div>{primary}</div>
</section>"""
    return page("Onboarding: connect accounts", body, workspace=False)


LANGUAGE_CHOSEN = [
    ("am", "Hi! I&rsquo;m your account manager. Your website told me a lot. A few questions fill in what it can&rsquo;t, like who buys most and what you want posts to do. About 8 questions, 5 minutes."),
    ("am", "Which language should we chat in?"),
    ("me", "English"),
]


def chat_messages(items):
    html = ""
    last_mine = max((i for i, (who, _) in enumerate(items) if who == "me"), default=-1)
    for index, (who, text) in enumerate(items):
        if who == "am":
            html += f'<div class="msg am-msg">{text}</div>'
        elif who == "me":
            hint = f'<p class="msg-meta right">{icon("pencil")}Tap your answer to change it</p>' if index == last_mine else ""
            html += f'<div class="msg me">{text}</div>{hint}'
        elif who == "sep":
            html += f'<span class="day-sep">{text}</span>'
        else:
            html += text
    return html


def answers_side(rows):
    items = "".join(
        f'<div class="kv"><span class="type-label">{k}</span><span class="{"pending-answer" if v is None else ""}">{v or "Not asked yet"}</span>'
        + ("" if v is None else f'<button class="btn icon" aria-label="Change {k}">{icon("pencil")}</button>')
        + "</div>"
        for k, v in rows
    )
    return f'<aside class="panel answers-side">{card_head("Your answers", "Tap any one to change it.")}{items}</aside>'


def chat_page(title, number, total, messages, composer, side_rows, progress_note=None):
    percent = number / total * 100
    note = progress_note or f"Question {number} of {total}"
    return page(title, f"""
{flow(3)}
<div class="chat-layout">
  <section class="panel chat">
    <header class="chat-head"><span class="am-avatar">{icon("sparkles")}</span><div style="flex:1"><p style="font-weight:600">Your account manager</p><p class="type-label">{note}</p></div><div class="overall"><span style="width:{percent:.0f}%"></span></div></header>
    <div class="chat-body" aria-live="polite">{chat_messages(messages)}</div>
    <div class="composer">{composer}</div>
  </section>
  {answers_side(side_rows)}
</div>""", workspace=False)


SIDE_EMPTY = [("Chat language", None), ("You sell", None), ("Posts should", None), ("Best customers", None), ("Typical order", None), ("Posts in", None)]


def send_row(text=None, active=False):
    content = text or '<span class="placeholder">Type an answer</span>'
    return f'<div class="send-row"><div class="box{" active" if active else ""}">{content}</div><button class="send-btn{"" if text else " off"}" aria-label="Send">{icon("send")}</button></div>'


def chat_start():
    """S18 v2 a: the manager says hello and asks for the chat language as quick replies."""
    messages = LANGUAGE_CHOSEN[:2]
    composer = '<div class="chips"><span class="chip-reply">English</span><span class="chip-reply">\u0939\u093f\u0928\u094d\u0926\u0940</span><span class="chip-reply">Hinglish</span></div>' + '<p class="type-label">Tap one to start. You pick the language for your posts later.</p>'
    return chat_page("Questionnaire chat: start", 0, 8, messages, composer, SIDE_EMPTY, "About 8 questions, 5 minutes")


def chat_confirm():
    """S18 v2 b: a confirm question quotes the website; quick replies answer it."""
    messages = LANGUAGE_CHOSEN + [
        ("am", f'Let&rsquo;s start with what you sell. Your About page says:<div class="quote">Handmade natural deodorant and body care, sold online and in about 40 shops across the US.</div><p style="margin-top:0.5rem">Is that right?</p>'),
    ]
    composer = f'<div class="chips"><span class="chip-reply">Yes, that&rsquo;s right</span><span class="chip-reply other">{icon("pencil")}Not quite, let me fix it</span></div>'
    side = [("Chat language", "English")] + SIDE_EMPTY[1:]
    return chat_page("Questionnaire chat: confirm", 1, 8, messages, composer, side)


def chat_other():
    """S18 v2 c: none of the options fit, so the owner taps Something else and types their own answer."""
    messages = LANGUAGE_CHOSEN + [
        ("am", "Let&rsquo;s start with what you sell. Your About page says handmade natural deodorant and body care, online and in about 40 shops. Is that right?"),
        ("me", "Yes, that&rsquo;s right"),
        ("am", "What should your posts do first? Pick the closest, or tell me in your own words."),
    ]
    composer = (
        f'<div class="chips"><span class="chip-reply">More new customers</span><span class="chip-reply">Customers coming back</span><span class="chip-reply">Bigger orders</span>'
        f'<span class="chip-reply">Launch something new</span><span class="chip-reply">Get known locally</span><span class="chip-reply on">{icon("pencil")}Something else</span></div>'
        + send_row('Get into more stores. Shop owners follow us on Instagram before they order.<span class="caret"></span>', active=True)
        + '<p class="type-label" style="margin-top:0.5rem">In your own words is fine. I&rsquo;ll ask if anything is unclear.</p>'
    )
    side = [("Chat language", "English"), ("You sell", "Natural deodorant and body care, online and in 40 shops")] + SIDE_EMPTY[2:]
    return chat_page("Questionnaire chat: something else", 3, 8, messages, composer, side)


def chat_follow_up():
    """S18 v2 d: after reading the answers, the manager asks about the typed one."""
    messages = [
        ("sep", "Answers sent"),
        ("am", "Thanks, that&rsquo;s everything. I read your answers and have one question about this one:"),
        ("html", '<div class="msg me" style="opacity:0.85">Get into more stores. Shop owners follow us on Instagram before they order.</div>'),
        ("am", "So posts should win over <b>shop owners</b>, not only shoppers. Should I plan for both, or mostly for shop owners?"),
    ]
    composer = f'<div class="chips"><span class="chip-reply">Both, shoppers first</span><span class="chip-reply">Both, shop owners first</span><span class="chip-reply">Mostly shop owners</span><span class="chip-reply other">{icon("pencil")}Something else</span></div>'
    side = [("Chat language", "English"), ("You sell", "Natural deodorant and body care, online and in 40 shops"), ("Posts should", "Get into more stores"), ("Best customers", "People 25&ndash;40 who read ingredient lists"), ("Typical order", "$15 to $30"), ("Posts in", "English")]
    return chat_page("Questionnaire chat: follow-up", 8, 8, messages, composer, side, "1 follow-up question")


def chat_summary():
    """S18 v2 e: the manager sums up in one card; approving it starts the research."""
    rows = [("You sell", "Natural deodorant and body care, online and through about 40 stores"), ("Posts should", "Win new stores first, then shoppers"), ("Best customers", "Shop owners, and people 25&ndash;40 who read ingredient lists"), ("Typical order", "$15 to $30"), ("Posts in", "English")]
    summary = "".join(f'<div class="sum-row"><span class="type-label">{k}</span><span>{v}</span><button class="btn sm btn-ghost pressable" aria-label="Change {k}">{icon("pencil")}Change</button></div>' for k, v in rows)
    messages = [
        ("sep", "Follow-up answered"),
        ("me", "Both, shop owners first"),
        ("am", "Perfect. Here&rsquo;s what I understood. Change anything I got wrong:"),
        ("html", f'<div class="summary-card">{summary}</div>'),
        ("am", "When it looks right, I&rsquo;ll research your market and similar brands. It takes about 5 minutes, and you can leave while I work."),
    ]
    composer = f'<div style="display:flex;gap:0.5rem;justify-content:flex-end;flex-wrap:wrap"><button class="btn btn-outline pressable">Change something</button><button class="btn lg btn-default pressable">{icon("check")}Looks right, start research</button></div>'
    side = [("Chat language", "English"), ("You sell", "Natural deodorant and body care, online and in 40 stores"), ("Posts should", "Win new stores first"), ("Best customers", "Shop owners, then shoppers 25&ndash;40"), ("Typical order", "$15 to $30"), ("Posts in", "English")]
    return chat_page("Questionnaire chat: summary", 8, 8, messages, composer, side, "All done")


def chat_edit():
    """S18 f: the client reopens an earlier answer mid-chat; it edits in place, and nothing after it resets."""
    goals = ["More new customers", "Customers coming back", "Bigger orders", "Launch something new", "Get known locally"]
    chips = "".join(f'<span class="chip-reply{" on" if g == "Bigger orders" else ""}">{g}</span>' for g in goals)
    edit = f"""<div class="edit-scrim"></div><div class="edit-card" role="dialog" aria-label="Change your answer">
  <p class="type-label">Change your answer</p>
  <p style="font-weight:600;margin:0.25rem 0 0.875rem">What should your posts do first?</p>
  <div class="chips">{chips}<span class="chip-reply other">{icon("pencil")}Something else</span></div>
  <p class="source" style="margin:0 0 1rem">{icon("clock")}Your other answers stay as they are.</p>
  <div style="display:flex;gap:0.5rem;justify-content:flex-end"><button class="btn btn-outline pressable">Cancel</button><button class="btn btn-default pressable">{icon("check")}Save</button></div>
</div>"""
    messages = [
        ("html", '<div class="msg am-msg dim">Which language should we chat in?</div>'),
        ("html", '<div class="msg me dim">English</div>'),
        ("html", '<div class="msg am-msg dim">What should your posts do first?</div>'),
        ("html", '<div class="msg me editing">More new customers</div>'),
        ("html", edit),
        ("html", '<div class="msg am-msg dim">Who buys from you most?</div>'),
        ("html", '<div class="msg me dim">People 25&ndash;40 who read ingredient lists</div>'),
        ("html", '<div class="msg am-msg dim">What does a typical order cost?</div>'),
    ]
    composer = '<div class="chips dim"><span class="chip-reply">Under $15</span><span class="chip-reply">$15 to $30</span><span class="chip-reply">$30 to $60</span><span class="chip-reply">Over $60</span><span class="chip-reply muted-chip">Not sure</span></div>'
    side = [("Chat language", "English"), ("You sell", "Natural deodorant and body care, online and in 40 shops"), ("Posts should", "More new customers"), ("Best customers", "People 25&ndash;40 who read ingredient lists"), ("Typical order", None), ("Posts in", None)]
    return chat_page("Questionnaire chat: change an earlier answer", 5, 8, messages, composer, side)


def onboarding_scanning():
    steps = [
        ("done", "Found the website", "meowmeowtweet.com, 14 pages"),
        ("done", "Read the pages", "Home, Shop, About, 11 product pages"),
        ("now", "Working out how it sounds", "Reading product descriptions and the About page"),
        ("later", "Drafting the brand kit", "Colours, typefaces, audience and tone"),
    ]
    rows = ""
    for state, title, detail in steps:
        mark = icon("check") if state == "done" else ('<span class="spinner"></span>' if state == "now" else "")
        weight = "font-weight:500" if state != "later" else "color:var(--muted-foreground)"
        rows += f'<div class="scan-step"><span class="scan-dot {state}">{mark}</span><div><p style="{weight}">{title}</p><p class="type-label" style="margin-top:0.125rem">{detail}</p></div></div>'
    swatches = "".join(f'<span class="swatch" style="width:2rem;height:2rem;background:{c}"></span>' for c in ["#f25c54", "#fdf6ec", "#2d2a32", "#9bc53d"])
    body = f"""
<section style="max-width:40rem;margin:3.5rem auto 0">
  <p class="type-label">Reading the website</p>
  <h1 class="type-title" style="margin-top:0.375rem">meowmeowtweet.com</h1>
  <p style="margin-top:0.5rem;color:var(--muted-foreground)">This takes about a minute. You can leave this page; the brand kit waits for you.</p>
  <div class="panel" style="margin-top:1.75rem">{rows}</div>
  <div class="panel" style="margin-top:1.25rem">
    <p class="type-heading" style="font-size:1rem">Found so far</p>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin-top:1rem">
      <div><p class="type-label">Colours</p><div style="display:flex;gap:0.375rem;margin-top:0.5rem">{swatches}</div></div>
      <div><p class="type-label">Typefaces</p><p style="margin-top:0.5rem;font-weight:500">Fraunces, Karla</p></div>
      <div><p class="type-label">Sells</p><p style="margin-top:0.5rem;font-weight:500">Natural deodorant</p></div>
    </div>
  </div>
  <p style="margin-top:1.25rem;text-align:center"><a class="link" href="#" style="color:var(--muted-foreground)">Cancel and use a different website</a></p>
</section>"""
    return page("Onboarding: scanning", body, workspace=False)


# ---------- Overview ----------

FORMATS = {"image": ("image", "Post"), "carousel": ("layers", "Carousel"), "reel": ("play", "Reel"), "story": ("clock", "Story")}
PLATFORMS = {"instagram": "Instagram", "facebook": "Facebook", "linkedin": "LinkedIn", "tiktok": "TikTok"}


def week_post(time, title, variant, platform, fmt, detail, needs):
    """One post in the week: where it goes, what kind it is, and whether it still needs the owner."""
    fmt_icon, fmt_name = FORMATS[fmt]
    where = f"{PLATFORMS[platform]} {fmt_name.lower()}"
    tag = '<span class="needs-tag">Needs approval</span>' if needs else ""
    label = f"{where}, {time}, {title}" + (", needs approval" if needs else "")
    return (f'<a class="chip-post{" needs" if needs else ""}" href="#" aria-label="{label}">'
            f'<span class="chip-thumb">{thumb(variant)}<span class="fmt">{icon(fmt_icon)}</span></span>'
            f'<span class="chip-body"><span class="chip-meta">{icon(platform)}<span class="short">{fmt_name}</span><span class="long">{where}{detail}</span></span>'
            f'<span class="chip-time">{time}</span><span class="muted chip-title">{title}</span>{tag}</span></a>')


def week_strip():
    """This week: seven days on desktop, an agenda on tablet and phone. Each post shows its platform and format."""
    days = [("Mon", "28", [], True), ("Tue", "29", [("9:00 AM", "At the wheel, take 1", "blue", "instagram", "reel", ", 30 seconds", False)], False),
            ("Wed", "30", "free", False), ("Thu", "1", [("1:00 PM", "New from the kiln, take 2", "yellow", "instagram", "carousel", ", 5 slides", True)], False),
            ("Fri", "2", "free", False), ("Sat", "3", [("5:00 PM", "On the table, take 3", "ink", "facebook", "image", "", True)], False), ("Sun", "4", [], False)]
    html = ""
    for name, num, posts, today in days:
        if posts == "free":
            items = '<div class="slot"><b>1:00 PM</b> free best time</div>'
        elif posts:
            items = "".join(week_post(*post) for post in posts)
        else:
            items = '<span class="empty">Nothing planned</span>'
        cls = "day today" if today else "day"
        label_day = "Today" if today else name
        html += f'<div class="{cls}"><div class="label"><span>{label_day}</span><b>{num}</b></div><div class="items">{items}</div></div>'
    return f'<div class="week">{html}</div>'


def this_week():
    legend = '<div class="week-legend"><span><i class="k-scheduled"></i>1 scheduled</span><span><i class="k-needs"></i>2 need approval</span><span><i class="k-free"></i>2 free best times</span><span class="hint">Tap a post to see it</span></div>'
    head = f'<div class="week-head"><div><h2 class="type-heading">This week</h2><p class="type-label" style="margin-top:0.25rem">28 September to 4 October</p></div><a class="btn sm btn-outline pressable" href="#" aria-label="Open calendar">{icon("calendar-days")}<span>Open calendar</span>{icon("arrow-right")}</a></div>'
    return f'<section class="panel" style="margin-bottom:1.25rem">{head}{legend}{week_strip()}</section>'


def overview_body():
    loop = "".join(
        f'<div class="loop-step {state}"><div class="track"></div><p>{label}</p></div>'
        for label, state in [("Onboard", "done"), ("Strategy", "done"), ("Create", "now"), ("Approve", ""), ("Publish", ""), ("Learn", "")]
    )
    return f"""
{header("Tartinebakery", f'Local bakery, <a class="link" href="#">tartinebakery.com</a>', f'<button class="btn sm btn-outline pressable">{icon("pencil")}Ask for changes</button>')}
<section class="next-step">
  <div>
    <h2 class="type-heading">5 posts are waiting for you</h2>
    <p style="margin-top:0.25rem;color:var(--muted-foreground)">The first one goes out Thursday 1 October at 1:00 PM if you approve it.</p>
    <p class="warning-line">{icon("alert")}Instagram isn't connected yet, so approved posts can't publish.</p>
  </div>
  <div class="toolbar-end"><button class="btn btn-outline pressable">{icon("instagram")}Connect Instagram</button><button class="btn btn-default pressable">Review 5 posts{icon("arrow-right")}</button></div>
</section>
<section class="panel" style="margin-bottom:1.25rem">{card_head("Where the agent is", "It has a strategy and has drafted the first posts. Next: your approvals.")}<div class="loop">{loop}</div></section>
{this_week()}
<div class="grid g4 stats">
  <div class="panel stat"><div class="type-label">Needs approval</div><div class="value type-number">5</div><div class="delta"><a class="link" href="#">Review now{icon("chevron-right")}</a></div></div>
  <div class="panel stat"><div class="type-label">Scheduled</div><div class="value type-number">1</div><div class="delta">Next: Tue 29 Sep, 9:00 AM</div></div>
  <div class="panel stat"><div class="type-label">Followers</div><p class="pending-value">Shows up once Instagram is connected.</p></div>
  <div class="panel stat"><div class="type-label">Engagement</div><p class="pending-value">Starts a day after the first post goes out.</p></div>
</div>
<section class="panel kit-summary" style="display:grid;grid-template-columns:minmax(0,1fr) 20rem;gap:2rem">
  <div>{card_head("Brand kit", "What every post starts from.")}
    <p style="max-width:52ch">Tartinebakery sells directly through tartinebakery.com. Friendly and straightforward, with a small, consistent colour palette.</p>
    <div class="form-grid" style="margin-top:1.25rem">
      <div><p class="type-label">Written for</p><p style="margin-top:0.25rem">Local customers, 25–45, who find brands on Instagram</p></div>
      <div><p class="type-label">Sounds</p><div class="pills" style="margin-top:0.375rem"><span class="badge badge-neutral">Friendly</span><span class="badge badge-neutral">Straightforward</span><span class="badge badge-neutral">Confident</span></div></div>
    </div>
    <p style="margin-top:1.25rem"><a class="link" href="#">Edit the brand kit{icon("chevron-right")}</a></p>
  </div>
  <div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);height:4rem;border-radius:1rem;overflow:hidden"><span style="background:{BRAND}"></span><span style="background:{PAPER}"></span><span style="background:{INK}"></span><span style="background:{HIGHLIGHT}"></span></div>
    <p class="type-label" style="margin-top:0.75rem">Poppins for headings, Inter for text</p>
  </div>
</section>"""


def overview():
    return page("Overview", overview_body() + tabbar(""), "")


def overview_chat():
    chat = f"""<div class="scrim"></div>
<aside class="sheet" role="dialog" aria-label="Ask the agent">
  <div class="sheet-head"><div><p class="type-heading">Ask the agent</p><p class="type-label" style="margin-top:0.25rem">About Tartinebakery. It can read, plan and draft; it never publishes.</p></div><button class="icon-close" aria-label="Close">{icon("x")}</button></div>
  <div class="sheet-body" style="gap:0.875rem">
    <div class="bubble me">What needs my approval this week?</div>
    <div class="bubble agent">Two this week, and 3 more next week. The first goes out Thursday at 1:00 PM:
      <div class="agent-posts">
        {week_post("Thu 1:00 PM", "New from the kiln, take 2", "yellow", "instagram", "carousel", ", 5 slides", True)}
        {week_post("Sat 5:00 PM", "On the table, take 3", "ink", "facebook", "image", "", True)}
      </div>
      <p style="margin-top:0.75rem">Instagram and Facebook still need connecting before these can publish. Tap a post to see it.</p>
    </div>
    <div class="pills"><button class="btn sm btn-default pressable">Review 5 posts</button><button class="btn sm btn-outline pressable">Connect accounts</button></div>
  </div>
  <div style="padding:1rem 1.5rem 1.25rem">
    <div class="pills" style="margin-bottom:0.75rem"><span class="pill">What's working best?</span><span class="pill">Give me a post idea</span></div>
    <div style="display:flex;gap:0.5rem;align-items:center"><div class="field" style="flex:1"><div class="input" style="border-radius:999px;color:var(--muted-foreground)">Ask about results or ideas</div></div><button class="btn icon btn-default" style="width:2.75rem;height:2.75rem;color:#fff" aria-label="Send">{icon("send")}</button></div>
  </div>
</aside>"""
    return page("Overview: agent chat", overview_body() + tabbar(""), "", overlay=chat)


# ---------- Strategy ----------

TABS = [("", "Overview", "house"), ("strategy", "Strategy", "compass"), ("content", "Content", "grid"), ("approvals", "Approvals", "check-circle"), ("more", "More", "dots")]


def tabbar(active):
    """The workspace rail as a bottom tab bar on tablet and phone."""
    items = ""
    for key, label, name in TABS:
        on = ' class="on" aria-current="page"' if key == active else ""
        count = '<span class="count">5</span>' if key == "approvals" else ""
        items += f'<a href="#"{on}>{icon(name)}{label}{count}</a>'
    return f'<nav class="tabbar material" aria-label="Workspace">{items}</nav>'


def as_meow(html):
    """Shows a workspace page as Meow Meow Tweet's, the brand that went through onboarding."""
    html = html.replace('<span class="client-mark">T</span><span class="client-name">Tartinebakery</span>', '<span class="client-mark">M</span><span class="client-name">Meow Meow Tweet</span>')
    return html.replace('<body class="brand-tartine">', '<body class="brand-meow">')


def countdown_ring(minutes_left, total=30):
    circumference = 2 * 3.1416 * 26
    remaining = circumference * minutes_left / total
    return (f'<div class="ring" role="timer" aria-label="{minutes_left} minutes until it starts"><svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="26" fill="none" stroke="var(--tint-strong)" stroke-width="6"/>'
            f'<circle cx="30" cy="30" r="26" fill="none" stroke="var(--brand)" stroke-width="6" stroke-linecap="round" stroke-dasharray="{remaining:.1f} {circumference:.1f}"/></svg>'
            f'<b>{minutes_left}<small>min</small></b></div>')


def strategy_body(banner):
    pillars = [("Made by hand", "How each bar is poured and cut, shown close up.", 35),
               ("What&rsquo;s inside", "One ingredient at a time, and why it doesn&rsquo;t sting.", 30),
               ("Real people", "Customer photos and reviews, shop owners first.", 20),
               ("New and back in stock", "Drops, restocks and gift sets.", 15)]
    pillar_html = "".join(f'<div class="pillar"><div style="display:flex;justify-content:space-between;gap:1rem"><span style="font-weight:500">{n}</span><span class="type-label">{s}%</span></div><p class="type-label" style="margin-top:0.125rem">{d}</p><div class="bar"><span style="width:{s}%"></span></div></div>' for n, d, s in pillars)
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    plan = {"instagram": {"Tue": "8 AM", "Thu": "6 PM", "Sat": "10 AM", "Sun": "7 PM"}, "facebook": {"Wed": "12 PM", "Sat": "9 AM"}}
    week = '<span></span>' + "".join(f'<span class="wk-day">{d}</span>' for d in days)
    for platform, label, alt in [("instagram", "Instagram", ""), ("facebook", "Facebook", " alt")]:
        week += f'<span class="plat">{icon(platform)}<span>{label}</span></span>'
        week += "".join(f'<span class="wk-slot on{alt}">{plan[platform][d]}</span>' if d in plan[platform] else '<span class="wk-slot">&ndash;</span>' for d in days)
    audiences = [("Ingredient checkers", "25&ndash;40, read every label. Most posts speak to them."),
                 ("Shop owners", "Natural-goods stores. One post a week shows what stockists get."),
                 ("Gift buyers", "Tested around holidays with the trial sets.")]
    aud_html = "".join(f'<div class="aud"><p style="font-weight:600">{n}</p><p class="type-label" style="margin-top:0.25rem">{d}</p></div>' for n, d in audiences)
    return f"""
{header("Strategy", "What the agent will post, how often and why.")}
{banner}
<div class="why">
  <div><p class="type-label">Why this plan</p><p style="margin-top:0.25rem"><b>Trust holds sales back:</b> people who try it love it, but few have heard of it. So posts show the ingredients and the hands behind them.</p></div>
  <button class="btn sm btn-ghost pressable">See the research{icon("arrow-right")}</button>
</div>
<div class="strat-grid">
  <section class="panel">{card_head("What you&rsquo;ll post about", "4 themes, and each one&rsquo;s share of the month.")}{pillar_html}</section>
  <section class="panel">{card_head("When it goes out", "6 posts a week, at the times your customers are most active.")}<div class="plan-week">{week}</div>
    <p class="type-label" style="margin-top:1rem">Times come from when similar brands get the most saves. They adjust once your own results come in.</p></section>
</div>
<section class="panel" style="margin-bottom:1.25rem">{card_head("Who it talks to", "From your research.")}<div class="g3" style="display:grid;gap:1rem">{aud_html}</div></section>
<section class="panel" style="margin-bottom:1.25rem">{card_head("What the agent has learned", "What worked and what didn&rsquo;t, from your own results. Each finding changes the next version of this plan.")}
  <div class="learn-empty"><span class="icon-wrap">{icon("sparkles")}</span><div><p style="font-weight:600">Nothing learned yet</p><p class="type-label" style="margin-top:0.25rem">Your first posts need about a week of results. First findings around 10 October; the agent then updates this plan and tells you what changed.</p></div></div>
  <div class="learn-sample" aria-label="What findings will look like">
    <p class="type-label">What findings will look like</p>
    <div class="learn-row"><span class="impact up">&uarr;</span><span>Ingredient close-ups get 3 times more saves than product shots</span><span class="sample-tag">Example</span></div>
    <div class="learn-row"><span class="impact down">&darr;</span><span>Posts after 8 PM reach half as many people</span><span class="sample-tag">Example</span></div>
  </div>
</section>
{tabbar("strategy")}"""


def draft_banner():
    return f"""<section class="draft-banner" aria-live="polite">
  {countdown_ring(24)}
  <div><h2 class="type-heading">Your first month is ready to check</h2><p class="type-label" style="margin-top:0.25rem">It starts on its own in 24 minutes if you change nothing. Starting only lets the agent draft posts; each one still waits for your approval.</p></div>
  <div class="actions"><button class="btn btn-outline pressable">Ask for changes</button><button class="btn btn-default pressable">{icon("check")}Start now</button></div>
</section>"""


def strategy_draft():
    """S20 a: the drafted strategy with its 30-minute window; it starts on its own unless the owner changes it."""
    return as_meow(page("Strategy: draft", strategy_body(draft_banner()), "strategy"))


def strategy_changes():
    """S20 b: the owner asks the strategist for changes; it redrafts, and the 30 minutes start again."""
    chips = "".join(f'<span class="chip-reply{" on" if c == "More behind the scenes" else ""}">{c}</span>' for c in ["Fewer posts a week", "More behind the scenes", "No Facebook", "Different days"])
    overlay = f"""<div class="sheet-scrim"></div><div class="ask-sheet" role="dialog" aria-label="Ask for changes">
  <h2 class="type-heading">What should change?</h2>
  <p class="type-label" style="margin-top:0.25rem">Tap one or say it in your own words.</p>
  <div class="chips" style="margin-top:1rem">{chips}</div>
  <textarea aria-label="Your changes">Weekends are our busiest days in the shop, so no posts on Saturday.</textarea>
  <p class="type-label" style="margin-top:0.75rem;display:flex;gap:0.375rem;align-items:center">{icon("clock")}The strategist redrafts it in about a minute. Then you get a fresh 30 minutes.</p>
  <div class="sheet-actions" style="display:flex;gap:0.5rem;justify-content:flex-end;margin-top:1.25rem"><button class="btn btn-outline pressable">Cancel</button><button class="btn btn-default pressable">{icon("send")}Send to strategist</button></div>
</div>"""
    return as_meow(page("Strategy: ask for changes", strategy_body(draft_banner()), "strategy", overlay=overlay))


def strategy_started():
    """S20 c: 30 minutes passed with no changes, so it started on its own; the owner can still change it."""
    banner = f"""<section class="draft-banner active" aria-live="polite">
  <span class="done-mark">{icon("check")}</span>
  <div><h2 class="type-heading">Your strategy started at 4:12 PM</h2><p class="type-label" style="margin-top:0.25rem">It started on its own after 30 minutes. The agent is drafting your first 6 posts now; you approve each one before it goes out.</p></div>
  <div class="actions"><button class="btn btn-outline pressable">Ask for changes</button><button class="btn btn-default pressable">See the drafts{icon("arrow-right")}</button></div>
</section>"""
    return as_meow(page("Strategy: started", strategy_body(banner), "strategy"))


SOURCES = [
    ("globe", "Your website", "meowmeowtweet.com/about", "About page and 11 product pages"),
    ("chat", "Reviews", "trustpilot.com/review/meowmeowtweet.com", "212 reviews, 4.8 stars"),
    ("chat", "Reviews", "amazon.com, Meow Meow Tweet store", "Ingredient and skin comments"),
    ("users", "Your answers", "Questionnaire, 26 September", "8 answers and 1 follow-up"),
    ("search", "Search", "natural deodorant for sensitive skin", "What people ask before buying"),
    ("globe", "Similar brand", "nativecos.com", "Posts, offers and prices"),
]


def research_sources():
    rows = "".join(
        f'<div class="source-row"><span class="icon-wrap">{icon(i)}</span><div style="min-width:0"><p style="font-weight:500">{kind}</p><p class="source-url">{url}</p></div><span class="type-label source-note">{note}</span></div>'
        for i, kind, url, note in SOURCES
    )
    return f"""<section class="panel" style="margin-top:1.25rem">{card_head("Sources", "Everything the agent read. Open any one to check it.", "14", "Sources")}{rows}
  <button class="btn btn-ghost pressable" style="margin-top:0.5rem">Show all 14{icon("chevron-down")}</button></section>"""


def research_page(banner, dimmed=False):
    back = f'<a class="back-link" href="#">{icon("arrow-left")}Strategy</a>'
    actions = f'<span class="version-pill">{icon("clock")}Version 1, 26 September</span>'
    if not dimmed:
        actions += f'<button class="btn btn-outline pressable">{icon("refresh")}Run research again</button>'
    body = f"""
{back}
{header("Research", "What the agent learned about your market before planning. Your strategy is built on it.", actions)}
{banner}
<div class="research-view{" dimmed" if dimmed else ""}">
{research_findings()}
{research_sources()}
</div>
{tabbar("strategy")}"""
    return body


def research_view():
    """S21 a: the research inside the workspace, reached from "See the research" on the strategy page."""
    return as_meow(page("Research", research_page(""), "strategy"))


def research_again():
    """S21 b: research is running again; the current version stays readable until the new one replaces it."""
    banner = f"""<section class="draft-banner" aria-live="polite">
  <span class="spinner" style="width:2.5rem;height:2.5rem;border-width:4px"></span>
  <div><h2 class="type-heading">Researching again: finding what holds sales back</h2><p class="type-label" style="margin-top:0.25rem">Step 2 of 4, about 3 minutes left. Below is version 1 until version 2 is ready. Your strategy keeps running; the strategist uses the new research at its next update.</p>
  <div class="overall" style="margin:0.75rem 0 0;background:#fff"><span style="width:40%"></span></div></div>
</section>"""
    return as_meow(page("Research: running again", research_page(banner, dimmed=True), "strategy"))


# ---------- Content ----------

CONTENT_POSTS = [
    ("At the wheel, take 1", "At the wheel", "instagram", "reel", "30 seconds", "Scheduled", "Tue 29 Sep, 9:00 AM", "Tomorrow", "blue"),
    ("New from the kiln, take 2", "New from the kiln", "instagram", "carousel", "5 slides", "Needs approval", "Thu 1 Oct, 1:00 PM", "In 3 days", "yellow"),
    ("On the table, take 3", "On the table", "facebook", "image", "", "Needs approval", "Sat 3 Oct, 5:00 PM", "In 5 days", "ink"),
    ("Studio notes, take 4", "Studio notes", "instagram", "reel", "45 seconds", "Needs approval", "Mon 5 Oct, 9:00 AM", "In a week", "yellow"),
    ("At the wheel, take 5", "At the wheel", "instagram", "carousel", "4 slides", "Needs approval", "Wed 7 Oct, 1:00 PM", "In 9 days", "blue"),
    ("New from the kiln, take 6", "New from the kiln", "instagram", "story", "15 seconds", "Needs approval", "Fri 9 Oct, 5:00 PM", "In 11 days", "yellow"),
]


def content_row(title, pillar, platform, fmt, detail, status, when, relative, variant):
    """One post: what it is, where it goes, where it stands, when it goes out, and the next action."""
    fmt_icon, fmt_name = FORMATS[fmt]
    where = f"{PLATFORMS[platform]} {fmt_name.lower()}"
    action = (f'<button class="btn sm btn-default pressable">Review</button>' if status == "Needs approval"
              else f'<span class="go">{icon("chevron-right")}</span>')
    return (f'<tr><td class="c-post"><span class="who" style="gap:0.875rem"><span class="chip-thumb">{thumb(variant)}<span class="fmt">{icon(fmt_icon)}</span></span>'
            f'<span style="min-width:0"><span style="display:block;font-weight:500">{title}</span><span class="type-label">Theme: {pillar}</span></span></span></td>'
            f'<td class="c-where"><span class="where">{icon(platform)}<span><b>{where}</b>{f"<span class=muted>, {detail}</span>" if detail else ""}</span></span></td>'
            f'<td class="c-status">{STATUS_BADGE[status]}</td>'
            f'<td class="c-when"><span style="display:block">{when}</span><span class="type-label">{relative}</span></td>'
            f'<td class="c-action">{action}</td></tr>')


def content_table_v3(rows, active_filter="All"):
    counts = {"All": 6, "Needs approval": 5, "Scheduled": 1, "Published": 0, "Drafts": 0}
    seg = "".join(f'<button class="{"on" if k == active_filter else ""}">{k} <span class="muted" style="margin-left:0.25rem">{v}</span></button>' for k, v in counts.items())
    body = "".join(content_row(*row) for row in rows)
    return f"""<div class="toolbar content-toolbar"><div class="seg">{seg}</div><div class="toolbar-end"><button class="filter-btn pressable">{icon("layers")}All platforms{icon("chevron-down")}</button><span class="search">{icon("search")}Search posts</span></div></div>
<section class="panel content-panel"><table class="table content-table"><thead><tr><th>Post</th><th>Where it goes</th><th>Status</th><th>Goes out</th><th></th></tr></thead><tbody>{body}</tbody></table></section>
<p class="type-label" style="margin-top:1rem">Soonest first. Reach and saves appear on each post a day after it&rsquo;s published.</p>"""


def content_header():
    return header("Content", "Every post the agent drafted, from first draft to published.", f'<button class="btn btn-default pressable">{icon("sparkles")}Draft 6 more posts</button>')


def content():
    """S06 v3: every post with where it goes and what it is; needs-approval rows carry a Review button."""
    return page("Content", content_header() + content_table_v3(CONTENT_POSTS) + tabbar("content"), "content")


def content_needs_approval_v3():
    """S07 v3: Content filtered to posts that need approval, with one button to review them one by one."""
    waiting = [p for p in CONTENT_POSTS if p[5] == "Needs approval"]
    banner = f'<section class="next-step" style="padding:1rem 1.25rem"><p><b style="font-weight:600">5 posts need your decision.</b> <span class="muted">Going through them one by one is quickest: approve, and the next one opens.</span></p><button class="btn sm btn-default pressable">Review one by one{icon("arrow-right")}</button></section>'
    return page("Content: needs approval", content_header() + banner + content_table_v3(waiting, "Needs approval") + tabbar("content"), "content")


def review_panel():
    """S08 v3: one post under review. It says where it goes and what it is, shows the real post, and moves on to the next after a decision."""
    slides = "".join(f'<span class="slide-thumb{" on" if i == 0 else ""}">{thumb(v)}</span>' for i, v in enumerate(["yellow", "blue", "ink", "yellow", "blue"]))
    return f"""<div class="scrim"></div>
<aside class="sheet review-sheet" role="dialog" aria-label="Review post">
  <div class="sheet-head">
    <div><p class="type-heading">Review post</p><p class="type-label" style="margin-top:0.25rem">1 of 5 waiting for you</p></div>
    <div style="display:flex;gap:0.375rem"><button class="icon-close" aria-label="Previous post">{icon("chevron-left")}</button><button class="icon-close" aria-label="Next post">{icon("chevron-right")}</button><button class="icon-close" aria-label="Close">{icon("x")}</button></div>
  </div>
  <div class="sheet-body review-body">
    <div class="post-facts" aria-label="Where it goes and what it is">
      <span class="fact strong">{icon("instagram")}Instagram</span>
      <span class="fact strong">{icon("layers")}Carousel, 5 slides</span>
      <a class="fact" href="#when">{icon("calendar")}Thu 1 Oct, 1:00 PM</a>
      <span class="fact bare">{STATUS_BADGE["Needs approval"]}</span>
    </div>
    <div class="preview">
      <div class="preview-frame">{art("New from the kiln, take 2", "yellow", "carousel", font_size="1.5rem")}
        <button class="slide-nav prev" aria-label="Previous slide">{icon("chevron-left")}</button><button class="slide-nav next" aria-label="Next slide">{icon("chevron-right")}</button>
        <span class="slide-count">1 / 5</span></div>
      <div class="slide-strip" aria-label="Slides">{slides}</div>
    </div>
    <div class="note">{icon("sparkles")}<span>Why this post: it fills the &ldquo;New from the kiln&rdquo; theme (30% of the month) and Thursday&rsquo;s best time.</span></div>
    <div class="field"><label style="display:flex;justify-content:space-between">Caption <span class="type-label">119 / 2,200</span></label><div class="input area">Batch drops, restocks and what sold out. Fresh from Friday&rsquo;s firing; the speckled mugs go first. Swipe for all five.</div></div>
    <div class="field"><label>Hashtags</label><div class="input"><span class="badge badge-neutral">#pottery</span><span class="badge badge-neutral">#smallbatch</span><span class="muted" style="font-size:0.8125rem">Add a hashtag</span></div></div>
    <div class="when-block" id="when">
      <p class="when-title">When it goes out</p>
      <div class="form-grid"><div class="field"><label>Date</label><div class="input">{icon("calendar")}Thu 1 Oct</div></div><div class="field"><label>Time</label><div class="input">{icon("clock")}1:00 PM</div></div></div>
      <div class="pills best-times"><span class="type-label">Best times on Thursday:</span><span class="pill on">1:00 PM</span><span class="pill">6:00 PM</span><span class="pill">9:00 AM</span></div>
      <p class="type-label">Pick any day and time. The best times are when your customers are most active; changing it only moves this post.</p>
    </div>
    <div class="warn-note">{icon("alert")}<span>Instagram isn&rsquo;t connected. If you approve, the post waits and goes out as soon as you connect.</span></div>
  </div>
  <div class="sheet-foot review-foot">
    <button class="btn btn-ghost pressable reject">Reject</button>
    <button class="btn btn-outline pressable">{icon("pencil")}Ask for changes</button>
    <button class="btn btn-default pressable approve">{icon("check")}Approve, next post</button>
  </div>
</aside>"""


def content_post_panel_v3():
    return page("Content: review post", content_header() + content_table_v3(CONTENT_POSTS) + tabbar("content"), "content", overlay=review_panel())


# ---------- Approvals ----------





QUEUE = [
    ("New from the kiln, take 2", "yellow", "instagram", "carousel", "5 slides", "Thu 1 Oct, 1:00 PM", "Batch drops, restocks and what sold out. Fresh from Friday&rsquo;s firing; the speckled mugs go first."),
    ("On the table, take 3", "ink", "facebook", "image", "", "Sat 3 Oct, 5:00 PM", "Your mugs on real breakfast tables. Send us yours and we&rsquo;ll share our favourites."),
    ("Studio notes, take 4", "blue", "instagram", "reel", "45 seconds", "Mon 5 Oct, 9:00 AM", "Two people, one kiln, and every mistake we made this month."),
]


def post_facts(platform, fmt, detail, when):
    """Where the post goes, what it is and when: the first thing on every card and panel."""
    fmt_icon, fmt_name = FORMATS[fmt]
    kind = f"{fmt_name}, {detail}" if detail else fmt_name
    return (f'<div class="post-facts"><span class="fact strong">{icon(platform)}{PLATFORMS[platform]}</span>'
            f'<span class="fact strong">{icon(fmt_icon)}{kind}</span><span class="fact">{icon("calendar")}{when}</span></div>')


def swipe_card(post, depth, pose=""):
    title, variant, platform, fmt, detail, when, caption = post
    stamp = ""
    if pose == "approve":
        stamp = f'<span class="stamp approve">{icon("check")}Approve</span>'
    elif pose == "reject":
        stamp = f'<span class="stamp reject">{icon("x")}Reject</span>'
    return (f'<article class="swipe-card depth-{depth} {pose}" aria-label="{title}">{stamp}'
            f'{post_facts(platform, fmt, detail, when)}'
            f'<div class="swipe-art">{art(title, variant, fmt if fmt != "image" else "image", font_size="1.9rem")}</div>'
            f'<p class="swipe-caption">{caption}</p></article>')


def review_details(post):
    """The full post beside the stack on wide screens: read it, change the time, or open the editor."""
    title, variant, platform, fmt, detail, when, caption = post
    fmt_icon, fmt_name = FORMATS[fmt]
    kind = f"{fmt_name}, {detail}" if detail else fmt_name
    return f"""<section class="panel review-details">
  {card_head(title, "Theme: New from the kiln")}
  <div class="post-facts"><span class="fact strong">{icon(platform)}{PLATFORMS[platform]}</span><span class="fact strong">{icon(fmt_icon)}{kind}</span></div>
  <div class="goes-out">
    <p class="type-label">Goes out</p>
    <p class="goes-out-when">Thursday 1 October, 1:00 PM</p>
    <p class="type-label">In 3 days</p>
    <div class="time-change"><span class="type-label">Change the time:</span><span class="pill on">1:00 PM</span><span class="pill">6:00 PM</span><span class="pill">9:00 AM</span><button class="pill pressable">{icon("clock")}Other time</button></div>
  </div>
  <div class="read-block"><p class="type-label">Caption</p><p class="caption-text">{caption}</p></div>
  <div class="read-block"><p class="type-label">Hashtags</p><div class="pills"><span class="badge badge-neutral">#pottery</span><span class="badge badge-neutral">#smallbatch</span><span class="badge badge-neutral">#handmade</span><span class="badge badge-neutral">#ceramics</span></div></div>
  <div class="note" style="margin-top:1rem">{icon("sparkles")}<span>Why this post: it fills the &ldquo;New from the kiln&rdquo; theme (30% of the month) and Thursday&rsquo;s best time.</span></div>
  <div class="warn-note" style="margin-top:0.75rem">{icon("alert")}<span>Instagram isn&rsquo;t connected. If you approve, the post waits and goes out as soon as you connect.</span></div>
  <div class="details-actions"><button class="btn btn-outline pressable">{icon("pencil")}Edit post</button><button class="btn btn-ghost pressable">{icon("image")}See all slides full size</button></div>
</section>"""


def approvals_v3(pose="", toast="", queue=QUEUE, left=5):
    cards = "".join(swipe_card(p, i, pose if i == 0 else "") for i, p in reversed(list(enumerate(queue))))
    progress = f'<p class="type-label" aria-live="polite">{left} left of 5</p>'
    stack = f"""<div class="stack-col">
  <div class="stack-top">{progress}<button class="btn sm btn-ghost pressable read-full">{icon("layers")}Read the full post</button></div>
  <div class="stack">{cards}</div>
  <div class="swipe-hint"><span>{icon("arrow-left")}Swipe left to reject</span><span>Swipe right to approve{icon("arrow-right")}</span></div>
  <div class="decide-row"><button class="btn lg btn-outline pressable reject-btn">{icon("x")}Reject</button><button class="btn lg btn-outline pressable">{icon("pencil")}Ask for changes</button><button class="btn lg btn-success pressable">{icon("check")}Approve</button></div>
  <div class="hint keys"><span class="kbd">&larr;</span> reject <span class="kbd">&rarr;</span> approve <span class="kbd">E</span> ask for changes <span class="kbd">Space</span> full post</div>
</div>"""
    body = f"""
{header("Approvals", "Swipe right to approve, left to reject. Nothing is published without you.")}
<div class="approvals-grid">{stack}{review_details(queue[0])}</div>
{toast}
{tabbar("approvals")}"""
    return page("Approvals", body, "approvals")


def approvals_idle():
    """S09 a: the stack of posts waiting, the top one ready to swipe."""
    return approvals_v3()


def approvals_swipe_right():
    """S09 b: dragging the top card right; the Approve stamp shows what letting go will do."""
    return approvals_v3("approve")


def approvals_swipe_left():
    """S09 c: dragging the top card left; the Reject stamp shows what letting go will do."""
    return approvals_v3("reject")


def approvals_undo():
    """S09 d: right after a reject. Undo is always offered; a reason is optional and teaches the agent."""
    toast = f"""<div class="toast" role="status">
  <div style="display:flex;align-items:center;gap:0.75rem;justify-content:space-between"><p><b>Rejected.</b> <span class="muted">Tell the agent why?</span></p><button class="btn sm btn-outline pressable">Undo</button></div>
  <div class="chips" style="margin:0.625rem 0 0"><span class="chip-reply">Off brand</span><span class="chip-reply">Wrong picture</span><span class="chip-reply">Wrong time</span><span class="chip-reply other">{icon("pencil")}Something else</span></div>
</div>"""
    return approvals_v3(toast=toast, queue=QUEUE[1:], left=4)




# ---------- Calendar ----------



# ---------- Analytics ----------



# ---------- Settings ----------

def settings_tabs(active):
    return f'<div class="toolbar">{segmented(["Brand kit", "Social accounts", "Preferences"], active)}</div>'


def settings_header():
    return header("Settings", "What the agent knows about this brand, and where it may publish.")






def settings_preferences_body():
    return f"""
{settings_header()}{settings_tabs("Preferences")}
<div style="display:grid;gap:1.25rem;max-width:48rem">
  <section class="panel">{card_head("Publishing", "When and how posts go out.")}
    <div class="field" style="margin-bottom:0.5rem"><label>Timezone</label><div class="input">{icon("globe")}Asia/Kolkata (GMT+5:30){icon("chevron-down", "i chev")}</div><p class="help">Best times and the calendar use this timezone.</p></div>
    <div class="toggle-row"><div><p style="font-weight:500">{icon("lock")} Ask me before every post</p><p class="type-label" style="margin-top:0.25rem">Always on. Nothing is published without a person approving it.</p></div><span class="switch locked on"><span></span></span></div>
    <div class="toggle-row"><div><p style="font-weight:500">Suggest best times when I edit a post</p><p class="type-label" style="margin-top:0.25rem">Shows the three strongest times under the time picker.</p></div><span class="switch on"><span></span></span></div>
  </section>
  <section class="panel">{card_head("Notifications", "What we email you about.")}
    <div class="toggle-row"><div><p style="font-weight:500">{icon("bell")} New posts to approve</p><p class="type-label" style="margin-top:0.25rem">One email a day at most, with everything waiting.</p></div><span class="switch on"><span></span></span></div>
    <div class="toggle-row"><div><p style="font-weight:500">Weekly results</p><p class="type-label" style="margin-top:0.25rem">Monday morning: what worked and what the agent changed.</p></div><span class="switch on"><span></span></span></div>
  </section>
  <section class="panel" style="box-shadow:0 0 0 1px rgba(207,63,87,0.3)">
    {card_head("Delete Tartinebakery", "Removes the brand kit, strategy and every post. Scheduled posts won't publish. This can't be undone.")}
    <button class="btn btn-outline pressable" style="color:var(--destructive);border-color:rgba(207,63,87,0.4)">{icon("trash")}Delete Tartinebakery</button>
  </section>
</div>"""






SCREENS = {
}


def main():
    OUT.mkdir(exist_ok=True)
    for name, build in SCREENS.items():
        (OUT / f"{name}.html").write_text(build(), encoding="utf-8")
    print(f"wrote {len(SCREENS)} screens to {OUT}")


if __name__ == "__main__":
    main()
