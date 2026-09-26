"""Header (top bar) v1: every state the app needs, as static mockups in screens-hdr/.

Run from design/web-v2: python header_design.py
Reuses build.py (tokens, icons, rail, tab bar); the header's own CSS is below and is embedded per page.
"""

from pathlib import Path

import build

HERE = Path(__file__).parent
OUT = HERE / "screens-hdr"
icon = build.icon

build.obs.ICONS.update({
    "log-out": '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    "user-cog": '<circle cx="10" cy="7" r="4"/><path d="M3 21v-1a6 6 0 0 1 9.3-5"/><circle cx="18" cy="18" r="2.5"/><path d="M18 14v1.5M18 20.5V22M21.5 18H20M16 18h-1.5"/>',
    "moon": '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
    "monitor": '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/>',
})

HDR_CSS = """
/* Header v1. Fixed colours or existing variables only. */
:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
.topbar { z-index: 45; }
.topbar.open { z-index: 70; }
.topbar-inner { gap: 0.625rem; }
.logo { border-radius: 999px; padding: 0.25rem 0.375rem 0.25rem 0.125rem; }

/* Brand switcher: colour mark, name, and for an admin whose brand it is. */
.bswitch { display: flex; align-items: center; gap: 0.625rem; min-width: 0; height: 2.625rem; padding: 0 0.625rem 0 0.3125rem; border-radius: 999px; text-align: left; }
.bswitch:hover, .bswitch[aria-expanded="true"] { background: var(--accent); }
.mark { display: grid; place-items: center; flex: none; width: 1.875rem; height: 1.875rem; border-radius: 999px; background: var(--mark, var(--brand)); color: var(--mark-ink, #fff); font-size: 0.75rem; font-weight: 600; }
.bswitch .names { display: grid; min-width: 0; line-height: 1.2; }
.bswitch .name { font-size: 0.875rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bswitch .owner { font-size: 0.72rem; color: var(--muted-foreground); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bswitch .chev { width: 0.875rem; height: 0.875rem; color: var(--muted-foreground); }

/* Admin inside a client's brand: the way back sits before the brand, like a path. */
.back { display: inline-flex; align-items: center; gap: 0.25rem; height: 2.125rem; padding: 0 0.75rem 0 0.5rem; border-radius: 999px; font-size: 0.8125rem; font-weight: 500; color: var(--muted-foreground); white-space: nowrap; }
.back:hover { background: var(--accent); color: var(--foreground); }
.back .i { width: 1rem; height: 1rem; }
.path-sep { color: #b3bac6; font-size: 1.125rem; line-height: 1; }
.context { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 600; white-space: nowrap; }

.topbar-end { gap: 0.5rem; }
.avatar-btn { display: grid; place-items: center; flex: none; width: 2.25rem; height: 2.25rem; border-radius: 999px; }
.avatar-btn .avatar { width: 2rem; height: 2rem; }
.avatar-btn[aria-expanded="true"] .avatar { box-shadow: 0 0 0 2px var(--card), 0 0 0 4px var(--brand); }
.admin-badge { border-color: var(--input); color: var(--foreground); }

/* Menus: material on wide screens, anchored under what opened them. */
.menu-layer { position: absolute; top: 4.75rem; left: 1.25rem; right: 1.25rem; max-width: 88rem; margin: 0 auto; height: 0; }
.menu { text-align: left; position: absolute; width: 20rem; padding: 0.375rem; border-radius: 1.375rem; display: grid; gap: 0.125rem; }
.menu.start { left: var(--menu-left, 9.25rem); transform-origin: top left; }
.menu.end { right: 0; transform-origin: top right; width: 19rem; }
.menu .handle, .menu .sheet-title { display: none; }
.menu-label { padding: 0.5rem 0.75rem 0.25rem; font-size: 0.75rem; font-weight: 500; color: var(--muted-foreground); }
.item { display: flex; align-items: center; gap: 0.75rem; width: 100%; min-height: 2.75rem; padding: 0.375rem 0.75rem; border-radius: 0.875rem; font-size: 0.875rem; text-align: left; }
.item:hover, .item.hi { background: var(--accent); }
.item.hi { outline: 2px solid var(--brand); outline-offset: -2px; }
.item .i { width: 1.125rem; height: 1.125rem; color: var(--muted-foreground); }
.item .mark { width: 1.75rem; height: 1.75rem; font-size: 0.72rem; }
.item .text { flex: 1; min-width: 0; display: grid; line-height: 1.25; }
.item .text b { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item .text span { font-size: 0.75rem; color: var(--muted-foreground); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item .tick { color: var(--tint-foreground); width: 1.125rem; height: 1.125rem; }
.item .count { flex: none; display: inline-flex; align-items: center; height: 1.375rem; padding: 0 0.5rem; white-space: nowrap; border-radius: 999px; background: rgba(183, 116, 10, 0.14); color: var(--warning); font-size: 0.6875rem; font-weight: 600; }
.item.current { background: var(--tint); }
.menu hr { border: 0; height: 1px; background: var(--border); margin: 0.25rem 0.5rem; }
.item.quiet { color: var(--foreground); }
.acct { display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0.75rem 0.75rem; }
.acct .avatar { width: 2.5rem; height: 2.5rem; font-size: 0.875rem; flex: none; }
.acct div { min-width: 0; display: grid; line-height: 1.3; }
.acct b { font-weight: 600; font-size: 0.9375rem; }
.acct div span { font-size: 0.8125rem; color: var(--muted-foreground); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.theme-row { padding: 0.375rem 0.75rem 0.625rem; }
.theme-row p { font-size: 0.8125rem; color: var(--muted-foreground); margin-bottom: 0.5rem; }
.theme-seg { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.125rem; padding: 0.1875rem; border-radius: 999px; background: var(--secondary); }
.theme-seg button { display: inline-flex; align-items: center; justify-content: center; gap: 0.3125rem; height: 2rem; border-radius: 999px; font-size: 0.8125rem; font-weight: 500; color: var(--muted-foreground); white-space: nowrap; }
.theme-seg button .i { width: 0.875rem; height: 0.875rem; }
.theme-seg button[aria-checked="true"] { background: var(--card); color: var(--foreground); box-shadow: var(--elevation-raised); }
.hscrim { display: none; }
.icon-close { flex: none; }

/* Page behind the header: quiet placeholders, so the eye stays on the bar. */
.ph-card { padding: 1.5rem; border-radius: 1.375rem; background: var(--card); box-shadow: var(--elevation-raised); margin-top: 1.25rem; display: grid; gap: 0.75rem; }
.ph-card .bone:nth-child(1) { width: 40%; height: 1rem; }
.ph-card .bone:nth-child(2) { width: 75%; }
.ph-card .bone:nth-child(3) { width: 60%; }
.ph-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.25rem; }
.ph-grid .ph-card { min-height: 9rem; }

/* Admin area on tablet and phone: its three places as a tab bar, like the workspace. */
.tabbar.admin { grid-template-columns: repeat(3, minmax(0, 1fr)); }

@media (max-width: 767px) {
  .admin-badge { display: none; }
  .ph-grid { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 560px) {
  .topbar { padding: 0.75rem 1rem 0; }
  .topbar-inner { gap: 0.375rem; padding: 0 0.375rem 0 0.75rem; }
  .bswitch { height: 2.5rem; gap: 0.5rem; padding-right: 0.5rem; }
  .bswitch .owner { display: none; }
  .back:not(.keep) { width: 2.25rem; padding: 0; justify-content: center; flex: none; }
  .back:not(.keep) .label { display: none; }
  .back.keep { min-width: 0; }
  .back.keep .label { overflow: hidden; text-overflow: ellipsis; }
  .path-sep { display: none; }
  /* On phones menus rise from the bottom as a sheet with big rows. */
  .hscrim { display: block; position: fixed; inset: 0; background: rgba(20, 24, 34, 0.38); z-index: 1; }
  .menu, .menu.start, .menu.end { position: fixed; z-index: 2; left: 0; right: 0; bottom: 0; width: auto; padding: 0.5rem 0.75rem calc(1rem + env(safe-area-inset-bottom)); border-radius: 1.75rem 1.75rem 0 0; background: var(--card); backdrop-filter: none; box-shadow: var(--elevation-floating); max-height: 85vh; overflow: auto; }
  .menu .handle { display: block; width: 2.5rem; height: 0.3125rem; border-radius: 999px; background: var(--input); margin: 0.25rem auto 0.5rem; }
  .menu .sheet-title { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.25rem 0.5rem 0.5rem 0.75rem; }
  .menu .sheet-title .type-heading { font-size: 1.125rem; }
  .menu > .menu-label.first { display: none; }
  .item { min-height: 3.25rem; font-size: 0.9375rem; }
  .item .mark { width: 2.25rem; height: 2.25rem; font-size: 0.8125rem; }
  .theme-seg button { height: 2.5rem; }
}

/* Dark theme values from docs/DESIGN.md, for the dark check. */
:root[data-theme="dark"] {
  --background: #0f1116; --foreground: #eceef2; --card: #171a21; --secondary: #1f232c; --accent: #232833;
  --muted-foreground: #9aa3b2; --border: #272c37; --input: #343a47; --success: #4cc596; --warning: #e5a53d; --destructive: #ec6b80;
  --material: rgba(27, 31, 40, 0.88); --material-edge: rgba(255, 255, 255, 0.06);
  --elevation-raised: 0 1px 2px rgba(0, 0, 0, 0.3), 0 6px 18px -8px rgba(0, 0, 0, 0.5);
  --elevation-floating: 0 2px 6px rgba(0, 0, 0, 0.3), 0 24px 60px -18px rgba(0, 0, 0, 0.7);
}
:root[data-theme="dark"] .brand-tartine { --tint: #1b283f; --tint-strong: #1e2f56; --tint-foreground: #8fb2f2; --brand-2: #3a5a94; }
:root[data-theme="dark"] .path-sep { color: #4a5261; }
"""

