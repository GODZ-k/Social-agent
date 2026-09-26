"""S12 Analytics v3: what the posts did, in plain words, and what the agent changed because of it.

Run from design/web-v2: python s12_analytics.py
Writes screens-s12/s12-v3-<state>.html for three states: empty, first week, a month of results.
"""

from pathlib import Path

import build
from build import icon, page, header, tabbar, thumb, card_head, segmented, FORMATS, PLATFORMS

OUT = Path(__file__).parent / "screens-s12"

build.obs.ICONS.update({
    "bookmark": '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    "user-plus": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    "eye": '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    "heart": '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
    "link": '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
})

CSS = """
<style>
/* S12 analytics */
.an-summary { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 1.25rem; align-items: center; padding: 1.25rem 1.5rem; border-radius: 1.375rem; background: var(--tint); margin-bottom: 1.25rem; }
.an-summary .icon-wrap { display: grid; place-items: center; width: 3rem; height: 3rem; border-radius: 999px; background: var(--card); color: var(--tint-foreground); }
.an-summary h2 { max-width: 46ch; }
.an-summary p { margin-top: 0.375rem; color: var(--muted-foreground); max-width: 70ch; }
.kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1.25rem; margin-bottom: 1.25rem; }
.kpi { display: flex; flex-direction: column; }
.kpi .kpi-top { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
.kpi .kpi-label { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; }
.kpi .kpi-label .i { width: 1rem; height: 1rem; color: var(--muted-foreground); }
.kpi .value { font-size: 2.25rem; line-height: 1.05; margin-top: 0.75rem; }
.kpi .kpi-why { margin-top: 0.5rem; font-size: 0.875rem; line-height: 1.45; color: var(--muted-foreground); }
.verdict { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.125rem 0.625rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
.verdict.good { background: rgba(23, 138, 94, 0.12); color: var(--success); }
.verdict.usual { background: var(--secondary); color: var(--muted-foreground); }
.verdict.low { background: rgba(183, 116, 10, 0.14); color: var(--warning); }
.verdict.early { background: var(--tint); color: var(--tint-foreground); }
.trend-grid { display: grid; grid-template-columns: minmax(0, 1fr); }
.chart-narrow { display: none; }
.chart-foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem 1.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); }
.best-day { display: flex; align-items: center; gap: 0.75rem; min-width: 0; font-size: 0.875rem; }
.best-day .chip-thumb .thumb { width: 2.5rem; height: 2.5rem; border-radius: 0.625rem; }
.chart-key { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; font-size: 0.8125rem; color: var(--muted-foreground); }
.chart-key span { display: inline-flex; align-items: center; gap: 0.4rem; }
.chart-key i { width: 0.625rem; height: 0.625rem; border-radius: 999px; display: inline-block; }
.post-list { display: grid; }
.post-row { display: grid; grid-template-columns: 3.5rem minmax(0, 1fr) auto; gap: 1rem; align-items: center; padding: 1rem 0; border-top: 1px solid var(--border); }
.post-row:first-child { border-top: 0; padding-top: 0.25rem; }
.post-row .chip-thumb .thumb { width: 3.5rem; height: 3.5rem; }
.post-row .title { font-weight: 600; }
.post-row .where { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.2rem; font-size: 0.875rem; }
.post-row .where .i { width: 1rem; height: 1rem; flex: none; }
.post-row .where b { font-weight: 500; }
.post-row .meta { margin-top: 0.2rem; font-size: 0.8125rem; color: var(--muted-foreground); }
.post-row .reason { margin-top: 0.5rem; font-size: 0.8125rem; line-height: 1.45; }
.post-row .reason.good { color: var(--success); }
.post-row .reason.low { color: var(--warning); }
.nums { display: grid; grid-template-columns: repeat(3, 5.25rem); gap: 0.5rem; text-align: right; }
.nums b { display: block; font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
.nums span { font-size: 0.75rem; color: var(--muted-foreground); }
.list-label { margin: 1.25rem 0 0.25rem; font-size: 0.8125rem; font-weight: 600; color: var(--muted-foreground); }
.cmp-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.25rem; margin-bottom: 1.25rem; }
.takeaway { display: flex; gap: 0.5rem; padding: 0.75rem 0.875rem; border-radius: 0.875rem; background: #f7f8fa; font-size: 0.875rem; line-height: 1.45; margin-bottom: 1rem; }
.takeaway .i { flex: none; margin-top: 0.15rem; color: var(--tint-foreground); }
.cmp-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.25rem 0.75rem; padding: 0.75rem 0; border-top: 1px solid var(--border); }
.cmp-row:first-of-type { border-top: 0; }
.cmp-row .name { display: flex; align-items: center; gap: 0.5rem; min-width: 0; font-weight: 500; font-size: 0.9375rem; }
.cmp-row .name .i { width: 1rem; height: 1rem; flex: none; color: var(--muted-foreground); }
.cmp-row .name small { font-weight: 400; font-size: 0.8125rem; color: var(--muted-foreground); white-space: nowrap; }
.cmp-row .val { font-weight: 600; font-variant-numeric: tabular-nums; text-align: right; }
.cmp-row .track { grid-column: 1 / -1; height: 0.5rem; border-radius: 999px; background: var(--secondary); overflow: hidden; }
.cmp-row .track span { display: block; height: 100%; border-radius: 999px; background: var(--brand-2); }
.cmp-row.top .track span { background: var(--brand); }
.cmp-row .sub { grid-column: 1 / -1; font-size: 0.8125rem; color: var(--muted-foreground); }
.cmp-row .sub b { color: var(--foreground); font-weight: 500; }
.cmp-note { margin-top: 0.75rem; font-size: 0.8125rem; color: var(--muted-foreground); }
.learned { display: grid; }
.learned-row { display: grid; grid-template-columns: 2rem minmax(0, 1fr) minmax(0, 17rem); gap: 1rem; align-items: start; padding: 1rem 0; border-top: 1px solid var(--border); }
.learned-row:first-child { border-top: 0; padding-top: 0.25rem; }
.learned-row .impact { display: grid; place-items: center; width: 2rem; height: 2rem; border-radius: 999px; font-weight: 700; }
.learned-row .impact.up { background: rgba(23, 138, 94, 0.12); color: var(--success); }
.learned-row .impact.down { background: rgba(207, 63, 87, 0.12); color: var(--destructive); }
.learned-row .impact.neutral { background: var(--secondary); color: var(--muted-foreground); }
.learned-row .finding { font-weight: 600; }
.learned-row .evidence { margin-top: 0.25rem; font-size: 0.875rem; line-height: 1.45; color: var(--muted-foreground); }
.change { padding: 0.625rem 0.875rem; border-radius: 0.875rem; background: var(--tint); font-size: 0.875rem; line-height: 1.4; color: var(--tint-foreground); }
.change.same { background: var(--secondary); color: var(--muted-foreground); }
.change small { display: block; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.125rem; }
.learned-foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--border); font-size: 0.875rem; color: var(--muted-foreground); }
.an-toolbar { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
.an-toolbar .filter-btn { display: inline-flex; align-items: center; gap: 0.5rem; height: 2.25rem; padding: 0 0.875rem; border-radius: 999px; background: var(--card); box-shadow: 0 0 0 1px var(--border); font-size: 0.8125rem; font-weight: 500; }
.an-toolbar .filter-btn .i { width: 1rem; height: 1rem; }
.period { font-size: 0.8125rem; color: var(--muted-foreground); margin: -0.75rem 0 1.25rem; }
/* Empty and first-week states */
.get-going { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 2rem; }
.steps { display: grid; gap: 0.625rem; margin-top: 1.25rem; }
.step { display: grid; grid-template-columns: 2rem minmax(0, 1fr) auto; gap: 0.875rem; align-items: center; padding: 0.875rem 1rem; border-radius: 1rem; box-shadow: 0 0 0 1px var(--border); }
.step .n { display: grid; place-items: center; width: 2rem; height: 2rem; border-radius: 999px; background: var(--tint); color: var(--tint-foreground); font-size: 0.8125rem; font-weight: 600; }
.step.later .n { background: var(--secondary); color: var(--muted-foreground); }
.step.later { box-shadow: none; background: #f7f8fa; }
.step p { font-weight: 500; }
.step .type-label { margin-top: 0.125rem; }
.when-list { display: grid; gap: 0; margin-top: 1.25rem; }
.when { display: grid; grid-template-columns: 1.25rem minmax(0, 1fr); gap: 0.875rem; padding-bottom: 1.125rem; position: relative; }
.when::before { content: ""; position: absolute; left: 0.5625rem; top: 1.25rem; bottom: 0; width: 2px; background: var(--border); }
.when:last-child::before { display: none; }
.when:last-child { padding-bottom: 0; }
.when .dot { width: 1.25rem; height: 1.25rem; border-radius: 999px; background: var(--card); box-shadow: inset 0 0 0 2px var(--tint-strong); margin-top: 0.1rem; }
.when b { display: block; font-weight: 600; }
.when span { display: block; margin-top: 0.125rem; font-size: 0.875rem; line-height: 1.45; color: var(--muted-foreground); }
.an-preview { position: relative; margin-top: 1.25rem; }
.an-preview .sample-tag { position: absolute; top: 1.25rem; right: 1.25rem; font-size: 0.6875rem; padding: 0.125rem 0.5rem; border-radius: 999px; background: var(--secondary); color: var(--muted-foreground); }
.an-preview .ghost { opacity: 0.5; }
.soon { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 1rem; align-items: start; padding: 1rem 1.125rem; border-radius: 1rem; background: #f7f8fa; }
.soon .icon-wrap { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 999px; background: var(--tint); color: var(--tint-foreground); }
@media (max-width: 1100px) {
  .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .cmp-grid { grid-template-columns: minmax(0, 1fr); }
  .get-going { grid-template-columns: minmax(0, 1fr); gap: 1.5rem; }
}
@media (max-width: 1023px) {
  .an-summary { grid-template-columns: auto minmax(0, 1fr); }
  .an-summary .actions { grid-column: 1 / -1; }
  .learned-row { grid-template-columns: 2rem minmax(0, 1fr); }
  .learned-row .change { grid-column: 2; }
}
@media (max-width: 640px) {
  .chart-wide { display: none; }
  .chart-narrow { display: block; }
  .post-row { grid-template-columns: 3rem minmax(0, 1fr); gap: 0.75rem; align-items: start; }
  .post-row .chip-thumb .thumb { width: 3rem; height: 3rem; }
  .post-row .nums { grid-column: 1 / -1; grid-template-columns: repeat(3, minmax(0, 1fr)); text-align: left; padding: 0.625rem 0.75rem; border-radius: 0.875rem; background: #f7f8fa; }
  .an-summary { padding: 1rem; gap: 0.875rem; }
  .an-summary .icon-wrap { width: 2.5rem; height: 2.5rem; }
  .an-summary .actions .btn { width: 100%; justify-content: center; }
  .step { grid-template-columns: 2rem minmax(0, 1fr); }
  .step .btn { grid-column: 2; justify-self: start; }
  .panel { padding: 1.25rem; }
}
@media (max-width: 560px) {
  .kpis { grid-template-columns: minmax(0, 1fr); gap: 0.875rem; }
  .kpi .value { font-size: 2rem; }
  .learned-row { grid-template-columns: minmax(0, 1fr); gap: 0.625rem; }
  .learned-row .impact { display: none; }
  .learned-row .change { grid-column: 1; }
  .learned-row .finding { display: flex; gap: 0.5rem; }
  .an-toolbar { width: 100%; }
  .an-toolbar .seg { flex: 1; }
  .an-toolbar .seg button { flex: 1; }
}
.learned-row .finding .mini { display: none; }
@media (max-width: 560px) { .learned-row .finding .mini { display: inline; } }
.mini.up { color: var(--success); } .mini.down { color: var(--destructive); } .mini.neutral { color: var(--muted-foreground); }
</style>
"""

