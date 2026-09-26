"""S13-S16 v3: Settings for one brand (/c/:brandId/settings).

Run from design/web-v2: python s13_settings.py
Built from build.py's helpers so Settings reads as the same kit as the onboarding check (S17a) and connect (S17b/c).
Data follows packages/shared: brandKitSchema, businessInfoSchema, brandPreferencesSchema, socialAccountDetailSchema.
"""

from pathlib import Path

import build
from build import MEOW, as_meow, card_head, found_on, icon, kit_card, meow_art, page, tabbar

HERE = Path(__file__).parent
NAME = "Meow Meow Tweet"

build.obs.ICONS.update({
    "archive": '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4"/>',
    "mail": '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 6L2 7"/>',
    "languages": '<path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>',
    "undo": '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    "link": '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
})

CSS = """
.settings { max-width: 64rem; }
.set-tabs { display: flex; gap: 0.25rem; width: fit-content; max-width: 100%; padding: 0.25rem; border-radius: 999px; background: var(--secondary); overflow-x: auto; scrollbar-width: none; margin-bottom: 1.5rem; }
.set-tabs::-webkit-scrollbar { display: none; }
.set-tabs a { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 999px; font-size: 0.875rem; font-weight: 500; color: var(--muted-foreground); white-space: nowrap; }
.set-tabs a .i { width: 1rem; height: 1rem; }
.set-tabs a.on { background: var(--card); color: var(--foreground); box-shadow: var(--elevation-raised); }
.set-tabs .flag { width: 0.5rem; height: 0.5rem; border-radius: 999px; background: var(--warning); }
.settings .review { margin: 0; max-width: none; }
.kit-meta { display: grid; gap: 0.375rem; padding: 1rem; border-radius: 1rem; background: #f7f8fa; font-size: 0.8125rem; line-height: 1.45; }
.kit-meta p { display: flex; gap: 0.5rem; align-items: flex-start; }
.kit-meta .i { width: 0.9rem; height: 0.9rem; flex: none; margin-top: 0.15rem; color: var(--muted-foreground); }
.platform .state { display: block; font-size: 0.75rem; margin-top: 0.125rem; }
.platform .state.ok { color: var(--success); }
.platform .state.warn { color: var(--warning); }
.platform .state a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
.edit-swatch { display: grid; grid-template-columns: 2.75rem minmax(0, 1fr) 7.5rem 2.25rem; gap: 0.625rem; align-items: center; }
.edit-swatch + .edit-swatch { margin-top: 0.625rem; }
.edit-swatch .remove { display: grid; place-items: center; width: 2.25rem; height: 2.25rem; border-radius: 999px; color: var(--muted-foreground); }
.edit-swatch .first { font-size: 0.72rem; color: var(--tint-foreground); }
.input.focus { border-color: var(--brand); box-shadow: 0 0 0 3px var(--tint-strong); }
.card-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.25rem; }
.stack-col-narrow { display: grid; gap: 1rem; max-width: 48rem; }
.group-label { font-size: 0.875rem; font-weight: 600; margin: 0.75rem 0 -0.25rem; }
.waiting { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 1rem; align-items: center; padding: 1rem 1.25rem; border-radius: 1.25rem; background: rgba(183, 116, 10, 0.1); }
.waiting .icon-wrap { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 999px; background: rgba(183, 116, 10, 0.16); color: var(--warning); }
.waiting b { font-weight: 600; }
.waiting p + p { margin-top: 0.125rem; font-size: 0.8125rem; color: #6f4a0a; }
.acct { display: grid; grid-template-columns: 3rem minmax(0, 1fr) auto; gap: 0.5rem 1rem; align-items: start; padding: 1.25rem 1.375rem; }
.acct .logo-badge { display: grid; place-items: center; width: 3rem; height: 3rem; border-radius: 1rem; color: #fff; }
.acct.off .logo-badge { background: var(--secondary) !important; color: var(--muted-foreground); }
.acct .name { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; font-weight: 600; }
.acct .handle { font-size: 0.875rem; color: var(--muted-foreground); margin-top: 0.125rem; }
.acct .facts { display: grid; gap: 0.3rem; margin-top: 0.75rem; font-size: 0.8125rem; color: var(--muted-foreground); }
.acct .facts p { display: flex; gap: 0.5rem; align-items: flex-start; }
.acct .facts .i { width: 0.875rem; height: 0.875rem; flex: none; margin-top: 0.15rem; }
.acct .facts .warn { color: var(--warning); }
.acct .act { grid-column: 3; grid-row: 1; align-self: center; display: flex; gap: 0.5rem; }
.acct .inline-error { grid-column: 2 / -1; display: flex; gap: 0.625rem; padding: 0.75rem 0.875rem; border-radius: 0.875rem; background: rgba(207, 63, 87, 0.08); color: #a3263b; font-size: 0.8125rem; line-height: 1.45; }
.acct .inline-error .i { flex: none; margin-top: 0.1rem; }
.acct.attention { box-shadow: 0 0 0 2px var(--warning), var(--elevation-raised); }
.acct.error { box-shadow: 0 0 0 2px var(--destructive), var(--elevation-raised); }
.pref-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem 1.5rem; padding: 1rem 0; border-top: 1px solid var(--border); }
.pref-row:first-of-type { border-top: 0; padding-top: 0; }
.pref-row > div:first-child { flex: 1 1 18rem; min-width: 0; }
.pref-row.inline { flex-wrap: nowrap; align-items: flex-start; }
.pref-row.inline > div:first-child { flex: 1 1 auto; }
.pref-row .title { display: flex; align-items: center; gap: 0.5rem; font-weight: 500; }
.pref-row .title .i { width: 1rem; height: 1rem; color: var(--muted-foreground); }
.pref-row .type-label { margin-top: 0.25rem; }
.fixed-tag { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.25rem 0.625rem; border-radius: 999px; background: var(--secondary); font-size: 0.75rem; font-weight: 500; color: var(--muted-foreground); white-space: nowrap; }
.fixed-tag .i { width: 0.75rem; height: 0.75rem; }
.select { display: flex; align-items: center; gap: 0.5rem; min-height: 2.75rem; min-width: 16rem; padding: 0 0.875rem; border-radius: 0.75rem; border: 1px solid var(--input); background: var(--card); font-size: 0.9375rem; }
.select .chev { margin-left: auto; width: 1rem; height: 1rem; color: var(--muted-foreground); }
.select .i:first-child { width: 1rem; height: 1rem; color: var(--muted-foreground); }
.end-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem 1.5rem; padding: 1rem 0; border-top: 1px solid var(--border); }
.end-row:first-of-type { border-top: 0; padding-top: 0; }
.end-row > div { flex: 1 1 20rem; min-width: 0; }
.end-row p:first-child { font-weight: 500; }
.btn-danger-outline { background: var(--card); border: 1px solid rgba(207, 63, 87, 0.4); color: var(--destructive); }
.archived-banner { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 1rem; align-items: center; padding: 1rem 1.25rem; border-radius: 1.25rem; background: var(--secondary); margin-bottom: 1.25rem; }
.archived-banner .icon-wrap { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 999px; background: var(--card); color: var(--muted-foreground); }
.toast-row { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; font-size: 0.875rem; }
.toast-row .i { color: var(--success); }
.toast-row .btn .i { color: inherit; }

/* S16: delete confirmation. A centred dialog on desktop and tablet, a bottom sheet on phone. */
.dlg { position: fixed; z-index: 60; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(32rem, calc(100vw - 2rem)); max-height: calc(100dvh - 2rem); display: flex; flex-direction: column; border-radius: 1.75rem; background: var(--card); box-shadow: var(--elevation-floating); overflow: hidden; }
.dlg-body { overflow-y: auto; padding: 1.75rem 1.75rem 1.25rem; }
.dlg-foot { display: flex; gap: 0.5rem; justify-content: flex-end; padding: 1rem 1.75rem 1.5rem; border-top: 1px solid var(--border); }
.dlg .danger-mark { display: grid; place-items: center; width: 3rem; height: 3rem; border-radius: 999px; background: rgba(207, 63, 87, 0.12); color: var(--destructive); margin-bottom: 1rem; }
.gone-list { display: grid; gap: 0.5rem; margin-top: 0.75rem; font-size: 0.875rem; line-height: 1.45; }
.gone-list p { display: flex; gap: 0.625rem; align-items: flex-start; }
.gone-list .i { flex: none; width: 1rem; height: 1rem; margin-top: 0.15rem; color: var(--destructive); }
.stays { margin-top: 0.875rem; font-size: 0.8125rem; color: var(--muted-foreground); line-height: 1.45; }
.alt-box { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0.25rem 0.75rem; margin-top: 1.25rem; padding: 1rem; border-radius: 1rem; background: var(--secondary); }
.alt-box .i { color: var(--muted-foreground); margin-top: 0.1rem; }
.alt-box p { font-size: 0.8125rem; line-height: 1.45; color: var(--foreground); }
.alt-box .btn { grid-column: 2; justify-self: start; margin-top: 0.5rem; }
.confirm-field { margin-top: 1.25rem; }
.confirm-field .match { display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; color: var(--success); }
.confirm-field .match .i { width: 0.875rem; height: 0.875rem; }
.btn[disabled] { opacity: 0.45; box-shadow: none; }

@media (max-width: 1023px) {
  .toast { bottom: 6.25rem; }
}
@media (max-width: 900px) {
  .settings .review { padding-bottom: 0; }
  .settings .sticky-side { grid-template-columns: 7.5rem minmax(0, 1fr); }
  .settings .sticky-side .headline { font-size: 0.8rem !important; }
}
@media (max-width: 560px) {
  .page-header p { display: none; }
  .set-tabs { width: 100%; margin-bottom: 1.25rem; }
  .set-tabs a { flex: 1 0 auto; justify-content: center; padding: 0.5rem 0.625rem; font-size: 0.8125rem; }
  .set-tabs a .i { display: none; }
  .kit-meta.desktop-only { display: none; }
  .settings .sticky-side { grid-template-columns: 5.5rem minmax(0, 1fr); gap: 0.875rem; }
  .settings .sticky-side .art { max-width: 5.5rem; }
  .settings .sticky-side .headline { font-size: 0.55rem !important; }
  .kit-meta { padding: 0.75rem; }
  .edit-swatch { grid-template-columns: 2.5rem minmax(0, 1fr) 2.25rem; }
  .edit-swatch .hex { grid-column: 2; grid-row: 2; }
  .edit-swatch .swatch { grid-row: span 2; }
  .edit-swatch .remove { grid-column: 3; grid-row: 1; }
  .card-actions .btn { flex: 1; }
  .waiting { grid-template-columns: auto minmax(0, 1fr); }
  .waiting .btn { grid-column: 1 / -1; }
  .acct { grid-template-columns: 2.75rem minmax(0, 1fr); padding: 1.125rem; }
  .acct .logo-badge { width: 2.75rem; height: 2.75rem; border-radius: 0.875rem; }
  .acct .act { grid-column: 1 / -1; grid-row: auto; }
  .acct .act .btn { flex: 1; }
  .acct .inline-error { grid-column: 1 / -1; }
  .select { min-width: 0; width: 100%; }
  .pref-row .seg { width: 100%; }
  .pref-row .seg button { flex: 1; }
  .end-row .btn { width: 100%; }
  .archived-banner { grid-template-columns: auto minmax(0, 1fr); }
  .archived-banner .btn { grid-column: 1 / -1; }
  .dlg { top: auto; bottom: 0; left: 0; transform: none; width: 100%; max-height: 94dvh; border-radius: 1.5rem 1.5rem 0 0; }
  .dlg-body { padding: 1.5rem 1.25rem 1rem; }
  .dlg-foot { padding: 0.875rem 1.25rem 1.25rem; flex-direction: column-reverse; }
  .dlg-foot .btn { width: 100%; }
  .alt-box { grid-template-columns: minmax(0, 1fr); }
  .alt-box > .i { display: none; }
  .alt-box .btn { grid-column: 1; width: 100%; }
}
"""

