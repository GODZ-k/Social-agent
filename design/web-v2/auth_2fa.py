"""AUTH-7: two-factor sign-in for admins. Set up, sign in, backup codes, manage, lost access.

Run from design/web-v2: python auth_2fa.py
Writes screens-auth-2fa/2fa-v1-<screen>.html. Extends the approved auth screens (auth_screens.py) and the
admin area (admin_screens.py) without editing either: their frames, helpers and CSS are imported, and the
few new pieces below are injected as one extra <style>.
"""

import random
from pathlib import Path
from urllib.parse import quote

import admin_screens
import auth_screens as auth
import build
from auth_screens import auth_page, notice, otp, primary, secondary, status_icon
from build import icon

OUT = Path(__file__).parent / "screens-auth-2fa"
ADMIN_NAME = "Priya Shah"
ADMIN_EMAIL = "priya@thescaleagency.org"
SETUP_KEY = "JBSW Y3DP EHPK 3PXP 4RTA 7QZC M2LN V6WE"
SETUP_SECRET = SETUP_KEY.replace(" ", "")
SIGN_OUT = '<a class="text-link" href="#">Sign out</a>'
OTHER_ACCOUNT = '<a class="text-link" href="#">Use a different account</a>'
BACKUP_CODES = ["7kq2-m9xp", "c4tn-8wze", "p2vh-6rjd", "x9mf-3kua", "h5ge-q7ns", "b3wy-t2lc", "n8dp-5vxk", "r6ja-m4hf", "e2zu-9pqt", "f7kc-w3yb"]

build.obs.ICONS.update({
    "key": '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
    "smartphone": '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
    "download": '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    "life-buoy": '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24"/>',
    "list": '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    "log-out": '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
})

MONO = 'ui-monospace, "SF Mono", "Cascadia Mono", "Roboto Mono", Menlo, Consolas, monospace'

# Pieces shared by the auth frame and the admin account page: the setup key and the backup codes.
SHARED_CSS = f"""
.mono {{ font-family: {MONO}; font-variant-ligatures: none; font-variant-numeric: tabular-nums slashed-zero; }}
.codes {{ display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.625rem 1.5rem; padding: 1.25rem 1.5rem; margin: 0; list-style: none; border-radius: 1.25rem; background: var(--card); box-shadow: 0 0 0 1px var(--border); }}
.codes li {{ font-size: 1.0625rem; letter-spacing: 0.06em; line-height: 1.5; user-select: all; }}
.codes-actions {{ display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.75rem; }}
.codes-actions .btn {{ width: 100%; }}
.saved-check {{ display: flex; align-items: flex-start; gap: 0.625rem; font-size: 0.875rem; line-height: 1.45; cursor: pointer; }}
.saved-check input {{ width: 1.25rem; height: 1.25rem; flex: none; margin: 0.1rem 0 0; accent-color: var(--brand); cursor: pointer; }}
.saved-check small {{ display: block; color: var(--muted-foreground); font-size: 0.8125rem; }}
.btn[disabled].needs-check {{ background: #a8a2f0; box-shadow: none; cursor: not-allowed; }}
.copied {{ color: var(--success); }}
@media (max-width: 560px) {{
  .codes {{ padding: 1rem 1.125rem; gap: 0.5rem 1rem; }}
  .codes li {{ font-size: 1rem; }}
}}
"""

