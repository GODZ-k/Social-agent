"""ADM-7 v1: Admin settings, the agency-wide page reached from the rail (not the personal account page).

Run from design/web-v2: python admin_settings.py
Built on admin_screens.py without editing it: the rail/tab bar are extended locally with a third
"Settings" item, same pattern brands_account.py and auth_2fa.py already use for their own pages.
Two tabs only: Team (who else at the agency can sign in as an admin) and Notifications (what Cadence
emails every admin about). Profile, password and two-factor already live in "Your account", reached
from the account menu (auth_2fa.py) -- this page does not repeat them.
"""

from pathlib import Path

import admin_screens
import build
import header_design as hdr
from admin_screens import STATUS, field
from build import card_head, icon, page

HERE = Path(__file__).parent
OUT = HERE / "screens-admin-settings"

ADMIN_NAME, ADMIN_EMAIL, ADMIN_INITIALS = hdr.ADMIN_USER

CSS = """
/* The three-item admin rail and tab bar, with Settings added; only used on this page. */
.set-wrap { max-width: 48rem; }
.set-tabs { display: flex; gap: 0.25rem; width: fit-content; max-width: 100%; padding: 0.25rem; border-radius: 999px; background: var(--secondary); margin-bottom: 1.5rem; }
.set-tabs a { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.125rem; border-radius: 999px; font-size: 0.875rem; font-weight: 500; color: var(--muted-foreground); }
.set-tabs a.on { background: var(--card); color: var(--foreground); box-shadow: var(--elevation-raised); }

/* Same "what needs a look" tile strip as the clients list (adm-needs); the owner asked to keep it. */
.set-needs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.need .icon-wrap.tint { background: var(--tint); color: var(--tint-foreground); }
@media (max-width: 1100px) { .set-needs { grid-template-columns: minmax(0, 1fr); gap: 0.625rem; } .set-needs .need { grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; padding: 0.875rem 1rem; } .set-needs .need .icon-wrap { grid-row: auto; } .set-needs .need .n { font-size: 1.25rem; } .set-needs .need .type-label.detail { display: none; } .set-needs .need .link { margin: 0; } }

/* One row per teammate: avatar, name and email, a role badge, then the one action that fits. */
.team-row { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem 0.875rem; padding: 0.875rem 0; border-bottom: 1px solid var(--border); }
.team-row:last-of-type { border-bottom: none; }
.team-row .person { flex: 1; min-width: 10rem; }
.team-row .person .email { white-space: normal; overflow: visible; text-overflow: clip; }
.team-row .role { flex: none; }
.team-row .act { flex: none; margin-left: auto; }
@media (max-width: 480px) {
  .team-row .role, .team-row .act { margin-left: 2.875rem; }
}
.pending-note { display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; color: var(--muted-foreground); }
.pending-note .i { width: 0.875rem; height: 0.875rem; }

/* Channels: Email is the always-on default, one quiet line, not a connector row: it can't be
   disconnected so it isn't a peer of the real connectors below it. Discord, Slack and WhatsApp
   use the same .account/.logo-badge row as connecting a social account in onboarding. */
.email-line { display: flex; align-items: center; gap: 0.625rem; padding: 0 0 1.125rem; font-size: 0.875rem; color: var(--muted-foreground); }
.email-line .icon-wrap { display: grid; place-items: center; width: 2rem; height: 2rem; border-radius: 999px; background: var(--secondary); flex: none; }
.email-line b { color: var(--foreground); font-weight: 500; }
.channels-panel { margin-bottom: 1.25rem; }
.account .logo-badge.mono { background: var(--secondary); color: var(--muted-foreground); }
.chan-detail { display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; color: var(--muted-foreground); }
.chan-detail .i { width: 0.875rem; height: 0.875rem; }

/* Alerts: one row per kind of alert, an icon-circle, then a labelled switch per channel it can
   route to -- a real on/off control, not a button styled to look like one. */
.alert-row { display: flex; align-items: flex-start; gap: 1rem; padding: 1.125rem 0; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
.alert-row:last-of-type { border-bottom: none; }
.alert-row .icon-wrap { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 999px; background: var(--secondary); color: var(--muted-foreground); flex: none; }
.alert-row .body { flex: 1; min-width: 12rem; }
.chan-row { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.75rem; }
@media (min-width: 640px) { .chan-row { margin-top: 0; margin-left: auto; align-self: center; } }
.chan-toggle { display: flex; align-items: center; gap: 0.5rem; min-width: 8rem; font-size: 0.8125rem; color: var(--foreground); cursor: pointer; }
.chan-toggle .i { width: 0.875rem; height: 0.875rem; color: var(--muted-foreground); }
.alerts-note { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); font-size: 0.8125rem; color: var(--muted-foreground); }
"""