TABS = [("Brand kit", "palette"), ("Social accounts", "link"), ("Preferences", "settings")]


def settings_tabs(active, accounts_flag=True):
    links = ""
    for label, name in TABS:
        on = ' class="on" aria-current="page"' if label == active else ""
        flag = '<span class="flag" aria-label="Needs attention"></span>' if label == "Social accounts" and accounts_flag else ""
        links += f'<a href="#"{on}>{icon(name)}{label}{flag}</a>'
    return f'<nav class="set-tabs" aria-label="Settings sections">{links}</nav>'


def settings_page(title, tab, content, overlay="", accounts_flag=True, banner=""):
    header = build.header("Settings", f"The brand kit, social accounts and preferences for {NAME}.")
    body = f'<style>{CSS}</style><div class="settings">{header}{banner}{settings_tabs(tab, accounts_flag)}{content}</div>{tabbar("more")}'
    return as_meow(page(f"Settings: {title}", body, "settings", overlay=overlay))


# ---------- S13: brand kit ----------

SWATCHES = [("Coral", MEOW["coral"]), ("Cream", MEOW["cream"]), ("Ink", MEOW["ink"]), ("Leaf", MEOW["leaf"])]

PLATFORM_ROWS = [
    ("Instagram", "instagram", True, '<span class="state ok">Connected as @meowmeowtweet</span>'),
    ("Facebook", "facebook", True, '<span class="state warn">Access expired. <a href="#">Reconnect</a></span>'),
    ("TikTok", "tiktok", False, '<span class="state">Not in your plan</span>'),
    ("LinkedIn", "linkedin", False, '<span class="state">Not in your plan</span>'),
]