TWOFA_CSS = SHARED_CSS + """
.progress-mini { display: flex; align-items: center; gap: 0.625rem; margin-bottom: 1.25rem; font-size: 0.8125rem; color: var(--muted-foreground); }
.progress-mini .bars { display: flex; gap: 0.25rem; }
.progress-mini .bars span { width: 1.5rem; height: 0.25rem; border-radius: 2px; background: var(--input); }
.progress-mini .bars span.done { background: var(--brand); }

/* Method choice: two real radios, each a whole card you can click. */
.methods { display: grid; gap: 0.75rem; border: 0; padding: 0; margin: 0; min-width: 0; }
.methods legend { font-size: 0.875rem; font-weight: 500; margin-bottom: 0.4375rem; padding: 0; }
.method { position: relative; text-align: left; font-weight: 400; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 0.875rem; align-items: start; padding: 1rem 1.125rem; border-radius: 1.125rem; background: var(--card); box-shadow: 0 0 0 1px var(--input); cursor: pointer; transition: box-shadow 120ms ease; }
.method input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.method:has(input:checked) { box-shadow: 0 0 0 2px var(--brand), 0 0 0 6px var(--tint-strong); }
.method:has(input:focus-visible) { outline: 2px solid var(--brand); outline-offset: 4px; }
.method .mi { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 0.875rem; background: var(--tint); color: var(--tint-foreground); }
.method .mt { display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem 0.5rem; font-size: 1rem; font-weight: 600; }
.method p { margin-top: 0.1875rem; font-size: 0.875rem; line-height: 1.45; color: var(--muted-foreground); }
.method .radio { width: 1.25rem; height: 1.25rem; margin-top: 0.1rem; border-radius: 999px; box-shadow: inset 0 0 0 1.5px var(--input); background: var(--card); transition: box-shadow 120ms ease; }
.method:has(input:checked) .radio { box-shadow: inset 0 0 0 5.5px var(--brand); }

/* Authenticator setup: the QR on a computer, an "open in app" link on a phone, the key on both. */
.qr-card { display: grid; grid-template-columns: 9.5rem minmax(0, 1fr); gap: 1.25rem; align-items: center; margin-top: 1.75rem; padding: 1.125rem; border-radius: 1.25rem; background: var(--card); box-shadow: var(--elevation-raised); }
.qr { width: 9.5rem; aspect-ratio: 1; padding: 0.375rem; border-radius: 0.75rem; background: #fff; box-shadow: 0 0 0 1px var(--border); }
.qr svg { display: block; width: 100%; height: 100%; }
.qr-card ol { display: grid; gap: 0.5rem; padding-left: 1.125rem; font-size: 0.875rem; line-height: 1.45; color: var(--muted-foreground); }
.qr-card ol b { color: var(--foreground); font-weight: 500; }
.open-app, .on-phone { display: none; }
.key-block { display: grid; gap: 0.4375rem; margin-top: 1rem; }
.key-block .lab { font-size: 0.875rem; font-weight: 500; }
.keybox { display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.375rem 0.375rem 0.875rem; border-radius: 0.875rem; background: var(--secondary); }
.keybox code { flex: 1; min-width: 0; font-size: 0.9375rem; letter-spacing: 0.04em; line-height: 1.5; overflow-wrap: anywhere; user-select: all; }
.keybox .btn { width: auto; flex: none; }

/* Passkey: the browser owns the prompt; we only say what is happening and offer a way out. */
.waiting { display: flex; align-items: center; gap: 0.875rem; margin-top: 1.75rem; padding: 1rem 1.125rem; border-radius: 1.125rem; background: var(--card); box-shadow: var(--elevation-raised); font-size: 0.875rem; }
.waiting .spinner { width: 1.25rem; height: 1.25rem; flex: none; animation: spin 900ms linear infinite; }
.waiting b { display: block; font-weight: 500; }
.waiting span { color: var(--muted-foreground); }
.other-ways { display: grid; gap: 0.625rem; margin-top: 1.75rem; }
.other-ways .or { margin-bottom: 0.125rem; }
.control input.mono { letter-spacing: 0.08em; font-size: 1.0625rem; }
.control input.mono::placeholder { letter-spacing: 0.08em; }

/* Lost access: a real sequence, so it is numbered. */
.steps-list { display: grid; gap: 0.875rem; margin-top: 1.75rem; padding: 1.25rem; border-radius: 1.25rem; background: var(--card); box-shadow: var(--elevation-raised); list-style: none; counter-reset: step; }
.steps-list li { display: grid; grid-template-columns: 1.75rem minmax(0, 1fr); gap: 0.75rem; font-size: 0.875rem; line-height: 1.45; color: var(--muted-foreground); counter-increment: step; }
.steps-list li::before { content: counter(step); display: grid; place-items: center; width: 1.75rem; height: 1.75rem; border-radius: 999px; background: var(--tint); color: var(--tint-foreground); font-weight: 600; font-size: 0.8125rem; }
.steps-list li.done::before { content: "\\2713"; background: rgba(23, 138, 94, 0.12); color: var(--success); }
.steps-list b { display: block; color: var(--foreground); font-weight: 500; }

/* Brand panel for admins: the two steps of an admin sign-in. */
.steps-card { position: relative; display: grid; gap: 0.25rem; padding: 0.75rem; border-radius: 1.5rem; background: var(--card); box-shadow: var(--elevation-floating); }
.srow { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 1rem; font-size: 0.9375rem; }
.srow .dot { display: grid; place-items: center; width: 2.25rem; height: 2.25rem; flex: none; border-radius: 999px; background: var(--secondary); color: var(--muted-foreground); }
.srow .dot .i { width: 1.0625rem; height: 1.0625rem; }
.srow.done .dot { background: rgba(23, 138, 94, 0.12); color: var(--success); }
.srow.now { background: #f5f4fe; }
.srow.now .dot { background: var(--brand); color: #fff; }
.srow small { display: block; color: var(--muted-foreground); font-size: 0.8125rem; }

@media (max-width: 560px) {
  .qr-card { grid-template-columns: minmax(0, 1fr); padding: 1rem; }
  .qr { display: none; }
  .open-app { display: flex; }
  .on-phone { display: inline; }
  .on-desk { display: none; }
  .method { padding: 0.875rem 1rem; gap: 0.75rem; }
}
@media (prefers-reduced-motion: reduce) {
  .waiting .spinner { animation-duration: 2.4s; }
  .method, .method .radio { transition: none; }
}
"""

