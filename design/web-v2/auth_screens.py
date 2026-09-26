"""Auth screens for the Cadence web redesign: our own sign-in, sign-up, email code, password reset and invite.

Run from design/web-v2: python auth_screens.py
Writes screens-auth/auth-v1-<screen>.html. Reuses the tokens, icons and post art from build.py.
"""

from pathlib import Path

import build
from build import art, icon, sprite

OUT = Path(__file__).parent / "screens-auth"
EMAIL = "sam@tartinebakery.com"
ADMIN = "Priya Shah"

build.obs.ICONS.update({
    "eye": '<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
    "eye-off": '<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c4.8 0 8.9 3 10.5 7a13 13 0 0 1-1.67 2.68M6.61 6.61A13.53 13.53 0 0 0 1.5 12c1.6 4 5.7 7 10.5 7a9.74 9.74 0 0 0 5.39-1.61M9.88 9.88a3 3 0 1 0 4.24 4.24M2 2l20 20"/>',
    "mail": '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    "shield": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    "timer": '<path d="M10 2h4M12 14l3-3"/><circle cx="12" cy="14" r="8"/>',
    "link-off": '<path d="M9 17H7A5 5 0 0 1 7 7M15 7h2a5 5 0 0 1 4 8M8 12h4M2 2l20 20"/>',
    "circle": '<circle cx="12" cy="12" r="9"/>',
})

LOGO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="9" width="4.5" height="10" rx="2.25" fill="currentColor" opacity=".55"/><rect x="9.75" y="4" width="4.5" height="15" rx="2.25" fill="currentColor"/><rect x="16.5" y="7" width="4.5" height="12" rx="2.25" fill="currentColor" opacity=".8"/></svg>'
GOOGLE = '<svg viewBox="0 0 24 24" aria-hidden="true" class="g"><path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h5.9a5.05 5.05 0 0 1-2.2 3.3v2.75h3.55c2.08-1.92 3.25-4.74 3.25-8.08z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.55-2.75c-.99.66-2.25 1.06-3.73 1.06-2.87 0-5.3-1.94-6.16-4.54H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1a11 11 0 0 0-9.82 6.06L5.84 9.9C6.7 7.3 9.13 5.38 12 5.38z"/></svg>'