# ---------- Data: Tartinebakery, the 30 days from 29 September to 28 October ----------

DAYS = [f"{d} Sep" for d in (29, 30)] + [f"{d} Oct" for d in range(1, 29)]
# People reached per day; spikes are the days a reel or carousel went out.
REACH = [620, 410, 380, 300, 170, 540, 330, 360, 240, 200, 150, 120, 280, 250,
         300, 260, 380, 330, 230, 410, 360, 270, 180, 300, 290, 250, 210, 260, 230, 180]
# (day index, platform) for each post; 24 posts in the month.
POST_DAYS = [(0, "instagram"), (2, "instagram"), (4, "facebook"), (6, "instagram"), (8, "instagram"), (10, "instagram"),
             (11, "facebook"), (12, "instagram"), (13, "instagram"), (15, "instagram"), (16, "instagram"), (17, "facebook"),
             (19, "instagram"), (20, "instagram"), (21, "facebook"), (22, "instagram"), (23, "instagram"), (24, "facebook"),
             (25, "instagram"), (26, "instagram"), (27, "instagram"), (28, "facebook"), (29, "instagram"), (1, "instagram")]

KPIS = [
    ("eye", "People reached", "9,300", ("good", "Good"), "About 390 people per post. Small shops like yours usually reach 250 to 300."),
    ("bookmark", "Saves", "326", ("good", "Very good"), "4 of every 100 people who saw a post saved it, twice the usual. A save means they want to come back to it."),
    ("heart", "Likes and comments", "460", ("usual", "About usual"), "5 of every 100 people liked, commented or shared. Similar shops get about the same."),
    ("user-plus", "New followers", "+148", ("good", "Good"), "From 1,202 to 1,350. Two in three came from your reels."),
]

