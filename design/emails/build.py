"""Cadence product emails as email-safe HTML mockups.

Run from the repo root: python design/emails/build.py
Writes design/emails/out/em-v1-<email>.html.

Email rules these follow (they differ from the app on purpose):
- Table layout, inline styles, 600px max, fluid below that. Web fonts load where the client allows
  (Apple Mail, iOS); everywhere else the stack falls back to system sans.
- No SVG and no background images: Gmail and Outlook drop them. The logo is three table cells.
- Dark mode uses prefers-color-scheme plus Outlook.com's [data-ogsc] hooks. The app never uses
  prefers-color-scheme (docs/DESIGN.md, section 11), but an email cannot read data-theme.
- Colours are the light tokens from docs/DESIGN.md; the dark block maps each one to its dark token.
"""

from pathlib import Path

OUT = Path(__file__).parent / "out"

# Tokens from docs/DESIGN.md, light and dark.
PAPER, PAPER_D = "#F5F6F8", "#0F1116"
CARD, CARD_D = "#FFFFFF", "#171A21"
INK, INK_D = "#1A1D26", "#ECEEF2"
MUTED, MUTED_D = "#5F6879", "#9AA3B2"
RULE, RULE_D = "#E1E4EA", "#272C37"
IRIS = "#4B3FE4"
TINT, TINT_D = "#EDECFC", "#20203F"
TINT_INK, TINT_INK_D = "#4138BE", "#A9A3F5"
DANGER, DANGER_D = "#CF3F57", "#EC6B80"
DANGER_FILL, DANGER_FILL_D = "#FBEDF0", "#2E1A21"
WARN, WARN_D = "#B7740A", "#E5A53D"
WARN_FILL, WARN_FILL_D = "#FBF3E5", "#2C2415"

DISPLAY = "'Bricolage Grotesque', 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
BODY = "'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"

EMAIL = "sam@tartinebakery.com"
ADMIN = "Priya Shah"
BRAND = "Tartine Bakery"
APP = "https://app.cadence.example"

HEAD_CSS = f"""
:root {{ color-scheme: light dark; supported-color-schemes: light dark; }}
body {{ margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; }}
a {{ color: {TINT_INK}; }}
.em-btn a:hover {{ background: #3E33CC !important; }}
@media (max-width: 480px) {{
  .em-pad {{ padding-left: 20px !important; padding-right: 20px !important; }}
  .em-outer {{ padding-left: 12px !important; padding-right: 12px !important; }}
  .em-title {{ font-size: 24px !important; line-height: 30px !important; }}
  .em-code {{ font-size: 32px !important; letter-spacing: 6px !important; }}
  .em-btn, .em-btn tbody, .em-btn tr, .em-btn td, .em-btn a {{ display: block !important; width: 100% !important; box-sizing: border-box; text-align: center !important; }}
  .em-stack td.em-k {{ display: block !important; width: 100% !important; box-sizing: border-box; padding: 10px 0 2px !important; }}
  .em-stack td.em-v {{ display: block !important; width: 100% !important; box-sizing: border-box; padding: 0 0 10px !important; border-top: 0 !important; text-align: left !important; }}
}}
@media (prefers-color-scheme: dark) {{
  .em-bg {{ background: {PAPER_D} !important; }}
  .em-card {{ background: {CARD_D} !important; }}
  .em-ink {{ color: {INK_D} !important; }}
  .em-muted {{ color: {MUTED_D} !important; }}
  .em-rule {{ border-color: {RULE_D} !important; }}
  .em-tint {{ background: {TINT_D} !important; }}
  .em-soft {{ background: #1F232C !important; }}
  .em-tint-ink {{ color: {TINT_INK_D} !important; }}
  .em-danger {{ color: {DANGER_D} !important; }}
  .em-danger-fill {{ background: {DANGER_FILL_D} !important; }}
  .em-warn {{ color: {WARN_D} !important; }}
  .em-warn-fill {{ background: {WARN_FILL_D} !important; }}
  .em-outline {{ border-color: #343A47 !important; color: {INK_D} !important; }}
  a.em-link {{ color: {TINT_INK_D} !important; }}
}}
[data-ogsc] .em-bg {{ background: {PAPER_D} !important; }}
[data-ogsc] .em-card {{ background: {CARD_D} !important; }}
[data-ogsc] .em-ink {{ color: {INK_D} !important; }}
[data-ogsc] .em-muted {{ color: {MUTED_D} !important; }}
[data-ogsc] .em-tint {{ background: {TINT_D} !important; }}
[data-ogsc] .em-tint-ink {{ color: {TINT_INK_D} !important; }}
"""


