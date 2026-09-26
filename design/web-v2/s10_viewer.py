"""S10 v3: the post viewer that opens from "See all slides full size" (or Space) on Approvals.

Run from design/web-v2: python s10_viewer.py
The viewer shows the post as big as the screen allows and keeps the decision in reach:
approve, ask for changes or reject without closing it. Writes screens-s10/s10-v3-<state>.html.
"""

from pathlib import Path

import build
from build import icon, art, thumb, FORMATS, PLATFORMS, QUEUE, approvals_v3

OUT = Path(__file__).parent / "screens-s10"

build.obs.ICONS.update({
    "pause": '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
    "volume-x": '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/>',
})

# The five slides of "New from the kiln, take 2": one caption, five pictures.
SLIDES = [
    ("New from the kiln, take 2", "yellow"),
    ("Speckled mugs, 24 made", "blue"),
    ("Bowls in sea glass", "ink"),
    ("What sold out last time", "yellow"),
    ("In the shop Friday, 10 AM", "blue"),
]

# The format as the owner says it: "Instagram carousel, 5 slides", "Facebook image post".
KIND_NAMES = {"image": "Image post", "carousel": "Carousel", "reel": "Reel", "story": "Story"}

CSS = """
body.viewer-open { overflow: hidden; }
.viewer:has(~ .v-toast) .v-keys { visibility: hidden; }
.viewer { position: fixed; inset: 0; z-index: 60; display: grid; grid-template-columns: minmax(0, 1fr) 24rem; grid-template-rows: auto minmax(0, 1fr) auto;
  background: rgba(12, 15, 22, 0.94); backdrop-filter: blur(18px); color: #fff; overflow: hidden; }
.v-top { grid-column: 1; grid-row: 1; display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.5rem 0.5rem; min-width: 0; }
.v-close { flex: none; display: grid; place-items: center; width: 2.75rem; height: 2.75rem; border-radius: 999px; background: rgba(255, 255, 255, 0.14); color: #fff; }
.v-close:hover { background: rgba(255, 255, 255, 0.24); }
.v-title { min-width: 0; display: grid; gap: 0.5rem; }
.v-title h2 { font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; letter-spacing: -0.015em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.v-facts { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.v-facts .fact { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.25rem 0.6875rem; border-radius: 999px; background: rgba(255, 255, 255, 0.12); font-size: 0.8125rem; color: rgba(255, 255, 255, 0.86); }
.v-facts .fact.strong { background: rgba(255, 255, 255, 0.2); color: #fff; font-weight: 600; }
.v-facts .fact .i { width: 0.875rem; height: 0.875rem; }
.v-queue { margin-left: auto; flex: none; display: flex; align-items: center; gap: 0.25rem; font-size: 0.8125rem; color: rgba(255, 255, 255, 0.72); }
.v-queue button { display: grid; place-items: center; width: 2.25rem; height: 2.25rem; border-radius: 999px; color: #fff; }
.v-queue button:hover { background: rgba(255, 255, 255, 0.14); }
.v-queue button[disabled] { opacity: 0.35; }
.v-stage { grid-column: 1; grid-row: 2; position: relative; display: flex; align-items: center; justify-content: center; gap: 1.25rem; padding: 0.75rem 1.5rem; min-height: 0; touch-action: pan-y; }
.v-frame { position: relative; flex: none; width: min(calc(100% - 8.5rem), calc((100dvh - 14.5rem) * 0.8), 38rem); }
.v-frame .art { width: 100%; aspect-ratio: 4 / 5; border-radius: 1.25rem; box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.6); }
.v-frame.reel { width: min(calc(100% - 8.5rem), calc((100dvh - 14.5rem) * 0.5625), 26rem); }
.v-frame.reel .art { aspect-ratio: 9 / 16; }
.v-frame.single { width: min(calc(100% - 3rem), calc(100dvh - 14.5rem), 40rem); }
.v-frame.single .art { aspect-ratio: 1 / 1; }
.v-count { position: absolute; z-index: 2; left: 0.875rem; top: 0.875rem; padding: 0.25rem 0.625rem; border-radius: 999px; background: rgba(12, 15, 22, 0.62); color: #fff; font-size: 0.8125rem; font-weight: 600; }
.v-nav { flex: none; display: grid; place-items: center; width: 3rem; height: 3rem; border-radius: 999px; background: rgba(255, 255, 255, 0.14); color: #fff; }
.v-nav:hover { background: rgba(255, 255, 255, 0.26); }
.v-nav[disabled] { opacity: 0.3; }
.v-nav .i { width: 1.25rem; height: 1.25rem; }
.v-foot { grid-column: 1; grid-row: 3; display: grid; justify-items: center; gap: 0.75rem; padding: 0.25rem 1.5rem 1.25rem; }
.v-strip { display: flex; gap: 0.5rem; }
.v-strip button { width: 3rem; border-radius: 0.625rem; opacity: 0.5; }
.v-strip button .thumb { width: 3rem; height: auto; aspect-ratio: 4 / 5; border-radius: 0.625rem; }
.v-strip button.on { opacity: 1; box-shadow: 0 0 0 2px rgba(12, 15, 22, 1), 0 0 0 4px #fff; }
.v-dots { display: none; gap: 0.375rem; }
.v-dots span { width: 0.4375rem; height: 0.4375rem; border-radius: 999px; background: rgba(255, 255, 255, 0.38); }
.v-dots span.on { width: 1.25rem; background: #fff; }
.v-keys { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 0.375rem 0.5rem; font-size: 0.8125rem; color: rgba(255, 255, 255, 0.66); }
.v-keys .kbd, .v-panel .kbd { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.22); color: #fff; }
.v-keys .gap { width: 0.625rem; }
.v-swipe-note { display: none; font-size: 0.8125rem; color: rgba(255, 255, 255, 0.66); }

/* The decision panel: a light card on the dark stage, so the post reads as the post and the panel as the tool. */
.v-panel { grid-column: 2; grid-row: 1 / 4; margin: 0.75rem 0.75rem 0.75rem 0; border-radius: 1.75rem; background: var(--card); color: var(--foreground);
  display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
.v-detail { flex: 1; min-height: 0; overflow-y: auto; padding: 1.5rem 1.5rem 0.5rem; display: grid; gap: 1rem; align-content: start; }
.v-detail .goes-out { margin-top: 0; }
.v-detail .read-block { margin-top: 0; }
.v-detail .caption-text { font-size: 0.875rem; }
.v-dock { display: grid; gap: 0.625rem; padding: 1rem 1.5rem 1.25rem; border-top: 1px solid var(--border); }
.v-dock .warn-note { padding: 0.625rem 0.875rem; }
.v-dock .warn-note .short { display: none; }
.v-short-caption { display: none; font-size: 0.875rem; line-height: 1.45; }
.v-decide { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.v-decide .approve { grid-column: 1 / -1; grid-row: 1; }
.v-decide .v-ask { grid-column: 1; grid-row: 2; }
.v-decide .reject { grid-column: 2; grid-row: 2; color: var(--destructive); }
.v-decide .btn { padding: 0 0.75rem; }
.v-panel-keys { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 0.375rem; font-size: 0.75rem; color: var(--muted-foreground); }
.v-panel-keys .kbd { background: var(--card); border-color: var(--border); color: var(--muted-foreground); }

/* Reel: the controls sit under the video, on the dark stage, so they never cover the picture. */
.v-play { position: absolute; z-index: 2; left: 50%; top: 50%; transform: translate(-50%, -50%); display: grid; place-items: center; width: 4.5rem; height: 4.5rem; border-radius: 999px;
  background: rgba(12, 15, 22, 0.55); backdrop-filter: blur(8px); color: #fff; }
.v-play .i { width: 1.75rem; height: 1.75rem; margin-left: 0.2rem; fill: currentColor; }
.v-player { width: min(100%, 30rem); display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; align-items: center; gap: 0.75rem; }
.v-player .ctl { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 999px; background: rgba(255, 255, 255, 0.14); color: #fff; }
.v-player .ctl .i.fill { fill: currentColor; }
.v-bar { position: relative; height: 0.3125rem; border-radius: 999px; background: rgba(255, 255, 255, 0.24); }
.v-bar i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 999px; background: #fff; }
.v-bar b { position: absolute; top: 50%; width: 0.875rem; height: 0.875rem; margin: -0.4375rem 0 0 -0.4375rem; border-radius: 999px; background: #fff; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4); }
.v-time { font-size: 0.8125rem; color: rgba(255, 255, 255, 0.8); white-space: nowrap; font-variant-numeric: tabular-nums; }

/* Mid-swipe: the slide follows the finger and the next one comes in behind it. */
.v-frame.swiping .art.current { transform: translateX(-34%); }
.v-frame.swiping .art.incoming { position: absolute; inset: 0 auto auto 0; transform: translateX(calc(66% + 1rem)); opacity: 0.9; }
.v-frame.swiping .v-count { display: none; }
.v-touch { position: absolute; z-index: 3; top: 55%; left: 38%; width: 3.25rem; height: 3.25rem; border-radius: 999px; background: rgba(255, 255, 255, 0.34); box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.12); }

.v-toast { position: fixed; z-index: 70; left: calc((100vw - 24.75rem) / 2); bottom: 0.875rem; transform: translateX(-50%); width: min(28rem, calc(100vw - 1.5rem)); display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem 0.75rem 0.75rem 1rem; border-radius: 1.25rem; background: var(--card); color: var(--foreground); box-shadow: var(--elevation-floating); font-size: 0.875rem; line-height: 1.4; }
.v-toast .ok { flex: none; display: grid; place-items: center; width: 1.75rem; height: 1.75rem; border-radius: 999px; background: rgba(23, 138, 94, 0.12); color: var(--success); }
.v-toast p { flex: 1; min-width: 0; }
.v-toast .muted { color: var(--muted-foreground); }

/* Tablet: no side panel. The details fold into a dock under the post; the decision stays one tap away. */
@media (max-width: 1023px) {
  .viewer { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr) auto auto; }
  .v-panel { grid-column: 1; grid-row: 4; margin: 0; border-radius: 1.5rem 1.5rem 0 0; }
  .v-detail { display: none; }
  .v-dock { border-top: 0; padding: 1rem 1.25rem 1.25rem; }
  .v-short-caption { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .v-decide { grid-template-columns: 1fr 1.3fr 1fr; }
  .v-decide .approve { grid-column: 3; grid-row: 1; }
  .v-decide .reject { grid-column: 1; grid-row: 1; }
  .v-decide .v-ask { grid-column: 2; grid-row: 1; }
  .v-panel-keys { display: none; }
  .v-frame { width: min(calc(100% - 8rem), calc((100dvh - 26rem) * 0.8), 34rem); }
  .v-frame.reel { width: min(calc(100% - 8rem), calc((100dvh - 26rem) * 0.5625), 24rem); }
  .v-frame.single { width: min(calc(100% - 2rem), calc(100dvh - 26rem), 34rem); }
  .v-keys { display: none; }
  .v-swipe-note { display: block; }
  .v-toast { left: 50%; bottom: 13.5rem; }
}
/* Phone: full screen. Swipe sideways for slides, down to close; the decision sits at the thumb. */
@media (max-width: 560px) {
  .v-top { padding: 0.75rem 1rem 0.25rem; gap: 0.75rem; flex-wrap: wrap; }
  .v-close { width: 2.5rem; height: 2.5rem; }
  .v-title { order: 3; flex-basis: 100%; gap: 0.375rem; }
  .v-title h2 { font-size: 1.0625rem; }
  .v-facts .fact { font-size: 0.75rem; padding: 0.1875rem 0.5625rem; }
  .v-queue .step { display: none; }
  .v-stage { padding: 0.5rem 1rem; }
  .v-nav { display: none; }
  .v-frame { width: min(100%, calc((100dvh - 30rem) * 0.8)); }
  .v-frame.single { width: min(100%, calc(100dvh - 30rem)); }
  .v-frame.reel { width: min(100%, calc((100dvh - 30rem) * 0.5625)); }
  .v-dock .warn-note .long { display: none; }
  .v-dock .warn-note .short { display: inline; }
  .v-strip { display: none; }
  .v-dots { display: flex; }
  .v-foot { padding: 0.25rem 1rem 0.625rem; gap: 0.5rem; }
  .v-dock { padding: 0.875rem 1rem 1rem; gap: 0.5rem; }
  .v-dock .warn-note { font-size: 0.75rem; padding: 0.5rem 0.75rem; }
  .v-short-caption { -webkit-line-clamp: 1; font-size: 0.8125rem; }
  .v-decide { grid-template-columns: 1fr 1fr; }
  .v-decide .approve { grid-column: 2; grid-row: 1; }
  .v-decide .reject { grid-column: 1; grid-row: 1; }
  .v-decide .v-ask { grid-column: 1 / -1; grid-row: 2; height: 2.5rem; }
  .v-player { grid-template-columns: auto minmax(0, 1fr) auto; }
  .v-player .mute { display: none; }
  .v-toast { bottom: 13.75rem; }
}
@media (prefers-reduced-motion: reduce) { .v-frame .art { transition: none; } }
"""