AUTH_CSS = """
body.auth { background: var(--background); }
.auth-page { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr); min-height: 100vh; min-height: 100dvh; }
.auth-main { display: flex; flex-direction: column; min-width: 0; padding: 1.75rem 2.5rem 1.5rem; }
.auth-top { display: flex; align-items: center; justify-content: space-between; gap: 1rem; min-height: 2.5rem; }
.auth-switch { font-size: 0.875rem; color: var(--muted-foreground); }
.text-link { color: var(--tint-foreground); font-weight: 500; text-decoration: underline; text-decoration-color: rgba(65, 56, 190, 0.35); text-underline-offset: 3px; }
.text-link:hover { text-decoration-color: var(--tint-foreground); }
.auth-body { flex: 1; display: flex; align-items: center; justify-content: center; padding: 3rem 0; }
.auth-form { width: 100%; max-width: 25rem; }
.auth-form h1 { font-family: var(--font-display); font-weight: 600; font-size: 2.125rem; line-height: 1.08; letter-spacing: -0.03em; text-wrap: balance; }
.auth-form .lede { margin-top: 0.625rem; color: var(--muted-foreground); font-size: 1rem; line-height: 1.5; }
.auth-form .lede b { color: var(--foreground); font-weight: 500; overflow-wrap: anywhere; }
.form-stack { display: grid; gap: 1.125rem; margin-top: 2rem; }
.form-stack.tight { margin-top: 1.5rem; }
.afield { display: grid; gap: 0.4375rem; min-width: 0; }
.afield .label-row { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; }
.afield label { font-size: 0.875rem; font-weight: 500; }
.afield .label-row a { font-size: 0.8125rem; }
.control { display: flex; align-items: center; min-height: 3rem; border-radius: 0.875rem; background: var(--card); box-shadow: 0 0 0 1px var(--input); transition: box-shadow 120ms ease; }
.control input { flex: 1; min-width: 0; height: 3rem; padding: 0 1rem; border: 0; border-radius: inherit; background: transparent; font: inherit; font-size: 1rem; color: var(--foreground); outline: none; }
.control input::placeholder { color: #8a92a2; }
.control input[type=password] { letter-spacing: 0.12em; }
.control:focus-within, .control.focus { box-shadow: 0 0 0 2px var(--brand), 0 0 0 6px var(--tint-strong); }
.control.invalid { box-shadow: 0 0 0 2px var(--destructive), 0 0 0 6px rgba(207, 63, 87, 0.12); }
.control.locked { background: var(--secondary); box-shadow: none; color: var(--muted-foreground); }
.control.locked input { color: var(--muted-foreground); }
.control .lead { display: flex; margin-left: 1rem; color: var(--muted-foreground); }
.control .lead + input { padding-left: 0.625rem; }
.control .toggle { display: grid; place-items: center; width: 2.75rem; height: 2.75rem; margin-right: 0.125rem; border-radius: 0.75rem; color: var(--muted-foreground); }
.control .toggle:hover { background: var(--accent); color: var(--foreground); }
.control .toggle .i { width: 1.125rem; height: 1.125rem; }
.control.busy { opacity: 0.6; }
.field-note { display: flex; align-items: flex-start; gap: 0.4375rem; font-size: 0.8125rem; line-height: 1.45; color: var(--muted-foreground); }
.field-note .i { width: 0.875rem; height: 0.875rem; margin-top: 0.15rem; }
.field-note.error { color: var(--destructive); }
.field-note.success { color: var(--success); }
.btn-block { width: 100%; height: 3rem; font-size: 0.9375rem; }
.btn-default[disabled] { background: #a8a2f0; box-shadow: none; cursor: progress; }
.btn-outline.btn-block { font-weight: 500; }
.spinner.light { border-color: rgba(255, 255, 255, 0.4); border-top-color: #fff; animation: spin 700ms linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.notice { display: flex; align-items: flex-start; gap: 0.625rem; margin-top: 1.5rem; padding: 0.875rem 1rem; border-radius: 1rem; font-size: 0.875rem; line-height: 1.45; }
.notice .i { margin-top: 0.15rem; }
.notice.error { background: rgba(207, 63, 87, 0.08); color: #a3293f; }
.notice.info { background: var(--tint); color: var(--tint-foreground); }
.notice.success { background: rgba(23, 138, 94, 0.1); color: #11694a; }
.notice.warning { background: rgba(183, 116, 10, 0.1); color: #8a5606; }
.notice .text-link { color: inherit; text-decoration-color: currentColor; }
.rules { list-style: none; padding: 0; display: grid; gap: 0.25rem; }
.rules li { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--muted-foreground); }
.rules .i { width: 0.875rem; height: 0.875rem; }
.rules li.rule-met { color: var(--success); }
.rules li.rule-fail { color: var(--destructive); }
.check-row { display: flex; align-items: flex-start; gap: 0.625rem; font-size: 0.875rem; }
.check-row .box { display: grid; place-items: center; width: 1.25rem; height: 1.25rem; flex: none; margin-top: 0.1rem; border-radius: 0.375rem; background: var(--brand); color: #fff; }
.check-row .box .i { width: 0.8rem; height: 0.8rem; stroke-width: 3; }
.check-row small { display: block; color: var(--muted-foreground); font-size: 0.8125rem; }
.or { display: flex; align-items: center; gap: 0.875rem; margin: 0; font-size: 0.8125rem; color: var(--muted-foreground); }
.or::before, .or::after { content: ""; flex: 1; height: 1px; background: var(--border); }
.optional { position: relative; display: flex; flex-direction: column; gap: 0.75rem; padding: 0.75rem; margin: -0.75rem; border-radius: 1.125rem; outline: 1.5px dashed #c9c5f5; }
.optional .tag { position: absolute; top: -0.625rem; right: 0.75rem; padding: 0 0.5rem; border-radius: 999px; background: var(--tint); color: var(--tint-foreground); font-size: 0.6875rem; font-weight: 600; line-height: 1.25rem; }
.g { width: 1.125rem; height: 1.125rem; }
.fine { font-size: 0.8125rem; color: var(--muted-foreground); line-height: 1.5; }
.after { margin-top: 1.5rem; font-size: 0.875rem; color: var(--muted-foreground); }
.after p + p { margin-top: 0.5rem; }
.carry { display: flex; align-items: center; gap: 0.625rem; margin-top: 1.25rem; padding: 0.625rem 0.75rem 0.625rem 0.875rem; border-radius: 1rem; background: var(--card); box-shadow: var(--elevation-raised); font-size: 0.875rem; }
.carry span { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.carry .i { color: var(--brand); }
.status-icon { display: grid; place-items: center; width: 3.25rem; height: 3.25rem; margin-bottom: 1.5rem; border-radius: 1.125rem; background: var(--tint); color: var(--tint-foreground); }
.status-icon .i { width: 1.5rem; height: 1.5rem; }
.status-icon.success { background: rgba(23, 138, 94, 0.12); color: var(--success); }
.status-icon.warning { background: rgba(183, 116, 10, 0.14); color: var(--warning); }
.status-icon.danger { background: rgba(207, 63, 87, 0.1); color: var(--destructive); }
.wait { font-variant-numeric: tabular-nums; }
.countdown { display: flex; align-items: center; gap: 0.875rem; margin-top: 1.75rem; padding: 1rem 1.125rem; border-radius: 1.125rem; background: var(--card); box-shadow: var(--elevation-raised); }
.countdown .type-number { font-size: 1.75rem; line-height: 1; }
.countdown p { font-size: 0.875rem; color: var(--muted-foreground); }
.otp { position: relative; }
.otp input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; font-size: 16px; cursor: text; }
.cells { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)) 0.75rem repeat(3, minmax(0, 1fr)); gap: 0.5rem; align-items: center; }
.cells .dash { height: 2px; border-radius: 2px; background: var(--input); }
.code-cell { display: grid; place-items: center; height: 3.75rem; border-radius: 0.875rem; background: var(--card); box-shadow: 0 0 0 1px var(--input); font-family: var(--font-display); font-size: 1.625rem; font-weight: 600; font-variant-numeric: tabular-nums; }
.code-cell.active { box-shadow: 0 0 0 2px var(--brand), 0 0 0 6px var(--tint-strong); }
.code-cell.active::after { content: ""; width: 1.5px; height: 1.6rem; background: var(--foreground); }
.cells.error .code-cell { box-shadow: 0 0 0 2px var(--destructive); color: var(--destructive); }
.cells.dim .code-cell { background: var(--secondary); box-shadow: none; color: #9aa1ae; }
.resend { display: flex; flex-wrap: wrap; gap: 0.25rem 0.5rem; align-items: center; }
.resend .off { color: var(--muted-foreground); }
.auth-foot { display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem; font-size: 0.8125rem; color: var(--muted-foreground); }
.auth-foot a:hover { color: var(--foreground); }
.auth-promise { display: none; align-items: center; gap: 0.5rem; margin-top: 2rem; font-size: 0.875rem; color: var(--muted-foreground); }
.auth-promise .i { color: var(--success); }

/* The quiet brand panel: one approval card, the product's one hard rule. */
.auth-panel { position: sticky; top: 0.75rem; display: flex; flex-direction: column; justify-content: center; gap: 2.75rem; height: calc(100dvh - 1.5rem); min-height: 40rem; margin: 0.75rem 0.75rem 0.75rem 0; padding: 3.5rem; border-radius: 1.75rem; background: #edecfc; overflow: hidden; }
.auth-panel .queue { position: relative; width: 19rem; max-width: 100%; margin: 0 auto; }
.auth-panel .ghost { position: absolute; left: 1.25rem; right: 1.25rem; top: -1rem; height: 4rem; border-radius: 1.375rem; background: #f7f6fe; box-shadow: var(--elevation-raised); }
.approve-card { position: relative; padding: 0.875rem; border-radius: 1.5rem; background: var(--card); box-shadow: var(--elevation-floating); }
.approve-card .art { aspect-ratio: 5 / 4; border-radius: 1rem; }
.approve-card .facts { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin: 0.875rem 0.25rem 0; font-size: 0.8125rem; color: var(--muted-foreground); }
.approve-card .facts b { color: var(--foreground); font-weight: 600; }
.approve-card .acts { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.875rem; }
.approve-card .acts .btn { height: 2.5rem; }
.auth-panel .say { max-width: 25rem; margin: 0 auto; text-align: center; }
.auth-panel .say h2 { font-family: var(--font-display); font-size: 1.75rem; font-weight: 600; line-height: 1.12; letter-spacing: -0.025em; color: #231d6e; text-wrap: balance; }
.auth-panel .say p { margin-top: 0.75rem; color: #4d4a78; }
.invite-note { position: relative; padding: 1.5rem; border-radius: 1.5rem; background: var(--card); box-shadow: var(--elevation-floating); }
.invite-note .who { display: flex; align-items: center; gap: 0.75rem; }
.invite-note .who .avatar-l { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 999px; background: #231d6e; color: #fff; font-weight: 600; }
.invite-note .who p { font-size: 0.875rem; line-height: 1.3; }
.invite-note .who small { display: block; color: var(--muted-foreground); font-size: 0.8125rem; }
.invite-note blockquote { margin-top: 1rem; font-size: 0.9375rem; line-height: 1.55; }

:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
.control input:focus-visible, .otp input:focus-visible { outline: none; }

@media (max-width: 1023px) {
  .auth-page { grid-template-columns: minmax(0, 1fr); }
  .auth-panel { display: none; }
  .auth-main { padding: 1.5rem 2rem; }
  .auth-body { align-items: flex-start; padding: 5rem 0 3rem; }
  .auth-promise { display: flex; }
}
@media (max-width: 560px) {
  .auth-main { padding: 1rem 1rem 1.25rem; }
  .auth-body { padding: 2.25rem 0 2rem; }
  .auth-form h1 { font-size: 1.75rem; }
  .auth-switch .prompt { display: none; }
  .form-stack { margin-top: 1.625rem; }
  .cells { gap: 0.375rem; grid-template-columns: repeat(3, minmax(0, 1fr)) 0.5rem repeat(3, minmax(0, 1fr)); }
  .code-cell { height: 3.375rem; font-size: 1.375rem; }
  .auth-promise { margin-top: 1.5rem; }
  .optional { margin: -0.5rem; padding: 0.5rem; }
}
@media (prefers-reduced-motion: reduce) {
  .spinner.light { animation-duration: 2s; }
  .control { transition: none; }
}
"""

