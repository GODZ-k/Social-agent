"""The loading states the app is still missing: the signed-out auth frame, the two-factor setup
page, and the client's "all brands" grid at /.

Run from design/loading-states: python build.py
Writes ld1-auth-frame.html, ld2-two-factor-setup.html, ld3-your-brands.html and review.html.

Builds on the approved design/web-v2 builders rather than restating them: the auth frame and its
pieces come from auth_screens.py, the two-factor panel and step bar from auth_2fa.py, the brands
grid and top bar from brands_account.py and header_design.py. The skeleton primitives (.sk, the
1.8s pulse, the three greys, reduced-motion off) are the ones S00a/S00b were approved with, so
every loading screen in the app reads as one language.
"""

import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "web-v2"))

import auth_2fa  # noqa: E402
import auth_screens as auth  # noqa: E402
import brands_account as ba  # noqa: E402
import build  # noqa: E402
import header_design as hdr  # noqa: E402
from build import icon  # noqa: E402

OUT = HERE

# Approved skeleton primitives, copied from design/web-v2/onboarding_loading.py (S00a/S00b) with
# the same values, so a reviewer sees one loading language across every screen.
SK_CSS = """
.sk { display: block; background: #e8ecf2; border-radius: 0.5rem; animation: sk-pulse 1.8s ease-in-out infinite; }
.sk.pill, .sk.round { border-radius: 999px; }
.sk.soft { background: #eef1f5; }
.tint-bg .sk { background: #d6e2f6; }
@keyframes sk-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
@media (prefers-reduced-motion: reduce) { .sk { animation: none; } }

/* The auth panel keeps its real tinted ground; only what it says is unknown, so the card and the
   two lines of copy inside it are bones. A paler bone reads on #edecfc. */
.auth-panel .sk { background: #dedcf6; }
.auth-panel .sk.soft { background: #e5e3f8; }
.panel-card { padding: 0.875rem; border-radius: 1.5rem; background: var(--card); box-shadow: var(--elevation-floating); }
.panel-art { aspect-ratio: 5 / 4; border-radius: 1rem; }
.panel-acts { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.875rem; }
.panel-say { max-width: 25rem; margin: 0 auto; display: grid; gap: 0.625rem; justify-items: center; }

/* LD-3: the all-brands grid. Each bone card is .bc's own box, so the real tile drops into the
   same space: same padding, radius, elevation and 1.125rem row gap. */
.bc.sk-card { gap: 1.125rem; }
.bc.sk-card .loop-bones { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 0.375rem; }
.bc.sk-card .strip { min-height: 3rem; border-radius: 1rem; background: #f2f4f8; }
.brands-head .head-bones { display: grid; gap: 0.625rem; }
"""


def sk(width="100%", height="0.875rem", extra="", style=""):
    return f'<span class="sk {extra}" style="width:{width};height:{height};{style}"></span>'


def lines(*widths, height="0.75rem"):
    return "".join(sk(w, height, style="margin-top:0.4rem" if i else "") for i, w in enumerate(widths))


# ---------- The panel beside every auth form ----------

def panel_bones(label):
    """The brand panel's real tinted ground and real card geometry, with bones where the copy goes.
    Which panel a route shows (approvals or two-factor) is only known once the route resolves."""
    return f"""<aside class="auth-panel" aria-label="{label}">
  <div class="queue"><div class="ghost"></div>
    <div class="panel-card">
      <span class="sk panel-art" style="width:100%;height:auto"></span>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin:0.875rem 0.25rem 0">
        {sk("8rem", "0.8125rem")}{sk("6rem", "0.8125rem", "soft")}
      </div>
      <div class="panel-acts">{sk("100%", "2.5rem", "pill", "")}{sk("100%", "2.5rem", "pill", "")}</div>
    </div>
  </div>
  <div class="panel-say">
    {sk("20rem", "1.75rem", "", "max-width:100%")}
    {sk("15rem", "1.75rem", "", "max-width:100%")}
    <div style="margin-top:0.5rem;display:grid;gap:0.375rem;justify-items:center;width:100%">
      {sk("22rem", "0.875rem", "soft", "max-width:100%")}{sk("17rem", "0.875rem", "soft", "max-width:100%")}
    </div>
  </div>
</aside>"""