LOGO = '<a class="logo" href="#" aria-label="Cadence home"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="9" width="4.5" height="10" rx="2.25" fill="currentColor" opacity=".55"/><rect x="9.75" y="4" width="4.5" height="15" rx="2.25" fill="currentColor"/><rect x="16.5" y="7" width="4.5" height="12" rx="2.25" fill="currentColor" opacity=".8"/></svg>Cadence</a>'

# A client who owns three brands. Bar Tartine's yellow checks that a light brand colour keeps its mark legible.
BRANDS = [
    ("Tartinebakery", "tartinebakery.com", "T", "#2f6fde", "#fff", 5),
    ("Meow Meow Tweet", "meowmeowtweet.com", "M", "#c93f37", "#fff", 2),
    ("Bar Tartine", "bartartine.com", "B", "#f2b441", "#1c2433", 0),
]
# The agency's clients, each with the person who owns the brand.
CLIENTS = [
    ("Tartinebakery", "Maya Chen", "T", "#2f6fde", "#fff", 5),
    ("Meow Meow Tweet", "Tom Ellis", "M", "#c93f37", "#fff", 2),
    ("Four Barrel Coffee", "Jo Park", "F", "#8a4b2a", "#fff", 0),
    ("Bar Tartine", "Maya Chen", "B", "#f2b441", "#1c2433", 1),
]
CLIENT_USER = ("Maya Chen", "maya@tartinebakery.com", "MC")
ADMIN_USER = ("Alex Morgan", "alex@thescaleagency.org", "AM")