def facts(platform, fmt, detail, when):
    """Where it goes, what it is, when: e.g. Instagram, Carousel, 5 slides, Thursday 1 October, 1:00 PM."""
    fmt_icon = FORMATS[fmt][0]
    kind = f"{KIND_NAMES[fmt]}, {detail}" if detail else KIND_NAMES[fmt]
    return (f'<div class="v-facts"><span class="fact strong">{icon(platform)}{PLATFORMS[platform]}</span>'
            f'<span class="fact strong">{icon(fmt_icon)}{kind}</span><span class="fact">{icon("calendar")}{when}</span></div>')


def top(title, platform, fmt, detail, when, position, total):
    first = " disabled" if position == 1 else ""
    fact_pills = facts(platform, fmt, detail, when)
    return f"""<header class="v-top">
  <button class="v-close pressable" aria-label="Close, back to approvals (Esc)">{icon("x")}</button>
  <div class="v-title"><h2 id="viewer-title">{title}</h2>{fact_pills}</div>
  <div class="v-queue"><button class="step pressable" aria-label="Previous post"{first}>{icon("chevron-left")}</button><span>Post {position} of {total}</span><button class="step pressable" aria-label="Next post">{icon("chevron-right")}</button></div>
</header>"""


def slide_art(index, font_size="clamp(1.5rem, 3.2vw, 3rem)", cls=""):
    title, variant = SLIDES[index]
    html = art(title, variant, font_size=font_size)
    return html.replace('class="art ', f'class="art {cls} ', 1) if cls else html


