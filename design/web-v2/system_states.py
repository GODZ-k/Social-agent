"""System states v1: errors, not found, loading skeletons and empty states for apps/web.

Run from design/web-v2: python system_states.py
Writes screens-states/st-v1-<screen>.html. Built from the same page shell, tokens and helpers as the approved
screens (S03 Overview, S06 Content, S09 Approvals, S11 Calendar), so every state sits in the real layout.
"""

from datetime import date
from pathlib import Path

import build
import s11_calendar as cal
from build import icon, page, header, tabbar, card_head

OUT = Path(__file__).parent / "screens-states"

# One Next.js error digest, shown as the support reference.
REFERENCE = "2338746510"

CSS = """
/* The state mark: the Cadence bars, with the middle bar telling the story (missing, fallen, done). */
.st-mark { display: grid; place-items: center; width: 5.5rem; height: 5.5rem; margin: 0 auto 1.5rem; border-radius: 1.75rem; background: var(--tint); }
.st-mark svg { width: 3.5rem; height: 3.5rem; }
.st-mark.error { background: #fbeef0; }
.st-mark.done { background: rgba(23, 138, 94, 0.1); }

.st-wrap { max-width: 34rem; margin: clamp(1.5rem, 6vh, 4.5rem) auto 3rem; text-align: center; }
.st-wrap h1 { font-family: var(--font-display); font-weight: 600; font-size: clamp(1.625rem, 1.3rem + 1.2vw, 2.125rem); line-height: 1.12; letter-spacing: -0.025em; text-wrap: balance; }
.st-wrap .lede { margin: 0.875rem auto 0; max-width: 30rem; color: var(--muted-foreground); font-size: 1rem; line-height: 1.55; text-wrap: balance; }
.st-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.625rem; margin-top: 1.75rem; }
.st-actions .btn { height: 2.75rem; padding: 0 1.25rem; }
.st-ref { display: inline-flex; align-items: center; gap: 0.75rem; margin-top: 2rem; padding: 0.5rem 0.5rem 0.5rem 1rem; border-radius: 999px; background: var(--secondary); font-size: 0.8125rem; color: var(--muted-foreground); }
.st-ref b { color: var(--foreground); font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: 0.02em; }
.st-ref .btn { height: 1.875rem; padding: 0 0.75rem; font-size: 0.75rem; }
.st-ref .btn .i { width: 0.8rem; height: 0.8rem; }
.st-help { text-wrap: balance; margin-top: 1rem; font-size: 0.8125rem; color: var(--muted-foreground); }
.st-help a { color: var(--tint-foreground); font-weight: 500; }
.st-panel { padding: 2.5rem 2rem 2.25rem; }
main .st-panel.st-wrap { max-width: 40rem; }

/* Brand not found: the brands this account can open, so the way on is one tap. */
.st-brands { margin-top: 2rem; text-align: left; padding: 0.5rem; }
.st-brands .type-label { padding: 0.75rem 0.875rem 0.375rem; }
.st-brand { display: flex; align-items: center; gap: 0.875rem; min-height: 3.5rem; padding: 0.625rem 0.875rem; border-radius: 1rem; }
.st-brand:hover { background: var(--accent); }
.st-brand .mk { display: grid; place-items: center; width: 2.25rem; height: 2.25rem; border-radius: 999px; color: #fff; font-weight: 600; font-size: 0.875rem; flex: none; }
.st-brand .nm { display: grid; min-width: 0; }
.st-brand .nm b { font-weight: 500; }
.st-brand .nm span { font-size: 0.8125rem; color: var(--muted-foreground); }
.st-brand .go { margin-left: auto; color: var(--muted-foreground); }
.st-brand.add { color: var(--tint-foreground); font-weight: 500; }
.st-brand.add .mk { background: var(--tint); color: var(--tint-foreground); }
.st-signed { margin-top: 1.25rem; font-size: 0.8125rem; color: var(--muted-foreground); }
.st-signed a { color: var(--tint-foreground); font-weight: 500; }

/* Skeletons: one slow, calm pulse; no spinners. Reduced motion holds them still. */
.sk { display: block; background: #e8ecf2; border-radius: 0.5rem; animation: sk-pulse 1.8s ease-in-out infinite; }
.sk.pill { border-radius: 999px; }
.sk.round { border-radius: 999px; }
.sk.soft { background: #eef1f5; }
.tint-bg .sk { background: #d6e2f6; }
@keyframes sk-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
@media (prefers-reduced-motion: reduce) { .sk { animation: none; } }
.sk-lines { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0.5rem; }
.sk-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

/* Overview skeleton (S03). */
.sko-next { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; padding: 1.5rem; border-radius: 1.375rem; background: var(--tint); margin-bottom: 1.25rem; }
.sko-loop { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 0.75rem; margin-top: 1.25rem; }
.sko-loop div { display: grid; gap: 0.625rem; }
.sko-week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 0.75rem; }
.sko-day { display: grid; align-content: start; gap: 0.75rem; min-height: 13.5rem; padding: 0.75rem; border-radius: 1rem; background: #f5f7fa; }
.sko-day .top { display: flex; justify-content: space-between; }
.sko-chip { display: grid; gap: 0.5rem; padding: 0.375rem; border-radius: 0.75rem; background: var(--card); box-shadow: var(--elevation-raised); }
.sko-kit { display: grid; grid-template-columns: minmax(0, 1fr) 20rem; gap: 2rem; }
@media (max-width: 900px) {
  .sko-week { grid-template-columns: minmax(0, 1fr); gap: 0.5rem; }
  .sko-day { min-height: 0; grid-template-columns: 3rem minmax(0, 1fr); align-items: center; }
  .sko-day .top { display: grid; gap: 0.375rem; }
  .sko-day:nth-child(n+4) { display: none; }
  .sko-chip { grid-template-columns: 3rem minmax(0, 1fr); align-items: center; }
  .sko-chip .sk:first-child { aspect-ratio: 1 !important; }
  .sko-kit { grid-template-columns: minmax(0, 1fr); gap: 1.25rem; }
}
@media (max-width: 560px) { .sko-loop span.sk:last-child { display: none; } }

/* Content skeleton (S06): the table's columns, then cards below 900px. */
.skc-table { display: grid; }
.skc-head, .skc-row { display: grid; grid-template-columns: minmax(0, 2.3fr) minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 1.2fr) 5.5rem; gap: 1.25rem; align-items: center; }
.skc-head { padding: 1rem 0 0.75rem; border-bottom: 1px solid var(--border); font-size: 0.8125rem; color: var(--muted-foreground); }
.skc-row { padding: 0.9rem 0; border-bottom: 1px solid var(--border); }
.skc-row:last-child { border-bottom: 0; }
.skc-post { display: flex; align-items: center; gap: 0.875rem; min-width: 0; }
.skc-post .sk-lines { flex: 1; }
.skc-where { display: flex; align-items: center; gap: 0.5rem; }
.skc-action { justify-self: end; }
@media (max-width: 900px) {
  .skc-head { display: none; }
  .skc-row { grid-template-columns: minmax(0, 1fr) auto; gap: 0.5rem 0.75rem; padding: 0.875rem 0; }
  .skc-post { grid-column: 1; grid-row: 1; }
  .skc-action { grid-column: 2; grid-row: 1; }
  .skc-where, .skc-status, .skc-when { grid-column: 1 / -1; padding-left: 3.875rem; }
  .skc-when .sk-lines { grid-template-columns: 7.5rem 4.5rem; }
}

/* Approvals skeleton (S09). Nothing moves sideways while loading, so the shadows need no clip. */
.approvals-grid[aria-busy] { overflow: visible; }
.ska-stack { position: relative; height: 36rem; }
.ska-card { position: absolute; inset: 0 0 2rem; display: flex; flex-direction: column; gap: 0.75rem; padding: 0.875rem; border-radius: 1.75rem; background: var(--card); box-shadow: var(--elevation-floating); transform-origin: 50% 100%; }
.ska-card.d1 { transform: translateY(0.875rem) scale(0.95); opacity: 0.9; }
.ska-card.d2 { transform: translateY(1.75rem) scale(0.9); opacity: 0.75; }
.ska-card .art-sk { flex: 1; border-radius: 1.25rem; }
.ska-hint { display: flex; justify-content: space-between; }
.ska-decide { display: grid; grid-template-columns: 1fr 1.3fr 1fr; gap: 0.5rem; }
@media (max-width: 1023px) { .ska-stack { height: clamp(20rem, calc(100dvh - 27rem), 36rem); } }
@media (max-width: 560px) { .ska-stack { height: 30rem; } .ska-decide { grid-template-columns: 1fr 1fr; } .ska-decide .sk:nth-child(2) { grid-column: 1 / -1; grid-row: 2; } }

/* Empty states: dashed ghosts of what will appear, then one clear next step. */
.em-panel { padding: 2.25rem 2rem 2.5rem; }
.em-ghosts { display: grid; gap: 0.625rem; max-width: 34rem; margin: 0 auto 2rem; }
.em-ghost { display: grid; grid-template-columns: 3rem minmax(0, 1fr) 5rem; gap: 0.875rem; align-items: center; padding: 0.625rem; border-radius: 1rem; border: 1.5px dashed #c9d2e0; }
.em-ghost .sq { width: 3rem; height: 3rem; border-radius: 0.75rem; background: #f1f4f8; }
.em-ghost .ln { display: grid; gap: 0.4rem; }
.em-ghost .ln i { display: block; height: 0.5rem; border-radius: 999px; background: #eef1f5; }
.em-ghost .pl { height: 1.5rem; border-radius: 999px; background: #f1f4f8; }
.em-ghost:nth-child(2) { opacity: 0.7; }
.em-ghost:nth-child(3) { opacity: 0.45; }
/* While the agent drafts, the ghost rows breathe one after another: the only moving thing on the page. */
.em-ghosts.working .sq, .em-ghosts.working .ln i { animation: sk-pulse 1.8s ease-in-out infinite; }
.em-ghosts.working .em-ghost:nth-child(2) * { animation-delay: 0.3s; }
.em-ghosts.working .em-ghost:nth-child(3) * { animation-delay: 0.6s; }
@media (prefers-reduced-motion: reduce) { .em-ghosts.working * { animation: none; } }
.em-body { max-width: 32rem; margin: 0 auto; text-align: center; }
.em-body h2 { font-family: var(--font-display); font-weight: 600; font-size: 1.5rem; line-height: 1.2; letter-spacing: -0.02em; text-wrap: balance; }
.em-body .lede { margin: 0.625rem auto 0; max-width: 30rem; color: var(--muted-foreground); line-height: 1.55; text-wrap: balance; }
.em-body .st-actions { margin-top: 1.5rem; }
.em-status { display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 1rem; padding: 0.375rem 0.875rem; border-radius: 999px; background: var(--tint); color: var(--tint-foreground); font-size: 0.8125rem; font-weight: 500; }
.em-status .i { width: 0.9rem; height: 0.9rem; }
.em-count { font-variant-numeric: tabular-nums; }

/* What happens next, after the approval queue is empty. */
.next-list { display: grid; gap: 0.25rem; margin: 2rem auto 0; max-width: 32rem; text-align: left; }
.next-item { display: grid; grid-template-columns: 2.25rem minmax(0, 1fr); gap: 0.875rem; align-items: start; padding: 0.875rem 0.25rem; border-top: 1px solid var(--border); }
.next-item:first-child { border-top: 0; }
.next-item .ic { display: grid; place-items: center; width: 2.25rem; height: 2.25rem; border-radius: 999px; background: var(--tint); color: var(--tint-foreground); }
.next-item .ic.warn { background: rgba(183, 116, 10, 0.14); color: var(--warning); }
.next-item .ic.ok { background: rgba(23, 138, 94, 0.12); color: var(--success); }
.next-item p { line-height: 1.5; }
.next-item p b { font-weight: 600; }
.next-item .muted { font-size: 0.875rem; }
.next-item .btn { margin-top: 0.625rem; }
.next-title { margin: 2rem auto 0; max-width: 32rem; text-align: left; font-size: 0.8125rem; color: var(--muted-foreground); padding-left: 0.25rem; }
.next-title + .next-list { margin-top: 0.5rem; }

/* Empty calendar: a short note above the month, which still shows the free best times. */
.cal-empty-note { display: flex; align-items: center; justify-content: space-between; gap: 1rem 1.5rem; flex-wrap: wrap; margin: 0.25rem 0 1rem; padding: 1rem 1.25rem; border-radius: 1.125rem; background: var(--tint); }
.cal-empty-note h3 { font-family: var(--font-display); font-weight: 600; font-size: 1.0625rem; }
.cal-empty-note p { margin-top: 0.25rem; font-size: 0.875rem; color: var(--muted-foreground); max-width: 56ch; }
.cal-empty-note .toolbar-end { flex: none; }

@media (max-width: 560px) {
  .st-panel, .em-panel { padding: 1.75rem 1.125rem 1.75rem; }
  .st-actions { flex-direction: column-reverse; align-items: stretch; }
  .st-actions .btn { width: 100%; }
  .st-ref { margin-top: 1.5rem; }
  .em-ghost { grid-template-columns: 2.5rem minmax(0, 1fr) 3.5rem; }
  .em-ghost .sq { width: 2.5rem; height: 2.5rem; }
  .em-body h2 { font-size: 1.3125rem; }
  .cal-empty-note .toolbar-end, .cal-empty-note .btn { width: 100%; }
}
"""