build.obs.ICONS.setdefault("hash", '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>')

CHANNEL_ICON = {"email": "mail", "discord": "chat", "slack": "hash", "whatsapp": "phone"}
CHANNELS = {"email": True, "discord": True, "slack": False, "whatsapp": False}

build.obs.ICONS.setdefault("shield", '<path d="M12 2 4 5v6c0 5.5 3.4 9.7 8 11 4.6-1.3 8-5.5 8-11V5z"/>')
build.obs.ICONS.setdefault("link", '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>')

TEAM = [
    (ADMIN_NAME, ADMIN_EMAIL, ADMIN_INITIALS, "owner", "active"),
    ("Priya Shah", "priya@thescaleagency.org", "PS", "admin", "active"),
]
PENDING = ("Jordan Lee", "jordan@thescaleagency.org", "admin")

ROLE_BADGE = {
    "owner": '<span class="badge badge-tint">Owner</span>',
    "admin": '<span class="badge badge-neutral">Admin</span>',
}


def settings_rail(active):
    items = [("clients", "Clients", "users", '<span class="count">4</span>'), ("observability", "Observability", "activity", ""), ("settings", "Settings", "settings", "")]
    links = "".join(
        f'<a href="#"{" class=\"on\" aria-current=\"page\"" if key == active else ""}>{icon(name)}{label}{count}</a>'
        for key, label, name, count in items
    )
    return f'<nav class="rail material" aria-label="Admin">{links}</nav>'


def settings_tabs_bar(active):
    items = [("clients", "Clients", "users"), ("observability", "Observability", "activity"), ("settings", "Settings", "settings")]
    links = "".join(
        f'<a href="#"{" class=\"on\" aria-current=\"page\"" if key == active else ""}>{icon(name)}{label}</a>'
        for key, label, name in items
    )
    return f'<nav class="tabbar admin-tabs material" aria-label="Admin" style="grid-template-columns:repeat(3,minmax(0,1fr))">{links}</nav>'


def settings_shell(title, tab, body, overlay=""):
    """The admin's own settings, outside any client: same kit as clients/observability, third rail item on."""
    content = f"<style>{admin_screens.CSS}{CSS}</style>{body}{settings_tabs_bar('settings')}"
    html = page(title, content, workspace=False, overlay=overlay)
    html = html.replace('<main class="solo">', f'{settings_rail("settings")}\n<main>')
    return admin_screens.admin_topbar(html)


def settings_needs():
    """The same at-a-glance tile strip as the clients list. The owner liked it -- keep it."""
    tiles = [
        ("tint", "users-round", "2", "admins", "Alex Morgan and Priya Shah can sign in as an admin.", "Manage team"),
        ("warn", "mail", "1", "invite pending", "Jordan Lee, invited 2 days ago.", "Resend or cancel"),
        ("tint", "link", "1", "channel connected", "Discord. Add Slack or WhatsApp to route alerts there too.", "Manage channels"),
    ]
    html = "".join(
        f'<a class="panel need" href="#"><span class="icon-wrap {tone}">{icon(name)}</span>'
        f'<p class="n">{n}<small>{label}</small></p><p class="type-label detail">{detail}</p>'
        f'<span class="link">{link}{icon("chevron-right")}</span></a>'
        for tone, name, n, label, detail, link in tiles
    )
    return f'<section class="adm-needs set-needs" aria-label="Settings at a glance">{html}</section>'


def set_tabs(active):
    tabs = [("team", "Team", "users-round"), ("notifications", "Notifications", "bell")]
    links = "".join(f'<a href="#"{" class=\"on\"" if key == active else ""}>{icon(name)}{label}</a>' for key, label, name in tabs)
    return f'<nav class="set-tabs" aria-label="Settings sections">{links}</nav>'


def team_row(name, email, initials, role, status):
    avatar_cls = "person-avatar" if status == "active" else "person-avatar invited"
    action = "" if role == "owner" else f'<button class="btn btn-ghost sm btn-remove pressable" aria-label="Remove {name}">{icon("trash")}Remove</button>'
    return f"""<div class="team-row">
  <span class="{avatar_cls}">{initials}</span>
  <div class="person"><b>{name}{' (you)' if role == 'owner' else ''}</b><span class="email">{email}</span></div>
  <span class="role">{ROLE_BADGE[role]}</span>
  <span class="act">{action}</span>
</div>"""


