"""ADM v1: the admin's screens (everything except observability).

Run from design/web-v2: python admin_screens.py
Built from build.py's helpers so the admin area reads as the same kit as the client screens:
the same top bar, floating rail, panels, tables that become cards on phone, badges and dialogs.
Data follows packages/shared: adminClientSchema, adminClientDetailSchema, brandSchema, inviteClientSchema.
Outside a brand workspace the accent is the default iris; inside one it is the brand's colour.
"""

from pathlib import Path

import build
from build import card_head, header, icon, page, tabbar

HERE = Path(__file__).parent
OUT = HERE / "screens-admin"

build.obs.ICONS.update({
    "mail": '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 6L2 7"/>',
    "phone": '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    "user-plus": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    "eye": '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    "archive": '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4"/>',
})

CSS = """
/* Admin shell: the rail carries Clients and Observability; the tab bar on tablet and phone has the same two. */
.tabbar.admin-tabs { grid-template-columns: repeat(2, minmax(0, 1fr)); left: 50%; right: auto; transform: translateX(-50%); width: min(20rem, calc(100vw - 1.5rem)); }
.admin-badge { margin-right: 0.25rem; }

/* What needs the admin, across every client. Three quiet panels that filter the list below. */
.adm-needs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.need { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0.25rem 0.875rem; align-items: start; padding: 1.125rem 1.25rem; color: inherit; }
.need .icon-wrap { grid-row: span 3; display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 999px; }
.need .icon-wrap.warn { background: rgba(183, 116, 10, 0.12); color: var(--warning); }
.need .icon-wrap.bad { background: rgba(207, 63, 87, 0.1); color: var(--destructive); }
.need .n { font-family: var(--font-display); font-weight: 600; font-size: 1.5rem; line-height: 1.1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.need .n small { font-family: var(--font-body); font-size: 0.9375rem; font-weight: 500; letter-spacing: 0; margin-left: 0.375rem; }
.need .link { margin-top: 0.25rem; }
a.need:hover { box-shadow: var(--elevation-floating); }

/* Clients: a table on desktop, one card per client below 900px. Hover lights the whole row. */
.clients-panel { padding: 0.5rem 1.5rem; }
.clients-table th { padding-top: 1rem; }
.clients-table tbody tr { cursor: pointer; transition: background-color 0.15s ease; }
.clients-table tbody tr:hover td { background: transparent; }
.clients-table tbody tr:hover { background: #f5f6f8; }
.clients-table tr.new { background: #f4f3fe; }
.person { display: flex; align-items: center; gap: 0.75rem; min-width: 0; }
.person-avatar { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 999px; flex: none; background: var(--tint-strong); color: var(--tint-foreground); font-size: 0.8125rem; font-weight: 600; }
.person-avatar.invited { background: var(--card); color: var(--muted-foreground); box-shadow: inset 0 0 0 1.5px var(--input); }
.person b { display: block; font-weight: 500; }
.person .email { display: block; font-size: 0.8125rem; color: var(--muted-foreground); overflow: hidden; text-overflow: ellipsis; }
.brand-list { display: grid; gap: 0.25rem; }
.brand-name { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
.brand-mark { display: grid; place-items: center; width: 1.375rem; height: 1.375rem; border-radius: 0.4375rem; flex: none; color: #fff; font-size: 0.625rem; font-weight: 700; }
.needs-cell { display: flex; flex-wrap: wrap; gap: 0.375rem; white-space: normal; max-width: 17rem; }
.clear { display: inline-flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; color: var(--muted-foreground); }
.clear .i { width: 0.875rem; height: 0.875rem; color: var(--success); }
.activity { display: block; }
.activity + .type-label { display: block; }
.clients-table .c-go { width: 1%; text-align: right; color: var(--muted-foreground); }
.list-note { margin-top: 1rem; }
@media (max-width: 1100px) { .adm-needs { grid-template-columns: minmax(0, 1fr); gap: 0.625rem; } .need { grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; padding: 0.875rem 1rem; } .need .icon-wrap { grid-row: auto; } .need .n { font-size: 1.25rem; } .need .type-label.detail { display: none; } .need .link { margin: 0; } }
@media (max-width: 900px) {
  .clients-toolbar .toolbar-end { width: 100%; }
  .clients-toolbar .search { flex: 1; min-width: 0; }
  .clients-panel { padding: 0.25rem 1rem; }
  .clients-table thead { display: none; }
  .clients-table, .clients-table tbody { display: block; }
  .clients-table tr { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.5rem 0.75rem; margin: 0 -1rem; padding: 0.875rem 1rem; border-bottom: 1px solid var(--border); }
  .clients-table tr:last-child { border-bottom: 0; }
  .clients-table td { border: 0; padding: 0; white-space: normal; }
  .clients-table .c-person { grid-column: 1; grid-row: 1; min-width: 0; }
  .clients-table .c-status { grid-column: 2; grid-row: 1; align-self: center; }
  .clients-table .c-brands, .clients-table .c-needs, .clients-table .c-last { grid-column: 1 / -1; padding-left: 3.25rem; }
  .clients-table .c-last { display: flex; gap: 0.5rem; align-items: baseline; flex-wrap: wrap; }
  .clients-table .c-go { display: none; }
  .brand-list { display: flex; flex-wrap: wrap; gap: 0.375rem 1rem; }
  .needs-cell { max-width: none; }
}
@media (max-width: 560px) {
  .clients-table .c-brands, .clients-table .c-needs, .clients-table .c-last { padding-left: 0; }
  .clients-toolbar .seg { width: 100%; }
  .clients-toolbar .seg button { flex: 1; }
}

/* Empty and error states: one job, one button. */
.state { max-width: 32rem; margin: 3rem auto 0; text-align: center; padding: 2.5rem 2rem; }
.state .mark { display: grid; place-items: center; width: 3.5rem; height: 3.5rem; margin: 0 auto 1.25rem; border-radius: 999px; background: var(--tint); color: var(--tint-foreground); }
.state .mark .i { width: 1.375rem; height: 1.375rem; }
.state .mark.bad { background: rgba(207, 63, 87, 0.1); color: var(--destructive); }
.state p.lede { margin-top: 0.5rem; color: var(--muted-foreground); }
.state .actions { display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap; margin-top: 1.5rem; }
.state .how { display: grid; gap: 0.625rem; margin-top: 1.75rem; padding-top: 1.5rem; border-top: 1px solid var(--border); text-align: left; }
.state .how p { display: flex; gap: 0.625rem; align-items: flex-start; font-size: 0.875rem; }
.state .how .step { display: grid; place-items: center; width: 1.5rem; height: 1.5rem; border-radius: 999px; background: var(--secondary); font-size: 0.75rem; font-weight: 600; flex: none; }

/* Client detail: the person on the side, their brands in the main column. */
.back-link { display: inline-flex; align-items: center; gap: 0.375rem; font-size: 0.875rem; color: var(--muted-foreground); margin-bottom: 0.75rem; }
.back-link .i { width: 1rem; height: 1rem; }
.client-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem 1.5rem; margin-bottom: 1.5rem; }
.client-head .who-big { display: flex; align-items: center; gap: 1rem; min-width: 0; }
.client-head .person-avatar { width: 3.5rem; height: 3.5rem; font-size: 1.125rem; }
.client-head .title-row { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.75rem; }
.client-head p { color: var(--muted-foreground); margin-top: 0.25rem; }
.detail-grid { display: grid; grid-template-columns: minmax(0, 1fr) 19rem; gap: 1.25rem; align-items: start; }
.detail-side { position: sticky; top: 6rem; display: grid; gap: 1rem; }
.detail-side .kv { grid-template-columns: minmax(0, 1fr); gap: 0.125rem; }
.detail-side .kv > div { min-width: 0; overflow-wrap: anywhere; }
.section-label { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; margin-bottom: 0.75rem; }
.brand-card { padding: 1.375rem 1.5rem; }
.brand-card + .brand-card { margin-top: 1rem; }
.brand-top { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 1rem; align-items: center; }
.brand-top .brand-mark { width: 2.75rem; height: 2.75rem; border-radius: 0.875rem; font-size: 1rem; }
.brand-top .type-heading { font-size: 1.125rem; }
.brand-top a.site { font-size: 0.8125rem; color: var(--muted-foreground); }
.brand-card .loop { margin-top: 1.25rem; }
.brand-card .loop-step p { font-size: 0.75rem; }
.brand-alert { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.75rem; margin-top: 1rem; padding: 0.75rem 0.875rem; border-radius: 0.875rem; background: rgba(183, 116, 10, 0.08); font-size: 0.8125rem; }
.brand-alert b { font-weight: 600; }
.brand-facts { margin-top: 1rem; }
.brand-facts .kv { grid-template-columns: 7rem minmax(0, 1fr); font-size: 0.875rem; }
.acct-state { display: inline-flex; align-items: center; gap: 0.375rem; margin-right: 1rem; }
.acct-state .i { width: 0.9rem; height: 0.9rem; }
.acct-state.ok .dot { background: var(--success); }
.acct-state.warn { color: var(--warning); }
.acct-state.warn .dot { background: var(--warning); }
.acct-state.off { color: var(--muted-foreground); }
.acct-state.off .dot { background: #b3bac6; }
.brand-card.pending { background: #fbfbfd; box-shadow: 0 0 0 1.5px var(--border); }
.brand-card.pending .brand-mark { background: var(--secondary) !important; color: var(--muted-foreground); }
.pending-body { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 1rem; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); }
.pending-body .overall { margin: 0.625rem 0 0.375rem; max-width: 22rem; }
.step-line { display: flex; align-items: center; gap: 0.5rem; font-weight: 500; }
.archived-line { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 1rem; padding: 0.875rem 1.25rem; border-radius: 1.125rem; box-shadow: 0 0 0 1px var(--border); font-size: 0.875rem; color: var(--muted-foreground); }
.archived-line span { display: inline-flex; align-items: center; gap: 0.5rem; }
.invite-banner { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 1rem; align-items: center; padding: 1rem 1.25rem; border-radius: 1.25rem; background: var(--tint); margin-bottom: 1.25rem; }
.invite-banner .icon-wrap { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 999px; background: var(--card); color: var(--tint-foreground); }
.invite-banner .actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.no-brands { display: grid; justify-items: start; gap: 0.5rem; padding: 1.75rem; }
.no-brands .icon-wrap { display: grid; place-items: center; width: 2.75rem; height: 2.75rem; border-radius: 999px; background: var(--tint); color: var(--tint-foreground); margin-bottom: 0.25rem; }
.no-brands .btn { margin-top: 0.75rem; }
@media (max-width: 1100px) {
  .detail-grid { grid-template-columns: minmax(0, 1fr); }
  .detail-side { position: static; order: 2; }
}
@media (max-width: 900px) {
  .brand-card .loop { grid-template-columns: repeat(6, minmax(0, 1fr)); row-gap: 0; }
}
@media (max-width: 560px) {
  .client-head .btn { width: 100%; }
  .client-head .person-avatar { width: 3rem; height: 3rem; font-size: 1rem; }
  .client-head .type-title { font-size: 1.75rem; }
  .brand-card { padding: 1.125rem; }
  .brand-top { grid-template-columns: auto minmax(0, 1fr); }
  .brand-top .btn { grid-column: 1 / -1; width: 100%; }
  .brand-top .badge { grid-column: 1 / -1; justify-self: start; }
  .brand-card .loop-step p { display: none; }
  .brand-card .loop-step.now p { display: block; white-space: nowrap; }
  .brand-facts .kv { grid-template-columns: minmax(0, 1fr); gap: 0.125rem; }
  .pending-body { grid-template-columns: minmax(0, 1fr); }
  .pending-body .btn { width: 100%; }
  .invite-banner { grid-template-columns: auto minmax(0, 1fr); }
  .invite-banner .actions { grid-column: 1 / -1; }
  .invite-banner .actions .btn { flex: 1; }
  .archived-line { flex-wrap: wrap; }
}

/* Dialogs: centred on desktop and tablet, a bottom sheet on phone (same as S16). */
.dlg { position: fixed; z-index: 60; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(30rem, calc(100vw - 2rem)); max-height: calc(100dvh - 2rem); display: flex; flex-direction: column; border-radius: 1.75rem; background: var(--card); box-shadow: var(--elevation-floating); overflow: hidden; }
.dlg-body { overflow-y: auto; padding: 1.75rem 1.75rem 1.25rem; display: grid; gap: 1rem; }
.dlg-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.dlg-head p { margin-top: 0.375rem; }
.dlg-foot { display: flex; gap: 0.5rem; justify-content: flex-end; padding: 1rem 1.75rem 1.5rem; border-top: 1px solid var(--border); }
.dlg .mark { display: grid; place-items: center; width: 3rem; height: 3rem; border-radius: 999px; }
.dlg .mark.ok { background: rgba(23, 138, 94, 0.12); color: var(--success); }
.dlg .mark.bad { background: rgba(207, 63, 87, 0.12); color: var(--destructive); }
.field .input.focus { border-color: var(--brand); box-shadow: 0 0 0 3px var(--tint-strong); }
.field .input.error { border-color: var(--destructive); box-shadow: 0 0 0 3px rgba(207, 63, 87, 0.12); }
.field .input .placeholder { color: var(--muted-foreground); }
.field .input .caret { display: inline-block; width: 1.5px; height: 1.15em; margin-left: -0.375rem; background: var(--foreground); }
.field .optional { font-weight: 400; color: var(--muted-foreground); }
.field-error { display: flex; gap: 0.375rem; align-items: flex-start; font-size: 0.8125rem; color: var(--destructive); line-height: 1.45; }
.field-error .i { width: 0.875rem; height: 0.875rem; flex: none; margin-top: 0.2rem; }
.field-error a { color: inherit; text-decoration: underline; text-underline-offset: 2px; font-weight: 500; }
.field-ok { display: flex; gap: 0.375rem; align-items: center; font-size: 0.8125rem; color: var(--muted-foreground); }
.field-ok .i { width: 0.875rem; height: 0.875rem; color: var(--success); }
.what-next { display: grid; gap: 0.5rem; padding: 1rem; border-radius: 1rem; background: #f7f8fa; font-size: 0.8125rem; line-height: 1.45; }
.what-next p { display: flex; gap: 0.5rem; align-items: flex-start; }
.what-next .i { width: 0.9rem; height: 0.9rem; flex: none; margin-top: 0.15rem; color: var(--muted-foreground); }
.sent-to { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem; border-radius: 1rem; box-shadow: 0 0 0 1px var(--border); }
.btn-danger { background: var(--destructive); color: #fff; }
.btn[disabled] { opacity: 0.45; box-shadow: none; }
@media (max-width: 560px) {
  .dlg { top: auto; bottom: 0; left: 0; transform: none; width: 100%; max-height: 94dvh; border-radius: 1.5rem 1.5rem 0 0; }
  .dlg-body { padding: 1.5rem 1.25rem 1rem; }
  .dlg-foot { padding: 0.875rem 1.25rem 1.25rem; flex-direction: column-reverse; }
  .dlg-foot .btn { width: 100%; }
  .page-header p { display: none; }
}

/* Viewing a brand as admin: a neutral ink strip above the header, so it never reads as the brand's colour. */
.admin-bar { position: relative; z-index: 41; display: flex; align-items: center; justify-content: space-between; gap: 1rem; max-width: 88rem; margin: 0.75rem auto 0; padding: 0.5rem 0.5rem 0.5rem 1rem; border-radius: 999px; background: #262b38; color: #fff; font-size: 0.875rem; }
.admin-bar-wrap { padding: 0 1.25rem; }
.admin-bar .say { display: flex; align-items: center; gap: 0.625rem; min-width: 0; }
.admin-bar .say .i { color: #b9b3ff; }
.admin-bar .say span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.admin-bar .say b { font-weight: 600; }
.admin-bar .say .soft { color: #c4c9d4; }
.admin-bar .btn { height: 2rem; background: rgba(255, 255, 255, 0.12); color: #fff; }
.admin-bar .btn:hover { background: rgba(255, 255, 255, 0.2); }
body.admin-view .rail { top: 9.25rem; }
@media (max-width: 1023px) { .admin-bar .soft { display: none; } }
@media (max-width: 560px) {
  .admin-bar-wrap { padding: 0 1rem; }
  .admin-bar { margin-top: 0.625rem; font-size: 0.8125rem; }
  .admin-bar .btn span { display: none; }
  .admin-bar .btn { width: 2rem; padding: 0; }
}
"""