STYLE = f"<style>{CSS}</style>"


def mark(kind):
    """The logo's three bars. Missing: the middle bar is a dashed outline. Error: it has fallen over. Done: a tick."""
    side = '<rect x="12" y="30" width="11" height="28" rx="5.5" fill="var(--brand)" opacity=".55"/><rect x="49" y="24" width="11" height="34" rx="5.5" fill="var(--brand)" opacity=".8"/>'
    if kind == "missing":
        middle = '<rect x="30.5" y="13.5" width="11" height="44" rx="5.5" fill="none" stroke="#9aa6b8" stroke-width="2" stroke-dasharray="4 4"/>'
        cls = "st-mark"
    elif kind == "error":
        side = side.replace("var(--brand)", "#b9c3d3")
        middle = ('<rect x="30.5" y="35" width="11" height="23" rx="5.5" fill="#cf3f57"/>'
                  '<rect x="30.5" y="12" width="11" height="17" rx="5.5" fill="#cf3f57" opacity=".75" transform="rotate(-22 36 20.5) translate(-3 0)"/>')
        cls = "st-mark error"
    else:
        side = side.replace("var(--brand)", "#178a5e")
        middle = ('<rect x="30.5" y="14" width="11" height="44" rx="5.5" fill="#178a5e"/><circle cx="56" cy="17" r="11" fill="#178a5e" stroke="#e8f3ee" stroke-width="3"/>'
                  '<path d="M51 17l3.5 3.5 6.5-7" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>')
        cls = "st-mark done"
    return f'<div class="{cls}" aria-hidden="true"><svg viewBox="0 0 72 72">{side}{middle}</svg></div>'