def two_factor_panel():
    """Only two-factor/setup gets this panel, and its three steps are hardcoded in
    TwoFactorPanel, so the whole card is real. Only the heading and the line under it are bones:
    they are the one thing that differs between an admin and a client."""
    rows = ""
    for name, title, note, state in (
        ("check", "Password", "Something you know", "done"),
        ("key", "Code from your phone or a passkey", "Something you have", "now"),
        ("lock", "Admin area", "Every client and brand", ""),
    ):
        rows += f'<div class="srow {state}"><span class="dot">{icon(name)}</span><span>{title}<small>{note}</small></span></div>'
    return f"""<aside class="auth-panel" aria-label="About two-factor sign-in">
  <div class="queue"><div class="ghost"></div><div class="steps-card">{rows}</div></div>
  <div class="panel-say">
    {sk("20rem", "1.75rem", "", "max-width:100%")}
    {sk("13rem", "1.75rem", "", "max-width:100%")}
    <div style="margin-top:0.5rem;display:grid;gap:0.375rem;justify-items:center;width:100%">
      {sk("22rem", "0.875rem", "soft", "max-width:100%")}{sk("16rem", "0.875rem", "soft", "max-width:100%")}
    </div>
  </div>
</aside>"""


def auth_shell(title, form, panel, switch_bone=True):
    """The approved auth frame with the skeleton CSS injected and the live bits stripped.

    The logo and the footer carry no request data, so they stay real — the house pattern every
    loading.tsx under app/(main) already follows (static chrome stays, only the request-dependent
    column is sketched)."""
    switch = sk("9rem", "0.875rem", "pill", "display:inline-block") if switch_bone else ""
    html = auth.auth_page(title, f"<style>{SK_CSS}</style>{form}", switch, panel)
    # The promise line under the form on small screens is the one piece of copy that varies per
    # route, so it is a bone too, not the sign-in wording the frame hardcodes.
    promise = f'<p class="auth-promise">{sk("17rem", "0.875rem", "soft", "max-width:100%")}</p>'
    html = html.replace(
        f'<p class="auth-promise">{icon("check-circle")}Nothing is published until you approve it.</p>',
        promise,
    )
    return html.replace('aria-busy="x"', "")


def busy(inner):
    return f'<div aria-busy="true" role="status" aria-label="Loading">{inner}</div>'


# ---------- LD-1: app/(auth)/loading.tsx ----------

def auth_frame_loading():
    """One loading state for the whole (auth) group. Today these ten routes inherit app/loading.tsx,
    a 3-row card skeleton in a centred max-w-5xl main — nothing like an auth page. This is the shape
    AuthFormSkeleton already draws (heading, lede, the Google block, the divider, n fields, submit),
    at the two-field height sign-in, sign-up and invite use, inside the real frame."""
    fields = "".join(
        f'<div style="display:grid;gap:0.4375rem">{sk("5rem", "1rem")}{sk("100%", "3rem", "", "border-radius:0.875rem")}</div>'
        for _ in range(2)
    )
    form = busy(f"""
{sk("14rem", "2.25rem", "", "max-width:100%")}
<div style="margin-top:0.75rem">{sk("18rem", "1rem", "soft", "max-width:100%")}</div>
<div style="margin-top:2rem">{sk("100%", "3rem", "", "border-radius:0.875rem")}</div>
<div style="margin:1.5rem auto 0;width:6rem">{sk("100%", "0.75rem", "soft")}</div>
<div style="display:grid;gap:1.125rem;margin-top:1.5rem">
  {fields}
  {sk("100%", "3rem", "pill")}
</div>""")
    return auth_shell("Loading — Cadence", form, panel_bones("About Cadence"))


# ---------- LD-2: app/(auth)/two-factor/setup/loading.tsx ----------

