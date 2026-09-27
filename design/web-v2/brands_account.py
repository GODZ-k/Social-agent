"""Your brands page (/) and the client account page, v1.

Run from design/web-v2: python brands_account.py
Writes screens-brands-account/ba-v1-<screen>.html. Builds on the approved header (header_design.py), the
admin brand cards (admin_screens.py, ADM-3) and the AUTH-7 manage screen (auth_2fa.py) without editing them:
their helpers and CSS are imported, and the few new pieces below are injected as one extra <style>.
"""

from pathlib import Path

import admin_screens
import auth_2fa
import build
import header_design as hdr
from auth_2fa import method_row, remove_button
from build import icon

OUT = Path(__file__).parent / "screens-brands-account"
CLIENT_NAME, CLIENT_EMAIL, CLIENT_INITIALS = hdr.CLIENT_USER
LOOP = admin_screens.LOOP

BA_CSS = """
/* Your brands: one card per brand, tinted by that brand's own colour, what needs the owner first. */
.brands-page { max-width: 76rem; }
.brands-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1.75rem; }
.brands-head p { margin-top: 0.375rem; color: var(--muted-foreground); }
.brands-head .btn { flex: none; }
.brand-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr)); gap: 1.25rem; }
.bc { align-content: start; }
.bc-where.phone { display: none; }

.bc { position: relative; display: grid; gap: 1.125rem; padding: 1.375rem 1.5rem 1.25rem; border-radius: 1.5rem; background: var(--card); box-shadow: var(--elevation-raised); transition: box-shadow 160ms ease; }
.bc:hover { box-shadow: var(--elevation-floating); }
.bc:has(.bc-open:focus-visible) { outline: 2px solid var(--brand); outline-offset: 3px; }
.bc-top { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 0.875rem; align-items: center; }
.bc-mark { display: grid; place-items: center; width: 3rem; height: 3rem; border-radius: 1rem; background: var(--brand); color: var(--mark-ink, #fff); font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; }
.bc-name { font-family: var(--font-display); font-size: 1.1875rem; font-weight: 600; letter-spacing: -0.015em; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bc-open { color: inherit; outline: none; }
.bc-open::after { content: ""; position: absolute; inset: 0; border-radius: inherit; }
.bc-site { font-size: 0.8125rem; color: var(--muted-foreground); }
.bc-go { display: grid; place-items: center; width: 2.25rem; height: 2.25rem; border-radius: 999px; background: var(--secondary); color: var(--foreground); }
.bc:hover .bc-go { background: var(--brand); color: var(--mark-ink, #fff); }
.bc .loop { grid-template-columns: repeat(6, minmax(0, 1fr)); row-gap: 0; }
.bc-go .i { width: 1rem; height: 1rem; }
.bc .loop-step p { font-size: 0.75rem; }
.bc-where { font-size: 0.8125rem; color: var(--muted-foreground); margin-top: -0.375rem; }
.bc-where b { color: var(--foreground); font-weight: 500; }

/* What needs the owner: each line is its own action, above the card's open link. */
.bc-needs { display: grid; gap: 0.375rem; }
.need-line { position: relative; z-index: 1; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 0.75rem; align-items: center; min-height: 3rem; padding: 0.5rem 0.5rem 0.5rem 0.75rem; border-radius: 1rem; background: rgba(183, 116, 10, 0.08); font-size: 0.875rem; }
.need-line .ni { display: grid; place-items: center; width: 1.75rem; height: 1.75rem; border-radius: 999px; background: rgba(183, 116, 10, 0.14); color: var(--warning); }
.need-line .ni .i { width: 0.875rem; height: 0.875rem; }
.need-line b { font-weight: 600; }
.need-line small { display: block; color: var(--muted-foreground); font-size: 0.75rem; }
.need-line .btn { background: var(--card); }
.all-set { display: flex; align-items: center; gap: 0.625rem; min-height: 3rem; padding: 0.5rem 0.75rem; border-radius: 1rem; background: rgba(23, 138, 94, 0.08); font-size: 0.875rem; }
.all-set .i { width: 1rem; height: 1rem; color: var(--success); flex: none; }
.all-set span { color: var(--muted-foreground); }
.all-set b { color: var(--foreground); font-weight: 500; }

/* A brand still being set up: no loop yet, the onboarding step it stopped at and one way back in. */
.bc.setup { background: #fbfbfd; box-shadow: 0 0 0 1.5px var(--border); }
.bc.setup .bc-mark { background: var(--secondary); color: var(--muted-foreground); }
.setup-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.5rem; }
.setup-steps .track { height: 0.375rem; border-radius: 999px; background: var(--secondary); }
.setup-steps .done .track { background: #b9b3f5; }
.setup-steps .now .track { background: var(--brand); }
.setup-steps p { margin-top: 0.5rem; font-size: 0.75rem; color: var(--muted-foreground); }
.setup-steps .now p { color: var(--foreground); font-weight: 500; }
.setup-foot { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 1rem; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border); font-size: 0.875rem; }
.setup-foot p { font-weight: 500; }
.setup-foot small { display: block; margin-top: 0.125rem; color: var(--muted-foreground); font-size: 0.8125rem; font-weight: 400; }

/* Add a brand: a quiet tile at the end of the grid, the same size as a card. */
.add-tile { display: grid; place-content: center; justify-items: center; gap: 0.625rem; min-height: 15rem; padding: 1.5rem; border-radius: 1.5rem; border: 1.5px dashed var(--input); color: var(--muted-foreground); text-align: center; font-size: 0.875rem; line-height: 1.45; }
.add-tile:hover { background: var(--card); border-color: var(--brand); color: var(--foreground); }
.add-tile .plus { display: grid; place-items: center; width: 3rem; height: 3rem; border-radius: 1rem; background: var(--tint); color: var(--tint-foreground); }
.add-tile b { color: var(--foreground); font-size: 1rem; font-weight: 600; }
.add-tile span { max-width: 18rem; }

/* Client account page: one column, the AUTH-7 rows, opened from the account menu. */
.acct-page { max-width: 48rem; }
.acct-page .acct-wrap { max-width: none; }
.acct-page .panel { padding: 1.5rem; }
.tf-off { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 0.25rem 0.875rem; align-items: center; padding: 1rem 0 0.25rem; border-top: 1px solid var(--border); }
.tf-off .ri { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 0.875rem; background: var(--secondary); color: var(--muted-foreground); }
.tf-off .mt { font-weight: 500; }
.tf-off .btn { width: auto; }
.tf-why { display: grid; gap: 0.5rem; margin-top: 1rem; padding: 1rem; border-radius: 1rem; background: #f7f8fa; font-size: 0.8125rem; line-height: 1.45; color: var(--muted-foreground); }
.tf-why p { display: flex; gap: 0.5rem; align-items: flex-start; }
.tf-why .i { width: 0.9rem; height: 0.9rem; flex: none; margin-top: 0.15rem; }
.sec-foot.split { justify-content: space-between; }
.mrow .acts:empty { display: none; }
.device-row .ri { background: var(--secondary); color: var(--muted-foreground); }
.here { display: inline-flex; align-items: center; height: 1.375rem; padding: 0 0.5rem; border-radius: 999px; background: rgba(23, 138, 94, 0.12); color: var(--success); font-size: 0.6875rem; font-weight: 600; }
.edit-form { display: grid; gap: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); }
.edit-form .form-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; align-items: start; }
.edit-form .field { align-content: start; }
.edit-form .input.on { border-color: var(--brand); box-shadow: 0 0 0 3px var(--tint-strong); }
.edit-form .caret { width: 1.5px; height: 1.125rem; background: var(--brand); margin-left: -0.375rem; }
.edit-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
.edit-actions .btn { width: auto; }
.dlg ul.devices { display: grid; gap: 0.375rem; padding: 0; margin: 0; list-style: none; font-size: 0.875rem; }
.dlg ul.devices li { display: flex; align-items: center; gap: 0.5rem; }
.dlg ul.devices .i { width: 1rem; height: 1rem; color: var(--muted-foreground); }

@media (max-width: 767px) {
  .edit-form .form-row { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 560px) {
  .brands-head { margin-bottom: 1.25rem; }
  .brands-head .btn { width: 100%; }
  .bc { padding: 1.125rem 1.125rem 1rem; border-radius: 1.25rem; }
  .bc-mark { width: 2.75rem; height: 2.75rem; border-radius: 0.875rem; }
  .bc .loop { gap: 0.3125rem; }
  .bc .loop-step p { display: none; }
  .bc-where { margin-top: -0.25rem; }
  .need-line { grid-template-columns: auto minmax(0, 1fr); padding: 0.625rem 0.75rem; }
  .need-line .btn { grid-column: 2; justify-self: start; }
  .setup-steps p { display: none; }
  .bc-where.phone { display: block; }
  .bc.setup .bc-top { grid-template-columns: auto minmax(0, 1fr); }
  .bc.setup .bc-top .badge { grid-column: 2; justify-self: start; margin-top: -0.5rem; }
  .setup-foot { grid-template-columns: minmax(0, 1fr); }
  .setup-foot .btn { width: 100%; }
  .add-tile { min-height: 0; grid-template-columns: auto minmax(0, 1fr); place-content: stretch; justify-items: start; align-items: center; text-align: left; column-gap: 0.875rem; padding: 1rem 1.125rem; }
  .add-tile .plus { grid-row: span 2; width: 2.75rem; height: 2.75rem; }
  .acct-page .panel { padding: 1.125rem; }
  .tf-off { grid-template-columns: auto minmax(0, 1fr); }
  .tf-off .btn { grid-column: 1 / -1; width: 100%; margin-top: 0.75rem; }
  .edit-actions { flex-direction: column-reverse; }
  .edit-actions .btn { width: 100%; }
}
@media (prefers-reduced-motion: reduce) { .bc { transition: none; } }
"""