def swatch_list():
    return "".join(
        f'<span style="display:inline-flex;align-items:center;gap:0.375rem;margin:0 0.75rem 0.375rem 0"><span class="swatch" style="width:1.5rem;height:1.5rem;border-radius:0.5rem;background:{c}"></span><span class="type-label" style="color:var(--foreground)">{n}</span></span>'
        for n, c in SWATCHES
    )


def business_card():
    return kit_card("The business", [
        ("Name", f'<span style="font-weight:500">{NAME}</span>'),
        ("Type of business", "Natural body care shop"),
        ("What you do", "<span>Handmade natural deodorant and body care, sold online and in 40 shops across the US.</span>" + found_on("your About page")),
        ("Tagline", "<span>Plastic-free body care, made by hand in Brooklyn</span>"),
        ("Website", "meowmeowtweet.com"),
    ])


def contact_card():
    note = '<p class="type-label" style="margin-top:0.25rem">Posts use these exactly as written here. The agent never makes them up.</p>'
    return kit_card("Contact details", [
        ("Email", "hello@meowmeowtweet.com" + found_on("your Contact page")),
        ("Address", "Brooklyn, New York, US" + found_on("your Contact page")),
        ("Phone", '<span class="muted">Not on your site</span>'),
        ("Opening hours", '<span class="muted">Not on your site. Add them if customers can visit you.</span>'),
    ], extra=note)