def logo():
    """The three-bar mark from the app, built from table cells so every client draws it."""
    bars = [(10, "#9C95F0"), (15, IRIS), (12, "#6F65E9")]
    cells = "".join(
        f'<td valign="bottom" style="padding:0 1px"><div style="width:5px;height:{h}px;background:{c};border-radius:3px;font-size:0;line-height:0">&nbsp;</div></td>'
        for h, c in bars
    )
    return (
        f'<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>'
        f'<td valign="bottom" style="padding-right:8px"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="height:16px"><tr>{cells}</tr></table></td>'
        f'<td valign="middle" class="em-ink" style="font-family:{DISPLAY};font-size:17px;line-height:20px;font-weight:600;color:{INK};letter-spacing:-0.2px">Cadence</td>'
        f"</tr></table>"
    )


def title(text):
    return f'<h1 class="em-title em-ink" style="margin:0 0 12px;font-family:{DISPLAY};font-size:28px;line-height:34px;font-weight:600;letter-spacing:-0.6px;color:{INK}">{text}</h1>'


def para(text, muted=False, size=15, space=16):
    color, cls = (MUTED, "em-muted") if muted else (INK, "em-ink")
    line = round(size * 1.55)
    return f'<p class="{cls}" style="margin:0 0 {space}px;font-family:{BODY};font-size:{size}px;line-height:{line}px;color:{color}">{text}</p>'


def link(text, href="#"):
    return f'<a class="em-link" href="{href}" style="color:{TINT_INK};text-decoration:underline">{text}</a>'


def button(label, href="#"):
    """Bulletproof pill: the padding lives on the link so the whole pill is clickable."""
    return (
        f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="em-btn" style="margin:8px 0 24px"><tr>'
        f'<td align="center" bgcolor="{IRIS}" style="border-radius:999px">'
        f'<a href="{href}" style="display:inline-block;padding:14px 28px;font-family:{BODY};font-size:15px;line-height:20px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:999px;background:{IRIS}">{label}</a>'
        f"</td></tr></table>"
    )


def fallback(url):
    """The plain link under a button, for clients that block buttons."""
    return para(f"Button not working? Paste this into your browser:<br>{link(url, url)}", muted=True, size=13, space=0)


def details(rows):
    """Label and value pairs, one per line; they stack on a phone."""
    body = "".join(
        f'<tr><td class="em-k em-muted em-rule" style="padding:10px 12px 10px 0;width:34%;vertical-align:top;border-top:1px solid {RULE};font-family:{BODY};font-size:13px;line-height:20px;color:{MUTED}">{k}</td>'
        f'<td class="em-v em-ink em-rule" style="padding:10px 0;vertical-align:top;border-top:1px solid {RULE};font-family:{BODY};font-size:14px;line-height:21px;color:{INK}">{v}</td></tr>'
        for k, v in rows
    )
    return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="em-stack" style="margin:4px 0 20px">{body}</table>'


def callout(text, tone="tint"):
    """A soft panel; status tones reuse the app's soft status fills."""
    # Text on the status fills stays ink: warning amber on its own fill is only about 3:1.
    fills = {"tint": (TINT, TINT_INK, "em-tint", "em-tint-ink"), "danger": (DANGER_FILL, INK, "em-danger-fill", "em-ink"), "warn": (WARN_FILL, INK, "em-warn-fill", "em-ink")}
    bg, ink, bg_cls, ink_cls = fills[tone]
    return (
        f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px"><tr>'
        f'<td class="{bg_cls}" style="background:{bg};border-radius:14px;padding:14px 16px;font-family:{BODY};font-size:14px;line-height:21px"><span class="{ink_cls}" style="color:{ink}">{text}</span></td>'
        f"</tr></table>"
    )


def post_card(headline, meta, fill="#F0B340"):
    """The first post in the queue: text on the brand colour, not an image, so it reads with images off."""
    return (
        f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px"><tr><td class="em-soft" style="background:{PAPER};border-radius:18px;padding:10px">'
        f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
        f'<td style="background:{fill};border-radius:12px;padding:40px 20px 18px;font-family:{DISPLAY};font-size:26px;line-height:28px;font-weight:600;letter-spacing:-0.6px;color:#1A1D26">{headline}</td></tr>'
        f'<tr><td class="em-ink" style="padding:12px 6px 4px;font-family:{BODY};font-size:14px;line-height:21px;color:{INK}">{meta}</td></tr></table>'
        f"</td></tr></table>"
    )