# Account page pieces, inside the admin area.
ACCOUNT_CSS = SHARED_CSS + """
.acct-wrap { display: grid; gap: 1.25rem; max-width: 48rem; }
.acct-wrap .card-head { margin-bottom: 0.75rem; }
.mrow { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 0.25rem 0.875rem; align-items: center; padding: 1rem 0; border-top: 1px solid var(--border); }
.mrow .ri { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 0.875rem; background: var(--tint); color: var(--tint-foreground); }
.mrow .ri.plain { background: var(--secondary); color: var(--muted-foreground); }
.mrow .mt { display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem 0.5rem; font-weight: 500; }
.mrow .type-label { margin-top: 0.125rem; }
.mrow .acts { display: flex; gap: 0.5rem; }
.mrow .acts .btn { width: auto; }
.mrow .row-note { grid-column: 2 / -1; display: flex; align-items: flex-start; gap: 0.4375rem; margin-top: 0.375rem; font-size: 0.8125rem; line-height: 1.45; color: var(--muted-foreground); }
.mrow .row-note .i { width: 0.875rem; height: 0.875rem; margin-top: 0.15rem; flex: none; }
.sec-foot { display: flex; flex-wrap: wrap; gap: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--border); }
.sec-foot .btn { width: auto; }
.btn-remove { color: var(--destructive); }
.btn-remove:hover { background: rgba(207, 63, 87, 0.08); }
.btn[disabled] { opacity: 0.45; cursor: not-allowed; }
.req { display: inline-flex; align-items: center; gap: 0.375rem; }
.warn-line { margin-bottom: 1rem; display: flex; gap: 0.5rem; align-items: flex-start; padding: 0.875rem 1rem; border-radius: 1rem; background: rgba(183, 116, 10, 0.1); color: #8a5606; font-size: 0.875rem; line-height: 1.45; }
.warn-line .i { margin-top: 0.15rem; flex: none; }
.dlg .codes { box-shadow: 0 0 0 1px var(--border); }
@media (max-width: 560px) {
  .mrow { grid-template-columns: auto minmax(0, 1fr); }
  .mrow .acts { grid-column: 2 / -1; margin-top: 0.5rem; }
  .mrow .acts .btn-ghost { margin-left: -0.875rem; }
  .sec-foot .btn { width: 100%; }
}
"""

# Copy buttons copy for real and say so; the "I saved them" box unlocks the button. Both are small and honest.
TWOFA_JS = """
document.querySelectorAll('[data-copy]').forEach(function (button) {
  button.addEventListener('click', function () {
    var text = button.dataset.copy;
    var label = button.querySelector('.lbl');
    var done = function () { label.textContent = 'Copied'; button.classList.add('copied'); setTimeout(function () { label.textContent = button.dataset.label; button.classList.remove('copied'); }, 2000); };
    if (navigator.clipboard) { navigator.clipboard.writeText(text).then(done, done); } else { done(); }
  });
});
document.querySelectorAll('[data-unlocks]').forEach(function (box) {
  var target = document.getElementById(box.dataset.unlocks);
  var sync = function () { target.disabled = !box.checked; };
  box.addEventListener('change', sync);
  sync();
});
"""


# ---------- Pieces ----------