def audience_card():
    return kit_card("Who it&rsquo;s for", [
        ("Your customers", "People 25&ndash;40 who shop for natural, plastic-free products and care about ingredients" + found_on("your product pages")),
    ])


def voice_card():
    tone = "".join(f'<span class="pill on">{t}</span>' for t in ["Playful", "Warm", "Witty"])
    return kit_card("How you sound", [
        ("Tone", f'<div class="pills">{tone}</div>'),
        ("Sounds like", "&ldquo;Our lavender stick just came back. It smells like a nap in a field, minus the bees.&rdquo;"),
    ])


def look_card():
    return kit_card("How you look", [
        ("Colours", f'<div style="display:flex;flex-wrap:wrap">{swatch_list()}</div>' + found_on("your homepage")),
        ("Typefaces", '<span><b style="font-weight:500">Fraunces</b> for headings, <b style="font-weight:500">Karla</b> for text</span>'),
        ("Feel", "Bright, hand-drawn, lots of cream space"),
    ])


def look_card_editing():
    rows = ""
    for i, (n, c) in enumerate(SWATCHES):
        first = '<span class="first">Workspace accent</span>' if i == 0 else ""
        focus = " focus" if n == "Leaf" else ""
        colour = "#7fb02e" if n == "Leaf" else c
        hex_value = colour.upper()
        rows += (
            f'<div class="edit-swatch"><span class="swatch" style="background:{colour}"></span>'
            f'<div class="field"><div class="input">{n}{first}</div></div>'
            f'<div class="field hex"><div class="input{focus}">{hex_value}</div></div>'
            f'<button class="remove pressable" aria-label="Remove {n}">{icon("x")}</button></div>'
        )
    return f"""<section class="panel kit-card editing"><div class="kit-card-head"><h2 class="type-heading">How you look</h2><span class="badge badge-tint">Editing</span></div>
  <p class="type-label" style="margin-bottom:0.875rem">Posts are drawn in these colours. The first one also colours this workspace.</p>
  {rows}
  <button class="btn sm btn-outline pressable" style="margin-top:0.875rem">{icon("plus")}Add a colour</button>
  <div class="form-grid" style="margin-top:1.25rem"><div class="field"><label>Heading typeface</label><div class="input">Fraunces</div></div><div class="field"><label>Text typeface</label><div class="input">Karla</div></div></div>
  <div class="field" style="margin-top:1rem"><label>Feel</label><div class="input">Bright, hand-drawn, lots of cream space</div><p class="help">A few words on the look. The agent follows them when it designs posts.</p></div>
  <div class="card-actions"><button class="btn btn-ghost pressable">Cancel</button><button class="btn btn-default pressable">Save changes</button></div>
</section>"""