# ---------- Data ----------

BRAND = {
    "Meow Meow Tweet": ("M", "#c93f37", "meowmeowtweet.com"),
    "Purr Pantry": ("P", "#0f766e", "purrpantry.com"),
    "Don Angie": ("D", "#9f1239", "donangie.com"),
    "Tartinebakery": ("T", "#2f6fde", "tartinebakery.com"),
    "Four Barrel Coffee": ("F", "#8a4b2a", "fourbarrelcoffee.com"),
    "Harbour Dental": ("H", "#0e7490", "harbourdental.co.uk"),
    "Mehta Sweets": ("M", "#b45309", "mehtasweets.in"),
}

WAIT = ("warning", "clock")
FIX = ("warning", "alert")
FAIL = ("danger", "alert")
INVITE = ("neutral", "mail")

# (name, email, initials, status, brands, needs, last activity, what happened)
CLIENTS = [
    ("Priya Raman", "priya@meowmeowtweet.com", "PR", "active", ["Meow Meow Tweet", "Purr Pantry"],
     [(WAIT, "3 posts to approve"), (FIX, "Facebook access expired")], "12 min ago", "Approved 2 posts"),
    ("Hannah Lee", "hannah@tartinebakery.com", "HL", "active", ["Tartinebakery"],
     [(WAIT, "5 posts to approve")], "Yesterday", "Finished the questionnaire"),
    ("Marco Bellini", "marco@donangie.com", "MB", "active", ["Don Angie"],
     [(FAIL, "Research failed")], "2 hours ago", "Asked for strategy changes"),
    ("Rahul Mehta", "rahul@mehtasweets.in", "RM", "invited", ["Mehta Sweets"],
     [(FAIL, "Website scan failed")], "Never signed in", "Invited 24 Sep"),
    ("Aisha Khan", "aisha@khanchai.com", "AK", "invited", [],
     [(INVITE, "Invite not opened, 3 days")], "Never signed in", "Invited 23 Sep"),
    ("Sam Okafor", "sam@fourbarrelcoffee.com", "SO", "active", ["Four Barrel Coffee"],
     [], "Today, 9:40 AM", "Connected Instagram"),
    ("Lucy Park", "lucy@harbourdental.co.uk", "LP", "active", ["Harbour Dental"],
     [], "21 Sep", "Approved 4 posts"),
]