def queue_rows(rows):
    body = "".join(
        f'<tr><td class="em-ink em-rule" style="padding:10px 0;border-top:1px solid {RULE};font-family:{BODY};font-size:14px;line-height:21px;color:{INK}">{name}<br><span class="em-muted" style="color:{MUTED};font-size:13px">{when}</span></td></tr>'
        for name, when in rows
    )
    return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 4px">{body}</table>'


def email(subject, preheader, content, footer):
    return f"""<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>{subject}</title>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600&family=Instrument+Sans:wght@400;600&display=swap" rel="stylesheet">
<style>{HEAD_CSS}</style>
</head>
<body class="em-bg" style="margin:0;padding:0;background:{PAPER}">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:{PAPER}">{preheader}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="em-bg" style="background:{PAPER}">
<tr><td align="center" class="em-outer" style="padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px">
    <tr><td class="em-pad" style="padding:0 40px 20px">{logo()}</td></tr>
    <tr><td class="em-card em-pad" style="background:{CARD};border-radius:22px;padding:40px">
{content}
    </td></tr>
    <tr><td class="em-pad" style="padding:24px 40px 0">
      <p class="em-muted" style="margin:0;font-family:{BODY};font-size:12px;line-height:19px;color:{MUTED}">{footer}</p>
      <p class="em-muted" style="margin:10px 0 0;font-family:{BODY};font-size:12px;line-height:19px;color:{MUTED}">Cadence by The Scale Agency. {link("Help", "#")}</p>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>"""


AUTH_FOOTER = f"Sent to {EMAIL} because someone used this address on Cadence. This is a security email, so it can't be turned off."
POSTS_FOOTER = f"Sent to {EMAIL} for {BRAND}. You get these when something needs you. {link('Choose which emails you get', '#')}"


def invite():
    url = f"{APP}/invite/7Hq2KfX9"
    content = (
        title(f"{ADMIN} invited you to Cadence")
        + para(f"{ADMIN} at The Scale Agency set up Cadence for <b>{BRAND}</b>. Cadence plans your posts and drafts them in your brand's voice. Nothing goes out until you approve it.")
        + button("Set up your account", url)
        + details([("Brand", BRAND), ("Invited by", f"{ADMIN}, The Scale Agency"), ("Works until", "Sat 3 Oct, 6:00 PM")])
        + para(f"The invite is for {EMAIL}. Not expecting it? Ignore this email and no account is made.", muted=True, size=13)
        + fallback(url)
    )
    footer = f"Sent to {EMAIL} because {ADMIN} at The Scale Agency invited you."
    return email(f"{ADMIN} invited you to Cadence for {BRAND}", f"Set up your account to review and approve posts for {BRAND}. The invite works for 7 days.", content, footer)


def sign_in_code():
    code_block = (
        f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px"><tr>'
        f'<td align="center" class="em-tint" style="background:{TINT};border-radius:16px;padding:22px 12px">'
        f'<span class="em-code em-ink" style="font-family:{DISPLAY};font-size:38px;line-height:44px;font-weight:600;letter-spacing:10px;color:{INK};font-variant-numeric:tabular-nums">482913</span>'
        f"</td></tr></table>"
    )
    content = (
        title("Your sign-in code")
        + para("Enter this code on the Cadence page that asked for it.")
        + code_block
        + para("It works for 10 minutes, and only once. A newer code replaces this one.", muted=True, size=14)
        + para("Didn't try to sign in? Ignore this email. Nobody can get in without the code, and it expires on its own.", muted=True, size=14, space=0)
    )
    return email("482913 is your Cadence code", "Enter it on the sign-in page. It works for 10 minutes.", content, AUTH_FOOTER)


def password_reset():
    url = f"{APP}/reset/c3F8xLw2"
    content = (
        title("Choose a new password")
        + para(f"We got a request to reset the password for {EMAIL}. Use the button to choose a new one.")
        + button("Choose a new password", url)
        + para("The link works once, for 30 minutes.", muted=True, size=14)
        + para("Didn't ask for this? Ignore this email. Your password stays the same.", muted=True, size=14)
        + fallback(url)
    )
    return email("Reset your Cadence password", "The link works once, for 30 minutes.", content, AUTH_FOOTER)