def where_card():
    tiles = "".join(
        f'<div class="platform{" on" if on else ""}">{icon(i)}<div style="min-width:0"><p style="font-weight:500">{n}</p>{state}</div><span class="box">{icon("check") if on else ""}</span></div>'
        for n, i, on, state in PLATFORM_ROWS
    )
    return f"""<section class="panel kit-card"><div class="kit-card-head"><div><h2 class="type-heading">Where to post</h2><p class="type-label" style="margin-top:0.25rem">The strategy plans posts for the ticked ones. Connections live in Social accounts.</p></div></div><div class="platform-grid">{tiles}</div></section>"""


def kit_side(preview_title="Back in stock: the lavender stick"):
    return f"""<aside class="sticky-side">
  {meow_art(preview_title)}
  <div style="display:grid;gap:0.75rem">
    <div><p style="font-weight:500">A post in your brand</p><p class="type-label" style="margin-top:0.25rem">Changes as you edit.</p></div>
    <div class="kit-meta desktop-only">
      <p>{icon("globe")}<span>Read from meowmeowtweet.com on 22 Sep. You last edited it on 24 Sep.</span></p>
      <p>{icon("pencil")}<span>Edits apply to posts written from now on. Posts already drafted keep their wording.</span></p>
    </div>
  </div>
</aside>"""


def brand_kit(editing=False):
    look = look_card_editing() if editing else look_card()
    cards = business_card() + contact_card() + audience_card() + voice_card() + look + where_card()
    content = f'<div class="review"><div>{cards}</div>{kit_side()}</div>'
    title = "brand kit, editing colours" if editing else "brand kit"
    return settings_page(title, "Brand kit", content)


# ---------- S14: social accounts ----------

BADGE_COLOUR = {"instagram": "#d6336c", "facebook": "#1877f2", "linkedin": "#0a66c2", "tiktok": "#000000"}


def acct(platform, name, status_badge, handle, facts, action, cls="", error=""):
    facts_html = "".join(f'<p class="{c}">{icon(i)}<span>{t}</span></p>' for i, t, c in facts)
    handle_html = f'<p class="handle">{handle}</p>' if handle else ""
    return f"""<section class="panel acct {cls}"><span class="logo-badge" style="background:{BADGE_COLOUR[platform]}">{icon(platform)}</span>
  <div style="min-width:0"><p class="name">{name}{status_badge}</p>{handle_html}<div class="facts">{facts_html}</div></div>
  {error}<div class="act">{action}</div>
</section>"""