NEW_CLIENT = ("Daniel Osei", "daniel@oseiflowers.com", "DO", "invited", [], [(INVITE, "Invite sent just now")], "Never signed in", "Invited today")

STATUS = {
    "active": f'<span class="badge badge-success">{icon("check")}Active</span>',
    "invited": f'<span class="badge badge-neutral">{icon("mail")}Invited</span>',
}


# ---------- Shell ----------

def admin_rail(active):
    items = [("clients", "Clients", "users", '<span class="count">4</span>'), ("observability", "Observability", "activity", "")]
    links = "".join(
        f'<a href="#"{" class=\"on\" aria-current=\"page\"" if key == active else ""}>{icon(name)}{label}{count}</a>'
        for key, label, name, count in items
    )
    return f'<nav class="rail material" aria-label="Admin">{links}</nav>'


def admin_tabs(active):
    items = [("clients", "Clients", "users"), ("observability", "Observability", "activity")]
    links = "".join(
        f'<a href="#"{" class=\"on\" aria-current=\"page\"" if key == active else ""}>{icon(name)}{label}</a>'
        for key, label, name in items
    )
    return f'<nav class="tabbar admin-tabs material" aria-label="Admin">{links}</nav>'


def admin_topbar(html):
    """The current top bar with the admin badge and initials, as on the approved observability screens."""
    return html.replace('<span class="avatar">T</span>', '<span class="badge badge-outline admin-badge">Admin</span><span class="avatar">SA</span>')