def sk(width="100%", height="0.875rem", extra="", style=""):
    return f'<span class="sk {extra}" style="width:{width};height:{height};{style}"></span>'


def lines(*widths, height="0.75rem"):
    return '<span class="sk-lines">' + "".join(sk(w, height) for w in widths) + "</span>"


def without_counts(html):
    """An empty queue has no badge on Approvals in the rail or the tab bar."""
    return html.replace('<span class="count">5</span>', "")


def reference():
    return (f'<div class="st-ref"><span>Reference <b>{REFERENCE}</b></span>'
            f'<button class="btn sm btn-outline pressable" aria-label="Copy reference {REFERENCE}">{icon("copy")}Copy</button></div>'
            '<p class="st-help">If it keeps happening, send this reference to <a href="#">support@thescaleagency.org</a>.</p>')


# ---------- Errors ----------

def error_app():
    """app/error.tsx: a fault outside a brand (home, onboarding). No rail; the header stays."""
    body = f"""{STYLE}
<section class="st-wrap" role="alert">
  {mark("error")}
  <h1>This page didn&rsquo;t load</h1>
  <p class="lede">Something went wrong on our side, not yours. Try again in a moment.</p>
  <div class="st-actions"><button class="btn btn-outline pressable">{icon("arrow-left")}Go back</button><button class="btn btn-default pressable">{icon("refresh")}Try again</button></div>
  {reference()}
</section>"""
    return page("Error", body, workspace=False)