# ---------- Your brands ----------

# (name, site, letter, colour, light colour for the done steps, letter ink, loop step, needs, all-set line)
LIVE_BRANDS = [
    ("Tartinebakery", "tartinebakery.com", "T", "#2f6fde", "#97b7ef", "#fff", 3,
     [("clock", "5 posts to approve", "The first goes out Fri 9 Oct, 5:00 PM", "Approve posts")], ""),
    ("Meow Meow Tweet", "meowmeowtweet.com", "M", "#c93f37", "#f2a7a1", "#fff", 3,
     [("clock", "2 posts to approve", "The first goes out tomorrow, 9:00 AM", "Approve posts"),
      ("alert", "Facebook connection expired", "Posts for Facebook wait until you reconnect", "Reconnect")], ""),
    ("Bar Tartine", "bartartine.com", "B", "#f2b441", "#f8d995", "#1c2433", 5, [],
     "Next post Thu 8 Oct, 6:00 PM. Last week&rsquo;s posts reached 2,140 people."),
]
WHERE = {3: "Waiting for your approval", 5: "Learning from last week&rsquo;s posts"}


def need_line(ic, title, detail, action):
    return (f'<div class="need-line"><span class="ni">{icon(ic)}</span><div><b>{title}</b><small>{detail}</small></div>'
            f'<a class="btn btn-outline sm pressable" href="#">{action}</a></div>')