def password_changed():
    content = (
        title("Your password was changed")
        + para(f"The password for {EMAIL} was changed. We signed you out on your other devices.")
        + details([("When", "Sun 27 Sep, 4:12 PM"), ("Device", "Chrome on Windows"), ("Near", "San Francisco, US")])
        + callout(f"Wasn't you? Reset your password now, then {link('contact support', '#')} so we can check your account.", "warn")
        + button("Reset your password", f"{APP}/forgot-password")
        + para("If this was you, there's nothing to do.", muted=True, size=13, space=0)
    )
    return email("Your Cadence password was changed", "If this wasn't you, reset your password now.", content, AUTH_FOOTER)


def approvals():
    """A reminder: posts drafted earlier still wait, and the first one is due soon."""
    url = f"{APP}/c/tartine/approvals"
    content = (
        title("3 posts are waiting for you")
        + para(f"These posts for {BRAND} still need your approval. The first one is due in 2 days.")
        + post_card("Morning buns are back", "<b>Instagram carousel, 5 slides</b>, first in the queue<br>Goes out Tue 29 Sep, 8:30 AM once you approve it")
        + button("Review 3 posts", url)
        + para("A post you don't review by its time stays a draft. Nothing is published without you.", muted=True, size=13, space=0)
    )
    return email("3 posts are waiting for your approval", "First up: an Instagram carousel for Tue 29 Sep, 8:30 AM.", content, POSTS_FOOTER)


def posts_ready():
    """Sent when the agent finishes drafting a batch."""
    url = f"{APP}/c/tartine/approvals"
    content = (
        title("Your new posts are ready to review")
        + para(f"Cadence drafted 6 posts for {BRAND} for the week of 5 Oct, from your current strategy.")
        + post_card("Country loaf, three ways", "<b>Instagram carousel, 5 slides</b>, first of 6<br>Goes out Mon 5 Oct, 8:30 AM once you approve it", "#E7C9A0")
        + button("Review posts", url)
        + para("Approve, edit or skip each one. Nothing is published until you approve it.", muted=True, size=13, space=0)
    )
    return email("Your new posts are ready to review", "6 posts for the week of 5 Oct. First up: an Instagram carousel for Mon 5 Oct, 8:30 AM.", content, POSTS_FOOTER)


def post_failed():
    url = f"{APP}/c/tartine/content/p_91"
    content = (
        title("A post didn't go out")
        + para(f"Your approved Instagram post for {BRAND} was due at 8:30 AM today. Instagram turned it down, so nothing was published.")
        + details([("Post", "Morning buns are back"), ("Network", "Instagram, @tartinebakery"), ("Was due", "Tue 29 Sep, 8:30 AM"), ("Why", "<b>Instagram says the second image is too small.</b> Images need to be at least 320 px wide.")])
        + button("Fix and reschedule", url)
        + para("The post stays approved. Swap the image, pick a new time, and it goes out then.", muted=True, size=13, space=0)
    )
    return email("Your Instagram post didn't go out", "Instagram turned down the image. Fix it and pick a new time.", content, POSTS_FOOTER)


def connection_expired():
    url = f"{APP}/c/tartine/settings?tab=accounts"
    content = (
        title("Reconnect Instagram to keep posting")
        + para(f"Instagram ended Cadence's access to @tartinebakery on Sun 27 Sep. This happens every 60 days, or when the password changes.")
        + callout("4 approved posts are waiting. The next one is due Tue 29 Sep, 8:30 AM.", "warn")
        + queue_rows([("Morning buns are back", "Tue 29 Sep, 8:30 AM"), ("Behind the bench: 4 AM shaping", "Thu 1 Oct, 7:00 AM"), ("Country loaf, sliced", "Sat 3 Oct, 9:00 AM")])
        + para("And 1 more.", muted=True, size=13)
        + button("Reconnect Instagram", url)
        + para("It takes about a minute. Posts that miss their time while you're away come back to you to pick a new one.", muted=True, size=13, space=0)
    )
    return email("Reconnect Instagram so 4 approved posts can go out", "Instagram access ended. The next post is due Tue 29 Sep, 8:30 AM.", content, POSTS_FOOTER)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    emails = {
        "invite": invite(),
        "sign-in-code": sign_in_code(),
        "password-reset": password_reset(),
        "password-changed": password_changed(),
        "posts-ready": posts_ready(),
        "approvals-waiting": approvals(),
        "post-failed": post_failed(),
        "connection-expired": connection_expired(),
    }
    for name, html in emails.items():
        (OUT / f"em-v1-{name}.html").write_text(html, encoding="utf-8")
        print(f"wrote out/em-v1-{name}.html")


if __name__ == "__main__":
    main()