# title, variant, platform, format, detail, theme, date, reached, saves, followers, reason
BEST = [
    ("At the wheel, take 1", "blue", "instagram", "reel", "30 seconds", "At the wheel", "Tue 29 Sep", "1,480", "41", "+52",
     ("good", "Reached 4 times more people than your average post. Your best day of the month.")),
    ("New from the kiln, take 2", "yellow", "instagram", "carousel", "5 slides", "New from the kiln", "Thu 1 Oct", "720", "64", "+11",
     ("good", "Most saved post of the month: 9 of every 100 people kept it.")),
    ("Studio notes, take 4", "yellow", "instagram", "reel", "45 seconds", "Studio notes", "Mon 5 Oct", "1,050", "22", "+31",
     ("good", "Second-best reach. People watched to the end: 38 seconds on average.")),
]
WEAKEST = ("On the table, take 3", "ink", "facebook", "image", "", "On the table", "Sat 3 Oct", "140", "1", "0",
           ("low", "Fewest people of the month. Facebook posts at 5 PM reached few people; the agent moved them to the morning."))

BY_FORMAT = [("play", "Reels", "6 posts", 610, "610 people", "<b>3</b> saves per 100 people", True),
             ("layers", "Carousels", "8 posts", 420, "420 people", "<b>6</b> saves per 100 people, the most", False),
             ("image", "Image posts", "6 posts", 260, "260 people", "<b>2</b> saves per 100 people", False),
             ("clock", "Stories", "4 posts", 180, "180 people", "Stories can&rsquo;t be saved; 12 replies in all", False)]