def brand_card(brand):
    name, site, letter, colour, light, ink, stage, needs, all_set = brand
    loop = admin_screens.loop_track(stage)
    if needs:
        status = '<div class="bc-needs">' + "".join(need_line(*n) for n in needs) + "</div>"
    else:
        status = f'<p class="all-set">{icon("check-circle")}<span><b>Nothing needs you.</b> {all_set}</span></p>'
    style = f"--brand:{colour};--brand-2:{light};--mark-ink:{ink}"
    return f"""<article class="bc" style="{style}" aria-labelledby="b-{letter}{stage}">
  <div class="bc-top"><span class="bc-mark" aria-hidden="true">{letter}</span>
    <div style="min-width:0"><a class="bc-open" href="#" id="b-{letter}{stage}"><h2 class="bc-name">{name}</h2></a><p class="bc-site">{site}</p></div>
    <span class="bc-go" aria-hidden="true">{icon("arrow-right")}</span></div>
  {loop}
  <p class="bc-where">Now: <b>{WHERE[stage]}</b></p>
  {status}
</article>"""


def setup_card():
    names = ["Read your website", "Check your brand kit", "Get your first month"]
    steps = "".join(
        f'<div class="{"done" if i < 2 else "now"}"><div class="track"></div><p>{n}</p></div>' for i, n in enumerate(names)
    )
    return f"""<article class="bc setup" aria-labelledby="b-setup">
  <div class="bc-top"><span class="bc-mark" aria-hidden="true">T</span>
    <div style="min-width:0"><h2 class="bc-name" id="b-setup">Tartine Manufactory</h2><p class="bc-site">tartinemanufactory.com</p></div>
    <span class="badge badge-tint">{icon("clock")}Setting up</span></div>
  <div class="setup-steps" aria-label="Setup, step 3 of 3: Get your first month">{steps}</div>
  <p class="bc-where phone">Step 3 of 3: <b>Get your first month</b></p>
  <div class="setup-foot"><div><p>4 of 9 questions answered</p><small>The agent plans your first month from your answers. Pick up where you left off.</small></div>
    <a class="btn btn-default pressable" href="#">Continue setup</a></div>
</article>"""


