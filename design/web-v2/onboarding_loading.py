"""Onboarding route loading (S00): the /onboarding and /admin/.../brand/new loading.tsx
boundary, shown while the server fetches the viewer/client/onboarding data, before the page
even knows whether to show the website step or a step already in progress.

Run from design/web-v2: python onboarding_loading.py
Writes screens-s00/s00a-loading-website-step.html and s00b-loading-resuming.html.
Reuses the same page shell, tokens and skeleton primitives as system_states.py (S03/S06/S09
loading skeletons) so this sits in the same visual language rather than inventing a new one.
"""

from pathlib import Path

from build import page

OUT = Path(__file__).parent / "screens-s00"

# Skeleton primitives copied from system_states.py's approved CSS (same values: colour, radius,
# pulse timing) so every loading.tsx in the app reads as one system, not a one-off.
CSS = """
.sk { display: block; background: #e8ecf2; border-radius: 0.5rem; animation: sk-pulse 1.8s ease-in-out infinite; }
.sk.pill, .sk.round { border-radius: 999px; }
.sk.soft { background: #eef1f5; }
.tint-bg .sk { background: #d6e2f6; }
@keyframes sk-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
@media (prefers-reduced-motion: reduce) { .sk { animation: none; } }

/* S00a: mirrors S01's website step (.start/.url-form/.journey/.step-card), content swapped for bones. */
.slw-wrap { max-width: 46rem; margin: 3.5rem auto 0; text-align: center; }
.slw-form { display: flex; align-items: center; gap: 0.625rem; margin: 2rem auto 0; max-width: 36rem; padding: 0.4375rem 0.4375rem 0.4375rem 1.125rem; border-radius: 999px; background: var(--card); box-shadow: 0 0 0 1px var(--input); }
.slw-journey { position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; max-width: 60rem; margin: 3.5rem auto 0; text-align: left; }
.slw-card { padding: 1.375rem; border-radius: 1.375rem; background: var(--card); box-shadow: var(--elevation-raised); }
.slw-card.now { background: var(--tint); box-shadow: none; }
.slw-num { width: 1.75rem; height: 1.75rem; margin-bottom: 0.875rem; }
@media (max-width: 900px) {
  .slw-journey { grid-template-columns: minmax(0, 1fr); gap: 0.75rem; max-width: 34rem; }
  .slw-card { display: grid; grid-template-columns: 2.5rem minmax(0, 1fr); column-gap: 0.75rem; align-items: start; }
  .slw-num { grid-row: span 3; margin-bottom: 0; }
}
@media (max-width: 560px) {
  .slw-wrap { margin-top: 2rem; }
  .slw-form { flex-direction: column; align-items: stretch; border-radius: 1.5rem; padding: 0.5rem; gap: 0.5rem; }
}

/* S00b: the frame every mid-flow step shares (step bar, then a panel + side panel), before the
   fetch resolves which of connect / the questionnaire / research it actually is. */
.slr-flow { display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin: 1.5rem auto 0; flex-wrap: wrap; }
.slr-flow .line { width: 2rem; height: 2px; background: var(--border); }
.slr-grid { display: grid; grid-template-columns: minmax(0, 1fr) 19rem; gap: 1.25rem; max-width: 62rem; margin: 1.75rem auto 0; align-items: start; }
.slr-main { min-height: 24rem; }
.slr-row { display: flex; gap: 0.875rem; align-items: flex-start; padding: 0.9rem 0; border-top: 1px solid var(--border); }
.slr-row:first-child { border-top: 0; }
.slr-kv { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.75rem; padding: 0.625rem 0; border-top: 1px solid var(--border); align-items: center; }
.slr-kv:first-of-type { border-top: 0; padding-top: 0; }
@media (max-width: 900px) { .slr-grid { grid-template-columns: minmax(0, 1fr); } .slr-side { display: none; } }
@media (max-width: 560px) { .slr-grid { margin-top: 1.25rem; } }
"""

STYLE = f"<style>{CSS}</style>"


def sk(width="100%", height="0.875rem", extra="", style=""):
    return f'<span class="sk {extra}" style="width:{width};height:{height};{style}"></span>'


def lines(*widths, height="0.75rem"):
    return "".join(sk(w, height, style="margin-top:0.4rem" if i else "") for i, w in enumerate(widths))


# ---------- S00a: first-time shape (mirrors S01) ----------