def error_workspace():
    """app/c/[clientId]/error.tsx: one page in a brand failed. The rail and tab bar stay, so the rest still works."""
    body = f"""{STYLE}
<section class="panel st-panel st-wrap" role="alert">
  {mark("error")}
  <h1>Content didn&rsquo;t load</h1>
  <p class="lede">Something went wrong on our side, not yours. The rest of Tartinebakery still works from the menu. Try again in a moment.</p>
  <div class="st-actions"><button class="btn btn-outline pressable">{icon("arrow-left")}Go back</button><button class="btn btn-default pressable">{icon("refresh")}Try again</button></div>
  {reference()}
</section>
{tabbar("content")}"""
    return page("Content: error", body, "content")


def error_global():
    """app/global-error.tsx: the root layout itself failed. Own <html>, system font, no design system, inline styles only."""
    bars = ('<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="3" y="9" width="4.5" height="10" rx="2.25" fill="#4b3fe4" opacity=".55"/>'
            '<rect x="9.75" y="4" width="4.5" height="15" rx="2.25" fill="#4b3fe4"/><rect x="16.5" y="7" width="4.5" height="12" rx="2.25" fill="#4b3fe4" opacity=".8"/></svg>')
    return f"""<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Cadence didn't load</title>
<style>
  body {{ margin: 0; min-height: 100dvh; display: grid; place-items: center; background: #f2f5fa; color: #1c2433; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; -webkit-font-smoothing: antialiased; }}
  main {{ width: min(28rem, calc(100vw - 2rem)); padding: 2.5rem 2rem; box-sizing: border-box; border-radius: 1.5rem; background: #fff; box-shadow: 0 1px 2px rgba(28,36,51,.06), 0 8px 24px rgba(28,36,51,.06); text-align: center; }}
  .logo {{ display: inline-flex; align-items: center; gap: .5rem; font-weight: 600; font-size: 1.0625rem; }}
  h1 {{ margin: 1.75rem 0 0; font-size: 1.5rem; line-height: 1.2; letter-spacing: -.02em; }}
  p {{ margin: .75rem 0 0; color: #5b6576; line-height: 1.5; }}
  .actions {{ display: flex; gap: .625rem; justify-content: center; flex-wrap: wrap; margin-top: 1.75rem; }}
  button {{ font: inherit; height: 2.75rem; padding: 0 1.25rem; border-radius: 999px; border: 1px solid #dde3ec; background: #fff; color: inherit; font-weight: 500; cursor: pointer; }}
  button.primary {{ background: #4b3fe4; border-color: #4b3fe4; color: #fff; }}
  button:focus-visible {{ outline: 2px solid #4b3fe4; outline-offset: 2px; }}
  .ref {{ margin-top: 1.75rem; font-size: .8125rem; }}
  .ref b {{ color: #1c2433; font-variant-numeric: tabular-nums; }}
  @media (max-width: 480px) {{ .actions {{ flex-direction: column-reverse; }} button {{ width: 100%; }} main {{ padding: 2rem 1.25rem; }} }}
</style></head>
<body>
<main role="alert">
  <span class="logo">{bars}Cadence</span>
  <h1>Cadence didn&rsquo;t load</h1>
  <p>Something went wrong while opening the app. Reload to try again; your brands and posts are safe.</p>
  <div class="actions"><button type="button" onclick="history.back()">Go back</button><button type="button" class="primary">Try again</button></div>
  <p class="ref">Reference <b>{REFERENCE}</b>. If it keeps happening, send it to support@thescaleagency.org.</p>
</main>
</body>
</html>"""