def add_tile():
    return (f'<a class="add-tile" href="#"><span class="plus">{icon("plus")}</span><b>Add a brand</b>'
            '<span>Paste its website. The agent reads it and drafts a brand kit for you to check.</span></a>')


def brands_body(setting_up=False):
    cards = [brand_card(b) for b in LIVE_BRANDS]
    if setting_up:
        cards.insert(2, setup_card())
    count = len(cards)
    lede = f"{count} brands. Two need you today."
    return f"""<div class="brands-page">
<header class="brands-head"><div><h1 class="type-title">Your brands</h1><p>{lede}</p></div>
  <a class="btn btn-default pressable" href="#">{icon("plus")}Add a brand</a></header>
<div class="brand-grid">{"".join(cards)}{add_tile()}</div>
</div>"""


def brands_bar():
    return hdr.bar("", hdr.avatar(hdr.CLIENT_USER))


def brands_page(title, setting_up=False):
    body = f"<style>{BA_CSS}</style>" + brands_body(setting_up)
    return hdr.document(title, brands_bar(), body, body_class="", solo=True)


# ---------- Client account ----------

def two_factor_off():
    return f"""<section class="panel" aria-labelledby="tf-title">
  <div class="card-head"><div><h2 class="type-heading req" id="tf-title">Two-factor sign-in <span class="badge badge-neutral">Off</span></h2>
    <p class="type-label">A second step after your password. If your password leaks, no one can post or approve in your brand&rsquo;s name without it.</p></div></div>
  <div class="tf-off"><span class="ri">{icon("shield")}</span><div><p class="mt">Two-factor is off</p><p class="type-label">Takes about a minute. Use a passkey or an authenticator app.</p></div>
    <button class="btn btn-default sm pressable">Turn on two-factor</button></div>
  <div class="tf-why"><p>{icon("key")}<span>A passkey uses your fingerprint, face or device PIN. Nothing to type.</span></p>
    <p>{icon("list")}<span>You also get 10 backup codes, for when your phone or computer isn&rsquo;t with you.</span></p></div>
</section>"""


def two_factor_on():
    on = f'<span class="badge badge-success">{icon("check")}On</span>'
    passkey = method_row("key", "Passkey on MacBook Pro", "Added 27 Sep. Last used today, 9:12 AM.", remove_button("passkey on MacBook Pro"))
    app = method_row("smartphone", "Authenticator app", "Added 27 Sep. Last used 3 days ago.", remove_button("authenticator app"))
    codes = method_row("list", "Backup codes", "9 of 10 left. Made 27 Sep. Each works once.", '<button class="btn btn-outline sm pressable">Make new codes</button>', plain=True)
    foot = (f'<div class="sec-foot split"><button class="btn btn-outline sm pressable">{icon("plus")}Add another passkey</button>'
            '<button class="btn btn-ghost sm btn-remove pressable">Turn off two-factor</button></div>')
    return f"""<section class="panel" aria-labelledby="tf-title">
  <div class="card-head"><div><h2 class="type-heading req" id="tf-title">Two-factor sign-in {on}</h2>
    <p class="type-label">A second step after your password, so no one can post or approve in your brand&rsquo;s name with your password alone.</p></div></div>
  {passkey}{app}{codes}{foot}
</section>"""


def details_panel(editing=False):
    head = build.card_head("Details", "Only you and Cadence support see these.")
    if not editing:
        row = method_row("users-round", CLIENT_NAME, CLIENT_EMAIL, '<button class="btn btn-outline sm pressable">Edit</button>', plain=True)
        return f'<section class="panel">{head}{row}</section>'
    return f"""<section class="panel">{head}
  <form class="edit-form" aria-label="Edit your details">
    <div class="form-row">
      <div class="field"><label for="f-name">Name</label><div class="input" id="f-name">{CLIENT_NAME}</div></div>
      <div class="field"><label for="f-email">Email</label><div class="input on" id="f-email">maya@tartine.co<span class="caret"></span></div>
        <p class="help">We email a link to the new address. It changes once you open the link.</p></div>
    </div>
    <div class="edit-actions"><button type="button" class="btn btn-outline pressable">Cancel</button><button type="button" class="btn btn-default pressable">Save changes</button></div>
  </form>
</section>"""


DEVICES = [
    ("monitor", "MacBook Pro, Safari", "San Francisco. Active now.", True),
    ("smartphone", "iPhone, Safari", "San Francisco. Last active 2 hours ago.", False),
    ("monitor", "Windows PC, Chrome", "Oakland. Last active 12 Sep.", False),
]