def admin_page(title, body, overlay=""):
    """An admin page outside any brand workspace: iris accent, admin rail, admin tab bar."""
    content = f"<style>{CSS}</style>{body}{admin_tabs('clients')}"
    html = page(title, content, workspace=False, overlay=overlay)
    html = html.replace('<main class="solo">', f'{admin_rail("clients")}\n<main>')
    return admin_topbar(html)


# ---------- Clients list ----------

def brand_mark(name, cls="brand-mark"):
    letter, colour, _ = BRAND[name]
    return f'<span class="{cls}" style="background:{colour}">{letter}</span>'


def need_badge(kind, text):
    tone, name = kind
    return f'<span class="badge badge-{tone}">{icon(name)}{text}</span>'


def client_row(client, new=False):
    name, email, initials, status, brands, needs, last, what = client
    avatar_cls = "person-avatar invited" if status == "invited" else "person-avatar"
    brand_html = "".join(f'<span class="brand-name">{brand_mark(b)}{b}</span>' for b in brands)
    if not brands:
        brand_html = '<span class="type-label">No brand yet</span>'
    needs_html = "".join(need_badge(kind, text) for kind, text in needs)
    if not needs:
        needs_html = f'<span class="clear">{icon("check")}Nothing waiting</span>'
    row_cls = ' class="new"' if new else ""
    return (f'<tr{row_cls}><td class="c-person"><span class="person"><span class="{avatar_cls}">{initials}</span>'
            f'<span style="min-width:0"><b>{name}</b><span class="email">{email}</span></span></span></td>'
            f'<td class="c-status">{STATUS[status]}</td>'
            f'<td class="c-brands"><div class="brand-list">{brand_html}</div></td>'
            f'<td class="c-needs"><div class="needs-cell">{needs_html}</div></td>'
            f'<td class="c-last"><span class="activity">{last}</span><span class="type-label">{what}</span></td>'
            f'<td class="c-go">{icon("chevron-right")}</td></tr>')