BY_PLATFORM = [("instagram", "Instagram", "18 posts", 440, "440 people", "<b>4</b> saves per 100 people, 139 new followers", True),
               ("facebook", "Facebook", "6 posts", 230, "230 people", "<b>1</b> save per 100 people, 9 new followers", False)]
BY_THEME = [("target", "At the wheel", "7 posts", 520, "520 people", "<b>3</b> saves per 100 people", True),
            ("target", "New from the kiln", "7 posts", 470, "470 people", "<b>5</b> saves per 100 people, the most", False),
            ("target", "On the table", "5 posts", 250, "250 people", "<b>1</b> save per 100 people", False),
            ("target", "Studio notes", "5 posts", 225, "225 people", "<b>2</b> saves per 100 people", False)]

LEARNED = [
    ("up", "Reels bring in the most new people",
     "Your 6 reels reached 610 people each, more than twice your image posts, and brought 97 of your 148 new followers.",
     "2 reels a week, up from 1"),
    ("up", "Carousels get saved the most",
     "6 saves per 100 people, three times your other posts. Kiln news as a carousel did best of all.",
     "New from the kiln now goes out as carousels"),
    ("down", "Facebook posts in the evening reach few people",
     "The 6 Facebook posts went out at 5 PM and reached 230 people each, half of Instagram.",
     "Facebook moves to Wednesday and Saturday at 9 AM"),
    ("neutral", "Studio notes is too early to call",
     "5 posts with mixed results: one strong reel, four quiet image posts.",
     None),
]


# ---------- Pieces ----------