# Show/hide works for real, and the one code input mirrors into the boxes, so paste can be tried in the mockup.
AUTH_JS = """
document.querySelectorAll('[data-toggle]').forEach(function (button) {
  button.addEventListener('click', function () {
    var input = document.getElementById(button.dataset.toggle);
    var show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    button.setAttribute('aria-pressed', String(show));
    button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    button.innerHTML = '<svg class="i" aria-hidden="true"><use href="#i-' + (show ? 'eye-off' : 'eye') + '"/></svg>';
  });
});
document.querySelectorAll('.otp input').forEach(function (input) {
  var cells = input.parentElement.querySelectorAll('.code-cell');
  function paint() {
    var digits = input.value.replace(/\\D/g, '').slice(0, 6);
    input.value = digits;
    cells.forEach(function (cell, i) {
      cell.textContent = digits[i] || '';
      cell.classList.toggle('active', document.activeElement === input && i === Math.min(digits.length, 5));
    });
  }
  input.addEventListener('input', paint);
  input.addEventListener('focus', paint);
  input.addEventListener('blur', paint);
});
"""


# ---------- Pieces ----------

def field(id, label, type="text", value="", autocomplete="", state="", message="", extra_label="", lead="", placeholder="", inputmode="", after=""):
    """A labelled input. state: '' | focus | invalid | locked | busy. The message is tied to the input by aria-describedby."""
    msg_id = f"{id}-msg"
    invalid = state == "invalid"
    attrs = [f'id="{id}"', f'name="{id}"', f'type="{type}"', f'value="{value}"']
    if autocomplete:
        attrs.append(f'autocomplete="{autocomplete}"')
    if placeholder:
        attrs.append(f'placeholder="{placeholder}"')
    if inputmode:
        attrs.append(f'inputmode="{inputmode}"')
    if message:
        attrs.append(f'aria-describedby="{msg_id}"')
    if invalid:
        attrs.append('aria-invalid="true"')
    if state == "locked":
        attrs.append("readonly")
    if state == "busy":
        attrs.append("disabled")
    if type == "email":
        attrs.append('spellcheck="false" autocapitalize="off"')
    toggle = ""
    if type == "password":
        toggle = f'<button type="button" class="toggle" data-toggle="{id}" aria-label="Show password" aria-pressed="false">{icon("eye")}</button>'
    lead_html = f'<span class="lead">{icon(lead)}</span>' if lead else ""
    label_row = f'<div class="label-row"><label for="{id}">{label}</label>{extra_label}</div>'
    return f'<div class="afield">{label_row}<div class="control {state}">{lead_html}<input {" ".join(attrs)}>{toggle}</div>{message_html(msg_id, message, invalid)}{after}</div>'