def carousel_stage(current, swiping=False):
    """Slide `current` (0-based) of five, with arrows either side on desktop and tablet."""
    number = current + 1
    first = " disabled" if current == 0 else ""
    last = " disabled" if current == len(SLIDES) - 1 else ""
    if swiping:
        leaving = slide_art(current, cls="current")
        incoming = slide_art(current + 1, cls="incoming")
        inner = leaving + incoming + '<span class="v-touch" aria-hidden="true"></span>'
        frame_cls = "v-frame swiping"
    else:
        inner = slide_art(current)
        frame_cls = "v-frame"
    return f"""<div class="v-stage" aria-roledescription="carousel">
  <button class="v-nav pressable" aria-label="Previous slide"{first}>{icon("chevron-left")}</button>
  <div class="{frame_cls}" role="group" aria-roledescription="slide" aria-label="Slide {number} of {len(SLIDES)}"><span class="v-count">{number} / {len(SLIDES)}</span>{inner}</div>
  <button class="v-nav pressable" aria-label="Next slide"{last}>{icon("chevron-right")}</button>
</div>"""


def strip_button(index, current):
    title, variant = SLIDES[index]
    if index == current:
        return f'<button class="pressable on" aria-label="Slide {index + 1}: {title}" aria-current=true>{thumb(variant)}</button>'
    return f'<button class="pressable" aria-label="Slide {index + 1}: {title}">{thumb(variant)}</button>'