def loading_website_step():
    """app/onboarding/loading.tsx, no client yet: the website step's headline, url pill and 3 step cards."""
    # Fixed widths, not flex-grow: `.slw-form` switches to a column at 560px, where a `flex:1`
    # bar's height collapses (flex-basis:0 overrides the inline height in the column axis).
    form = f'<div class="slw-form" aria-hidden="true">{sk("1.5rem", "1.5rem", "round", "flex:none")}{sk("60%", "1rem", "", "margin:0 0.75rem")}{sk("9rem", "2.75rem", "pill", "flex:none;margin-left:auto")}</div>'
    # Each card is a number bone, a title bone, two detail bones and a meta row: the fields
    # StartJourney (S01) fills in, so the skeleton claims the same space the real cards will.
    cards = ""
    for i in range(3):
        cls = "slw-card now tint-bg" if i == 0 else "slw-card"
        cards += (
            f'<div class="{cls}">'
            f'<span class="sk round slw-num" style="width:1.75rem;height:1.75rem;display:block"></span>'
            f'<span class="sk" style="width:80%;height:1rem"></span>'
            f'<div style="margin-top:0.5rem">{lines("100%", "60%")}</div>'
            f'<div style="display:flex;align-items:center;gap:0.375rem;margin-top:0.875rem">'
            f'{sk("0.875rem", "0.875rem", "round")}{sk("6rem", "0.75rem")}</div>'
            f"</div>"
        )
    body = f"""{STYLE}
<div aria-busy="true" aria-label="Loading">
<section class="slw-wrap">
  {sk("22rem", "2.75rem", "", "max-width:80vw;margin:0 auto")}
  <div style="margin-top:1rem">{sk("28rem", "1rem", "", "max-width:85vw;margin:0 auto")}</div>
  {form}
  <div style="margin-top:0.875rem">{sk("18rem", "0.8125rem", "", "max-width:75vw;margin:0 auto")}</div>
</section>
<section class="slw-journey" aria-hidden="true">{cards}</section>
<div style="margin-top:2.5rem">{sk("16rem", "0.875rem", "", "max-width:75vw;margin:0 auto")}</div>
</div>"""
    return page("Onboarding: loading", body, workspace=False)


# ---------- S00b: resuming shape (shared frame of connect / questionnaire / research) ----------

def loading_resuming():
    """app/onboarding/loading.tsx, a client already onboarding: the step bar plus a generic
    panel + side-panel frame that all three in-progress steps (connect, questionnaire, research)
    share, before the fetch says which one this client actually left off at."""
    dots = "".join(
        f'<span style="display:inline-flex;align-items:center;gap:0.5rem">{sk("1.375rem", "1.375rem", "round")}{sk("5rem", "0.8125rem", "", "" if i == 1 else "opacity:0.6")}</span>'
        + ('<span class="line"></span>' if i < 2 else "")
        for i in range(3)
    )
    rows = "".join(
        f'<div class="slr-row">{sk("2.25rem", "2.25rem", "round", "flex:none")}'
        f'<div style="flex:1">{sk("40%", "0.875rem")}<div style="margin-top:0.5rem">{lines("90%", "70%")}</div></div></div>'
        for _ in range(4)
    )
    side_rows = "".join(f'<div class="slr-kv">{sk("6rem", "0.75rem")}{sk("5rem", "1.25rem", "pill")}</div>' for _ in range(5))
    body = f"""{STYLE}
<div aria-busy="true" aria-label="Loading">
<nav class="slr-flow" aria-hidden="true">{dots}</nav>
<section class="slr-grid">
  <section class="panel slr-main">
    {sk("14rem", "1.25rem")}
    <div style="margin-top:0.375rem">{sk("20rem", "0.8125rem", "", "max-width:100%")}</div>
    <div style="margin-top:1.25rem">{rows}</div>
  </section>
  <aside class="panel slr-side">
    {sk("9rem", "1rem")}
    <div style="margin-top:0.375rem">{sk("11rem", "0.75rem", "", "max-width:100%")}</div>
    <div style="margin-top:1rem">{side_rows}</div>
  </aside>
</section>
</div>"""
    return page("Onboarding: loading", body, workspace=False)


SCREENS = {
    "s00a-loading-website-step": loading_website_step,
    "s00b-loading-resuming": loading_resuming,
}


def main():
    OUT.mkdir(exist_ok=True)
    for name, render in SCREENS.items():
        (OUT / f"{name}.html").write_text(render(), encoding="utf-8")
    print(f"wrote {len(SCREENS)} screens to {OUT}")


if __name__ == "__main__":
    main()