def mark(letter, colour, ink):
    return f'<span class="mark" style="--mark:{colour};--mark-ink:{ink}" aria-hidden="true">{letter}</span>'


def switcher(name, owner=None, is_open=False):
    """The brand switcher. An admin also sees whose brand it is."""
    owner_line = f'<span class="owner">{owner}&rsquo;s brand</span>' if owner else ""
    expanded = "true" if is_open else "false"
    label = f"{name}, {owner}&rsquo;s brand. Switch client" if owner else f"{name}. Switch brand"
    return (f'<button class="bswitch pressable" aria-haspopup="menu" aria-expanded="{expanded}" aria-label="{label}">'
            f'<span class="mark" aria-hidden="true">{name[0]}</span><span class="names"><span class="name">{name}</span>{owner_line}</span>'
            f'{icon("chevrons", "i chev")}</button>')


def ask_agent():
    return f'<button class="btn sm btn-tint pressable ask-agent" aria-label="Ask the agent">{icon("sparkles")}<span>Ask the agent</span></button>'


def avatar(user, is_open=False):
    name, _, initials = user
    expanded = "true" if is_open else "false"
    return f'<button class="avatar-btn pressable" aria-haspopup="menu" aria-expanded="{expanded}" aria-label="Your account, {name}"><span class="avatar">{initials}</span></button>'


def bar(start="", end="", menus="", is_open=False):
    open_class = " open" if is_open else ""
    layer = f'<div class="menu-layer">{menus}</div>' if menus else ""
    return f"""<header class="topbar{open_class}"><div class="topbar-inner material">
  {LOGO}
  {start}
  <div class="topbar-end">{end}</div>
</div>{layer}</header>"""


# ---------- Menus ----------

def sheet_title(title):
    return f'<div class="sheet-title"><p class="type-heading">{title}</p><button class="icon-close" aria-label="Close">{icon("x")}</button></div>'