# ---------- Not found ----------

def not_found_page():
    """app/not-found.tsx: an address that matches nothing."""
    body = f"""{STYLE}
<section class="st-wrap">
  {mark("missing")}
  <h1>We can&rsquo;t find that page</h1>
  <p class="lede">The link may be old or have a typo. Check the address, or go back to where you were.</p>
  <div class="st-actions"><button class="btn btn-outline pressable">{icon("arrow-left")}Go back</button><a class="btn btn-default pressable" href="#">{icon("house")}Go to your brands</a></div>
</section>"""
    return page("Page not found", body, workspace=False)


BRANDS = [("T", "#2f6fde", "Tartinebakery", "tartinebakery.com"), ("M", "#f25c54", "Meow Meow Tweet", "meowmeowtweet.com")]


def not_found_brand():
    """app/c/[clientId]/not-found.tsx: missing, archived and not yours all read the same, so nothing is revealed."""
    rows = "".join(f'<a class="st-brand" href="#"><span class="mk" style="background:{c}">{l}</span><span class="nm"><b>{n}</b><span>{w}</span></span>{icon("chevron-right", "i go")}</a>' for l, c, n, w in BRANDS)
    rows += f'<a class="st-brand add" href="#"><span class="mk">{icon("plus")}</span><span class="nm"><b>Add a brand</b></span></a>'
    body = f"""{STYLE}
<section class="st-wrap">
  {mark("missing")}
  <h1>This brand isn&rsquo;t available</h1>
  <p class="lede">It may have been removed, or this account can&rsquo;t open it. If someone sent you the link, ask them to check it.</p>
  <div class="panel st-brands"><p class="type-label">Your brands</p>{rows}</div>
  <p class="st-signed">Signed in as maya@tartinebakery.com. <a href="#">Use another account</a></p>
</section>"""
    return page("Brand not available", body, workspace=False)


# ---------- Loading ----------