def qr_svg():
    """A drawn stand-in for the real QR: three finder squares, one alignment square, seeded noise."""
    size = 25
    rng = random.Random(7)
    cells = [[rng.random() < 0.48 for _ in range(size)] for _ in range(size)]

    def square(x0, y0, n):
        for y in range(n):
            for x in range(n):
                edge = x in (0, n - 1) or y in (0, n - 1)
                core = 2 <= x <= n - 3 and 2 <= y <= n - 3
                cells[y0 + y][x0 + x] = edge or core

    def clear(x0, y0, n):
        for y in range(max(y0, 0), min(y0 + n, size)):
            for x in range(max(x0, 0), min(x0 + n, size)):
                cells[y][x] = False

    for x0, y0 in ((0, 0), (size - 7, 0), (0, size - 7)):
        clear(x0 - 1, y0 - 1, 9)
        square(x0, y0, 7)
    clear(15, 15, 7)
    square(16, 16, 5)
    rects = "".join(
        f'<rect x="{x}" y="{y}" width="1" height="1"/>' for y in range(size) for x in range(size) if cells[y][x]
    )
    return f'<svg viewBox="-1 -1 27 27" role="img" aria-label="QR code for your authenticator app" shape-rendering="crispEdges"><g fill="#141822">{rects}</g></svg>'


def copy_button(text, label, cls="btn btn-outline sm pressable", name="copy"):
    return f'<button type="button" class="{cls}" data-copy="{text}" data-label="{label}">{icon(name)}<span class="lbl" aria-live="polite">{label}</span></button>'


def codes_block(codes=BACKUP_CODES):
    items = "".join(f'<li class="mono">{code}</li>' for code in codes)
    text = "&#10;".join(codes)
    lines = "\n".join(codes)
    download_body = quote(f"Cadence backup codes for {ADMIN_EMAIL}\n\n{lines}\n\nEach code works once.\n")
    download = f'<a class="btn btn-outline pressable" href="data:text/plain;charset=utf-8,{download_body}" download="cadence-backup-codes.txt">{icon("download")}Download</a>'
    return f"""<ul class="codes" aria-label="Your backup codes">{items}</ul>
<div class="codes-actions">{copy_button(text, "Copy all", "btn btn-outline pressable")}{download}</div>"""


def saved_check(button_id):
    return (f'<label class="saved-check"><input type="checkbox" data-unlocks="{button_id}">'
            f'<span>I saved my backup codes<small>Somewhere safe that isn&#39;t this computer, like a password manager.</small></span></label>')


def progress(step, total=3):
    bars = "".join(f'<span class="{"done" if i < step else ""}"></span>' for i in range(total))
    return f'<div class="progress-mini"><span class="bars" aria-hidden="true">{bars}</span>Step {step} of {total}</div>'


def other_ways(*links):
    buttons = "".join(secondary(label, name) for label, name in links)
    return f'<div class="other-ways"><div class="or">or</div>{buttons}</div>'


def lost_link():
    return '<div class="after"><p>No phone, passkey or backup codes? <a class="text-link" href="#">Get back into your account</a></p></div>'


def admin_panel():
    """The admin's brand panel: sign-in is two steps, and the second one is what this flow is about."""
    return f"""<aside class="auth-panel" aria-label="About two-factor sign-in">
  <div class="queue"><div class="ghost"></div>
    <div class="steps-card">
      <div class="srow done"><span class="dot">{icon("check")}</span><span>Password<small>Something you know</small></span></div>
      <div class="srow now"><span class="dot">{icon("key")}</span><span>Code from your phone or a passkey<small>Something you have</small></span></div>
      <div class="srow"><span class="dot">{icon("lock")}</span><span>Admin area<small>Every client and brand</small></span></div>
    </div>
  </div>
  <div class="say"><h2>Admin accounts open every client&#39;s brand.</h2>
    <p>So they need a second step at sign-in. A stolen password alone can&#39;t get in.</p></div>
</aside>"""


def frame(title, form, switch=""):
    """The approved auth frame with the admin panel and this flow's extra styles and script."""
    panel = admin_panel()
    html = auth_page(title, f"<style>{TWOFA_CSS}</style>{form}", switch, panel)
    html = html.replace("Nothing is published until you approve it.", "Admin accounts always sign in with two steps.")
    return html.replace("</body>", f"<script>{TWOFA_JS}</script>\n</body>")


# ---------- Set up (required before the admin area opens) ----------