def message_html(msg_id, message, invalid):
    if not message:
        return ""
    if invalid:
        return f'<p class="field-note error" id="{msg_id}">{icon("alert")}<span>{message}</span></p>'
    return f'<div class="field-note" id="{msg_id}">{message}</div>'


def rules(states):
    """Password rules, live as the person types. states: pending | met | fail, one per rule."""
    names = ["At least 10 characters", "Not a common or leaked password", "Not your email address"]
    marks = {"pending": "circle", "met": "check", "fail": "x"}
    items = "".join(
        f'<li class="rule-{state}">{icon(marks[state])}<span>{name}</span></li>' for name, state in zip(names, states)
    )
    return f'<ul class="rules" aria-label="Password rules">{items}</ul>'


def primary(label, loading=False, icon_name=""):
    if loading:
        return f'<button class="btn btn-default btn-block" type="submit" disabled aria-busy="true"><span class="spinner light" aria-hidden="true"></span>{label}</button>'
    trailing = icon(icon_name) if icon_name else ""
    return f'<button class="btn btn-default btn-block pressable" type="submit">{label}{trailing}</button>'


def secondary(label, icon_name=""):
    leading = icon(icon_name) if icon_name else ""
    return f'<a class="btn btn-outline btn-block pressable" href="#">{leading}{label}</a>'