def loading_overview():
    """app/c/[clientId]/loading.tsx: S03 block by block. Fixed headings show at once; only the data waits."""
    loop = "".join(f'<div>{sk("100%", "0.375rem", "pill")}<span class="sk" style="width:{w};height:0.75rem"></span></div>' for w in ["4rem", "4.5rem", "3.5rem", "4rem", "3.75rem", "3rem"])
    days = ""
    for i in range(7):
        chip = ""
        if i in (1, 3, 5):
            chip = f'<div class="sko-chip">{sk("100%", "auto", "soft", "aspect-ratio:3/2")}<span class="sk-lines" style="padding:0 0.25rem 0.25rem">{sk("70%", "0.625rem")}{sk("90%", "0.625rem")}</span></div>'
        elif i in (2, 4):
            chip = sk("100%", "2.75rem", "soft", "border-radius:0.75rem")
        days += f'<div class="sko-day"><div class="top">{sk("2rem", "0.75rem")}{sk("1.25rem", "0.75rem")}</div>{chip}</div>'
    stats = "".join(f'<div class="panel stat"><div class="type-label">{label}</div>{sk("2.5rem", "2rem", "", "margin-top:0.75rem")}{sk("7rem", "0.75rem", "", "margin-top:0.75rem")}</div>'
                    for label in ["Needs approval", "Scheduled", "Followers", "Engagement"])
    body = f"""{STYLE}
<div aria-busy="true" aria-label="Loading Tartinebakery">
<header class="page-header"><div>{sk("16rem", "2.375rem", "", "max-width:70vw")}{sk("13rem", "0.875rem", "", "margin-top:0.875rem")}</div><div class="toolbar-end">{sk("9.5rem", "2.125rem", "pill")}</div></header>
<section class="sko-next tint-bg"><div class="sk-lines" style="flex:1;min-width:14rem;gap:0.625rem">{sk("16rem", "1.25rem", "", "max-width:100%")}{sk("26rem", "0.875rem", "", "max-width:100%")}{sk("19rem", "0.75rem", "", "max-width:100%")}</div><div class="sk-row">{sk("10.5rem", "2.5rem", "pill")}{sk("9rem", "2.5rem", "pill")}</div></section>
<section class="panel" style="margin-bottom:1.25rem">{card_head("Where the agent is", sk("20rem", "0.75rem", "", "max-width:100%;margin-top:0.25rem"))}<div class="sko-loop">{loop}</div></section>
<section class="panel" style="margin-bottom:1.25rem"><div class="week-head"><div><h2 class="type-heading">This week</h2>{sk("10rem", "0.75rem", "", "margin-top:0.5rem")}</div>{sk("8.5rem", "2.125rem", "pill")}</div><div class="sk-row" style="margin-bottom:1rem">{sk("6rem", "0.75rem")}{sk("7rem", "0.75rem")}{sk("7rem", "0.75rem")}</div><div class="sko-week">{days}</div></section>
<div class="grid g4 stats">{stats}</div>
<section class="panel"><div class="sko-kit"><div>{card_head("Brand kit", "What every post starts from.")}<span class="sk-lines" style="margin-top:1.25rem">{sk("100%", "0.875rem")}{sk("80%", "0.875rem")}</span><div class="sk-row" style="margin-top:1.25rem">{sk("5rem", "1.5rem", "pill")}{sk("7rem", "1.5rem", "pill")}{sk("5.5rem", "1.5rem", "pill")}</div></div><div>{sk("100%", "4rem", "", "border-radius:1rem")}{sk("12rem", "0.75rem", "", "margin-top:0.75rem")}</div></div></section>
</div>
{tabbar("")}"""
    return page("Overview: loading", body, "")


def loading_content():
    """content/loading.tsx: S06's table (cards below 900px). The page's own words are static, so they show at once."""
    rows = ""
    for i in range(6):
        rows += (f'<div class="skc-row"><div class="skc-post">{sk("3rem", "3rem", "soft", "border-radius:0.75rem;flex:none")}{lines("75%", "45%")}</div>'
                 f'<div class="skc-where">{sk("1rem", "1rem", "round")}{sk("8.5rem", "0.75rem")}</div>'
                 f'<div class="skc-status">{sk("7.5rem", "1.5rem", "pill")}</div>'
                 f'<div class="skc-when">{lines("7.5rem", "4.5rem")}</div>'
                 f'<div class="skc-action">{sk("4.75rem", "2.125rem", "pill")}</div></div>')
    head = '<div class="skc-head"><span>Post</span><span>Where it goes</span><span>Status</span><span>Goes out</span><span></span></div>'
    body = f"""{STYLE}
{header("Content", "Every post the agent drafted, from first draft to published.", sk("11rem", "2.5rem", "pill"))}
<div aria-busy="true" aria-label="Loading posts">
<div class="toolbar content-toolbar">{sk("25rem", "2.5rem", "pill", "max-width:100%")}<div class="toolbar-end">{sk("9rem", "2.125rem", "pill")}{sk("11rem", "2.125rem", "pill", "flex:1;min-width:0")}</div></div>
<section class="panel content-panel"><div class="skc-table">{head}{rows}</div></section>
</div>
{tabbar("content")}"""
    return page("Content: loading", body, "content")