def setup_choose():
    methods = f"""<fieldset class="methods"><legend>Choose how you&#39;ll confirm it&#39;s you</legend>
<label class="method"><input type="radio" name="method" value="passkey" checked><span class="mi">{icon("key")}</span>
  <span><span class="mt">Passkey <span class="badge badge-tint">Recommended</span></span><p>Use your fingerprint, face or device PIN. Nothing to type, and it can&#39;t be phished.</p></span><span class="radio" aria-hidden="true"></span></label>
<label class="method"><input type="radio" name="method" value="app"><span class="mi">{icon("smartphone")}</span>
  <span><span class="mt">Authenticator app</span><p>Google Authenticator, 1Password, Authy or similar shows a new 6-digit code every 30 seconds.</p></span><span class="radio" aria-hidden="true"></span></label>
</fieldset>"""
    form = f"""{progress(1)}
<h1>Turn on two-factor sign-in</h1>
<p class="lede">Admin accounts need a second step after the password. Set it up once, now. It takes about a minute.</p>
<form class="form-stack" novalidate onsubmit="return false">{methods}{primary("Continue")}
<p class="fine">You can add the other method later in your account settings. We recommend having both.</p></form>"""
    return frame("Turn on two-factor", form, SIGN_OUT)


def setup_app(state="default"):
    """state: default | wrong."""
    digits, cell_state = "", "focus"
    message = '<p class="field-note" id="code-msg">The code changes every 30 seconds. Enter the one showing now.</p>'
    if state == "wrong":
        digits, cell_state = "318204", "error"
        message = (f'<p class="field-note error" id="code-msg">{icon("alert")}<span>That code didn&#39;t match. Enter the code showing now, '
                   'and check that your phone sets its time automatically.</span></p>')
    otpauth = f"otpauth://totp/Cadence:{ADMIN_EMAIL}?secret={SETUP_SECRET}&amp;issuer=Cadence"
    form = f"""{progress(2)}
<h1>Connect your authenticator app</h1>
<p class="lede">Add Cadence to the app, then type the 6-digit code it shows.</p>
<div class="qr-card">
  <div class="qr">{qr_svg()}</div>
  <ol><li><b>Open your authenticator app</b> and tap the add button.</li><li><span class="on-desk"><b>Scan this code</b>, or enter the setup key below.</span><span class="on-phone"><b>Tap Open in authenticator app</b> below, or copy the setup key.</span></li><li><b>Type the 6-digit code</b> the app shows for Cadence.</li></ol>
  <a class="btn btn-outline btn-block pressable open-app" href="{otpauth}">{icon("smartphone")}Open in authenticator app</a>
</div>
<div class="key-block"><span class="lab" id="key-label">Setup key</span>
  <div class="keybox"><code class="mono" aria-labelledby="key-label">{SETUP_KEY}</code>{copy_button(SETUP_SECRET, "Copy")}</div>
  <p class="field-note">Account: Cadence ({ADMIN_EMAIL}). Time-based, 6 digits. Keep this key private; it works like a password.</p></div>
<form class="form-stack" novalidate onsubmit="return false">{otp(digits, cell_state)}{message}{primary("Turn on two-factor")}</form>
<div class="after"><p>Rather use a passkey? <a class="text-link" href="#">Switch method</a></p></div>"""
    return frame("Connect your authenticator app", form, SIGN_OUT)


def setup_passkey(state="waiting"):
    """state: waiting | cancelled."""
    if state == "cancelled":
        body = (notice("warning", "The passkey wasn&#39;t created. The prompt was closed or timed out. Nothing changed on your device.")
                + f'<div class="form-stack tight">{primary("Try again")}{secondary("Use an authenticator app instead", "smartphone")}</div>')
    else:
        body = (f'<div class="waiting" role="status"><span class="spinner" aria-hidden="true"></span><p><b>Waiting for your device</b><span>Follow the prompt from your browser or phone.</span></p></div>'
                f'<div class="form-stack tight">{secondary("Use an authenticator app instead", "smartphone")}</div>')
    form = f"""{progress(2)}{status_icon("key")}
<h1>Create a passkey</h1>
<p class="lede">Your browser asks for your fingerprint, face or device PIN. Cadence never sees them; they stay on your device.</p>
{body}"""
    return frame("Create a passkey", form, SIGN_OUT)


def backup_codes():
    form = f"""{progress(3)}
<h1>Save your backup codes</h1>
<p class="lede">If you lose your phone or passkey, each code gets you in once. This is the only time we show them.</p>
{notice("warning", "Save them now. You can make new ones later, but you can&#39;t see these again.", "alert")}
<div class="form-stack tight">{codes_block()}{saved_check("go")}
<button class="btn btn-default btn-block pressable needs-check" id="go" type="button" disabled>Continue to admin area</button></div>"""
    return frame("Save your backup codes", form, SIGN_OUT)


# ---------- Sign in with two-factor (after the password) ----------