def pending_row():
    name, email, role = PENDING
    return f"""<div class="team-row">
  <span class="person-avatar invited">{icon("mail")}</span>
  <div class="person"><b>{name}</b><span class="email">{email}</span></div>
  <span class="role">{STATUS['invited']}</span>
  <span class="act"><span class="pending-note">{icon("clock")}Invited 2 days ago</span></span>
</div>"""


def settings_header(actions=""):
    return build.header("Settings", "Your agency&rsquo;s team and what Cadence emails you about.", actions)


def team_body():
    rows = "".join(team_row(*t) for t in TEAM) + pending_row()
    invite = f'<button class="btn btn-default pressable">{icon("user-plus")}Invite a teammate</button>'
    return f"""{settings_header(invite)}
<div class="set-wrap">{settings_needs()}{set_tabs("team")}
<section class="panel">{card_head("Your team", "Everyone at The Scale Agency who can sign in as an admin. Admins see every client.", "2", "admins")}
  {rows}
</section></div>"""


def channel_row(key, name, detail, color, connected, connect_label):
    logo_cls = "logo-badge" if connected else "logo-badge mono"
    style = f' style="background:{color}"' if connected else ""
    if connected:
        action = f'<span class="badge badge-success" style="margin-left:auto">{icon("check")}Connected</span><button class="btn btn-ghost sm pressable" style="margin-left:0.5rem">Disconnect</button>'
    else:
        action = f'<button class="btn btn-outline pressable" style="margin-left:auto">{connect_label}</button>'
    return f"""<section class="panel account"><span class="{logo_cls}"{style}>{icon(CHANNEL_ICON[key])}</span>
  <div style="flex:1;min-width:12rem"><p style="font-weight:600">{name}</p><p class="chan-detail">{detail}</p></div>
  {action}
</section>"""


def channels_body():
    email_line = f'<div class="email-line"><span class="icon-wrap">{icon("mail")}</span><span><b>Email</b> is on by default, sent to every admin&rsquo;s own inbox. Turn it off per alert below.</span></div>'
    rows = "".join([
        channel_row("discord", "Discord", f"{icon('link')} Webhook to #cadence-alerts", "#5865f2", True, "Connect Discord"),
        channel_row("slack", "Slack", "Not connected. Paste a webhook URL to route alerts to a channel.", "", False, "Connect Slack"),
        channel_row("whatsapp", "WhatsApp", "Not connected. Needs a WhatsApp Business number and API token.", "", False, "Connect WhatsApp"),
    ])
    return f'<section class="channels-panel panel">{card_head("Channels", "Add somewhere besides email for Cadence to send alerts.", "1", "connected")}{email_line}{rows}</section>'


ALERTS = [
    ("alert", "Observability alerts", "A run fails, a client&rsquo;s connection breaks, or the server needs attention.", {"email": True, "discord": True, "slack": False, "whatsapp": False}),
    ("bell", "A new client is onboarded", "Their brand kit is drafted and their first month is ready to check.", {"email": True, "discord": False, "slack": False, "whatsapp": False}),
    ("shield", "A client&rsquo;s questions are ready to check", "Before their research starts, in case something needs a fix first.", {"email": True, "discord": True, "slack": False, "whatsapp": False}),
    ("mail", "Weekly summary across every client", "Monday morning: what shipped, what needs you.", {"email": False, "discord": True, "slack": False, "whatsapp": False}),
]


def chan_toggle(key, on):
    label = key.capitalize()
    return (
        f'<label class="chan-toggle">{icon(CHANNEL_ICON[key])}<span style="flex:1">{label}</span>'
        f'<span class="switch{" on" if on else ""}" role="switch" aria-checked="{"true" if on else "false"}"><span></span></span></label>'
    )


def alert_row(name, title, detail, routing):
    # Only connected channels get a toggle; connect one above and it appears as an option on every alert.
    toggles = "".join(chan_toggle(key, on) for key, on in routing.items() if CHANNELS[key])
    return f"""<div class="alert-row"><span class="icon-wrap">{icon(name)}</span>
  <div class="body"><p style="font-weight:500">{title}</p><p class="type-label" style="margin-top:0.25rem">{detail}</p></div>
  <div class="chan-row">{toggles}</div>
</div>"""


def alerts_body():
    rows = "".join(alert_row(*a) for a in ALERTS)
    return f"""<section class="panel">{card_head("Alerts", "Pick which connected channels each kind of alert goes to.", "4", "kinds")}
  {rows}
  <p class="alerts-note">Connect Slack or WhatsApp above and they show up here too. Sign-in and account alerts (new device, two-factor changes) are personal and stay in <b>Your account</b>, from the account menu.</p>
</section>"""