def instagram_connected():
    return acct("instagram", "Instagram", f'<span class="badge badge-success">{icon("check")}Connected</span>', "@meowmeowtweet", [
        ("calendar", "Connected by you on 22 Sep", ""),
        ("refresh", "Last checked 2 hours ago", ""),
        ("lock", "Access lasts until 21 Nov. Cadence renews it on its own.", ""),
    ], '<button class="btn sm btn-ghost pressable">Disconnect</button>')


def facebook_expired():
    return acct("facebook", "Facebook", f'<span class="badge badge-warning">{icon("alert")}Access expired</span>', "Meow Meow Tweet Page", [
        ("alert", "Facebook ended access on 24 Sep, usually after a password change.", "warn"),
        ("clock", "3 approved posts are waiting for it.", "warn"),
        ("refresh", "Reconnect with the same Facebook login and pick this Page again.", ""),
    ], '<button class="btn btn-default pressable">Reconnect Facebook</button>', cls="attention")


def not_planned(platform, name):
    return acct(platform, name, "", "", [
        ("x", "Not in your posting plan. Tick it in Brand kit, then connect it here.", ""),
    ], '<button class="btn sm btn-outline pressable">Add to plan</button>', cls="off")


def promise_panel():
    return f"""<div class="panel" style="background:var(--tint);box-shadow:none">
  <p style="font-weight:600">What Cadence does with a connection</p>
  <div class="promise-list">
    <p>{icon("check")}Publishes the posts you approve, at the times you approve.</p>
    <p>{icon("check")}Reads likes, saves and reach so the plan gets better.</p>
    <p style="color:var(--muted-foreground)">{icon("x")}Never messages your followers or changes your profile.</p>
  </div>
</div>"""


def waiting_banner(title, detail, button):
    return f'<div class="waiting"><span class="icon-wrap">{icon("clock")}</span><div><p><b>{title}</b></p><p>{detail}</p></div>{button}</div>'


def accounts_mixed():
    content = f"""<div class="stack-col-narrow">
  {waiting_banner("3 approved posts are waiting for Facebook", "They go out once you reconnect Facebook below. Instagram posts are publishing as planned.", "")}
  <p class="group-label">In your posting plan</p>
  {instagram_connected()}{facebook_expired()}
  <p class="group-label">Not in your plan</p>
  {not_planned("tiktok", "TikTok")}{not_planned("linkedin", "LinkedIn")}
  {promise_panel()}
</div>"""
    return settings_page("social accounts", "Social accounts", content)


def accounts_none():
    ig = acct("instagram", "Instagram", '<span class="badge badge-neutral">Not connected</span>', "", [
        ("clock", "3 approved posts are waiting for it.", "warn"),
        ("alert", "Needs an Instagram business or creator account.", ""),
    ], '<button class="btn btn-default pressable">Connect Instagram</button>', cls="attention")
    fb = acct("facebook", "Facebook", '<span class="badge badge-neutral">Not connected</span>', "", [
        ("clock", "2 approved posts are waiting for it.", "warn"),
        ("alert", "Posts to a Facebook Page you manage.", ""),
    ], '<button class="btn btn-default pressable">Connect Facebook</button>', cls="attention")
    content = f"""<div class="stack-col-narrow">
  {waiting_banner("5 approved posts are waiting for a connection", "You skipped connecting during setup, which is fine. Connect Instagram and Facebook and they go out.", "")}
  <p class="group-label">In your posting plan</p>
  {ig}{fb}
  <p class="group-label">Not in your plan</p>
  {not_planned("tiktok", "TikTok")}{not_planned("linkedin", "LinkedIn")}
  {promise_panel()}
</div>"""
    return settings_page("social accounts, none connected", "Social accounts", content)