def loading_approvals():
    """approvals/loading.tsx: S09's card stack and details panel, with the decide buttons held back until a post is there."""
    front = (f'<div class="ska-card"><div class="sk-row">{sk("6rem", "1.75rem", "pill")}{sk("8.5rem", "1.75rem", "pill")}{sk("7.5rem", "1.75rem", "pill")}</div>'
             f'<span class="sk soft art-sk"></span>{lines("92%", "64%", height="0.8rem")}</div>')
    back = '<div class="ska-card d2"></div><div class="ska-card d1"></div>'
    stack = f"""<div class="stack-col">
  <div class="stack-top">{sk("4.5rem", "0.75rem")}</div>
  <div class="ska-stack">{back}{front}</div>
  <div class="ska-hint">{sk("7.5rem", "0.75rem")}{sk("8rem", "0.75rem")}</div>
  <div class="ska-decide">{sk("100%", "3rem", "pill")}{sk("100%", "3rem", "pill")}{sk("100%", "3rem", "pill")}</div>
</div>"""
    details = f"""<section class="panel review-details">
  {sk("16rem", "1.375rem", "", "max-width:100%")}{sk("9rem", "0.75rem", "", "margin-top:0.5rem")}
  <div class="sk-row" style="margin-top:1.25rem">{sk("7rem", "2rem", "pill")}{sk("9.5rem", "2rem", "pill")}</div>
  <div class="goes-out">{sk("4rem", "0.75rem")}{sk("15rem", "1.25rem", "", "max-width:100%;margin-top:0.375rem")}{sk("4rem", "0.75rem", "", "margin-top:0.375rem")}<div class="sk-row" style="margin-top:0.75rem">{sk("5rem", "2rem", "pill")}{sk("5rem", "2rem", "pill")}{sk("5rem", "2rem", "pill")}</div></div>
  <div class="read-block">{sk("4rem", "0.75rem")}{lines("100%", "85%", "40%", height="0.875rem")}</div>
  <div class="read-block">{sk("4.5rem", "0.75rem")}<div class="sk-row">{sk("5rem", "1.5rem", "pill")}{sk("6rem", "1.5rem", "pill")}{sk("5.5rem", "1.5rem", "pill")}</div></div>
  {sk("100%", "3.5rem", "soft", "margin-top:1.25rem;border-radius:1rem")}
</section>"""
    body = f"""{STYLE}
{header("Approvals", "Swipe right to approve, left to reject. Nothing is published without you.")}
<div class="approvals-grid" aria-busy="true" aria-label="Loading posts to approve">{stack}{details}</div>
{tabbar("approvals")}"""
    return page("Approvals: loading", body, "approvals")


# ---------- Empty states ----------

def approvals_done():
    """S09 empty, after going through the queue (empty-queue.tsx, done > 0): what just happened and what happens next."""
    body = f"""{STYLE}
{header("Approvals", "Swipe right to approve, left to reject. Nothing is published without you.")}
<section class="panel em-panel">
  <div class="em-body" role="status">
    {mark("done")}
    <h2>That&rsquo;s all of them</h2>
    <p class="lede">You went through 5 posts: 4 approved and 1 sent back for changes.</p>
  </div>
  <p class="next-title">What happens next</p>
  <div class="next-list">
    <div class="next-item"><span class="ic ok">{icon("calendar")}</span><div><p><b>4 posts are on the calendar.</b></p><p class="muted">The first goes out Thursday 1 October at 1:00 PM.</p></div></div>
    <div class="next-item"><span class="ic warn">{icon("alert")}</span><div><p><b>Instagram isn&rsquo;t connected yet.</b></p><p class="muted">Approved posts wait and go out as soon as you connect it.</p><button class="btn sm btn-outline pressable">{icon("instagram")}Connect Instagram</button></div></div>
    <div class="next-item"><span class="ic">{icon("pencil")}</span><div><p><b>1 post is back with the agent.</b></p><p class="muted">It comes back here once it&rsquo;s rewritten.</p></div></div>
    <div class="next-item"><span class="ic">{icon("sparkles")}</span><div><p><b>New drafts arrive about a week ahead.</b></p><p class="muted">They show up here before anything is scheduled.</p></div></div>
  </div>
  <div class="st-actions"><a class="btn btn-outline pressable" href="#">{icon("grid")}See all content</a><a class="btn btn-default pressable" href="#">{icon("calendar-days")}Open calendar</a></div>
</section>
{tabbar("approvals")}"""
    return without_counts(page("Approvals: all caught up", body, "approvals"))


def approvals_none():
    """S09 empty on a first visit (done = 0): nothing has been drafted for approval yet."""
    body = f"""{STYLE}
{header("Approvals", "Swipe right to approve, left to reject. Nothing is published without you.")}
<section class="panel em-panel">
  <div class="em-body" role="status">
    {mark("missing")}
    <h2>Nothing to approve</h2>
    <p class="lede">New drafts from the agent show up here before anything is scheduled. You decide on each one.</p>
    <div class="st-actions"><a class="btn btn-outline pressable" href="#">{icon("grid")}See all content</a><a class="btn btn-default pressable" href="#">{icon("calendar-days")}Open calendar</a></div>
  </div>
</section>
{tabbar("approvals")}"""
    return without_counts(page("Approvals: nothing to approve", body, "approvals"))