def carousel_foot(current):
    strip = "".join(strip_button(i, current) for i in range(len(SLIDES)))
    dots = "".join(f'<span class="{"on" if i == current else ""}"></span>' for i in range(len(SLIDES)))
    keys = ('<span class="kbd">&larr;</span><span class="kbd">&rarr;</span> slides<span class="gap"></span>'
            '<span class="kbd">&uarr;</span><span class="kbd">&darr;</span> posts<span class="gap"></span><span class="kbd">Esc</span> close')
    return f"""<div class="v-foot">
  <div class="v-strip" role="tablist" aria-label="All 5 slides">{strip}</div>
  <div class="v-dots" aria-hidden="true">{dots}</div>
  <p class="v-swipe-note">Swipe for the next slide. Swipe down to close.</p>
  <div class="v-keys">{keys}</div>
</div>"""


def panel(when_long, relative, times, caption, hashtags, why, network):
    pills = "".join(f'<span class="pill{" on" if i == 0 else ""}">{t}</span>' for i, t in enumerate(times))
    tags = "".join(f'<span class="badge badge-neutral">{t}</span>' for t in hashtags)
    return f"""<aside class="v-panel" aria-label="Decide on this post">
  <div class="v-detail">
    <div class="goes-out">
      <p class="type-label">Goes out</p>
      <p class="goes-out-when">{when_long}</p>
      <p class="type-label">{relative}</p>
      <div class="time-change"><span class="type-label">Change the time:</span>{pills}<button class="pill pressable">{icon("clock")}Other time</button></div>
    </div>
    <div class="read-block"><p class="type-label">Caption</p><p class="caption-text">{caption}</p></div>
    <div class="read-block"><p class="type-label">Hashtags</p><div class="pills">{tags}</div></div>
    <div class="note">{icon("sparkles")}<span>{why}</span></div>
  </div>
  <div class="v-dock">
    <p class="v-short-caption">{caption}</p>
    <div class="warn-note">{icon("alert")}<span class="long">{network} isn&rsquo;t connected. If you approve, the post waits and goes out once you connect.</span><span class="short">{network} isn&rsquo;t connected. Approved posts wait until you connect.</span></div>
    <div class="v-decide">
      <button class="btn lg btn-success pressable approve">{icon("check")}Approve</button>
      <button class="btn lg btn-outline pressable v-ask">{icon("pencil")}Ask for changes</button>
      <button class="btn lg btn-outline pressable reject">{icon("x")}Reject</button>
    </div>
    <div class="v-panel-keys"><span class="kbd">A</span> approve <span class="kbd">E</span> ask for changes <span class="kbd">R</span> reject</div>
  </div>
</aside>"""