def needs_summary():
    tiles = [
        ("warn", "clock", "8", "posts to approve", "Across Priya Raman and Hannah Lee.", "Show 2 clients"),
        ("warn", "alert", "1", "connection to fix", "Facebook for Meow Meow Tweet expired on 24 Sep.", "Show client"),
        ("bad", "alert", "2", "failed runs", "Research for Don Angie, a website scan for Mehta Sweets.", "See in Observability"),
    ]
    html = "".join(
        f'<a class="panel need" href="#"><span class="icon-wrap {tone}">{icon(name)}</span>'
        f'<p class="n">{n}<small>{label}</small></p><p class="type-label detail">{detail}</p>'
        f'<span class="link">{link}{icon("chevron-right")}</span></a>'
        for tone, name, n, label, detail, link in tiles
    )
    return f'<section class="adm-needs" aria-label="What needs you">{html}</section>'


def clients_header():
    invite = f'<button class="btn btn-default pressable">{icon("user-plus")}Invite a client</button>'
    return header("Clients", "Every business owner you manage, with what needs you first.", invite)


def clients_toolbar(total=7):
    seg = f'<div class="seg"><button class="on">All <span class="muted" style="margin-left:0.25rem">{total}</span></button><button>Needs you <span class="muted" style="margin-left:0.25rem">4</span></button><button>Invited <span class="muted" style="margin-left:0.25rem">{2 if total == 7 else 3}</span></button></div>'
    return f'<div class="toolbar clients-toolbar">{seg}<div class="toolbar-end"><span class="search">{icon("search")}Search clients or brands</span></div></div>'


def clients_table(rows):
    return f"""<section class="panel clients-panel"><table class="table clients-table">
<thead><tr><th>Client</th><th>Status</th><th>Brands</th><th>Needs you</th><th>Last activity</th><th></th></tr></thead>
<tbody>{rows}</tbody></table></section>
<p class="type-label list-note">Clients who need you come first, then the most recently active.</p>"""


def clients_body(with_new=False):
    rows = "".join(client_row(c) for c in CLIENTS)
    total = 7
    if with_new:
        rows = client_row(NEW_CLIENT, new=True) + rows
        total = 8
    return clients_header() + needs_summary() + clients_toolbar(total) + clients_table(rows)


def clients():
    """ADM-1: the admin home. What needs the admin across every client, then every client."""
    return admin_page("Admin: clients", clients_body())


def clients_empty():
    """ADM-1 empty: no clients yet. The page's one job is the first invite."""
    body = f"""{header("Clients", "Every business owner you manage, with what needs you first.")}
<section class="panel state">
  <div class="mark">{icon("users")}</div>
  <h2 class="type-heading">No clients yet</h2>
  <p class="lede">Invite a business owner to get started. You can set up their brand before they first sign in.</p>
  <div class="actions"><button class="btn btn-default pressable">{icon("user-plus")}Invite a client</button></div>
  <div class="how">
    <p><span class="step">1</span><span>They get an email with a link to sign in.</span></p>
    <p><span class="step">2</span><span>You or they add their website, and the agent drafts a brand kit.</span></p>
    <p><span class="step">3</span><span>They approve every post before it goes out. You can approve for them too.</span></p>
  </div>
</section>"""
    return admin_page("Admin: clients, none yet", body)