def signin_code(state="default"):
    """state: default | wrong."""
    digits, cell_state = "", "focus"
    message = '<p class="field-note" id="code-msg">Open your authenticator app and find Cadence.</p>'
    if state == "wrong":
        digits, cell_state = "550871", "error"
        message = (f'<p class="field-note error" id="code-msg">{icon("alert")}<span>That code isn&#39;t right. '
                   'Enter the code showing now; it changes every 30 seconds. 2 tries left.</span></p>')
    form = f"""{status_icon("shield")}
<h1>Enter your two-factor code</h1>
<p class="lede">Signing in as <b>{ADMIN_EMAIL}</b>. Your password was accepted; this is the second step.</p>
<form class="form-stack" novalidate onsubmit="return false">{otp(digits, cell_state)}{message}{primary("Verify and sign in")}</form>
{other_ways(("Use your passkey", "key"), ("Use a backup code", "list"))}
{lost_link()}"""
    return frame("Two-factor code", form, OTHER_ACCOUNT)


def signin_passkey():
    form = f"""{status_icon("key")}
<h1>Confirm with your passkey</h1>
<p class="lede">Signing in as <b>{ADMIN_EMAIL}</b>. Use your fingerprint, face or device PIN when your browser asks.</p>
<div class="waiting" role="status"><span class="spinner" aria-hidden="true"></span><p><b>Waiting for your device</b><span>No prompt? <a class="text-link" href="#">Try again</a></span></p></div>
{other_ways(("Use your authenticator app", "smartphone"), ("Use a backup code", "list"))}
{lost_link()}"""
    return frame("Confirm with your passkey", form, OTHER_ACCOUNT)


def signin_backup():
    code = auth.field("backup", "Backup code", "text", "", "one-time-code", "focus",
                      '8 letters and numbers. The dash is optional. Each code works once.',
                      placeholder="xxxx-xxxx")
    code = code.replace('name="backup"', 'name="backup" class="mono" spellcheck="false" autocapitalize="off" maxlength="9"')
    form = f"""{status_icon("list")}
<h1>Use a backup code</h1>
<p class="lede">Signing in as <b>{ADMIN_EMAIL}</b>. Enter one of the codes you saved when you turned on two-factor.</p>
<form class="form-stack" novalidate onsubmit="return false">{code}{primary("Verify and sign in")}</form>
<div class="after"><p>Have your phone after all? <a class="text-link" href="#">Use your authenticator app</a> or <a class="text-link" href="#">passkey</a></p></div>
{lost_link()}"""
    return frame("Use a backup code", form, OTHER_ACCOUNT)


def backup_low():
    form = f"""{status_icon("alert", "warning")}
<h1>You have 2 backup codes left</h1>
<p class="lede">You just used one to sign in. When they run out and you have no phone or passkey, getting back in takes a recovery check of up to 2 working days.</p>
<div class="form-stack tight">{primary("Make new backup codes")}{secondary("Not now")}
<p class="fine">Making new codes stops the 2 old ones from working. You can also do it any time in your account settings.</p></div>"""
    return frame("2 backup codes left", form, "")


def signin_paused():
    form = f"""{status_icon("timer", "danger")}
<h1>Sign-in is paused for 15 minutes</h1>
<p class="lede">The two-factor code for <b>{ADMIN_EMAIL}</b> was wrong 5 times. We emailed you about it.</p>
<div class="countdown" role="timer" aria-live="off"><span class="type-number wait">14:48</span><p>Try again at 10:45 AM. You can leave this page.</p></div>
{notice("error", "Wasn&#39;t you? Someone has your password, because this step only comes after it. <a class=\"text-link\" href=\"#\">Reset your password</a> now; it works while sign-in is paused.", "alert")}
<div class="form-stack tight">{secondary("Back to sign in")}</div>"""
    return frame("Two-factor paused", form, "")


# ---------- Lost access ----------

def lost_access():
    form = f"""{status_icon("life-buoy")}
<h1>Get back into your account</h1>
<p class="lede">With no phone, passkey or backup codes, we check it&#39;s really you before we turn off two-factor. There&#39;s no email-only shortcut, because admin accounts open every client&#39;s brand.</p>
<ol class="steps-list">
  <li class="done"><span><b>Your password</b>Checked just now for {ADMIN_EMAIL}.</span></li>
  <li><span><b>A short video call</b>Cadence support checks who you are. We email you within 1 working day to book it.</span></li>
  <li><span><b>24 hours&#39; notice</b>We email you before two-factor is turned off. If you didn&#39;t ask for this, cancel from that email.</span></li>
  <li><span><b>Set it up again</b>You sign in with your password and turn on two-factor before the admin area opens. Every other session is signed out.</span></li>
</ol>
<div class="form-stack tight">{primary("Send recovery request")}{secondary("Back to sign in")}</div>
<div class="after"><p>Found a backup code? <a class="text-link" href="#">Use it instead</a>. It&#39;s much faster.</p></div>"""
    return frame("Get back into your account", form, "")