def notif_body():
    return f"""{settings_header()}
<div class="set-wrap">{settings_needs()}{set_tabs("notifications")}
{channels_body()}
{alerts_body()}
</div>"""


def invite_teammate_dialog():
    name = field("Name", '<span class="placeholder">Jordan Lee</span>')
    email = field("Email", '<span class="placeholder">jordan@thescaleagency.org</span>')
    role = field("Role", 'Admin<span class="caret"></span>')
    return f"""<div class="scrim"></div>
<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="invite-team-title">
  <div class="dlg-body">
    <div class="dlg-head"><div><h2 class="type-heading" id="invite-team-title">Invite a teammate</h2><p class="type-label">They sign in as an admin and see every client, same as you.</p></div><button class="icon-close" aria-label="Close">{icon("x")}</button></div>
    {name}{email}{role}
    <div class="what-next"><p>{icon("mail")}<span>They get an email with a link to sign in. They show up here as Invited until they do.</span></p></div>
  </div>
  <div class="dlg-foot"><button class="btn btn-outline pressable">Cancel</button><button class="btn btn-default pressable">{icon("send")}Send invite</button></div>
</div>"""


def connect_webhook_dialog(name, color, how_line):
    url = field("Webhook URL", '<span class="placeholder">https://…/webhooks/…</span>')
    return f"""<div class="scrim"></div>
<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="connect-{name.lower()}-title">
  <div class="dlg-body">
    <div class="dlg-head"><span class="logo-badge" style="background:{color};margin-right:0.875rem">{icon(CHANNEL_ICON[name.lower()])}</span><div><h2 class="type-heading" id="connect-{name.lower()}-title">Connect {name}</h2><p class="type-label">{how_line}</p></div><button class="icon-close" aria-label="Close">{icon("x")}</button></div>
    {url}
    <div class="what-next"><p>{icon("shield")}<span>The webhook only receives Cadence alerts; it can&rsquo;t read anything back from {name}.</span></p></div>
  </div>
  <div class="dlg-foot"><button class="btn btn-outline pressable">Cancel</button><button class="btn btn-default pressable">{icon("link")}Connect {name}</button></div>
</div>"""


def connect_whatsapp_dialog():
    phone = field("WhatsApp Business number", '<span class="placeholder">+1 415 555 0132</span>')
    token = field("API token", '<span class="placeholder">From your WhatsApp Business API provider</span>')
    return f"""<div class="scrim"></div>
<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="connect-whatsapp-title">
  <div class="dlg-body">
    <div class="dlg-head"><span class="logo-badge" style="background:#25d366;margin-right:0.875rem">{icon("phone")}</span><div><h2 class="type-heading" id="connect-whatsapp-title">Connect WhatsApp</h2><p class="type-label">Needs a WhatsApp Business API number, not a personal WhatsApp account.</p></div><button class="icon-close" aria-label="Close">{icon("x")}</button></div>
    {phone}{token}
    <div class="what-next"><p>{icon("shield")}<span>The token only sends Cadence alerts to this number; it can&rsquo;t read your WhatsApp messages.</span></p></div>
  </div>
  <div class="dlg-foot"><button class="btn btn-outline pressable">Cancel</button><button class="btn btn-default pressable">{icon("link")}Connect WhatsApp</button></div>
</div>"""


def team():
    return settings_shell("Admin: settings, team", "team", team_body())


def team_invite():
    return settings_shell("Admin: settings, invite a teammate", "team", team_body(), overlay=invite_teammate_dialog())


def notifications():
    return settings_shell("Admin: settings, notifications", "notifications", notif_body())


def connect_slack():
    overlay = connect_webhook_dialog("Slack", "#4a154b", "Create an incoming webhook in Slack, then paste its URL here.")
    return settings_shell("Admin: settings, connect Slack", "notifications", notif_body(), overlay=overlay)


def connect_whatsapp():
    return settings_shell("Admin: settings, connect WhatsApp", "notifications", notif_body(), overlay=connect_whatsapp_dialog())


SCREENS = {
    "adm7-v1-team": team,
    "adm7-v1-team-invite": team_invite,
    "adm7-v1-notifications": notifications,
    "adm7-v1-connect-slack": connect_slack,
    "adm7-v1-connect-whatsapp": connect_whatsapp,
}


def main():
    OUT.mkdir(exist_ok=True)
    for name, make in SCREENS.items():
        (OUT / f"{name}.html").write_text(make(), encoding="utf-8")
    print(f"wrote {len(SCREENS)} screens to {OUT}")


if __name__ == "__main__":
    main()