def where_line(platform, fmt, detail):
    """Platform icon and name, then format and its length, e.g. 'Instagram carousel, 5 slides'."""
    fmt_name = FORMATS[fmt][1].lower()
    kind = f"{PLATFORMS[platform]} {fmt_name}"
    extra = f'<span class="muted">, {detail}</span>' if detail else ""
    return f'<span class="where">{icon(platform)}<span><b>{kind}</b>{extra}</span></span>'


def post_thumb(variant, fmt):
    return f'<span class="chip-thumb">{thumb(variant)}<span class="fmt">{icon(FORMATS[fmt][0])}</span></span>'


def verdict(tone, text):
    return f'<span class="verdict {tone}">{text}</span>'


def kpi(icon_name, label, value, badge, why):
    tone, text = badge
    return (f'<div class="panel kpi"><div class="kpi-top"><span class="kpi-label">{icon(icon_name)}{label}</span>{verdict(tone, text)}</div>'
            f'<div class="value type-number">{value}</div><p class="kpi-why">{why}</p></div>')


def reach_chart(values, labels, post_days, width, height, label_every, best=None):
    """Daily people reached as a filled line; a dot on the line marks each day a post went out, ringed on the best day."""
    left, bottom, top = 40, 24, 12
    plot_w, plot_h = width - left, height - bottom - top
    y_max = 800
    step = plot_w / (len(values) - 1)

    def point(i):
        return left + i * step, top + plot_h - values[i] / y_max * plot_h

    svg = f'<svg class="chart" viewBox="0 0 {width} {height}" role="img" aria-label="People reached per day, 29 September to 28 October. Highest on 29 September with 620.">'
    for k in range(5):
        y = top + plot_h - k / 4 * plot_h
        svg += f'<line class="grid-line" x1="{left}" x2="{width}" y1="{y:.1f}" y2="{y:.1f}"/>'
        svg += f'<text x="{left - 8}" y="{y + 4:.1f}" text-anchor="end">{int(y_max * k / 4)}</text>'
    for i, label in enumerate(labels):
        if i % label_every == 0:
            x, _ = point(i)
            anchor = "start" if i == 0 else ("end" if i == len(labels) - 1 else "middle")
            svg += f'<text x="{x:.1f}" y="{height - 4}" text-anchor="{anchor}">{label}</text>'
    points = " ".join(f"{x:.1f},{y:.1f}" for x, y in (point(i) for i in range(len(values))))
    base = top + plot_h
    last_x = left + (len(values) - 1) * step
    svg += f'<polygon points="{left},{base} {points} {last_x:.1f},{base}" fill="var(--brand)" fill-opacity="0.12"/>'
    svg += f'<polyline points="{points}" fill="none" stroke="var(--brand)" stroke-width="2.25" stroke-linejoin="round" stroke-linecap="round"/>'
    for i, platform in post_days:
        x, y = point(i)
        fill = "var(--brand)" if platform == "instagram" else "var(--brand-2)"
        svg += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3.5" fill="{fill}" stroke="var(--card)" stroke-width="1.5"/>'
    if best is not None:
        x, y = point(best)
        svg += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="8" fill="none" stroke="var(--brand)" stroke-width="2"/>'
    return svg + "</svg>"


def trend_panel(values, labels, post_days, days_label, best_html, narrow_every=7, wide_every=4):
    wide = reach_chart(values, labels, post_days, 860, 250, wide_every, best=0)
    narrow = reach_chart(values, labels, post_days, 340, 210, narrow_every, best=0)
    key = ('<div class="chart-key"><span><i style="background:var(--brand)"></i>Day an Instagram post went out</span>'
           '<span><i style="background:var(--brand-2)"></i>Day a Facebook post went out</span></div>')
    metric = segmented(["People reached", "Saves", "New followers"], "People reached", small=True)
    return f"""<section class="panel" style="margin-bottom:1.25rem">
  <div class="card-head" style="flex-wrap:wrap"><div><h2 class="type-heading">Day by day</h2><p class="type-label">People who saw one of your posts each day, {days_label}.</p></div>{metric}</div>
  <div class="chart-wide">{wide}</div><div class="chart-narrow">{narrow}</div>
  <div class="chart-foot">{best_html}{key}</div>
</section>"""