def lost_access_sent():
    form = f"""{status_icon("check-circle", "success")}
<h1>Recovery request sent</h1>
<p class="lede">We&#39;ll email <b>{ADMIN_EMAIL}</b> within 1 working day to book a short video call. Keep your ID handy.</p>
{notice("info", "Your admin area stays locked until then. Your clients aren&#39;t affected: posts they already approved still go out on schedule.", "clock")}
<div class="form-stack tight">{secondary("Back to sign in")}</div>
<div class="after"><p>Didn&#39;t ask for this? <a class="text-link" href="#">Cancel the request</a> and reset your password.</p></div>"""
    return frame("Recovery request sent", form, "")


# ---------- Manage two-factor in the admin's account ----------

def method_row(ri, title, detail, acts, note="", plain=False):
    ri_cls = "ri plain" if plain else "ri"
    note_html = ""
    if note:
        note_id, note_text = note
        note_html = f'<p class="row-note" id="{note_id}">{icon("lock")}<span>{note_text}</span></p>'
    return f'<div class="mrow"><span class="{ri_cls}">{icon(ri)}</span><div><p class="mt">{title}</p><p class="type-label">{detail}</p></div><div class="acts">{acts}</div>{note_html}</div>'


def remove_button(what, disabled_by=""):
    if disabled_by:
        return f'<button class="btn btn-ghost sm btn-remove" disabled aria-describedby="{disabled_by}">{icon("trash")}Remove</button>'
    return f'<button class="btn btn-ghost sm btn-remove pressable" aria-label="Remove {what}">{icon("trash")}Remove</button>'


def account_body(only_app=False):
    required = f'<span class="badge badge-success">{icon("check")}On</span>'
    passkey = method_row("key", "Passkey on MacBook Pro", "Added 26 Sep. Last used today, 9:12 AM.", remove_button("passkey on MacBook Pro"))
    app_note = ("last-note", "You can&#39;t remove your only method. Admin accounts always need one. Add a passkey first.") if only_app else ""
    app_remove = remove_button("authenticator app", "last-note" if only_app else "")
    app = method_row("smartphone", "Authenticator app", "Added 26 Sep. Last used 3 days ago.", app_remove, app_note)
    methods = app if only_app else passkey + app
    left = "10 of 10 left" if only_app else "8 of 10 left"
    codes = method_row("list", "Backup codes", f"{left}. Made 26 Sep. Each works once.", '<button class="btn btn-outline sm pressable">Make new codes</button>', plain=True)
    add_label = "Add a passkey" if only_app else "Add another passkey"
    add = f'<div class="sec-foot"><button class="btn btn-outline sm pressable">{icon("plus")}{add_label}</button></div>'
    tip = ""
    if only_app:
        tip = f'<p class="warn-line">{icon("alert")}<span>You have one way in besides backup codes. Add a passkey too, so losing your phone doesn&#39;t lock you out.</span></p>'
    return f"""{build.header("Your account", "Your details and how you sign in.")}
<div class="acct-wrap">
  <section class="panel">{build.card_head("Details", "Only you and Cadence support see these.")}
    {method_row("users-round", ADMIN_NAME, ADMIN_EMAIL, '<button class="btn btn-outline sm pressable">Edit</button>', plain=True)}
  </section>
  <section class="panel">{build.card_head("Password", "At least 10 characters, not common or leaked.")}
    {method_row("lock", "Password", "Changed 12 Sep.", '<button class="btn btn-outline sm pressable">Change password</button>', plain=True)}
  </section>
  <section class="panel" aria-labelledby="tf-title">
    <div class="card-head"><div><h2 class="type-heading req" id="tf-title">Two-factor sign-in {required}</h2><p class="type-label">A second step after your password. Admin accounts need at least one method, so it can&#39;t be turned off.</p></div></div>
    {tip}{methods}{codes}{add}
  </section>
</div>"""