def two_factor_setup_loading():
    """The one auth route that really does block: the page awaits getViewerRole() at its top level,
    so it has no prerenderable shell and the outer boundary is what the person sees. Its first step
    is always the method choice, so the step bar and the two card shapes are known; only the copy,
    which differs for an admin and a client, is a bone."""
    cards = "".join(
        f"""<div class="method" style="cursor:default">
  <span class="sk" style="width:2.5rem;height:2.5rem;border-radius:0.875rem"></span>
  <span style="min-width:0">{sk("9rem", "1rem")}
    <span style="display:block;margin-top:0.5rem">{lines("100%", "70%")}</span></span>
  <span class="sk round" style="width:1.25rem;height:1.25rem;margin-top:0.1rem"></span>
</div>"""
        for _ in range(2)
    )
    form = f'<style>{auth_2fa.TWOFA_CSS}</style>' + busy(f"""
{auth_2fa.progress(1)}
{sk("16rem", "2.25rem", "", "max-width:100%")}
<div style="margin-top:0.75rem;display:grid;gap:0.4rem">
  {sk("22rem", "1rem", "soft", "max-width:100%")}{sk("14rem", "1rem", "soft", "max-width:100%")}
</div>
<div style="display:grid;gap:1.125rem;margin-top:2rem">
  <div style="display:grid;gap:0.75rem">{sk("13rem", "0.875rem")}{cards}</div>
  {sk("100%", "3rem", "pill")}
  <div style="display:grid;gap:0.4rem">{sk("100%", "0.8125rem", "soft")}{sk("60%", "0.8125rem", "soft")}</div>
</div>""")
    return auth_shell("Loading — two-factor", form, two_factor_panel())


# ---------- LD-3: app/(main)/loading.tsx ----------

def brand_card_bones():
    """One .bc in bones: the mark, the name and site, the open circle, the six loop ticks, the
    "Now:" line and the one strip that is either what needs the owner or "Nothing needs you"."""
    ticks = "".join('<span class="sk" style="width:100%;height:0.375rem;border-radius:999px"></span>' for _ in range(6))
    return f"""<article class="bc sk-card" aria-hidden="true">
  <div class="bc-top">
    <span class="sk" style="width:3rem;height:3rem;border-radius:1rem"></span>
    <span style="min-width:0">{sk("8.5rem", "1.1875rem")}
      <span style="display:block;margin-top:0.4375rem">{sk("10rem", "0.8125rem", "soft", "max-width:100%")}</span></span>
    <span class="sk round" style="width:2.25rem;height:2.25rem"></span>
  </div>
  <div class="loop-bones">{ticks}</div>
  {sk("12rem", "0.8125rem", "soft", "margin-top:-0.375rem;max-width:100%")}
  <div class="strip"></div>
</article>"""


def your_brands_loading():
    """app/(main)/loading.tsx: the client's all-brands page awaits getViewer() and
    listActiveBrands() at the top of page.tsx, so the whole route waits. The bar frame, the title
    and the one button are known before the request resolves, so they are real and nothing moves
    when the brands arrive."""
    bar = hdr.bar("", f'<span class="sk round" style="width:2rem;height:2rem"></span>')
    cards = "".join(brand_card_bones() for _ in range(3))
    body = f"<style>{ba.BA_CSS}{SK_CSS}</style>" + f"""<div class="brands-page">
<header class="brands-head">
  <div><h1 class="type-title">Your brands</h1>
    <p class="head-bones" style="margin-top:0.625rem">{sk("13rem", "0.875rem", "soft")}</p></div>
  <a class="btn btn-default pressable" href="#">{icon("plus")}Add a brand</a>
</header>
{busy(f'<div class="brand-grid">{cards}</div>')}
</div>"""
    return hdr.document("Loading — your brands", bar, body, body_class="", solo=True)


SCREENS = {
    "ld1-auth-frame": auth_frame_loading,
    "ld2-two-factor-setup": two_factor_setup_loading,
    "ld3-your-brands": your_brands_loading,
}


def main():
    OUT.mkdir(exist_ok=True)
    for name, render in SCREENS.items():
        (OUT / f"{name}.html").write_text(render(), encoding="utf-8")
    print(f"wrote {len(SCREENS)} screens to {OUT}")


if __name__ == "__main__":
    main()