def google(label):
    return f'<div class="optional"><span class="tag">Optional</span><button class="btn btn-outline btn-block pressable" type="button">{GOOGLE}{label}</button><div class="or">or with email</div></div>'


def notice(tone, text, name="alert"):
    role = ' role="alert"' if tone == "error" else ' role="status"'
    return f'<div class="notice {tone}"{role}>{icon(name)}<p>{text}</p></div>'


def forgot_link():
    return '<a class="text-link" href="#">Forgot password?</a>'


def status_icon(name, tone=""):
    return f'<div class="status-icon {tone}">{icon(name)}</div>'


def otp(digits="", state=""):
    """Six boxes drawn over one real input, so paste, SMS/email autofill and screen readers see a single field."""
    cells = ""
    for i in range(6):
        if i == 3:
            cells += '<span class="dash"></span>'
        digit = digits[i] if i < len(digits) else ""
        active = " active" if state == "focus" and i == len(digits) else ""
        cells += f'<span class="code-cell{active}">{digit}</span>'
    invalid = ' aria-invalid="true"' if state == "error" else ""
    disabled = " disabled" if state == "dim" else ""
    group_state = state if state in ("error", "dim") else ""
    return f"""<div class="afield"><label for="code">6-digit code</label>
<div class="otp"><input id="code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]*" maxlength="6" value="{digits}" aria-describedby="code-msg"{invalid}{disabled}>
<div class="cells {group_state}" aria-hidden="true">{cells}</div></div></div>"""


# ---------- Page frame ----------

def default_panel():
    card_art = art("Morning buns are back", "yellow", "image", font_size="1.5rem")
    return f"""<aside class="auth-panel" aria-label="About Cadence">
  <div class="queue"><div class="ghost"></div>
    <div class="approve-card">{card_art}
      <p class="facts"><span><b>Instagram</b> post</span><span>Tuesday, 8:30 AM</span></p>
      <div class="acts"><span class="btn btn-outline">{icon("x")}Skip</span><span class="btn btn-default">{icon("check")}Approve</span></div>
    </div>
  </div>
  <div class="say"><h2>You approve every post before it goes out.</h2>
    <p>Cadence reads your website, plans your month and drafts posts that sound like you.</p></div>
</aside>"""


def invite_panel():
    card_art = art("Morning buns are back", "yellow", "image", font_size="1.5rem")
    return f"""<aside class="auth-panel" aria-label="Your invite">
  <div class="queue">
    <div class="invite-note"><div class="who"><span class="avatar-l">P</span><p>{ADMIN}<small>The Scale Agency</small></p></div>
      <blockquote>Invited you to Cadence to review and approve posts for Tartine Bakery.</blockquote>
      <p class="field-note" style="margin-top:0.75rem">Sent 2 days ago. The invite works until 3 October.</p></div>
  </div>
  <div class="queue" style="width:15rem"><div class="approve-card">{card_art}<p class="facts"><span><b>3 posts</b> to approve</span></p></div></div>
</aside>"""