def account_page(title, body, overlay=""):
    """Admin area frame with no rail item on: the account page is reached from the account menu."""
    content = f"<style>{admin_screens.CSS}{ACCOUNT_CSS}</style>{body}{admin_screens.admin_tabs('')}"
    html = build.page(title, content, workspace=False, overlay=overlay)
    html = html.replace('<main class="solo">', f'{admin_screens.admin_rail("")}\n<main>')
    html = admin_screens.admin_topbar(html).replace('<span class="avatar">SA</span>', '<span class="avatar">PS</span>')
    return html.replace("</body>", f"<script>{TWOFA_JS}</script>\n</body>")


def manage():
    return account_page("Your account: two-factor", account_body())


def manage_last_method():
    return account_page("Your account: one two-factor method", account_body(only_app=True))


def remove_dialog():
    overlay = f"""<div class="scrim"></div>
<div class="dlg" role="alertdialog" aria-modal="true" aria-labelledby="rm-title" aria-describedby="rm-desc">
  <div class="dlg-body">
    <div class="mark bad">{icon("key")}</div>
    <div><h2 class="type-heading" id="rm-title">Remove the passkey on MacBook Pro?</h2>
    <p class="type-label" id="rm-desc" style="margin-top:0.375rem;color:var(--foreground)">You won&#39;t be able to sign in with it. You still have your authenticator app and 8 backup codes.</p></div>
    <div class="what-next"><p>{icon("shield")}<span>We ask for a code from your authenticator app to confirm.</span></p><p>{icon("mail")}<span>We email {ADMIN_EMAIL} that it was removed.</span></p></div>
  </div>
  <div class="dlg-foot"><button class="btn btn-outline pressable">Keep passkey</button><button class="btn btn-danger pressable">Remove passkey</button></div>
</div>"""
    return account_page("Your account: remove a passkey", account_body(), overlay)


def new_codes_confirm():
    overlay = f"""<div class="scrim"></div>
<div class="dlg" role="alertdialog" aria-modal="true" aria-labelledby="nc-title" aria-describedby="nc-desc">
  <div class="dlg-body">
    <div class="mark bad">{icon("refresh")}</div>
    <div><h2 class="type-heading" id="nc-title">Make new backup codes?</h2>
    <p class="type-label" id="nc-desc" style="margin-top:0.375rem;color:var(--foreground)">Your 8 unused codes stop working at once. You get 10 new ones, shown one time.</p></div>
  </div>
  <div class="dlg-foot"><button class="btn btn-outline pressable">Cancel</button><button class="btn btn-default pressable">Make new codes</button></div>
</div>"""
    return account_page("Your account: make new backup codes", account_body(), overlay)


def new_codes():
    fresh = ["m4rx-2kbt", "w7cq-9dpe", "t3nh-6fua", "k8zs-4vmg", "y2pd-7rjc", "a6ve-3nwq", "g9tk-5hxb", "u4mb-8cze", "s7wf-2qjd", "d3yn-6ktp"]
    overlay = f"""<div class="scrim"></div>
<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="codes-title">
  <div class="dlg-body">
    <div class="dlg-head"><div><h2 class="type-heading" id="codes-title">Your new backup codes</h2><p class="type-label">Your old codes no longer work. This is the only time we show these.</p></div></div>
    {codes_block(fresh)}
    {saved_check("done")}
  </div>
  <div class="dlg-foot"><button class="btn btn-default pressable needs-check" id="done" disabled>Done</button></div>
</div>"""
    return account_page("Your account: new backup codes", account_body(), overlay)


SCREENS = {
    "setup-choose": setup_choose,
    "setup-app": setup_app,
    "setup-app-wrong-code": lambda: setup_app("wrong"),
    "setup-passkey": setup_passkey,
    "setup-passkey-cancelled": lambda: setup_passkey("cancelled"),
    "setup-backup-codes": backup_codes,
    "sign-in-code": signin_code,
    "sign-in-code-wrong": lambda: signin_code("wrong"),
    "sign-in-passkey": signin_passkey,
    "sign-in-backup-code": signin_backup,
    "sign-in-backup-codes-low": backup_low,
    "sign-in-paused": signin_paused,
    "lost-access": lost_access,
    "lost-access-sent": lost_access_sent,
    "manage": manage,
    "manage-last-method": manage_last_method,
    "manage-remove-passkey": remove_dialog,
    "manage-new-codes-confirm": new_codes_confirm,
    "manage-new-codes": new_codes,
}


def main():
    OUT.mkdir(exist_ok=True)
    for name, render in SCREENS.items():
        html = render()
        (OUT / f"2fa-v1-{name}.html").write_text(html, encoding="utf-8")
    print(f"wrote {len(SCREENS)} screens to {OUT}")


if __name__ == "__main__":
    main()