def accounts_error():
    error = f'<div class="inline-error">{icon("alert")}<span><b style="font-weight:600">Instagram didn&rsquo;t give permission to publish.</b> On the Instagram screen, leave every permission ticked, then try again.</span></div>'
    ig = acct("instagram", "Instagram", '<span class="badge badge-danger">Couldn&rsquo;t connect</span>', "", [
        ("clock", "3 approved posts are waiting for it.", "warn"),
    ], '<button class="btn btn-default pressable">Try again</button>', cls="error", error=error)
    content = f"""<div class="stack-col-narrow">
  {waiting_banner("3 approved posts are waiting for Instagram", "They go out once Instagram is connected.", "")}
  <p class="group-label">In your posting plan</p>
  {ig}{facebook_expired()}
  <p class="group-label">Not in your plan</p>
  {not_planned("tiktok", "TikTok")}{not_planned("linkedin", "LinkedIn")}
</div>"""
    return settings_page("social accounts, connect failed", "Social accounts", content)


# ---------- S15: preferences ----------

def lang_seg(active):
    return build.segmented(["English", "Hindi", "Hinglish"], active)


def preferences_content(timezone="America/New York (GMT-4)", timezone_focus=False, archived=False):
    focus = ' style="border-color:var(--brand);box-shadow:0 0 0 3px var(--tint-strong)"' if timezone_focus else ""
    archive_row = f'''<div class="end-row"><div><p>Archive {NAME}</p><p class="type-label" style="margin-top:0.25rem">Nothing new is written and nothing publishes. Everything is kept, and you can restore it any time.</p></div><button class="btn btn-outline pressable">{icon("archive")}Archive</button></div>'''
    if archived:
        archive_row = f'''<div class="end-row"><div><p>Archived on 26 Sep</p><p class="type-label" style="margin-top:0.25rem">Restore it from the banner at the top to start writing and publishing again.</p></div></div>'''
    return f"""<div class="stack-col-narrow">
  <section class="panel">{card_head("Publishing", "When posts go out.")}
    <div class="pref-row"><div><p class="title">Timezone</p><p class="type-label">Best times, the calendar and every publish time use this.</p></div><div class="select"{focus}>{icon("globe")}{timezone}{icon("chevron-down", "i chev")}</div></div>
  </section>
  <section class="panel">{card_head("Language", "Set during the questionnaire. Change it any time.")}
    <div class="pref-row"><div><p class="title">Posts are written in</p><p class="type-label">Applies to posts written from now on.</p></div>{lang_seg("English")}</div>
    <div class="pref-row"><div><p class="title">Your account manager chats in</p><p class="type-label">The language of questions and messages from the agent.</p></div>{lang_seg("Hinglish")}</div>
  </section>
  <section class="panel">{card_head("Approvals and emails", "How the agent checks with you.")}
    <div class="pref-row inline"><div><p class="title">{icon("lock")}A person approves every post</p><p class="type-label">Nothing is published without your yes. This can&rsquo;t be turned off.</p></div><span class="fixed-tag">{icon("lock")}Always on</span></div>
    <div class="pref-row inline"><div><p class="title">{icon("clock")}New strategies start after 30 minutes</p><p class="type-label">You get 30 minutes to read a new strategy or ask for changes. After that it starts on its own, and its posts still wait for your approval.</p></div><span class="fixed-tag">{icon("lock")}Always on</span></div>
    <div class="pref-row inline"><div><p class="title">{icon("mail")}Email me when posts need approval</p><p class="type-label">One email per batch, not one per post. Sent to owner@meowmeowtweet.com.</p></div><span class="switch on" role="switch" aria-checked="true"><span></span></span></div>
  </section>
  <section class="panel" style="box-shadow:0 0 0 1px rgba(207,63,87,0.25)">{card_head("Stop or remove this brand", "Archive to pause. Delete only if you never want it back.")}
    {archive_row}
    <div class="end-row"><div><p>Delete {NAME}</p><p class="type-label" style="margin-top:0.25rem">Removes the brand kit, strategy, every post and the results. This can&rsquo;t be undone.</p></div><button class="btn btn-danger-outline pressable">{icon("trash")}Delete</button></div>
  </section>
</div>"""


def toast(text, undo=False):
    action = f'<button class="btn sm btn-ghost pressable">{icon("undo")}Undo</button>' if undo else ""
    return f'<div class="toast" role="status"><div class="toast-row"><span style="display:flex;gap:0.5rem;align-items:center">{icon("check")}{text}</span>{action}</div></div>'