def auth_page(title, form, switch="", panel=None):
    """Signed-out frame: logo and one switch link on top, the form, a quiet brand panel beside it on desktop."""
    aside = default_panel() if panel is None else panel
    return f"""<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..700&family=Instrument+Sans:wght@400..700&display=swap" rel="stylesheet">
<style>{build.CSS}</style>
</head>
<body class="auth">
<style>{AUTH_CSS}</style>
{sprite()}
<div class="auth-page">
  <div class="auth-main">
    <header class="auth-top"><a class="logo" href="#" aria-label="Cadence home">{LOGO}Cadence</a><p class="auth-switch">{switch}</p></header>
    <main class="auth-body" id="main"><div class="auth-form">{form}
      <p class="auth-promise">{icon("check-circle")}Nothing is published until you approve it.</p></div></main>
    <footer class="auth-foot"><a href="#">Terms</a><a href="#">Privacy</a><a href="#">Help</a></footer>
  </div>
  {aside}
</div>
<script>{AUTH_JS}</script>
</body>
</html>"""


SWITCH_TO_SIGN_UP = '<span class="prompt">New to Cadence? </span><a class="text-link" href="#">Create an account</a>'
SWITCH_TO_SIGN_IN = '<span class="prompt">Have an account? </span><a class="text-link" href="#">Sign in</a>'
BACK_TO_SIGN_IN = f'<a class="text-link" href="#">Back to sign in</a>'


# ---------- Sign in ----------

def sign_in(state="default"):
    """state: default | wrong | loading | expired."""
    top = ""
    email_state, password_state, password_value, password_msg = "", "", "", ""
    if state == "wrong":
        top = notice("error", "That email and password don&#39;t match. Check both, or <a class=\"text-link\" href=\"#\">reset your password</a>.")
        password_state = "invalid"
        password_msg = "2 tries left before sign-in pauses for 15 minutes."
    if state == "loading":
        email_state = password_state = "busy"
        password_value = "morningbuns1987"
    if state == "expired":
        top = notice("info", "You were signed out because your session ended. Sign in to carry on where you were.", "clock")
    if state == "default":
        email_state = "focus"
    email_value = "" if state == "default" else EMAIL
    email = field("email", "Email", "email", email_value, "email", email_state, placeholder="you@business.com", inputmode="email")
    password = field("password", "Password", "password", password_value, "current-password", password_state, password_msg, forgot_link())
    button = primary("Signing in", loading=True) if state == "loading" else primary("Sign in")
    alt = "" if state == "loading" else google("Continue with Google")
    form = f"""<h1>Sign in to Cadence</h1>
<p class="lede">Use the email you signed up with, or the one your invite came to.</p>
{top}
<form class="form-stack" novalidate aria-busy="{str(state == 'loading').lower()}" onsubmit="return false">{alt}{email}{password}{button}</form>"""
    return auth_page("Sign in", form, SWITCH_TO_SIGN_UP)


# ---------- Sign up ----------

def sign_up(state="default"):
    """state: default | email-used | weak."""
    email_state, email_msg = "", ""
    password_state, password_msg, password_value = "", "", ""
    rule_states = ["pending", "pending", "pending"]
    if state == "email-used":
        email_state = "invalid"
        email_msg = 'This email already has an account. <a class="text-link" href="#">Sign in</a> or <a class="text-link" href="#">reset your password</a>.'
        password_value = "morningbuns1987"
        rule_states = ["met", "met", "met"]
    if state == "weak":
        password_state = "invalid"
        password_value = "password1234"
        password_msg = "This password shows up in known data leaks, so it is easy to guess. Try a short phrase only you would know."
        rule_states = ["met", "fail", "met"]
    name = field("name", "Your name", "text", "Sam Rivera", "name")
    email_value = EMAIL
    email = field("email", "Email", "email", email_value, "email", email_state, email_msg, inputmode="email")
    password_rules = rules(rule_states)
    password = field("password", "Password", "password", password_value, "new-password", password_state, password_msg, after=password_rules)
    form = f"""<h1>Create your account</h1>
<p class="lede">Next you paste your website, and Cadence drafts a brand kit you can edit.</p>
<div class="carry">{icon("globe")}<span>We&#39;ll read <b>tartinebakery.com</b> once your account is ready.</span><a class="text-link" href="#">Change</a></div>
<form class="form-stack" novalidate onsubmit="return false">{google("Sign up with Google")}{name}{email}{password}{primary("Create account")}
<p class="fine">By creating an account you agree to the <a class="text-link" href="#">Terms</a> and <a class="text-link" href="#">Privacy policy</a>.</p></form>"""
    return auth_page("Create account", form, SWITCH_TO_SIGN_IN)