def brand_menu(current="Tartinebakery", highlight="Meow Meow Tweet"):
    rows = ""
    for name, site, letter, colour, ink, waiting in BRANDS:
        on = name == current
        cls = " current" if on else (" hi" if name == highlight else "")
        tick = icon("check", "i tick") if on else ""
        count = f'<span class="count">{waiting} to approve</span>' if waiting and not on else ""
        aria = ' aria-current="true"' if on else ""
        rows += f'<button class="item{cls}" role="menuitemradio" aria-checked="{"true" if on else "false"}"{aria}>{mark(letter, colour, ink)}<span class="text"><b>{name}</b><span>{site}</span></span>{count}{tick}</button>'
    return f"""<div class="hscrim" aria-hidden="true"></div>
<div class="menu start material" role="menu" aria-label="Your brands">
  <span class="handle" aria-hidden="true"></span>{sheet_title("Your brands")}
  <p class="menu-label first">Your brands</p>
  {rows}
  <hr>
  <button class="item quiet" role="menuitem">{icon("grid")}<span class="text"><b>All brands</b></span></button>
  <button class="item quiet" role="menuitem">{icon("plus")}<span class="text"><b>Add a brand</b></span></button>
</div>"""


def client_menu(current="Tartinebakery"):
    rows = ""
    for name, owner, letter, colour, ink, waiting in CLIENTS:
        on = name == current
        cls = " current" if on else ""
        tick = icon("check", "i tick") if on else ""
        count = f'<span class="count">{waiting} to approve</span>' if waiting and not on else ""
        rows += f'<button class="item{cls}" role="menuitemradio" aria-checked="{"true" if on else "false"}">{mark(letter, colour, ink)}<span class="text"><b>{name}</b><span>{owner}</span></span>{count}{tick}</button>'
    return f"""<div class="hscrim" aria-hidden="true"></div>
<div class="menu start material" role="menu" aria-label="Switch client" style="--menu-left:16.4rem">
  <span class="handle" aria-hidden="true"></span>{sheet_title("Switch client")}
  <p class="menu-label first">Switch client</p>
  {rows}
  <hr>
  <button class="item quiet" role="menuitem">{icon("users")}<span class="text"><b>All clients</b></span></button>
  <button class="item quiet" role="menuitem">{icon("plus")}<span class="text"><b>Add a client</b></span></button>
</div>"""


def account_menu(user, theme="light"):
    name, email, initials = user
    options = [("light", "Light", "sun"), ("dark", "Dark", "moon"), ("device", "Device", "monitor")]
    seg = "".join(
        f'<button role="radio" aria-checked="{"true" if key == theme else "false"}" aria-label="{"Match device" if key == "device" else label} theme">{icon(ic)}{label}</button>'
        for key, label, ic in options
    )
    return f"""<div class="hscrim" aria-hidden="true"></div>
<div class="menu end material" role="menu" aria-label="Your account">
  <span class="handle" aria-hidden="true"></span>{sheet_title("Your account")}
  <div class="acct"><span class="avatar">{initials}</span><div><b>{name}</b><span>{email}</span></div></div>
  <hr>
  <button class="item quiet" role="menuitem">{icon("user-cog")}<span class="text"><b>Manage account</b><span>Name, email, password and sign-in</span></span></button>
  <div class="theme-row"><p id="theme-label">Theme</p><div class="theme-seg" role="radiogroup" aria-labelledby="theme-label">{seg}</div></div>
  <hr>
  <button class="item quiet" role="menuitem">{icon("log-out")}<span class="text"><b>Sign out</b></span></button>
</div>"""


# ---------- Bars ----------

def client_bar(switch_open=False, account_open=False):
    start = f'<span class="topbar-sep"></span>{switcher("Tartinebakery", is_open=switch_open)}'
    end = ask_agent() + avatar(CLIENT_USER, account_open)
    menus = brand_menu() if switch_open else (account_menu(CLIENT_USER) if account_open else "")
    return bar(start, end, menus, switch_open or account_open)


def admin_client_bar(switch_open=False):
    start = (f'<span class="topbar-sep"></span><a class="back pressable" href="#" aria-label="Back to all clients">{icon("chevron-left")}<span class="label">Clients</span></a>'
             f'<span class="path-sep" aria-hidden="true">/</span>{switcher("Tartinebakery", "Maya Chen", switch_open)}')
    end = ask_agent() + '<span class="badge badge-outline admin-badge">Admin</span>' + avatar(ADMIN_USER)
    menus = client_menu() if switch_open else ""
    return bar(start, end, menus, switch_open)


def admin_area_bar(account_open=False):
    start = '<span class="topbar-sep"></span><span class="context">Agency admin</span>'
    end = avatar(ADMIN_USER, account_open)
    menus = account_menu(ADMIN_USER, "device") if account_open else ""
    return bar(start, end, menus, account_open)