def clients_error():
    """ADM-1 error: the list didn't load. Say what happened and offer the two useful next steps."""
    body = f"""{clients_header()}
<section class="panel state">
  <div class="mark bad">{icon("alert")}</div>
  <h2 class="type-heading">Couldn&rsquo;t load your clients</h2>
  <p class="lede">The server didn&rsquo;t answer within 10 seconds. Nothing was changed. Try again, or check the server in Observability.</p>
  <div class="actions"><button class="btn btn-outline pressable">{icon("activity")}Open Observability</button><button class="btn btn-default pressable">{icon("refresh")}Try again</button></div>
</section>"""
    return admin_page("Admin: clients, failed to load", body)


# ---------- Invite ----------

def field(label, value, state="", optional=False, message=""):
    opt = ' <span class="optional">(optional)</span>' if optional else ""
    return f'<div class="field"><label>{label}{opt}</label><div class="input {state}">{value}</div>{message}</div>'


def invite_dialog(state="typing"):
    name = field("Name", "Daniel Osei")
    phone = field("Phone", '<span class="placeholder">+44 7700 900123</span>', optional=True)
    if state == "error":
        message = f'<p class="field-error">{icon("alert")}<span>This email already belongs to Sam Okafor. <a href="#">Open Sam Okafor</a> or use a different email.</span></p>'
        email = field("Email", "sam@fourbarrelcoffee.com", "error", message=message)
        name = field("Name", "Sam Okafor")
    else:
        email = field("Email", 'daniel@oseiflowers.com<span class="caret"></span>', "focus")
    return f"""<div class="scrim"></div>
<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="invite-title">
  <div class="dlg-body">
    <div class="dlg-head"><div><h2 class="type-heading" id="invite-title">Invite a client</h2><p class="type-label">A business owner whose social media you&rsquo;ll run.</p></div><button class="icon-close" aria-label="Close">{icon("x")}</button></div>
    {name}{email}{phone}
    <div class="what-next">
      <p>{icon("mail")}<span>They get an email with a link to sign in. They show up here as Invited until they do.</span></p>
      <p>{icon("globe")}<span>You can add their brand now, so it&rsquo;s ready when they arrive.</span></p>
    </div>
  </div>
  <div class="dlg-foot"><button class="btn btn-outline pressable">Cancel</button><button class="btn btn-default pressable"{" disabled" if state == "error" else ""}>{icon("send")}Send invite</button></div>
</div>"""


def invite_sent_dialog():
    return f"""<div class="scrim"></div>
<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="sent-title">
  <div class="dlg-body">
    <div class="mark ok">{icon("check")}</div>
    <div><h2 class="type-heading" id="sent-title">Invite sent to Daniel Osei</h2><p class="type-label" style="margin-top:0.375rem">The sign-in link stays valid for 30 days. You can resend or cancel it from Daniel&rsquo;s page.</p></div>
    <div class="sent-to"><span class="person-avatar invited">DO</span><div style="min-width:0"><p style="font-weight:500">daniel@oseiflowers.com</p><p class="type-label">Invited just now</p></div></div>
    <p style="font-size:0.875rem">Want Daniel&rsquo;s brand ready when he signs in? Add the website now and check the brand kit the agent drafts.</p>
  </div>
  <div class="dlg-foot"><button class="btn btn-outline pressable">Done</button><button class="btn btn-default pressable">{icon("plus")}Add a brand for Daniel</button></div>
</div>"""


def invite():
    """ADM-2 a: the invite dialog over the list. Name and email; phone is optional."""
    return admin_page("Admin: invite a client", clients_body(), overlay=invite_dialog())


def invite_error():
    """ADM-2 b: the email already belongs to a client (409 EMAIL_IN_USE). Point to that client."""
    return admin_page("Admin: invite, email in use", clients_body(), overlay=invite_dialog("error"))


def invite_sent():
    """ADM-2 c: sent. The new client is already in the list as Invited; the next step is their brand."""
    return admin_page("Admin: invite sent", clients_body(with_new=True), overlay=invite_sent_dialog())


# ---------- Client detail ----------

LOOP = ["Onboard", "Strategy", "Create", "Approve", "Publish", "Learn"]


def loop_track(now):
    steps = ""
    for i, label in enumerate(LOOP):
        state = "done" if i < now else ("now" if i == now else "")
        steps += f'<div class="loop-step {state}"><div class="track"></div><p>{label}</p></div>'
    return f'<div class="loop" aria-label="Where the brand is: {LOOP[now]}">{steps}</div>'


def acct_state(name, platform, tone, text):
    return f'<span class="acct-state {tone}">{icon(platform)}<span>{name} {text}</span></span>'


def brand_card(name, stage, alert, accounts, strategy, posts):
    site = BRAND[name][2]
    alert_html = f'<div class="brand-alert">{alert}</div>' if alert else ""
    facts = "".join(f'<div class="kv"><span class="type-label">{k}</span><div>{v}</div></div>' for k, v in [("Accounts", accounts), ("Strategy", strategy), ("Posts", posts)])
    return f"""<section class="panel brand-card">
  <div class="brand-top">{brand_mark(name)}<div style="min-width:0"><h3 class="type-heading">{name}</h3><a class="site" href="#">{site}</a></div>
    <button class="btn btn-default pressable">{icon("eye")}Open workspace</button></div>
  {loop_track(stage)}
  {alert_html}
  <div class="brand-facts">{facts}</div>
</section>"""