def best_day_note():
    return (f'<div class="best-day">{post_thumb("blue", "reel")}<span><b>Best day: Tue 29 Sep, 620 people.</b> '
            f'<span class="muted">The reel &ldquo;At the wheel, take 1&rdquo; went out that morning.</span></span></div>')


def post_row(title, variant, platform, fmt, detail, theme, date, reached, saves, followers, reason):
    tone, text = reason
    return (f'<div class="post-row">{post_thumb(variant, fmt)}'
            f'<div style="min-width:0"><p class="title">{title}</p>{where_line(platform, fmt, detail)}'
            f'<p class="meta">Theme: {theme}. Went out {date}.</p><p class="reason {tone}">{text}</p></div>'
            f'<div class="nums"><div><b>{reached}</b><span>reached</span></div><div><b>{saves}</b><span>saves</span></div>'
            f'<div><b>{followers}</b><span>new followers</span></div></div></div>')


def best_posts_panel(best, weakest, sub):
    rows = "".join(post_row(*p) for p in best)
    weak = ""
    if weakest:
        weak = f'<p class="list-label">Did least well</p><div class="post-list">{post_row(*weakest)}</div>'
    sort = segmented(["Most people", "Most saves"], "Most people", small=True)
    return f"""<section class="panel" style="margin-bottom:1.25rem">
  <div class="card-head" style="flex-wrap:wrap"><div><h2 class="type-heading">Posts that worked best</h2><p class="type-label">{sub}</p></div>{sort}</div>
  <div class="post-list">{rows}</div>{weak}
  <p style="margin-top:1rem"><a class="link" href="#">See every post and its numbers in Content{icon("chevron-right")}</a></p>
</section>"""


def cmp_panel(title, sub, takeaway, rows, note):
    peak = max(r[3] for r in rows)
    html = ""
    for icon_name, name, count, value, value_text, detail, top in rows:
        width = value / peak * 100
        html += (f'<div class="cmp-row{" top" if top else ""}"><span class="name">{icon(icon_name)}<span>{name}</span><small>{count}</small></span>'
                 f'<span class="val">{value_text}</span><div class="track"><span style="width:{width:.0f}%"></span></div>'
                 f'<span class="sub">{detail}</span></div>')
    return (f'<section class="panel">{card_head(title, sub)}<div class="takeaway">{icon("sparkles")}<span>{takeaway}</span></div>'
            f'{html}<p class="cmp-note">{note}</p></section>')


def compare_grid():
    sub = "Average people reached per post."
    return f"""<div class="cmp-grid">
  {cmp_panel("By format", sub, "<b>Reels reach the most people. Carousels get saved the most.</b> So next month has more of both.", BY_FORMAT, "Bars: people reached per post. Longer is better.")}
  {cmp_panel("By platform", sub, "<b>Instagram does most of the work.</b> Facebook posts went out at 5 PM, when few of your customers are there.", BY_PLATFORM, "Bars: people reached per post. Longer is better.")}
  {cmp_panel("By theme", sub, "<b>At the wheel reaches the most; kiln news gets kept.</b> On the table is the quietest theme.", BY_THEME, "Themes come from your strategy.")}
</div>"""


def learned_panel():
    arrows = {"up": "&uarr;", "down": "&darr;", "neutral": "&ndash;"}
    rows = ""
    for impact, finding, evidence, change in LEARNED:
        if change:
            change_html = f'<div class="change"><small>What changes</small>{change}</div>'
        else:
            change_html = '<div class="change same"><small>What changes</small>Nothing yet. Kept for another month.</div>'
        rows += (f'<div class="learned-row"><span class="impact {impact}" aria-label="{impact}">{arrows[impact]}</span>'
                 f'<div><p class="finding"><span class="mini {impact}" aria-hidden="true">{arrows[impact]}</span>{finding}</p><p class="evidence">{evidence}</p></div>{change_html}</div>')
    return f"""<section class="panel" style="margin-bottom:1.25rem">
  {card_head("What the agent learned", "From your own results this month. Each finding changes the strategy for next month.")}
  <div class="learned">{rows}</div>
  <div class="learned-foot"><span>The agent updated your strategy on 29 October with these 3 changes. Posts you already approved stay as they are.</span>
    <div class="toolbar-end"><button class="btn sm btn-outline pressable">Ask for changes</button><a class="btn sm btn-default pressable" href="#">{icon("compass")}See the updated strategy</a></div></div>
</section>"""