def onboarding_bar(back_to=None):
    start = ""
    if back_to:
        start = f'<span class="topbar-sep"></span><a class="back keep pressable" href="#">{icon("chevron-left")}<span class="label">Back to {back_to}</span></a>'
    return bar(start, avatar(CLIENT_USER))


# ---------- Pages ----------

def placeholders(title, lede):
    return (f'<header class="page-header"><div><h1 class="type-title">{title}</h1><p>{lede}</p></div></header>'
            '<div class="ph-card"><div class="bone"></div><div class="bone"></div><div class="bone"></div></div>'
            '<div class="ph-grid"><div class="ph-card"><div class="bone"></div><div class="bone"></div></div>'
            '<div class="ph-card"><div class="bone"></div><div class="bone"></div></div>'
            '<div class="ph-card"><div class="bone"></div><div class="bone"></div></div></div>')


def admin_rail():
    return (f'<nav class="rail material" aria-label="Admin"><a href="#" class="on" aria-current="page">{icon("users")}Clients</a>'
            f'<a href="#">{icon("activity")}Observability</a><div class="sep"></div><a href="#">{icon("settings")}Settings</a></nav>')


def admin_tabbar():
    return (f'<nav class="tabbar admin material" aria-label="Admin"><a href="#" class="on" aria-current="page">{icon("users")}Clients</a>'
            f'<a href="#">{icon("activity")}Observability</a><a href="#">{icon("settings")}Settings</a></nav>')


def document(title, header_html, body, nav="", body_class="brand-tartine", theme="light", solo=False):
    main_class = ' class="solo"' if solo else ""
    return f"""<!doctype html>
<html lang="en" data-theme="{theme}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..700&family=Instrument+Sans:wght@400..700&display=swap" rel="stylesheet">
<style>{build.CSS}</style>
</head>
<body class="{body_class}">
<style>{HDR_CSS}</style>
{build.sprite()}
{header_html}
{nav}
<main{main_class}>
{body}
</main>
</body>
</html>"""


def workspace(title, header_html, theme="light"):
    body = placeholders("Tartinebakery", "Local bakery, tartinebakery.com")
    return document(title, header_html, body, build.rail("") + build.tabbar(""), theme=theme)


def admin_workspace(title, header_html):
    body = placeholders("Tartinebakery", "Maya Chen&rsquo;s brand, tartinebakery.com")
    return document(title, header_html, body, build.rail("") + build.tabbar(""))


def admin_area(title, header_html):
    body = placeholders("Clients", "Every client the agency runs, and what is waiting on each.")
    return document(title, header_html, body, admin_rail() + admin_tabbar(), body_class="")


def onboarding(title, header_html):
    body = ('<section class="start"><h1 class="type-title">Start with your website</h1>'
            '<p class="lede">Paste your address. The agent reads it and drafts your brand kit, so your first posts sound like you.</p></section>'
            '<div class="ph-card" style="max-width:36rem;margin:2rem auto 0"><div class="bone"></div><div class="bone"></div></div>')
    return document(title, header_html, body, body_class="", solo=True)


SCREENS = {
    "hdr-v1-client": lambda: workspace("Header: client in a brand", client_bar()),
    "hdr-v1-client-switcher-open": lambda: workspace("Header: brand switcher open", client_bar(switch_open=True)),
    "hdr-v1-client-account-open": lambda: workspace("Header: account menu open", client_bar(account_open=True)),
    "hdr-v1-client-dark": lambda: workspace("Header: client in a brand, dark", client_bar(), theme="dark"),
    "hdr-v1-admin-area": lambda: admin_area("Header: admin area", admin_area_bar()),
    "hdr-v1-admin-area-account-open": lambda: admin_area("Header: admin account menu open", admin_area_bar(account_open=True)),
    "hdr-v1-admin-in-client": lambda: admin_workspace("Header: admin in a client's brand", admin_client_bar()),
    "hdr-v1-admin-in-client-switcher-open": lambda: admin_workspace("Header: admin client switcher open", admin_client_bar(switch_open=True)),
    "hdr-v1-onboarding-first": lambda: onboarding("Header: onboarding, first brand", onboarding_bar()),
    "hdr-v1-onboarding-add-brand": lambda: onboarding("Header: onboarding, adding a brand", onboarding_bar("Tartinebakery")),
}


def main():
    OUT.mkdir(exist_ok=True)
    for name, make in SCREENS.items():
        (OUT / f"{name}.html").write_text(make(), encoding="utf-8")
    print(f"wrote {len(SCREENS)} screens to {OUT}")


if __name__ == "__main__":
    main()