# ---------- Verify email ----------

def verify_email(state="default"):
    """state: default | wrong | expired | resent."""
    top = ""
    digits, cell_state = "", "focus"
    resend = '<span class="off">Send a new code in <span class="wait">0:42</span></span>'
    message = '<p class="field-note" id="code-msg">You can paste the whole code.</p>'
    button = primary("Verify email")
    lede = f"We sent a 6-digit code to <b>{EMAIL}</b>. It works for 10 minutes."
    if state == "wrong":
        digits, cell_state = "482913", "error"
        message = f'<p class="field-note error" id="code-msg">{icon("alert")}<span>That code isn&#39;t right. Check the newest email from Cadence and try again. 3 tries left.</span></p>'
    if state == "expired":
        digits, cell_state = "", "dim"
        top = notice("warning", "This code has expired. Codes work for 10 minutes. Send a new one to carry on.", "clock")
        message = ""
        resend = ""
        button = primary("Send a new code")
        lede = f"We sent a code to <b>{EMAIL}</b>, but it is too old to use now."
    if state == "resent":
        top = notice("success", f"New code sent to {EMAIL}. Codes from earlier emails no longer work.", "check-circle")
        resend = '<span class="off">Send another in <span class="wait">0:59</span></span>'
    resend_row = f'<div class="resend fine"><span>Didn&#39;t get it? Check spam.</span>{resend}</div>' if resend else ""
    form = f"""{status_icon("mail")}
<h1>Enter the code we emailed you</h1>
<p class="lede">{lede}</p>
{top}
<form class="form-stack" novalidate onsubmit="return false">{otp(digits, cell_state)}{message}{button}{resend_row}</form>
<div class="after"><p>Wrong email? <a class="text-link" href="#">Change it</a></p></div>"""
    return auth_page("Verify your email", form, BACK_TO_SIGN_IN)


# ---------- Forgot and reset password ----------

def forgot_password():
    email = field("email", "Email", "email", EMAIL, "email", "focus", inputmode="email")
    form = f"""<h1>Reset your password</h1>
<p class="lede">Enter the email you use for Cadence. We&#39;ll send a link to choose a new password.</p>
<form class="form-stack" novalidate onsubmit="return false">{email}{primary("Send reset link")}</form>
<div class="after"><p>Remembered it? <a class="text-link" href="#">Sign in</a></p></div>"""
    return auth_page("Reset your password", form, BACK_TO_SIGN_IN)


def check_email():
    form = f"""{status_icon("mail")}
<h1>Check your email</h1>
<p class="lede">If an account exists for <b>{EMAIL}</b>, we sent a link to reset your password. The link works for 30 minutes.</p>
<div class="form-stack tight">{secondary("Back to sign in", "arrow-left")}
<div class="resend fine"><span>Nothing after a few minutes? Check spam.</span><span class="off">Send again in <span class="wait">0:52</span></span></div></div>
<div class="after"><p>Typed the wrong email? <a class="text-link" href="#">Use a different one</a></p></div>"""
    return auth_page("Check your email", form, "")


def reset_password():
    password_rules = rules(["met", "met", "met"])
    password = field("password", "New password", "password", "kiln-warm-bread-at-7", "new-password", "focus", after=password_rules)
    sign_out = f'<label class="check-row"><span class="box">{icon("check")}</span><span>Sign me out on other devices<small>Recommended if you think someone else knows your old password.</small></span></label>'
    form = f"""<h1>Choose a new password</h1>
<p class="lede">For <b>{EMAIL}</b>. Use the eye button to check what you typed.</p>
<form class="form-stack" novalidate onsubmit="return false">
<input type="email" autocomplete="username" value="{EMAIL}" hidden>{password}{sign_out}{primary("Save new password")}</form>"""
    return auth_page("Choose a new password", form, "")


def password_changed():
    form = f"""{status_icon("check-circle", "success")}
<h1>Password changed</h1>
<p class="lede">Sign in with your new password. We signed you out on your other devices and sent a note to <b>{EMAIL}</b>.</p>
<div class="form-stack tight">{primary("Sign in")}</div>
<div class="after"><p>Didn&#39;t change it yourself? <a class="text-link" href="#">Contact support</a></p></div>"""
    return auth_page("Password changed", form, "")


