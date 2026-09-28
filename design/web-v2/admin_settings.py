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
.set-wrap { max-width: 44rem; }
.set-tabs { display: flex; gap: 0.25rem; width: fit-content; max-width: 100%; padding: 0.25rem; border-radius: 999px; background: var(--secondary); margin-bottom: 1.5rem; }
.set-tabs a { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.125rem; border-radius: 999px; font-size: 0.875rem; font-weight: 500; color: var(--muted-foreground); }
.set-tabs a.on { background: var(--card); color: var(--foreground); box-shadow: var(--elevation-raised); }

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
.invite-foot { display: flex; justify-content: flex-end; padding-top: 1.25rem; }
.pending-note { display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; color: var(--muted-foreground); }
.pending-note .i { width: 0.875rem; height: 0.875rem; }

/* Notifications: reuses the shared .toggle-row/.switch from the onboarding preferences panel. */
.notif-note { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); font-size: 0.8125rem; color: var(--muted-foreground); }
"""

build.obs.ICONS.setdefault("shield", '<path d="M12 2 4 5v6c0 5.5 3.4 9.7 8 11 4.6-1.3 8-5.5 8-11V5z"/>')

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


def team_body():
    rows = "".join(team_row(*t) for t in TEAM) + pending_row()
    return f"""{build.header("Settings", "Your agency&rsquo;s team and what Cadence emails you about.")}
<div class="set-wrap">{set_tabs("team")}
<section class="panel">{card_head("Your team", "Everyone at The Scale Agency who can sign in as an admin. Admins see every client.")}
  {rows}
  <div class="invite-foot"><button class="btn btn-default pressable">{icon("user-plus")}Invite a teammate</button></div>
</section></div>"""


def notif_body():
    rows = [
        ("bell", "A new client signs up", "Right after they accept an invite and finish onboarding.", True),
        ("shield", "A client&rsquo;s questions are ready to check", "Before their research starts, in case something needs a fix first.", True),
        ("alert", "A scan or research run fails", "So you can retry it before the client notices.", True),
        ("mail", "Weekly summary across every client", "Monday morning: what shipped, what needs you.", True),
    ]
    toggles = "".join(
        f'<div class="toggle-row"><div><p style="font-weight:500">{icon(i)} {t}</p><p class="type-label" style="margin-top:0.25rem">{d}</p></div>'
        f'<span class="switch{" on" if on else ""}" role="switch" aria-checked="{"true" if on else "false"}"><span></span></span></div>'
        for i, t, d, on in rows
    )
    return f"""{build.header("Settings", "Your agency&rsquo;s team and what Cadence emails you about.")}
<div class="set-wrap">{set_tabs("notifications")}
<section class="panel">{card_head("Email alerts", "Sent to every admin&rsquo;s own email, not a shared inbox.")}
  {toggles}
  <p class="notif-note">Sign-in and account alerts (new device, two-factor changes) are personal and stay in <b>Your account</b>, from the account menu.</p>
</section></div>"""


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


def team():
    return settings_shell("Admin: settings, team", "team", team_body())


def team_invite():
    return settings_shell("Admin: settings, invite a teammate", "team", team_body(), overlay=invite_teammate_dialog())


def notifications():
    return settings_shell("Admin: settings, notifications", "notifications", notif_body())


SCREENS = {
    "adm7-v1-team": team,
    "adm7-v1-team-invite": team_invite,
    "adm7-v1-notifications": notifications,
}


def main():
    OUT.mkdir(exist_ok=True)
    for name, make in SCREENS.items():
        (OUT / f"{name}.html").write_text(make(), encoding="utf-8")
    print(f"wrote {len(SCREENS)} screens to {OUT}")


if __name__ == "__main__":
    main()