def ghosts(working=False):
    cls = "em-ghosts working" if working else "em-ghosts"
    row = '<div class="em-ghost"><span class="sq"></span><span class="ln"><i style="width:70%"></i><i style="width:40%"></i></span><span class="pl"></span></div>'
    return f'<div class="{cls}" aria-hidden="true">{row * 3}</div>'


def content_empty_strategy():
    """S06 empty: the strategy is drafted but not started, so the agent has nothing to draft from yet."""
    body = f"""{STYLE}
{header("Content", "Every post the agent drafted, from first draft to published.")}
<section class="panel em-panel">
  {ghosts()}
  <div class="em-body">
    <h2>No posts yet</h2>
    <p class="lede">The agent starts drafting once your strategy starts. It starts on its own in 18 minutes, or you can start it now.</p>
    <div class="st-actions"><a class="btn btn-default pressable" href="#">{icon("compass")}Review the strategy</a></div>
  </div>
</section>
{tabbar("content")}"""
    return without_counts(page("Content: no strategy yet", body, "content"))


def content_empty_drafting():
    """S06 empty: the strategy started and the agent is writing the first posts."""
    body = f"""{STYLE}
{header("Content", "Every post the agent drafted, from first draft to published.")}
<section class="panel em-panel">
  {ghosts(working=True)}
  <div class="em-body" role="status">
    <h2>The agent is drafting your first posts</h2>
    <p class="lede">It&rsquo;s writing 6 posts for the next two weeks, from your strategy&rsquo;s themes and best times. This takes a few minutes; you can leave this page.</p>
    <span class="em-status">{icon("sparkles")}Started 2 minutes ago</span>
    <p class="st-help">When they&rsquo;re ready they show up here and in Approvals. Nothing goes out without you.</p>
  </div>
</section>
{tabbar("content")}"""
    return without_counts(page("Content: drafting", body, "content"))


def calendar_empty():
    """S11 empty: no posts this month yet. The strategy's best times still show, so the month isn't blank."""
    # Next week's best times too: with no posts drafted yet, every best time is free.
    free = {**cal.FREE, date(2026, 10, 5): "9:00 AM", date(2026, 10, 7): "1:00 PM", date(2026, 10, 9): "5:00 PM"}
    nav = (f'<div class="month-nav"><h2 class="type-heading" aria-live="polite">October 2026</h2><div class="navgroup">'
           f'<button class="btn icon btn-outline" aria-label="Previous month">{icon("chevron-left")}</button>'
           f'<button class="btn sm btn-outline pressable">Today</button>'
           f'<button class="btn icon btn-outline" aria-label="Next month">{icon("chevron-right")}</button></div></div>')
    legend = '<div class="week-legend cal-legend"><span><i class="k-free"></i>Free best time</span></div>'
    note = (f'<div class="cal-empty-note"><div><h3>Nothing planned in October yet</h3>'
            f'<p>The dashed slots are your strategy&rsquo;s best times. The agent fills them with drafts about a week ahead, and each one waits for your approval.</p></div>'
            f'<div class="toolbar-end"><a class="btn sm btn-default pressable" href="#">{icon("grid")}Open content</a></div></div>')
    compact = f'<div class="cal-compact">{cal.mini_month([], free)}{cal.week_picker([], free)}{cal.agenda([], free)}</div>'
    body = (f"<style>{cal.CSS}</style>{STYLE}"
            + header("Calendar", "What goes out and when. Tap a post to read it, approve it or change its time.")
            + f'<section class="panel cal-panel"><div class="cal-bar">{nav}{legend}</div>{note}{cal.month_grid([], free)}{compact}</section>'
            + tabbar("more"))
    return without_counts(page("Calendar: nothing planned", body, "calendar"))


SCREENS = {
    "error-app": error_app,
    "error-workspace": error_workspace,
    "error-global": error_global,
    "404-page": not_found_page,
    "404-brand": not_found_brand,
    "loading-overview": loading_overview,
    "loading-content": loading_content,
    "loading-approvals": loading_approvals,
    "approvals-done": approvals_done,
    "approvals-none": approvals_none,
    "content-empty-strategy": content_empty_strategy,
    "content-empty-drafting": content_empty_drafting,
    "calendar-empty": calendar_empty,
}


def main():
    OUT.mkdir(exist_ok=True)
    for name, render in SCREENS.items():
        (OUT / f"st-v1-{name}.html").write_text(render(), encoding="utf-8")
    print(f"wrote {len(SCREENS)} screens to {OUT}")


if __name__ == "__main__":
    main()