def link_expired():
    form = f"""{status_icon("link-off", "warning")}
<h1>This link no longer works</h1>
<p class="lede">Reset links work once, for 30 minutes. This one has expired or was already used. Send yourself a new one.</p>
<div class="form-stack tight">{primary("Send a new link")}{secondary("Back to sign in")}</div>"""
    return auth_page("Link expired", form, "")


# ---------- Invite ----------

def invite_accept(state="default"):
    """state: default | loading."""
    loading = state == "loading"
    busy = "busy" if loading else ""
    email = field("email", "Email", "email", EMAIL, "username", "locked", f'<p class="field-note">{icon("lock")}<span>From your invite. You can change it in settings later.</span></p>', lead="mail")
    name = field("name", "Your name", "text", "Sam Rivera", "name", busy)
    password_rules = rules(["met", "met", "met"])
    password = field("password", "Choose a password", "password", "kiln-warm-bread-at-7", "new-password", busy or "focus", after=password_rules)
    button = primary("Setting up your account", loading=True) if loading else primary("Create account")
    form = f"""<h1>Set up your account</h1>
<p class="lede">{ADMIN} at The Scale Agency invited you to Cadence for <b>Tartine Bakery</b>.</p>
<form class="form-stack" novalidate onsubmit="return false">{email}{name}{password}{button}
<p class="fine">By creating an account you agree to the <a class="text-link" href="#">Terms</a> and <a class="text-link" href="#">Privacy policy</a>.</p></form>"""
    return auth_page("Accept your invite", form, SWITCH_TO_SIGN_IN, invite_panel())


def invite_used():
    form = f"""{status_icon("check-circle")}
<h1>This invite was already used</h1>
<p class="lede">An account was set up with it. Sign in with the email the invite came to.</p>
<div class="form-stack tight">{primary("Sign in")}</div>
<div class="after"><p>Can&#39;t remember the password? <a class="text-link" href="#">Reset it</a></p></div>"""
    return auth_page("Invite already used", form, "")


def invite_expired():
    form = f"""{status_icon("link-off", "warning")}
<h1>This invite has expired</h1>
<p class="lede">Invites work for 7 days. Ask {ADMIN} at The Scale Agency to send you a new one.</p>
<div class="form-stack tight">{primary("Ask for a new invite")}</div>
<p class="after">We&#39;ll let {ADMIN} know. The new invite comes to the same email.</p>
<div class="after"><p>Already set up your account? <a class="text-link" href="#">Sign in</a></p></div>"""
    return auth_page("Invite expired", form, "")


# ---------- Lock ----------

def too_many_attempts():
    form = f"""{status_icon("timer", "danger")}
<h1>Sign-in is paused for 15 minutes</h1>
<p class="lede">There were too many wrong passwords for <b>{EMAIL}</b>. This protects the account while we wait.</p>
<div class="countdown" role="timer" aria-live="off"><span class="type-number wait">14:32</span><p>Try again at 10:45 AM. You can leave this page.</p></div>
<div class="form-stack tight"><p class="fine">If you forgot your password, reset it now. Resetting works while sign-in is paused.</p>{primary("Reset password")}{secondary("Back to sign in")}</div>"""
    return auth_page("Sign-in paused", form, "")


SCREENS = {
    "sign-in": sign_in,
    "sign-in-wrong-password": lambda: sign_in("wrong"),
    "sign-in-loading": lambda: sign_in("loading"),
    "sign-in-session-ended": lambda: sign_in("expired"),
    "sign-up": sign_up,
    "sign-up-email-used": lambda: sign_up("email-used"),
    "sign-up-weak-password": lambda: sign_up("weak"),
    "verify-email": verify_email,
    "verify-email-wrong-code": lambda: verify_email("wrong"),
    "verify-email-expired": lambda: verify_email("expired"),
    "verify-email-new-code-sent": lambda: verify_email("resent"),
    "forgot-password": forgot_password,
    "check-email": check_email,
    "reset-password": reset_password,
    "password-changed": password_changed,
    "reset-link-expired": link_expired,
    "invite-accept": invite_accept,
    "invite-accept-loading": lambda: invite_accept("loading"),
    "invite-used": invite_used,
    "invite-expired": invite_expired,
    "too-many-attempts": too_many_attempts,
}


def main():
    OUT.mkdir(exist_ok=True)
    for name, render in SCREENS.items():
        (OUT / f"auth-v1-{name}.html").write_text(render(), encoding="utf-8")
    print(f"wrote {len(SCREENS)} screens to {OUT}")


if __name__ == "__main__":
    main()