def meow_card():
    alert = (f'<b>Needs you:</b>{need_badge(WAIT, "3 posts to approve")}{need_badge(FIX, "Facebook access expired")}'
             f'<a class="link" href="#" style="margin-left:auto">Approve posts{icon("chevron-right")}</a>')
    accounts = acct_state("Instagram", "instagram", "ok", "connected") + acct_state("Facebook", "facebook", "warn", "expired 24 Sep")
    return brand_card("Meow Meow Tweet", 3, alert, accounts, "Running since 22 Sep, version 2", "3 waiting for approval, 6 scheduled, 18 published")


def purr_pending(scanning=False):
    letter, colour, site = BRAND["Purr Pantry"]
    if scanning:
        body = f"""<div class="pending-body"><div>
      <p class="step-line"><span class="spinner"></span>Reading the pages, step 2 of 4</p>
      <div class="overall" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100"><span style="width:40%"></span></div>
      <p class="type-label">About 40 seconds left. You can leave this page; it keeps going.</p></div>
      <button class="btn btn-ghost pressable" style="color:var(--muted-foreground)">Stop</button></div>"""
        badge = f'<span class="badge badge-tint">{icon("clock")}Reading the website</span>'
    else:
        body = f"""<div class="pending-body"><div>
      <p style="font-weight:500">The brand kit is ready to check</p>
      <p class="type-label" style="margin-top:0.25rem">Read on 26 Sep. Check it and the brand is created; Priya sees it on her next sign-in.</p></div>
      <button class="btn btn-default pressable">Check brand kit{icon("arrow-right")}</button></div>"""
        badge = f'<span class="badge badge-warning">{icon("clock")}Not created yet</span>'
    return f"""<section class="panel brand-card pending">
  <div class="brand-top"><span class="brand-mark">{letter}</span><div style="min-width:0"><h3 class="type-heading">Purr Pantry</h3><a class="site" href="#">{site}</a></div>{badge}</div>
  {body}
</section>"""


def client_side(rows):
    items = "".join(f'<div class="kv"><span class="type-label">{k}</span><div>{v}</div></div>' for k, v in rows)
    return f'<aside class="detail-side"><section class="panel">{card_head("About", "From the invite and their account.")}{items}</section></aside>'


PRIYA_SIDE = [
    ("Email", '<a class="link" href="#" style="font-size:0.875rem">priya@meowmeowtweet.com</a>'),
    ("Phone", "+1 718 555 0142"),
    ("Client since", "12 Sep, invited by you"),
    ("Last signed in", "Today, 10:48 AM"),
    ("Brands", "2, and 1 archived"),
]


def client_head(name, initials, status, sub, action, invited=False):
    avatar_cls = "person-avatar invited" if invited else "person-avatar"
    return f"""<a class="back-link" href="#">{icon("arrow-left")}Clients</a>
<header class="client-head"><div class="who-big"><span class="{avatar_cls}">{initials}</span><div style="min-width:0"><div class="title-row"><h1 class="type-title">{name}</h1>{STATUS[status]}</div><p>{sub}</p></div></div>{action}</header>"""


def add_brand_button(first_name):
    return f'<button class="btn btn-default pressable">{icon("plus")}Add a brand for {first_name}</button>'


def priya_body(scanning=False):
    brands = meow_card() + purr_pending(scanning)
    archived = f'<div class="archived-line"><span>{icon("archive")}1 archived brand: Whisker Wash</span><a class="link" href="#">Show{icon("chevron-down")}</a></div>'
    return f"""{client_head("Priya Raman", "PR", "active", "2 brands. Last active 12 minutes ago.", add_brand_button("Priya"))}
<div class="detail-grid">
  <div><div class="section-label"><h2 class="type-heading">Brands</h2><span class="type-label">Needs you first</span></div>{brands}{archived}</div>
  {client_side(PRIYA_SIDE)}
</div>"""


def client_detail():
    """ADM-3: one client. Their brands with where each stands and what needs the admin, and a way into each workspace."""
    return admin_page("Admin: client Priya Raman", priya_body())


def toast(text):
    return f'<div class="toast" role="status"><div style="display:flex;align-items:center;gap:0.625rem;font-size:0.875rem"><span style="color:var(--success);display:flex">{icon("check")}</span>{text}</div></div>'


def add_brand_scanning():
    """ADM-4 b: the scan is running on the new brand's card. The admin can leave; it keeps going."""
    return admin_page("Admin: adding a brand, reading the website", priya_body(scanning=True), overlay=toast("Reading purrpantry.com. The brand kit shows up here when it&rsquo;s ready."))


def add_brand_dialog():
    ok = f'<p class="field-ok">{icon("check")}We&rsquo;ll read purrpantry.com and the pages it links to.</p>'
    return f"""<div class="scrim"></div>
<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="add-title">
  <div class="dlg-body">
    <div class="dlg-head"><div><h2 class="type-heading" id="add-title">Add a brand for Priya</h2><p class="type-label">Paste the brand&rsquo;s website. The agent reads it and drafts a brand kit.</p></div><button class="icon-close" aria-label="Close">{icon("x")}</button></div>
    {field("Website", f'{icon("globe")}purrpantry.com<span class="caret"></span>', "focus", message=ok)}
    <div class="what-next">
      <p>{icon("clock")}<span>Reading takes about a minute. You can close this and carry on.</span></p>
      <p>{icon("pencil")}<span>You check the brand kit before the brand is created. Priya sees it after that.</span></p>
      <p>{icon("lock")}<span>Nothing is posted until Priya or you approve it.</span></p>
    </div>
  </div>
  <div class="dlg-foot"><button class="btn btn-outline pressable">Cancel</button><button class="btn btn-default pressable">Read the website{icon("arrow-right")}</button></div>
</div>"""