KILN = QUEUE[0]
KILN_PANEL = dict(when_long="Thursday 1 October, 1:00 PM", relative="In 3 days", times=["1:00 PM", "6:00 PM", "9:00 AM"], caption=KILN[6],
                  hashtags=["#pottery", "#smallbatch", "#handmade", "#ceramics"],
                  why="Why this post: it fills the &ldquo;New from the kiln&rdquo; theme (30% of the month) and Thursday&rsquo;s best time.", network="Instagram")


def viewer(label, top_html, stage, foot, side, extra=""):
    return (f'<style>{CSS}</style><div class="viewer" role="dialog" aria-modal="true" aria-labelledby="viewer-title" aria-label="{label}">'
            f'{top_html}{stage}{foot}{side}</div>{extra}')


def with_viewer(overlay):
    """The approvals screen underneath, as the owner left it, with the viewer on top."""
    html = approvals_v3()
    html = html.replace('<body class="brand-tartine">', '<body class="brand-tartine viewer-open">')
    return html.replace("</body>", f"{overlay}\n</body>")


def carousel(current=1, swiping=False):
    title, _, platform, fmt, detail, when, _ = KILN
    top_html = top(title, platform, fmt, detail, "Thursday 1 October, 1:00 PM", 1, 5)
    stage = carousel_stage(current, swiping)
    foot = carousel_foot(current)
    side = panel(**KILN_PANEL)
    overlay = viewer("Post full size", top_html, stage, foot, side)
    return with_viewer(overlay)


def carousel_slide_2():
    """S10 a: the carousel full size on slide 2 of 5, decisions in the panel beside it."""
    return carousel(1)


def carousel_swiping():
    """S10 c: on a phone, dragging slide 2 away; slide 3 follows the finger in. Built for 390 px."""
    return carousel(1, swiping=True)