def results_header(active="30 days"):
    period = segmented(["7 days", "30 days", "90 days"], active, small=True)
    tools = f'<div class="an-toolbar">{period}<button class="filter-btn pressable">{icon("layers")}All platforms{icon("chevron-down")}</button></div>'
    return header("Analytics", "How your posts did, in plain numbers, and what the agent changed because of it.", tools)


def month():
    """b) A month of results: the month in one line, four numbers that each say if they are good, the daily trend,
    the best posts with platform and format, format / platform / theme compared, and what the agent learned."""
    kpis = "".join(kpi(*k) for k in KPIS)
    body = f"""{CSS}
{results_header()}
<p class="period">29 September to 28 October, 24 posts on Instagram and Facebook. Compared with small shops like yours, from your research.</p>
<section class="an-summary">
  <span class="icon-wrap">{icon("chart")}</span>
  <div><h2 class="type-heading">A strong first month. Reels brought new people, carousels got saved.</h2>
    <p>9,300 people saw your posts and 148 started following you. The agent found 3 things to change and has updated next month&rsquo;s plan.</p></div>
  <div class="actions"><a class="btn btn-default pressable" href="#learned">See what changes</a></div>
</section>
<div class="kpis">{kpis}</div>
{trend_panel(REACH, DAYS, POST_DAYS, "29 September to 28 October", best_day_note())}
{best_posts_panel(BEST, WEAKEST, "Top 3 of 24 posts this month, by people reached. The numbers are from a day after each went out.")}
<h2 class="type-heading" style="margin:1.75rem 0 0.25rem">What works best for you</h2>
<p class="type-label" style="margin-bottom:1rem">Your posts grouped three ways, so you can see which kind to make more of.</p>
{compare_grid()}
<div id="learned">{learned_panel()}</div>
{tabbar("more")}"""
    return page("Analytics", body, "analytics")


# ---------- a) Empty ----------

def empty():
    """a) Nothing published yet: what has to happen, and when each part of this page fills in."""
    ghost = reach_chart([60, 120, 110, 180, 150, 240, 210, 300, 260, 330, 310, 380, 350, 420],
                        [f"{d} Oct" for d in range(1, 15)], [(0, "instagram"), (3, "instagram"), (5, "facebook"), (7, "instagram"), (11, "instagram")], 860, 220, 3)
    ghost_narrow = reach_chart([60, 120, 110, 180, 150, 240, 210, 300, 260, 330, 310, 380, 350, 420],
                               [f"{d} Oct" for d in range(1, 15)], [(0, "instagram"), (3, "instagram"), (5, "facebook"), (7, "instagram"), (11, "instagram")], 340, 190, 6)
    body = f"""{CSS}
{header("Analytics", "How your posts did, in plain numbers, and what the agent changed because of it.")}
<section class="panel" style="margin-bottom:1.25rem">
  <div class="get-going">
    <div>
      <span class="icon-wrap" style="display:grid;place-items:center;width:3rem;height:3rem;border-radius:999px;background:var(--tint);color:var(--tint-foreground);margin-bottom:1rem">{icon("chart")}</span>
      <h2 class="type-heading">No results yet, because nothing has gone out</h2>
      <p style="margin-top:0.375rem;color:var(--muted-foreground);max-width:52ch">Your first post is ready for Tuesday 29 September at 9:00 AM. Two things stand between it and your first numbers:</p>
      <div class="steps">
        <div class="step"><span class="n">1</span><div><p>Connect Instagram and Facebook</p><p class="type-label">Posts can&rsquo;t go out, and results can&rsquo;t come back, until they&rsquo;re connected.</p></div><a class="btn sm btn-default pressable" href="#">{icon("link")}Connect</a></div>
        <div class="step"><span class="n">2</span><div><p>Approve the 5 waiting posts</p><p class="type-label">Nothing is published without your approval.</p></div><a class="btn sm btn-outline pressable" href="#">Review 5 posts</a></div>
      </div>
    </div>
    <div>
      <h3 class="type-heading" style="font-size:1rem">When this page fills in</h3>
      <div class="when-list">
        <div class="when"><span class="dot"></span><div><b>A day after the first post</b><span>How many people saw it, saved it and followed you, for each post.</span></div></div>
        <div class="when"><span class="dot"></span><div><b>After a week of posts</b><span>Which formats, platforms and themes work best, and the agent&rsquo;s first findings.</span></div></div>
        <div class="when"><span class="dot"></span><div><b>After a month</b><span>The month in one line, and next month&rsquo;s plan updated from what worked.</span></div></div>
      </div>
    </div>
  </div>
</section>
<section class="panel an-preview" aria-label="Example of what you will see">
  <span class="sample-tag">Example</span>
  <div class="ghost">{card_head("Day by day", "People who saw one of your posts each day.")}<div class="chart-wide">{ghost}</div><div class="chart-narrow">{ghost_narrow}</div></div>
</section>
{tabbar("more")}"""
    return page("Analytics: no results yet", body, "analytics")