def add_brand():
    """ADM-4 a: add a brand for a client. The website is the only field; the scan does the rest."""
    return admin_page("Admin: add a brand", priya_body(), overlay=add_brand_dialog())


def aisha_body():
    banner = f"""<div class="invite-banner"><span class="icon-wrap">{icon("mail")}</span>
  <div><p style="font-weight:600">Invite sent 23 Sep, not opened yet</p><p class="type-label" style="margin-top:0.125rem">The link in aisha@khanchai.com&rsquo;s inbox works until 23 Oct.</p></div>
  <div class="actions"><button class="btn btn-ghost pressable">Cancel invite</button><button class="btn btn-outline pressable">{icon("send")}Resend invite</button></div></div>"""
    empty = f"""<section class="panel no-brands"><span class="icon-wrap">{icon("globe")}</span>
  <h3 class="type-heading">No brand yet</h3>
  <p class="type-label" style="max-width:34rem">Aisha can add her website after she signs in. Or set it up now, so her brand kit is waiting when she arrives.</p>
  {add_brand_button("Aisha")}</section>"""
    side = client_side([
        ("Email", '<a class="link" href="#" style="font-size:0.875rem">aisha@khanchai.com</a>'),
        ("Phone", '<span class="muted">Not given</span>'),
        ("Invited", "23 Sep, by you"),
        ("Last signed in", '<span class="muted">Never</span>'),
    ])
    return f"""{client_head("Aisha Khan", "AK", "invited", "Hasn&rsquo;t signed in yet.", "", invited=True)}
{banner}
<div class="detail-grid"><div><div class="section-label"><h2 class="type-heading">Brands</h2></div>{empty}</div>{side}</div>"""


def client_invited():
    """ADM-5 a: an invited client who hasn't signed in. Resend or cancel the invite; set up the brand early."""
    return admin_page("Admin: client Aisha Khan, invited", aisha_body())


def cancel_invite():
    """ADM-5 b: cancelling an invite asks once; the link stops working and she can be invited again."""
    overlay = f"""<div class="scrim"></div>
<div class="dlg" role="alertdialog" aria-modal="true" aria-labelledby="cancel-title">
  <div class="dlg-body">
    <div class="mark bad">{icon("x")}</div>
    <div><h2 class="type-heading" id="cancel-title">Cancel Aisha Khan&rsquo;s invite?</h2>
    <p class="type-label" style="margin-top:0.375rem;color:var(--foreground)">The sign-in link in her email stops working, and she leaves your client list. You can invite her again any time.</p></div>
  </div>
  <div class="dlg-foot"><button class="btn btn-outline pressable">Keep invite</button><button class="btn btn-danger pressable">Cancel invite</button></div>
</div>"""
    return admin_page("Admin: cancel an invite", aisha_body(), overlay=overlay)


# ---------- Viewing a brand as admin ----------

def admin_bar():
    return f"""<div class="admin-bar-wrap"><div class="admin-bar" role="note">
  <p class="say">{icon("eye")}<span><b>Admin view: Hannah Lee&rsquo;s brand.</b> <span class="soft">Posts you approve here are approved in your name.</span></span></p>
  <a class="btn sm pressable" href="#" aria-label="Back to Hannah Lee">{icon("arrow-left")}<span>Back to Hannah Lee</span></a>
</div></div>"""


def viewing_as_admin():
    """ADM-6: the admin inside a client's workspace. The brand colour stays; a neutral strip says whose it is and leads back."""
    html = page("Admin view: Tartinebakery", f"<style>{CSS}</style>" + build.overview_body() + tabbar(""), "")
    html = html.replace('<body class="brand-tartine">', '<body class="brand-tartine admin-view">')
    html = html.replace('<header class="topbar">', admin_bar() + '\n<header class="topbar">', 1)
    return admin_topbar(html)


SCREENS = {
    "adm-v1-clients": clients,
    "adm-v1-clients-empty": clients_empty,
    "adm-v1-clients-error": clients_error,
    "adm-v1-invite": invite,
    "adm-v1-invite-email-in-use": invite_error,
    "adm-v1-invite-sent": invite_sent,
    "adm-v1-client-detail": client_detail,
    "adm-v1-add-brand": add_brand,
    "adm-v1-add-brand-reading": add_brand_scanning,
    "adm-v1-client-invited": client_invited,
    "adm-v1-cancel-invite": cancel_invite,
    "adm-v1-viewing-as-admin": viewing_as_admin,
}


def main():
    OUT.mkdir(exist_ok=True)
    for name, make in SCREENS.items():
        (OUT / f"{name}.html").write_text(make(), encoding="utf-8")
    print(f"wrote {len(SCREENS)} screens to {OUT}")


if __name__ == "__main__":
    main()