def reel():
    """S10 b: a reel full size, paused at 0:12 of 0:45, sound off until the owner turns it on."""
    title, variant, platform, fmt, detail, _, caption = QUEUE[2]
    top_html = top(title, platform, fmt, "45 seconds", "Monday 5 October, 9:00 AM", 3, 5)
    stage = f"""<div class="v-stage">
  <div class="v-frame reel" role="group" aria-label="Reel, 45 seconds">{art(title, variant, font_size="clamp(1.4rem, 2.4vw, 2.25rem)")}
    <button class="v-play pressable" aria-label="Play">{icon("play")}</button></div>
</div>"""
    foot = f"""<div class="v-foot">
  <div class="v-player">
    <button class="ctl pressable" aria-label="Play">{icon("play", "i fill")}</button>
    <div class="v-bar" role="slider" aria-label="Position" aria-valuemin="0" aria-valuemax="45" aria-valuenow="12" aria-valuetext="0:12 of 0:45"><i style="width:27%"></i><b style="left:27%"></b></div>
    <span class="v-time">0:12 / 0:45</span>
    <button class="ctl mute pressable" aria-label="Turn sound on">{icon("volume-x")}</button>
  </div>
  <p class="v-swipe-note">Tap to play. Swipe down to close.</p>
  <div class="v-keys"><span class="kbd">Space</span> play or pause<span class="gap"></span><span class="kbd">&larr;</span><span class="kbd">&rarr;</span> 5 seconds<span class="gap"></span><span class="kbd">&uarr;</span><span class="kbd">&darr;</span> posts<span class="gap"></span><span class="kbd">Esc</span> close</div>
</div>"""
    side = panel("Monday 5 October, 9:00 AM", "In 7 days", ["9:00 AM", "1:00 PM", "6:00 PM"], caption,
                 ["#studiolife", "#pottery", "#behindthescenes", "#ceramics"],
                 "Why this post: reels reach new people fastest, and Monday 9:00 AM is when your audience opens Instagram most.", "Instagram")
    overlay = viewer("Reel full size", top_html, stage, foot, side)
    return with_viewer(overlay)


def after_approve():
    """S10 d: the owner approved from the viewer; it moves to the next post and offers Undo."""
    title, variant, platform, fmt, detail, _, caption = QUEUE[1]
    top_html = top(title, platform, fmt, detail, "Saturday 3 October, 5:00 PM", 1, 4)
    stage = f"""<div class="v-stage">
  <div class="v-frame single" role="group" aria-label="Image post">{art(title, variant, font_size="clamp(1.5rem, 3.2vw, 3rem)")}</div>
</div>"""
    foot = """<div class="v-foot"><p class="v-swipe-note">Swipe down to close.</p><div class="v-keys"><span class="kbd">&uarr;</span><span class="kbd">&darr;</span> posts<span class="gap"></span><span class="kbd">Esc</span> close</div></div>"""
    side = panel("Saturday 3 October, 5:00 PM", "In 5 days", ["5:00 PM", "11:00 AM", "7:00 PM"], caption,
                 ["#breakfast", "#handmade", "#ceramics", "#mugshot"],
                 "Why this post: weekend breakfast photos get the most saves, and it fills the &ldquo;On the table&rdquo; theme.", "Facebook")
    toast = f"""<div class="v-toast" role="status"><span class="ok">{icon("check")}</span>
  <p><b>Approved &ldquo;New from the kiln, take 2&rdquo;.</b> <span class="muted">It waits for Instagram.</span></p>
  <button class="btn sm btn-outline pressable">Undo</button></div>"""
    overlay = viewer("Post full size", top_html, stage, foot, side, toast)
    return with_viewer(overlay)


STATES = {
    "carousel": carousel_slide_2,
    "reel": reel,
    "phone-swipe": carousel_swiping,
    "after-approve": after_approve,
}


def main():
    OUT.mkdir(exist_ok=True)
    for name, make in STATES.items():
        html = make()
        (OUT / f"s10-v3-{name}.html").write_text(html, encoding="utf-8")
    print(f"wrote {len(STATES)} screens to {OUT}")


if __name__ == "__main__":
    main()