# ---------- c) First week ----------

def first_week():
    """c) Three posts out: real numbers per post, but too early to judge formats or learn anything; says when that comes."""
    reach = [620, 410, 380, 300, 170, 540]
    days = ["29 Sep", "30 Sep", "1 Oct", "2 Oct", "3 Oct", "4 Oct"]
    post_days = [(0, "instagram"), (2, "instagram"), (4, "facebook")]
    kpis = "".join([
        kpi("eye", "People reached", "2,340", ("early", "Too early"), "3 posts so far. A fair comparison needs about a week of posts."),
        kpi("bookmark", "Saves", "106", ("good", "Good start"), "5 of every 100 people saved a post. Small shops usually see 2."),
        kpi("heart", "Likes and comments", "118", ("early", "Too early"), "Comes into focus after about 6 posts."),
        kpi("user-plus", "New followers", "+63", ("good", "Good start"), "From 1,202 to 1,265, most on the day the reel went out."),
    ])
    week_best = [
        BEST[0][:10] + (("good", "Your best post so far, and 52 new followers the day it went out."),),
        BEST[1][:10] + (("good", "Most saved so far: 9 of every 100 people kept it."),),
        WEAKEST[:10] + (("low", "Fewest people so far. One Facebook post is too few to judge; the agent is watching the 5 PM time."),),
    ]
    wide = reach_chart(reach, days, post_days, 860, 230, 1, best=0)
    narrow = reach_chart(reach, days, post_days, 340, 190, 1, best=0)
    body = f"""{CSS}
{results_header("7 days")}
<p class="period">29 September to 4 October, 3 posts so far.</p>
<div class="kpis">{kpis}</div>
<section class="panel" style="margin-bottom:1.25rem">
  {card_head("Day by day", "People who saw one of your posts each day, since the first post.")}
  <div class="chart-wide">{wide}</div><div class="chart-narrow">{narrow}</div>
  <div class="chart-foot">{best_day_note()}<div class="chart-key"><span><i style="background:var(--brand)"></i>Instagram post</span><span><i style="background:var(--brand-2)"></i>Facebook post</span></div></div>
</section>
{best_posts_panel(week_best, None, "All 3 posts so far, most people first. Numbers settle about a day after each post.")}
<div class="grid g2">
  <section class="panel">{card_head("What works best for you", "Formats, platforms and themes compared.")}
    <div class="soon"><span class="icon-wrap">{icon("layers")}</span><div><p style="font-weight:600">Around Tuesday 6 October</p><p class="type-label" style="margin-top:0.25rem">After 6 posts there&rsquo;s enough to compare reels with carousels, and Instagram with Facebook, fairly.</p></div></div>
  </section>
  <section class="panel">{card_head("What the agent learned", "Findings that change the strategy.")}
    <div class="soon"><span class="icon-wrap">{icon("sparkles")}</span><div><p style="font-weight:600">First findings around Tuesday 6 October</p><p class="type-label" style="margin-top:0.25rem">The agent needs a week of results. It then updates the strategy and tells you what changed.</p></div></div>
  </section>
</div>
{tabbar("more")}"""
    return page("Analytics: first week", body, "analytics")


STATES = {"empty": empty, "first-week": first_week, "month": month}


def main():
    OUT.mkdir(exist_ok=True)
    for name, make in STATES.items():
        (OUT / f"s12-v3-{name}.html").write_text(make(), encoding="utf-8")
    print(f"wrote {len(STATES)} screens to {OUT}")


if __name__ == "__main__":
    main()