def preferences():
    return settings_page("preferences", "Preferences", preferences_content())


def preferences_saved():
    overlay = toast("Timezone saved: Europe/London")
    return settings_page("preferences, saved", "Preferences", preferences_content("Europe/London (GMT+1)", True), overlay=overlay)


# ---------- S16: delete or archive ----------

def delete_dialog(typed, ready):
    match = f'<p class="match">{icon("check")}Name matches</p>' if ready else ""
    focus = "border-color:var(--destructive);box-shadow:0 0 0 3px rgba(207,63,87,0.15)" if ready else "border-color:#5f6879;box-shadow:0 0 0 3px rgba(95,104,121,0.16)"
    disabled = "" if ready else " disabled"
    gone = "".join(f'<p>{icon("x")}<span>{t}</span></p>' for t in [
        "The brand kit and contact details",
        "The strategy and the research behind it",
        "14 posts, including 3 approved and 2 scheduled that won&rsquo;t go out",
        "Results and what the agent learned",
        "The connections to Instagram and Facebook",
    ])
    return f"""<div class="scrim"></div>
<div class="dlg" role="alertdialog" aria-modal="true" aria-labelledby="dlg-title">
  <div class="dlg-body">
    <div class="danger-mark">{icon("trash")}</div>
    <h2 class="type-heading" id="dlg-title">Delete {NAME}?</h2>
    <p class="type-label" style="margin-top:0.375rem;color:var(--foreground)">This can&rsquo;t be undone. It deletes:</p>
    <div class="gone-list">{gone}</div>
    <p class="stays">Posts already published stay on Instagram and Facebook. Delete them there if you want them gone.</p>
    <div class="alt-box">{icon("archive")}<p><b style="font-weight:600">Only want to stop for now?</b> Archive keeps everything and stops publishing. You can restore it any time.</p><button class="btn sm btn-outline pressable">Archive instead</button></div>
    <div class="field confirm-field"><label for="confirm">Type <b>{NAME}</b> to confirm</label><div class="input" id="confirm" style="{focus}">{typed}</div>{match}</div>
  </div>
  <div class="dlg-foot"><button class="btn btn-outline pressable">Keep the brand</button><button class="btn btn-danger pressable"{disabled}>Delete for good</button></div>
</div>"""


def delete_typing():
    return settings_page("delete brand", "Preferences", preferences_content(), overlay=delete_dialog("Meow Meow", False))


def delete_ready():
    return settings_page("delete brand, name typed", "Preferences", preferences_content(), overlay=delete_dialog(NAME, True))


def archived():
    banner = f"""<div class="archived-banner"><span class="icon-wrap">{icon("archive")}</span><div><p style="font-weight:600">{NAME} is archived</p><p class="type-label" style="margin-top:0.125rem">Nothing is being written or published. Your brand kit, strategy and posts are kept as they were.</p></div><button class="btn btn-default pressable">Restore</button></div>"""
    return settings_page("archived", "Preferences", preferences_content(archived=True), overlay=toast(f"{NAME} archived", undo=True), banner=banner)


SCREENS = {
    "screens-s13/s13-v3-brand-kit.html": brand_kit,
    "screens-s13/s13-v3-brand-kit-editing.html": lambda: brand_kit(editing=True),
    "screens-s14/s14-v3-accounts.html": accounts_mixed,
    "screens-s14/s14-v3-accounts-none-connected.html": accounts_none,
    "screens-s14/s14-v3-accounts-connect-failed.html": accounts_error,
    "screens-s15/s15-v3-preferences.html": preferences,
    "screens-s15/s15-v3-preferences-saved.html": preferences_saved,
    "screens-s16/s16-v3-delete-typing.html": delete_typing,
    "screens-s16/s16-v3-delete-ready.html": delete_ready,
    "screens-s16/s16-v3-archived.html": archived,
}


def main():
    for rel, make in SCREENS.items():
        path = HERE / rel
        path.parent.mkdir(exist_ok=True)
        path.write_text(make(), encoding="utf-8")
    print(f"wrote {len(SCREENS)} screens")


if __name__ == "__main__":
    main()