def devices_panel():
    rows = ""
    for ic, name, detail, here in DEVICES:
        title = f'{name} <span class="here">This device</span>' if here else name
        rows += f'<div class="device-row">{method_row(ic, title, detail, "", plain=True)}</div>'
    foot = f'<div class="sec-foot"><button class="btn btn-outline sm pressable">{icon("log-out")}Sign out other devices</button></div>'
    return f'<section class="panel">{build.card_head("Where you&rsquo;re signed in", "Sign out anywhere you don&rsquo;t recognise, then change your password.")}{rows}{foot}</section>'


def account_body(two_factor="off", editing=False):
    password = method_row("lock", "Password", "Changed 12 Sep.", '<button class="btn btn-outline sm pressable">Change password</button>', plain=True)
    tf = two_factor_on() if two_factor == "on" else two_factor_off()
    return f"""<div class="acct-page">
{build.header("Your account", "Your details and how you sign in. The same for every brand you own.")}
<div class="acct-wrap">
  {details_panel(editing)}
  <section class="panel">{build.card_head("Password", "At least 10 characters, not common or leaked.")}{password}</section>
  {tf}
  {devices_panel()}
</div></div>"""


def account_bar():
    start = f'<span class="topbar-sep"></span><a class="back keep pressable" href="#">{icon("chevron-left")}<span class="label">Back to Tartinebakery</span></a>'
    return hdr.bar(start, hdr.avatar(hdr.CLIENT_USER))


def account_page(title, body, overlay=""):
    css = f"<style>{admin_screens.CSS}{auth_2fa.ACCOUNT_CSS}{BA_CSS}</style>"
    return hdr.document(title, account_bar(), css + body + overlay, body_class="", solo=True)


def dialog(mark_cls, ic, title, desc, extra, cancel, confirm, confirm_cls="btn-danger"):
    return f"""<div class="scrim"></div>
<div class="dlg" role="alertdialog" aria-modal="true" aria-labelledby="d-title" aria-describedby="d-desc">
  <div class="dlg-body">
    <div class="mark {mark_cls}">{icon(ic)}</div>
    <div><h2 class="type-heading" id="d-title">{title}</h2>
    <p class="type-label" id="d-desc" style="margin-top:0.375rem;color:var(--foreground)">{desc}</p></div>
    {extra}
  </div>
  <div class="dlg-foot"><button class="btn btn-outline pressable">{cancel}</button><button class="btn {confirm_cls} pressable">{confirm}</button></div>
</div>"""


def sign_out_dialog():
    items = "".join(f"<li>{icon(ic)}{name}</li>" for ic, name, _, here in DEVICES if not here)
    extra = f'<ul class="devices">{items}</ul><div class="what-next"><p>{icon("lock")}<span>You stay signed in here. Next time, those devices ask for your password.</span></p></div>'
    return dialog("bad", "log-out", "Sign out 2 other devices?", "Anyone using them is signed out at once.", extra, "Cancel", "Sign out 2 devices")


def turn_off_dialog():
    extra = (f'<div class="what-next"><p>{icon("shield")}<span>We ask for a code from your authenticator app to confirm.</span></p>'
             f'<p>{icon("trash")}<span>Your passkey, authenticator app and backup codes are removed.</span></p>'
             f'<p>{icon("mail")}<span>We email {CLIENT_EMAIL} that two-factor is off.</span></p></div>')
    return dialog("bad", "shield", "Turn off two-factor?",
                  "You&rsquo;ll sign in with your password only. If it leaks, someone could post or approve in your brand&rsquo;s name.",
                  extra, "Keep two-factor", "Turn off")


SCREENS = {
    "brands": lambda: brands_page("Your brands"),
    "brands-setting-up": lambda: brands_page("Your brands: one being set up", setting_up=True),
    "account": lambda: account_page("Your account", account_body("off")),
    "account-2fa-on": lambda: account_page("Your account: two-factor on", account_body("on")),
    "account-edit-details": lambda: account_page("Your account: edit details", account_body("off", editing=True)),
    "account-sign-out-devices": lambda: account_page("Your account: sign out other devices", account_body("on"), sign_out_dialog()),
    "account-2fa-turn-off": lambda: account_page("Your account: turn off two-factor", account_body("on"), turn_off_dialog()),
}


def main():
    OUT.mkdir(exist_ok=True)
    for name, make in SCREENS.items():
        (OUT / f"ba-v1-{name}.html").write_text(make(), encoding="utf-8")
    print(f"wrote {len(SCREENS)} screens to {OUT}")


if __name__ == "__main__":
    main()
