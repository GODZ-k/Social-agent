"""Extra flows for the web redesign: fill in the brand kit by hand, post states, strategy version 2.

Run from design/web-v2: python flows_extra.py
Writes screens-flows/fl-v1-<screen>.html. Builds on the approved S06, S08, S17 and S20 pieces in build.py.
"""

from pathlib import Path

import build
import s12_analytics  # noqa: F401  (registers the eye, bookmark, heart and link icons)
from build import (icon, page, header, tabbar, thumb, art, card_head, as_meow, countdown_ring,
                   CONTENT_POSTS, STATUS_BADGE, PLATFORMS)

OUT = Path(__file__).parent / "screens-flows"

build.obs.ICONS.update({
    "phone": '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    "mail": '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 6L2 7"/>',
    "map-pin": '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
})

# Every post names its platform and its format; an image is an "image post" (DESIGN_TRACKER section 5).
FORMAT_NAME = {"image": "image post", "carousel": "carousel", "reel": "reel", "story": "story"}
FORMAT_ICON = {"image": "image", "carousel": "layers", "reel": "play", "story": "clock"}

CSS = """<style>
/* Flows v1: manual brand kit, post states, strategy version 2 */
.fl-opt { font-size: 0.75rem; font-weight: 500; color: var(--muted-foreground); }
.fl-input { display: flex; align-items: center; gap: 0.5rem; min-height: 2.75rem; padding: 0 0.875rem; border-radius: 0.75rem; border: 1px solid var(--input); background: var(--card); color: var(--foreground); font-size: 0.9375rem; min-width: 0; }
.fl-input.placeholder { color: #8a93a3; }
.fl-input.area { align-items: flex-start; min-height: 5.25rem; padding: 0.75rem 0.875rem; line-height: 1.5; }
.fl-input.focus { border-color: var(--brand); box-shadow: 0 0 0 3px var(--tint-strong); }
.fl-input .caret { display: inline-block; width: 1.5px; height: 1.15em; margin-left: 1px; background: var(--foreground); }
.fl-input .i { width: 1rem; height: 1rem; flex: none; color: var(--muted-foreground); }
.fl-field { display: grid; gap: 0.375rem; padding: 0.75rem 0; border-top: 1px solid var(--border); }
.fl-field:first-of-type { border-top: 0; padding-top: 0; }
.fl-field > label { display: flex; justify-content: space-between; gap: 0.75rem; font-size: 0.875rem; font-weight: 500; }
.fl-help { font-size: 0.8125rem; line-height: 1.45; color: var(--muted-foreground); }
.fl-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
.suggest { display: flex; flex-wrap: wrap; gap: 0.375rem; align-items: center; }
.suggest .type-label { margin-right: 0.25rem; }
.chip-add { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.3125rem 0.75rem; border-radius: 999px; border: 1px dashed var(--input); font-size: 0.8125rem; font-weight: 500; color: var(--muted-foreground); background: var(--card); }
.chip-add .i { width: 0.8rem; height: 0.8rem; }
.default-note { display: flex; gap: 0.5rem; align-items: flex-start; margin-bottom: 0.875rem; font-size: 0.8125rem; line-height: 1.45; color: var(--muted-foreground); }
.default-note .i { flex: none; width: 0.9rem; height: 0.9rem; margin-top: 0.15rem; color: var(--tint-foreground); }
.swatch-row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
.swatch-chip { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem 0.25rem 0.25rem; border-radius: 999px; box-shadow: 0 0 0 1px var(--border); font-size: 0.8125rem; }
.swatch-chip i { width: 1.5rem; height: 1.5rem; border-radius: 999px; box-shadow: inset 0 0 0 1px rgba(20, 24, 34, 0.1); }
.swatch-chip small { color: var(--muted-foreground); font-size: 0.75rem; }
.font-pairs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.625rem; }
.font-pair { display: grid; gap: 0.25rem; padding: 0.875rem 1rem; border-radius: 1rem; box-shadow: 0 0 0 1px var(--border); background: var(--card); min-width: 0; }
.font-pair.on { box-shadow: 0 0 0 2px var(--brand); background: var(--tint); }
.font-pair .aa { font-size: 1.625rem; line-height: 1.1; }
.font-pair .names { font-size: 0.75rem; color: var(--muted-foreground); }
.hours-closed { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; }
.toggle-line { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem 0.875rem; border-radius: 0.875rem; background: #f7f8fa; font-size: 0.875rem; }
.need-list { display: grid; gap: 0.5rem; margin-top: 0.875rem; padding: 0.875rem 1rem; border-radius: 1rem; background: var(--card); box-shadow: 0 0 0 1px var(--border); font-size: 0.8125rem; }
.need-list p { display: flex; align-items: center; gap: 0.5rem; }
.need-list .tick { display: grid; place-items: center; width: 1.125rem; height: 1.125rem; border-radius: 999px; flex: none; box-shadow: inset 0 0 0 1.5px var(--input); }
.need-list .tick.done { background: var(--success); box-shadow: none; color: #fff; }
.need-list .tick .i { width: 0.625rem; height: 0.625rem; }
.btn[disabled], .btn.is-disabled { background: var(--secondary); color: #8a93a3; box-shadow: none; cursor: not-allowed; }
.skip-flow .dot.skip { color: var(--muted-foreground); }

/* Post states */
.badge .spin { width: 0.625rem; height: 0.625rem; border-radius: 999px; border: 2px solid var(--tint-strong); border-top-color: var(--brand); }
.row-reason { display: flex; align-items: flex-start; gap: 0.3rem; margin-top: 0.375rem; max-width: 15rem; font-size: 0.75rem; line-height: 1.4; color: var(--destructive); }
.row-reason .i { width: 0.75rem; height: 0.75rem; flex: none; margin-top: 0.1rem; }
.content-table tr.failed { box-shadow: inset 3px 0 0 var(--destructive); }
.content-table tr.failed td:first-child { padding-left: 0.875rem; }
.new-tag { display: inline-block; margin-left: 0.375rem; padding: 0 0.4375rem; border-radius: 999px; background: var(--brand); color: #fff; font-size: 0.6875rem; font-weight: 600; vertical-align: 0.1rem; }
.btn-soft-danger { background: rgba(207, 63, 87, 0.1); color: var(--destructive); }
.group-row td { padding: 1.25rem 0 0.5rem !important; font-size: 0.8125rem; font-weight: 600; color: var(--muted-foreground); border-bottom: 1px solid var(--border); }
.bone-thumb { display: block; width: 3rem; height: 3rem; border-radius: 0.75rem; background: var(--secondary); position: relative; overflow: hidden; }
.bone-thumb::after, .bone-line::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%); transform: translateX(-100%); animation: shimmer 1.6s ease-in-out infinite; }
.bone-line { display: block; position: relative; overflow: hidden; height: 0.75rem; border-radius: 999px; background: var(--secondary); }
@keyframes shimmer { to { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) { .bone-thumb::after, .bone-line::after { animation: none; } }
.draft-step { font-size: 0.75rem; color: var(--tint-foreground); display: inline-flex; align-items: center; gap: 0.375rem; margin-top: 0.3rem; }
.draft-step.wait { color: var(--muted-foreground); }
.drafting { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 1rem 1.5rem; align-items: center; margin-bottom: 1.25rem; }
.drafting .overall { margin: 0.875rem 0 0; }
.drafting .now { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.75rem; font-size: 0.875rem; }
.drafting .now .spinner { flex: none; }
.drafting .leave-note { grid-column: 1 / -1; }
.drafting-count { text-align: right; }
.drafting-count b { display: block; font-family: var(--font-display); font-size: 2rem; font-weight: 600; letter-spacing: -0.03em; line-height: 1; }
.fail-card { padding: 1rem 1.125rem; border-radius: 1rem; background: rgba(207, 63, 87, 0.07); box-shadow: inset 0 0 0 1px rgba(207, 63, 87, 0.18); }
.fail-card h3 { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 1rem; font-weight: 600; line-height: 1.35; }
.fail-card h3 .i { flex: none; margin-top: 0.2rem; color: var(--destructive); }
.fail-card p { margin-top: 0.375rem; font-size: 0.875rem; line-height: 1.5; }
.fail-card .tries { display: flex; align-items: center; gap: 0.375rem; margin-top: 0.625rem; font-size: 0.8125rem; color: var(--muted-foreground); }
.fail-card .tries .i { width: 0.875rem; height: 0.875rem; }
.crop-demo { display: grid; grid-template-columns: 8.5rem minmax(0, 1fr); gap: 1rem; align-items: center; }
.crop-frame { position: relative; width: 8.5rem; }
.crop-frame .art { aspect-ratio: 9 / 16; border-radius: 0.75rem; }
.crop-frame .limit { position: absolute; left: -0.25rem; right: -0.25rem; top: 50%; transform: translateY(-50%); aspect-ratio: 4 / 5; border: 2px dashed var(--destructive); border-radius: 0.5rem; background: rgba(255, 255, 255, 0.12); }
.crop-copy p + p { margin-top: 0.375rem; }
.slide-thumb { position: relative; }
.slide-thumb.bad .thumb { opacity: 1; box-shadow: 0 0 0 2px var(--destructive); }
.slide-thumb .flag { position: absolute; right: -0.3rem; top: -0.3rem; display: grid; place-items: center; width: 1rem; height: 1rem; border-radius: 999px; background: var(--destructive); color: #fff; }
.slide-thumb .flag .i { width: 0.6rem; height: 0.6rem; }
.fl-when { display: grid; gap: 0.625rem; }
.fl-when .pills { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.fl-when .pill { display: inline-flex; align-items: center; gap: 0.375rem; }
.fl-when .pill .i { width: 0.875rem; height: 0.875rem; }
.fl-foot { display: flex; gap: 0.5rem; justify-content: flex-end; }
.fl-foot .lead { margin-right: auto; }
.live-link { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0.75rem; align-items: center; padding: 0.75rem 0.875rem; border-radius: 1rem; background: rgba(23, 138, 94, 0.08); }
.live-link .dot { display: grid; place-items: center; width: 2.25rem; height: 2.25rem; border-radius: 999px; background: var(--success); color: #fff; }
.live-link .url { display: block; font-size: 0.8125rem; color: var(--tint-foreground); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.results-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; }
.metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.5rem; margin-top: 0.75rem; }
.metric { padding: 0.75rem; border-radius: 0.875rem; background: #f7f8fa; min-width: 0; }
.metric .lbl { display: flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; color: var(--muted-foreground); }
.metric .lbl .i { width: 0.8rem; height: 0.8rem; flex: none; }
.metric b { display: block; margin-top: 0.25rem; font-family: var(--font-display); font-size: 1.375rem; font-weight: 600; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.result-lines { display: grid; gap: 0.375rem; margin-top: 0.75rem; font-size: 0.875rem; line-height: 1.45; }
.result-lines p { display: flex; gap: 0.5rem; align-items: flex-start; }
.result-lines .i { flex: none; width: 0.9rem; height: 0.9rem; margin-top: 0.2rem; color: var(--success); }
.verdict { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.125rem 0.625rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
.verdict.good { background: rgba(23, 138, 94, 0.12); color: var(--success); }
.read-caption { padding: 0.75rem 0.875rem; border-radius: 0.875rem; background: #f7f8fa; font-size: 0.9375rem; line-height: 1.5; }
.small-print { font-size: 0.8125rem; color: var(--muted-foreground); line-height: 1.45; }
.fail-step { background: rgba(207, 63, 87, 0.07); display: block; }
.fail-step .fail-top { display: flex; align-items: flex-start; gap: 0.875rem; }
.fail-step .fail-top .mark { display: grid; place-items: center; flex: none; width: 2.5rem; height: 2.5rem; border-radius: 999px; background: rgba(207, 63, 87, 0.14); color: var(--destructive); }
.fail-list { display: grid; gap: 0.5rem; margin-top: 1rem; }
.fail-item { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 0.875rem; align-items: center; padding: 0.75rem 0.875rem; border-radius: 1rem; background: var(--card); box-shadow: var(--elevation-raised); }
.fail-item .chip-thumb .thumb { width: 2.75rem; height: 2.75rem; }
.fail-item .fail-what { font-weight: 600; font-size: 0.9375rem; }
.fail-item .fail-why { margin-top: 0.125rem; font-size: 0.8125rem; color: var(--destructive); }
.chip-post.failed { box-shadow: var(--elevation-raised), inset 3px 0 0 var(--destructive); }
.chip-post .failed-tag { display: block; font-size: 0.65rem; font-weight: 600; color: var(--destructive); }
@media (max-width: 1023px) {
  .drafting { grid-template-columns: minmax(0, 1fr); }
  .drafting-count { text-align: left; display: flex; align-items: baseline; gap: 0.5rem; }
  .content-table tr.failed { box-shadow: inset 3px 0 0 var(--destructive); }
  .content-table tr.failed td:first-child { padding-left: 0; }
  .group-row { display: block !important; padding: 0 !important; border: 0 !important; }
  .group-row td { display: block; padding: 1.25rem 0 0.5rem !important; }
  .row-reason { max-width: none; }
  .font-pairs { grid-template-columns: minmax(0, 1fr); }
  .font-pair { grid-template-columns: 3.5rem minmax(0, 1fr); align-items: center; }
}
@media (max-width: 560px) {
  .fl-two { grid-template-columns: minmax(0, 1fr); }
  .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .crop-demo { grid-template-columns: 6.5rem minmax(0, 1fr); }
  .crop-frame { width: 6.5rem; }
  .fl-foot { flex-direction: column-reverse; }
  .fl-foot .btn { width: 100%; }
  .fl-foot .lead { margin-right: 0; }
  .fail-item { grid-template-columns: auto minmax(0, 1fr); }
  .fail-item .btn { grid-column: 1 / -1; width: 100%; }
}

/* Strategy version 2 */
.v-switch { display: flex; align-items: center; gap: 0.625rem; flex-wrap: wrap; }
.agent-words { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0.875rem; padding: 1rem 1.125rem; border-radius: 1rem; background: #f7f8fa; }
.agent-words .icon-wrap { display: grid; place-items: center; width: 2.25rem; height: 2.25rem; border-radius: 999px; background: var(--tint); color: var(--tint-foreground); }
.agent-words blockquote { margin: 0.25rem 0 0; font-size: 1rem; line-height: 1.55; max-width: 72ch; }
.change-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.625rem; margin-top: 1rem; }
.change { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0.75rem; align-items: start; padding: 0.875rem 1rem; border-radius: 1rem; box-shadow: 0 0 0 1px var(--border); }
.change .icon-wrap { display: grid; place-items: center; width: 2rem; height: 2rem; border-radius: 999px; background: var(--tint); color: var(--tint-foreground); }
.change .icon-wrap .i { width: 0.9rem; height: 0.9rem; }
.change p.what { font-weight: 600; }
.change p.because { margin-top: 0.2rem; font-size: 0.8125rem; line-height: 1.45; color: var(--muted-foreground); }
.pillar-cmp { padding: 0.875rem 0; border-top: 1px solid var(--border); }
.pillar-cmp:first-of-type { border-top: 0; padding-top: 0.25rem; }
.pillar-cmp .top { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; }
.pillar-cmp .name { font-weight: 500; }
.pillar-cmp .shift { font-size: 0.8125rem; white-space: nowrap; font-variant-numeric: tabular-nums; }
.pillar-cmp .shift s { color: var(--muted-foreground); }
.pillar-cmp .shift b { font-weight: 600; }
.pillar-cmp .bars { display: grid; gap: 0.25rem; margin-top: 0.5rem; }
.pillar-cmp .bars span { display: block; height: 0.5rem; border-radius: 999px; background: var(--secondary); overflow: hidden; }
.pillar-cmp .bars span i { display: block; height: 100%; border-radius: 999px; }
.pillar-cmp .bars .before i { background: #c9ced8; }
.pillar-cmp .bars .after i { background: var(--brand); }
.cmp-key { display: flex; gap: 1rem; margin-top: 0.875rem; font-size: 0.75rem; color: var(--muted-foreground); }
.cmp-key span { display: inline-flex; align-items: center; gap: 0.375rem; }
.cmp-key i { display: inline-block; width: 0.875rem; height: 0.375rem; border-radius: 999px; }
.times-label { display: flex; justify-content: space-between; align-items: baseline; margin: 1.25rem 0 0.5rem; font-size: 0.8125rem; font-weight: 600; }
.times-label:first-of-type { margin-top: 0; }
.plan-week.before .wk-slot.on { background: #dfe2e8; color: #5f6879; }
.plan-week .wk-slot.moved { box-shadow: 0 0 0 2px var(--foreground); }
.plan-week .wk-slot.gone { background: transparent; color: #8a93a3; box-shadow: inset 0 0 0 1.5px #c9ced8; text-decoration: line-through; }
.moves { display: grid; gap: 0.375rem; margin-top: 1rem; font-size: 0.875rem; }
.moves p { display: flex; gap: 0.5rem; align-items: flex-start; }
.moves .i { flex: none; width: 0.9rem; height: 0.9rem; margin-top: 0.2rem; color: var(--muted-foreground); }
.learn { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 0.25rem 0.875rem; align-items: start; padding: 1rem 0; border-top: 1px solid var(--border); }
.learn:first-of-type { border-top: 0; padding-top: 0.25rem; }
.learn .impact { display: grid; place-items: center; width: 2rem; height: 2rem; border-radius: 999px; font-weight: 700; }
.learn .impact.up { background: rgba(23, 138, 94, 0.12); color: var(--success); }
.learn .impact.down { background: rgba(207, 63, 87, 0.1); color: var(--destructive); }
.learn .impact.neutral { background: var(--secondary); color: var(--muted-foreground); }
.learn .insight { font-weight: 600; }
.learn .evidence { margin-top: 0.25rem; font-size: 0.875rem; line-height: 1.5; color: var(--muted-foreground); max-width: 68ch; }
.learn .led { justify-self: end; font-size: 0.75rem; font-weight: 500; padding: 0.1875rem 0.625rem; border-radius: 999px; background: var(--tint); color: var(--tint-foreground); white-space: nowrap; }
.learn .led.none { background: var(--secondary); color: var(--muted-foreground); }
.same-note { display: inline-flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; font-weight: 500; color: var(--muted-foreground); padding: 0.1875rem 0.625rem; border-radius: 999px; background: var(--secondary); white-space: nowrap; }
@media (max-width: 1023px) {
  .change-list { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 560px) {
  .learn { grid-template-columns: auto minmax(0, 1fr); }
  .learn .led { grid-column: 2; justify-self: start; margin-top: 0.375rem; white-space: normal; }
  .agent-words { grid-template-columns: minmax(0, 1fr); }
  .v-switch .seg { width: 100%; }
  .v-switch .seg button { flex: 1; }
}
</style>"""


# ---------- Shared pieces ----------

def where_cell(platform, fmt, detail):
    """The 'Where it goes' cell: 'Instagram carousel, 5 slides' or 'Facebook image post'."""
    detail_html = f'<span class="muted">, {detail}</span>' if detail else ""
    return f'<td class="c-where"><span class="where">{icon(platform)}<span><b>{PLATFORMS[platform]} {FORMAT_NAME[fmt]}</b>{detail_html}</span></span></td>'


def badge(status):
    if status == "Didn't go out":
        return f'<span class="badge badge-danger">{icon("alert")}Didn&rsquo;t go out</span>'
    if status == "Drafting":
        return '<span class="badge badge-tint"><span class="spin"></span>Drafting</span>'
    return STATUS_BADGE[status]


def facts(platform, fmt, detail, when, status):
    """Where it goes, what it is, when, and where it stands: the top of every post panel (as S08)."""
    kind = f"{FORMAT_NAME[fmt].capitalize()}, {detail}" if detail else FORMAT_NAME[fmt].capitalize()
    return (f'<div class="post-facts" aria-label="Where it goes and what it is"><span class="fact strong">{icon(platform)}{PLATFORMS[platform]}</span>'
            f'<span class="fact strong">{icon(FORMAT_ICON[fmt])}{kind}</span><span class="fact">{icon("calendar")}{when}</span>'
            f'<span class="fact bare">{badge(status)}</span></div>')


def post_row(title, pillar, platform, fmt, detail, status, when, sub, variant, reason="", new=False, action=None):
    """A Content row (S06) that also knows about failed, published and new posts."""
    new_tag = '<span class="new-tag">New</span>' if new else ""
    reason_html = f'<span class="row-reason">{icon("alert")}{reason}</span>' if reason else ""
    if action is None:
        action = ('<button class="btn sm btn-default pressable">Review</button>' if status == "Needs approval"
                  else f'<span class="go">{icon("chevron-right")}</span>')
    row_class = ' class="failed"' if status == "Didn't go out" else ""
    return (f'<tr{row_class}><td class="c-post"><span class="who" style="gap:0.875rem"><span class="chip-thumb">{thumb(variant)}<span class="fmt">{icon(FORMAT_ICON[fmt])}</span></span>'
            f'<span style="min-width:0"><span style="display:block;font-weight:500">{title}{new_tag}</span><span class="type-label">Theme: {pillar}</span></span></span></td>'
            f'{where_cell(platform, fmt, detail)}'
            f'<td class="c-status">{badge(status)}{reason_html}</td>'
            f'<td class="c-when"><span style="display:block">{when}</span><span class="type-label">{sub}</span></td>'
            f'<td class="c-action">{action}</td></tr>')


def placeholder_row(platform, fmt, detail, when, step, waiting=False):
    """A post the agent is still drafting: where and when are known from the strategy, the rest fills in."""
    step_cls = "draft-step wait" if waiting else "draft-step"
    step_icon = icon("clock") if waiting else '<span class="spinner" style="width:0.625rem;height:0.625rem"></span>'
    return (f'<tr aria-busy="true"><td class="c-post"><span class="who" style="gap:0.875rem"><span class="bone-thumb"></span>'
            f'<span style="min-width:0;flex:1"><span class="bone-line" style="width:9rem"></span><span class="{step_cls}">{step_icon}{step}</span></span></span></td>'
            f'{where_cell(platform, fmt, detail)}'
            f'<td class="c-status">{badge("Drafting")}</td>'
            f'<td class="c-when"><span style="display:block">{when}</span><span class="type-label">Best time from your strategy</span></td>'
            f'<td class="c-action"></td></tr>')


def content_table(rows_html, counts, active="All", foot="Soonest first. Reach and saves appear on each post a day after it&rsquo;s published."):
    seg = "".join(f'<button class="{"on" if k == active else ""}">{k} <span class="muted" style="margin-left:0.25rem">{v}</span></button>' for k, v in counts)
    return f"""<div class="toolbar content-toolbar"><div class="seg">{seg}</div><div class="toolbar-end"><button class="filter-btn pressable">{icon("layers")}All platforms{icon("chevron-down")}</button><span class="search">{icon("search")}Search posts</span></div></div>
<section class="panel content-panel"><table class="table content-table"><thead><tr><th>Post</th><th>Where it goes</th><th>Status</th><th>Goes out</th><th></th></tr></thead><tbody>{rows_html}</tbody></table></section>
<p class="type-label" style="margin-top:1rem">{foot}</p>"""


def content_header(button=None):
    if button is None:
        button = f'<button class="btn btn-default pressable">{icon("sparkles")}Draft 6 more posts</button>'
    return header("Content", "Every post the agent drafted, from first draft to published.", button)


def post_sheet(title, sub, body, foot):
    """The S08 side panel, reused for posts that are not waiting for approval."""
    return f"""<div class="scrim"></div>
<aside class="sheet review-sheet" role="dialog" aria-label="{title}">
  <div class="sheet-head">
    <div><p class="type-heading">{title}</p><p class="type-label" style="margin-top:0.25rem">{sub}</p></div>
    <div style="display:flex;gap:0.375rem"><button class="icon-close" aria-label="Close">{icon("x")}</button></div>
  </div>
  <div class="sheet-body review-body">{body}</div>
  <div class="sheet-foot fl-foot">{foot}</div>
</aside>"""


def content_page(title, body, overlay="", waiting=5):
    """A Content page; `waiting` is the approvals count in the rail and tab bar."""
    html = page(title, CSS + body + tabbar("content"), "content", overlay=overlay)
    return html.replace('<span class="count">5</span>', f'<span class="count">{waiting}</span>')


# ---------- 1. Fill in the brand kit yourself ----------

def manual_flow():
    """The onboarding steps with the website step skipped rather than done."""
    names = [("skip", "Website skipped", "&ndash;"), ("on", "Fill in your brand kit", "2"), ("", "Get your first month", "3")]
    parts = [f'<span class="{cls}"><span class="dot {cls}">{mark}</span><span class="label">{name}</span></span>' for cls, name, mark in names]
    return '<nav class="flow skip-flow" aria-label="Onboarding steps">' + '<span class="line"></span>'.join(parts) + "</nav>"


def field(label, control, help_text="", optional=False):
    opt = '<span class="fl-opt">Optional</span>' if optional else ""
    help_html = f'<p class="fl-help">{help_text}</p>' if help_text else ""
    return f'<div class="fl-field"><label>{label}{opt}</label>{control}{help_html}</div>'


def kit_section(title, sub, inner, badge_html=""):
    return (f'<section class="panel kit-card"><div class="kit-card-head"><div><h2 class="type-heading">{title}</h2>'
            f'<p class="type-label" style="margin-top:0.25rem">{sub}</p></div>{badge_html}</div>{inner}</section>')


def kit_manual():
    """Fill in the brand kit by hand: the S17a parts, empty, with defaults where a safe one exists."""
    business = kit_section("The business", "What it&rsquo;s called and what it does.", "".join([
        field("Business name", '<div class="fl-input focus">Meow Meow Tweet<span class="caret"></span></div>'),
        field("Type of business", '<div class="fl-input placeholder">For example: bakery, yoga studio, online shop</div>'
              '<div class="suggest" style="margin-top:0.25rem"><span class="type-label">Common:</span><span class="pill">Online shop</span><span class="pill">Caf&eacute; or bakery</span><span class="pill">Salon or spa</span><span class="pill">Studio or class</span></div>'),
        field("What you do", '<div class="fl-input area placeholder">What you sell or offer, and what makes it yours. One or two sentences.</div>',
              "The agent uses this in every caption, so say it the way you&rsquo;d tell a customer."),
        field("Website", f'<div class="fl-input">{icon("globe")}meowmeowtweet.com</div>',
              "We couldn&rsquo;t read it just now. It stays on your kit, and you can ask for a new read in Settings.", optional=True),
        field("Tagline", '<div class="fl-input placeholder">One line you&rsquo;re known for</div>', optional=True),
    ]))
    contact = kit_section("Contact details", "Used only when a post needs them, like opening hours on a holiday post.", "".join([
        '<div class="fl-two">' + field("Phone", f'<div class="fl-input placeholder">{icon("phone")}+1 555 010 2030</div>')
        + field("Email", f'<div class="fl-input placeholder">{icon("mail")}hello@yourbusiness.com</div>') + "</div>",
        field("Address", f'<div class="fl-input placeholder">{icon("map-pin")}Street, city, region and country</div>'),
        field("Opening hours", '<div class="toggle-line"><span>Customers can visit us in person</span><span class="switch"><span></span></span></div>',
              "Off: posts never mention hours or a place to visit. Turn it on to add your hours."),
    ]), '<span class="badge badge-neutral">All optional</span>')
    audience = kit_section("Who it&rsquo;s for", "Posts are written for these people.", field(
        "Your customers", '<div class="fl-input area placeholder">Who buys from you, and what they care about</div>'
        '<div class="suggest" style="margin-top:0.25rem"><span class="type-label">Start from:</span><span class="pill">Locals nearby</span><span class="pill">People who shop online</span><span class="pill">Parents</span><span class="pill">Other businesses</span></div>',
        "One sentence is enough, for example &ldquo;People 25 to 40 who read every ingredient label.&rdquo;"))
    tone = "".join(f'<span class="pill{" on" if t in ("Friendly", "Straightforward") else ""}">{t}</span>'
                   for t in ["Playful", "Warm", "Witty", "Friendly", "Straightforward", "Confident", "Expert", "Calm", "Bold"])
    voice = kit_section("How you sound", "Pick up to three. Every caption is written this way.", f"""
  <p class="default-note">{icon("sparkles")}<span>We started you on Friendly and Straightforward, which suit most small businesses. Change them if they don&rsquo;t sound like you.</span></p>
  <div class="pills">{tone}</div>
  <div style="margin-top:1rem;padding:0.875rem 1rem;border-radius:1rem;background:#f7f8fa"><p class="type-label">Example caption in this voice</p><p style="margin-top:0.375rem">&ldquo;Fresh batch, same recipe. Here&rsquo;s what went into it and why.&rdquo;</p></div>""")
    swatches = "".join(f'<span class="swatch-chip"><i style="background:{c}"></i>{n} <small>{c}</small></span>'
                       for n, c in [("Indigo", "#4B3FE4"), ("Paper", "#F7F7FA"), ("Ink", "#1C2433")])
    pairs = [("Clean", "Inter for headings and text", "font-family:Inter,system-ui,sans-serif", True),
             ("Warm", "Fraunces for headings, Karla for text", "font-family:Fraunces,Georgia,serif", False),
             ("Friendly", "Poppins for headings, Nunito for text", "font-family:Poppins,system-ui,sans-serif", False)]
    pair_html = "".join(f'<div class="font-pair{" on" if on else ""}"><span class="aa" style="{style}">Aa</span><span><b style="font-weight:600;display:block">{name}</b><span class="names">{names}</span></span></div>'
                        for name, names, style, on in pairs)
    look = kit_section("How you look", "The colours and typefaces your post pictures use.", f"""
  <p class="default-note">{icon("sparkles")}<span>These are starting colours. Add your own and they replace them.</span></p>
  {field("Colours", f'<div class="swatch-row">{swatches}<button class="chip-add pressable">{icon("plus")}Add a colour</button></div>', "Add a colour by its code, for example #F25C54. Up to five.")}
  {field("Typefaces", f'<div class="font-pairs">{pair_html}</div>')}""")
    platforms = "".join(
        f'<div class="platform{" on" if on else ""}">{icon(i)}<div style="min-width:0"><p style="font-weight:500">{n}</p><p class="type-label">{note}</p></div><span class="box">{icon("check") if on else ""}</span></div>'
        for n, i, on, note in [
            ("Instagram", "instagram", True, "Where most small businesses start"),
            ("Facebook", "facebook", False, "Posts to a Facebook Page"),
            ("TikTok", "tiktok", False, "Short videos"),
            ("LinkedIn", "linkedin", False, "For selling to other businesses"),
        ])
    where = kit_section("Where should we post?", "Pick at least one. You connect them in the next step.", f'<div class="platform-grid">{platforms}</div>')
    needs = (f'<div class="need-list" aria-label="Needed to continue"><p style="font-weight:600">Needed to continue</p>'
             f'<p><span class="tick done">{icon("check")}</span>Business name</p>'
             f'<p><span class="tick"></span>What you do</p>'
             f'<p><span class="tick"></span>Who it&rsquo;s for</p>'
             f'<p><span class="tick done">{icon("check")}</span>Where to post</p></div>')
    side = f"""<aside class="sticky-side">
  {art("Meow Meow Tweet", "ink", font_size="1.6rem")}
  <div>
    <p style="font-weight:500">A post in your brand</p>
    <p class="type-label" style="margin-top:0.25rem">Changes as you fill it in.</p>
    <div class="desktop-only">{needs}
    <button class="btn btn-default pressable is-disabled" aria-disabled="true" style="width:100%;margin-top:1rem">Continue{icon("arrow-right")}</button>
    <p class="type-label" style="margin-top:0.625rem;text-align:center">You can change all of this later in Settings.</p></div>
  </div>
</aside>"""
    body = f"""{CSS}
{manual_flow()}
<section class="review-head">
  <h1 class="type-title">Tell us about your business</h1>
  <p style="margin-top:0.5rem;color:var(--muted-foreground);max-width:40rem">Every post starts from this brand kit. It takes about 5 minutes, and you can change all of it later.</p>
</section>
<div class="review">
  <div>{business}{audience}{voice}{look}{contact}{where}</div>
  {side}
</div>
<div class="bottom-bar"><p class="type-label">2 of 4 needed parts done</p><button class="btn lg btn-default pressable is-disabled" aria-disabled="true">Continue{icon("arrow-right")}</button></div>"""
    html = page("Onboarding: fill in your brand kit", body, workspace=False)
    fonts = "family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@600&family=Poppins:wght@600&"
    return html.replace("css2?family=Bricolage", f"css2?{fonts}family=Bricolage")


# ---------- 2. Post states ----------

TODAY_ROWS = {
    "published_1": ("At the wheel, take 1", "At the wheel", "instagram", "reel", "30 seconds", "Published", "Tue 29 Sep, 9:00 AM", "1,480 reached", "blue"),
    "published_3": ("On the table, take 3", "On the table", "facebook", "image", "", "Published", "Sat 3 Oct, 9:00 AM", "Results from tomorrow", "ink"),
}


def failed_rows():
    """Sat 3 Oct: two posts didn't go out. They stay at the top until they are fixed."""
    see = '<button class="btn sm btn-soft-danger pressable">See why</button>'
    rows = [
        post_row("New from the kiln, take 2", "New from the kiln", "instagram", "carousel", "5 slides", "Didn't go out", "Thu 1 Oct, 1:00 PM", "Tried twice",
                 "yellow", reason="Instagram didn&rsquo;t accept slide 3", action=see),
        post_row("Studio notes, take 4", "Studio notes", "facebook", "image", "", "Didn't go out", "Sat 3 Oct, 5:00 PM", "Tried once",
                 "blue", reason="Your Facebook connection expired", action=see),
        '<tr class="group-row"><td colspan="5">Coming up</td></tr>',
        post_row("At the wheel, take 5", "At the wheel", "instagram", "carousel", "4 slides", "Needs approval", "Wed 7 Oct, 1:00 PM", "In 4 days", "blue"),
        post_row("New from the kiln, take 6", "New from the kiln", "instagram", "story", "15 seconds", "Needs approval", "Fri 9 Oct, 5:00 PM", "In 6 days", "yellow"),
        '<tr class="group-row"><td colspan="5">Published</td></tr>',
        post_row(*TODAY_ROWS["published_1"]),
    ]
    counts = [("All", 5), ("Needs approval", 2), ("Scheduled", 0), ("Published", 1), ("Didn&rsquo;t go out", 2), ("Drafts", 0)]
    foot = "Posts that didn&rsquo;t go out stay at the top until you fix them. Then soonest first."
    return content_table("".join(rows), counts, foot=foot)


def failed_size_panel():
    """Instagram turned a slide down: show which one, why, and the fix."""
    flag = f'<span class="flag">{icon("alert")}</span>'
    slides = "".join(
        f'<span class="slide-thumb{" bad on" if i == 2 else ""}">{thumb(v)}{flag if i == 2 else ""}</span>'
        for i, v in enumerate(["yellow", "blue", "ink", "yellow", "blue"]))
    body = f"""
{facts("instagram", "carousel", "5 slides", "Was due Thu 1 Oct, 1:00 PM", "Didn't go out")}
<div class="fail-card" role="alert">
  <h3>{icon("alert")}Instagram didn&rsquo;t accept slide 3</h3>
  <p>Slide 3 is taller than Instagram allows in a carousel. Nothing was posted, so none of your followers saw it.</p>
  <p class="tries">{icon("refresh")}Tried at 1:00 PM and again at 1:05 PM on Thursday.</p>
</div>
<div class="crop-demo">
  <div class="crop-frame">{art("", "ink")}<span class="limit" aria-hidden="true"></span></div>
  <div class="crop-copy">
    <p style="font-weight:600">Slide 3 of 5</p>
    <p class="small-print">It&rsquo;s 1080 by 1920. The dashed frame is the tallest a carousel slide can be (4 by 5).</p>
    <p class="small-print">&ldquo;Change and try again&rdquo; crops it to the frame. You see it before it goes out.</p>
  </div>
</div>
<div class="preview"><div class="slide-strip" aria-label="Slides">{slides}</div></div>
<div class="fl-when">
  <p class="when-title">When it goes out after the fix</p>
  <div class="pills"><span class="pill on">As soon as it&rsquo;s fixed</span><span class="pill">Mon 5 Oct, 1:00 PM</span><button class="pill pressable">{icon("clock")}Other time</button></div>
  <p class="type-label">Mon 5 Oct at 1:00 PM is the next best time for this theme.</p>
</div>
<div class="read-block"><p class="type-label">Caption</p><p class="read-caption" style="margin-top:0.375rem">Batch drops, restocks and what sold out. Fresh from Friday&rsquo;s firing; the speckled mugs go first. Swipe for all five.</p></div>"""
    foot = (f'<button class="btn btn-outline pressable lead">{icon("refresh")}Try again</button>'
            f'<button class="btn btn-default pressable">{icon("pencil")}Change and try again</button>')
    return post_sheet("Post didn&rsquo;t go out", "Fix it and it goes out straight away", body, foot)


def failed_connection_panel():
    """The network ended Cadence's access: reconnecting is the fix."""
    body = f"""
{facts("facebook", "image", "", "Was due Sat 3 Oct, 5:00 PM", "Didn't go out")}
<div class="fail-card" role="alert">
  <h3>{icon("alert")}Your Facebook connection expired</h3>
  <p>Facebook stopped letting Cadence post for you. This happens after a password change, or when Facebook asks you to confirm access again. Nothing was posted.</p>
  <p class="tries">{icon("refresh")}Tried at 5:00 PM today.</p>
</div>
<div class="preview"><div class="preview-frame">{art("Studio notes, take 4", "blue", "image", font_size="1.5rem")}</div></div>
<div class="note">{icon("sparkles")}<span>Reconnecting takes about a minute on Facebook. Your other approved Facebook posts wait until then; Instagram posts are not affected.</span></div>
<div class="fl-when">
  <p class="when-title">When it goes out after you reconnect</p>
  <div class="pills"><span class="pill on">Straight away</span><span class="pill">Wed 7 Oct, 9:00 AM</span><button class="pill pressable">{icon("clock")}Other time</button></div>
</div>"""
    foot = (f'<button class="btn btn-outline pressable lead">{icon("pencil")}Change and try again</button>'
            f'<button class="btn btn-default pressable">{icon("facebook")}Reconnect and try again</button>')
    return post_sheet("Post didn&rsquo;t go out", "Reconnect Facebook and it goes out straight away", body, foot)


def post_failed_size():
    return content_page("Content: post didn't go out", content_header() + failed_rows(), failed_size_panel(), waiting=2)


def post_failed_connection():
    return content_page("Content: connection expired", content_header() + failed_rows(), failed_connection_panel(), waiting=2)


def failed_chip(time, title, variant, platform, fmt, detail, reason):
    chip = build.week_post(time, title, variant, platform, fmt, detail, True)
    chip = chip.replace('class="chip-post needs"', 'class="chip-post failed"').replace(", needs approval", ", didn't go out")
    return chip.replace('<span class="needs-tag">Needs approval</span>', f'<span class="failed-tag">{reason}</span>')


def post_failed_overview():
    """The overview puts failed posts first, above everything that is going well."""
    body = build.overview_body()
    start = body.index('<section class="next-step">')
    end = body.index("</section>", start) + len("</section>")
    alert = f"""<section class="next-step fail-step" role="alert">
  <div class="fail-top"><span class="mark">{icon("alert")}</span><div>
    <h2 class="type-heading">2 posts didn&rsquo;t go out</h2>
    <p style="margin-top:0.25rem;color:var(--muted-foreground)">Nothing was posted for either. Fix them and they go out straight away.</p>
  </div></div>
  <div class="fail-list">
    <div class="fail-item"><span class="chip-thumb">{thumb("yellow")}<span class="fmt">{icon("layers")}</span></span><div style="min-width:0"><p class="fail-what">Instagram carousel, Thu 1 Oct</p><p class="fail-why">Instagram didn&rsquo;t accept slide 3: it&rsquo;s too tall.</p></div><button class="btn sm btn-default pressable">Fix the slide</button></div>
    <div class="fail-item"><span class="chip-thumb">{thumb("blue")}<span class="fmt">{icon("image")}</span></span><div style="min-width:0"><p class="fail-what">Facebook image post, today 5:00 PM</p><p class="fail-why">Your Facebook connection expired.</p></div><button class="btn sm btn-default pressable">{icon("facebook")}Reconnect Facebook</button></div>
  </div>
</section>"""
    body = body[:start] + alert + body[end:]
    thu = build.week_post("1:00 PM", "New from the kiln, take 2", "yellow", "instagram", "carousel", ", 5 slides", True)
    sat = build.week_post("5:00 PM", "On the table, take 3", "ink", "facebook", "image", "", True)
    body = body.replace(thu, failed_chip("1:00 PM", "New from the kiln, take 2", "yellow", "instagram", "carousel", ", 5 slides", "Didn&rsquo;t go out"))
    body = body.replace(sat, failed_chip("5:00 PM", "Studio notes, take 4", "blue", "facebook", "image", "", "Didn&rsquo;t go out"))
    body = body.replace('<span><i class="k-needs"></i>2 need approval</span>', '<span><i class="k-needs" style="background:var(--destructive)"></i>2 didn&rsquo;t go out</span>')
    body = body.replace('<p class="pending-value">Shows up once Instagram is connected.</p>', '<div class="value type-number">1,262</div><div class="delta">+60 this week</div>')
    body = body.replace('<p class="pending-value">Starts a day after the first post goes out.</p>', '<div class="value type-number">5.1%</div><div class="delta">About usual</div>')
    # Today is Saturday 3 October in this scene; the week before it has passed.
    week_fixes = [
        ('<div class="day today"><div class="label"><span>Today</span><b>28</b>', '<div class="day"><div class="label"><span>Mon</span><b>28</b>'),
        ('<div class="day"><div class="label"><span>Sat</span><b>3</b>', '<div class="day today"><div class="label"><span>Today</span><b>3</b>'),
        ('<div class="slot"><b>1:00 PM</b> free best time</div>', '<span class="empty">Nothing planned</span>'),
        ('<span><i class="k-free"></i>2 free best times</span>', ''),
        ('<span><i class="k-scheduled"></i>1 scheduled</span>', '<span><i class="k-scheduled"></i>1 published</span>'),
        ('class="long">Facebook post', 'class="long">Facebook image post'),
        ('Next: Tue 29 Sep, 9:00 AM', 'Next: Mon 5 Oct, 9:00 AM'),
        ('<p class="type-label" style="margin-top:0.25rem">28 September to 4 October</p>', '<p class="type-label" style="margin-top:0.25rem">28 September to 4 October, today is Saturday</p>'),
    ]
    for before, after in week_fixes:
        body = body.replace(before, after)
    body = body.replace('<div class="type-label">Needs approval</div><div class="value type-number">5</div>', '<div class="type-label">Needs approval</div><div class="value type-number">2</div>')
    html = page("Overview: posts didn't go out", CSS + body + tabbar(""), "")
    return html.replace('<span class="count">5</span>', '<span class="count">2</span>')


def published_rows():
    rows = [
        post_row(*TODAY_ROWS["published_3"]),
        post_row("New from the kiln, take 2", "New from the kiln", "instagram", "carousel", "5 slides", "Published", "Thu 1 Oct, 1:00 PM", "720 reached", "yellow"),
        post_row(*TODAY_ROWS["published_1"]),
    ]
    counts = [("All", 6), ("Needs approval", 3), ("Scheduled", 0), ("Published", 3), ("Drafts", 0)]
    return content_table("".join(rows), counts, "Published", "Newest first. Numbers settle about a day after a post goes out.")


def published_panel():
    """The post as it went out, a link to it, and its first-day results in S12's words."""
    metrics = "".join(f'<div class="metric"><span class="lbl">{icon(i)}{label}</span><b>{value}</b></div>'
                      for i, label, value in [("eye", "Reached", "1,480"), ("bookmark", "Saves", "41"), ("heart", "Likes", "96"), ("chat", "Comments", "12")])
    body = f"""
{facts("instagram", "reel", "30 seconds", "Tue 29 Sep, 9:00 AM", "Published")}
<div class="live-link"><span class="dot">{icon("check")}</span><div style="min-width:0"><p style="font-weight:600">Live on Instagram</p><a class="url" href="#">instagram.com/tartinebakery/reel/C9xk2Lm</a></div></div>
<section>
  <div class="results-head"><p class="when-title" style="margin:0">Results after 1 day</p><span class="verdict good">Your best post so far</span></div>
  <div class="metrics">{metrics}</div>
  <div class="result-lines">
    <p>{icon("check")}<span>Reached 4 times more people than your average post.</span></p>
    <p>{icon("check")}<span>52 new followers the day it went out.</span></p>
  </div>
  <p class="small-print" style="margin-top:0.75rem">Updated Wed 30 Sep, 9:00 AM. Numbers update once a day for a week.</p>
</section>
<div class="preview"><div class="preview-frame" style="width:min(100%,13rem)">{art("At the wheel, take 1", "blue", "reel", font_size="1.25rem")}</div></div>
<div class="read-block"><p class="type-label">Caption as posted</p><p class="read-caption" style="margin-top:0.375rem">Thirty seconds at the wheel, start to finish. Every mug starts as a lump like this one.</p></div>
<p class="small-print">Published posts can&rsquo;t be changed here. To edit or delete it, open it on Instagram.</p>"""
    foot = (f'<a class="btn btn-outline pressable lead" href="#">{icon("chart")}See it in Analytics</a>'
            f'<a class="btn btn-default pressable" href="#">{icon("external")}Open on Instagram</a>')
    return post_sheet("Published post", "The post as it went out, and how it did", body, foot)


def post_published():
    return content_page("Content: published post", content_header() + published_rows(), published_panel(), waiting=3)


NEW_POSTS = [
    ("Studio notes, take 7", "Studio notes", "instagram", "reel", "30 seconds", "Sun 11 Oct, 9:00 AM", "In 13 days", "blue"),
    ("On the table, take 8", "On the table", "facebook", "image", "", "Tue 13 Oct, 9:00 AM", "In 15 days", "ink"),
    ("New from the kiln, take 9", "New from the kiln", "instagram", "carousel", "5 slides", "Wed 14 Oct, 1:00 PM", "In 16 days", "yellow"),
    ("At the wheel, take 10", "At the wheel", "instagram", "reel", "45 seconds", "Fri 16 Oct, 9:00 AM", "In 18 days", "blue"),
    ("New from the kiln, take 11", "New from the kiln", "instagram", "carousel", "4 slides", "Sat 17 Oct, 1:00 PM", "In 19 days", "yellow"),
    ("On the table, take 12", "On the table", "instagram", "story", "15 seconds", "Mon 19 Oct, 5:00 PM", "In 21 days", "ink"),
]


def new_row(post):
    title, pillar, platform, fmt, detail, when, relative, variant = post
    return post_row(title, pillar, platform, fmt, detail, "Needs approval", when, relative, variant, new=True)


def drafting_panel():
    return f"""<section class="panel drafting" aria-live="polite">
  <div>
    <h2 class="type-heading">Drafting 6 more posts</h2>
    <p class="type-label" style="margin-top:0.25rem">For 11 to 19 October, from your strategy&rsquo;s themes and best times.</p>
    <div class="overall" role="progressbar" aria-valuenow="2" aria-valuemin="0" aria-valuemax="6" aria-label="2 of 6 posts ready"><span style="width:33%"></span></div>
    <p class="now"><span class="spinner"></span><span><b style="font-weight:600">Now:</b> making the picture for an Instagram carousel, 5 slides, in your colours.</span></p>
  </div>
  <div class="drafting-count"><b>2 of 6</b><span class="type-label">ready, about 3 minutes left</span></div>
  <div class="leave-note">{icon("clock")}<span>You can leave this page. Each post appears here as it&rsquo;s ready, and we email you when all 6 are waiting for approval.</span></div>
</section>"""


def post_drafting():
    """After "Draft 6 more posts": two drafts are in, four are being made."""
    button = '<button class="btn btn-default pressable is-disabled" aria-disabled="true"><span class="spinner"></span>Drafting 6 posts</button>'
    rows = "".join(post_row(*p) for p in CONTENT_POSTS)
    rows += '<tr class="group-row"><td colspan="5">New drafts</td></tr>'
    rows += new_row(NEW_POSTS[0]) + new_row(NEW_POSTS[1])
    rows += placeholder_row("instagram", "carousel", "5 slides", "Wed 14 Oct, 1:00 PM", "Making the picture")
    rows += placeholder_row("instagram", "reel", "45 seconds", "Fri 16 Oct, 9:00 AM", "Writing the caption")
    rows += placeholder_row("instagram", "carousel", "4 slides", "Sat 17 Oct, 1:00 PM", "Next in line", waiting=True)
    rows += placeholder_row("instagram", "story", "15 seconds", "Mon 19 Oct, 5:00 PM", "Next in line", waiting=True)
    counts = [("All", 8), ("Needs approval", 7), ("Scheduled", 1), ("Published", 0), ("Drafts", 0)]
    body = content_header(button) + drafting_panel() + content_table(rows, counts)
    return content_page("Content: drafting new posts", body, waiting=7)


def post_drafts_arrived():
    """All six are in, each waiting for approval like every other draft."""
    banner = (f'<section class="next-step" style="padding:1rem 1.25rem" aria-live="polite"><p><b style="font-weight:600">6 new posts are ready.</b> '
              f'<span class="muted">11 posts need your decision now. Going one by one is quickest: approve, and the next one opens.</span></p>'
              f'<button class="btn sm btn-default pressable">Review one by one{icon("arrow-right")}</button></section>')
    rows = "".join(post_row(*p) for p in CONTENT_POSTS)
    rows += '<tr class="group-row"><td colspan="5">New drafts</td></tr>' + "".join(new_row(p) for p in NEW_POSTS)
    counts = [("All", 12), ("Needs approval", 11), ("Scheduled", 1), ("Published", 0), ("Drafts", 0)]
    return content_page("Content: new drafts ready", content_header() + banner + content_table(rows, counts), waiting=11)


# ---------- 3. Strategy version 2 ----------

PILLARS_V2 = [
    ("Made by hand", "How each bar is poured and cut, shown close up.", 35, 30),
    ("What&rsquo;s inside", "One ingredient at a time, and why it doesn&rsquo;t sting.", 30, 35),
    ("Real people", "Customer photos and reviews, shop owners first.", 20, 25),
    ("New and back in stock", "Drops, restocks and gift sets.", 15, 10),
]
DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
PLAN_V1 = {"instagram": {"Tue": "8 AM", "Thu": "6 PM", "Sat": "10 AM", "Sun": "7 PM"}, "facebook": {"Wed": "12 PM", "Sat": "9 AM"}}
PLAN_V2 = {"instagram": {"Tue": "8 AM", "Thu": "8 AM", "Sat": "10 AM", "Sun": "11 AM"}, "facebook": {"Wed": "12 PM", "Sat": "9 AM"}}
LEARNINGS = [
    ("up", "Ingredient close-ups get saved the most",
     "7 of every 100 people saved a &ldquo;What&rsquo;s inside&rdquo; post, three times your product shots. The shea butter carousel was the most saved post of the month.",
     "More What&rsquo;s inside"),
    ("up", "Customer reviews bring in new followers",
     "The 5 &ldquo;Real people&rdquo; posts brought 64 of your 120 new followers, more than any other theme.",
     "More Real people"),
    ("down", "Evening posts reach half as many people",
     "Thursday 6 PM and Sunday 7 PM reached 180 people on average. Your morning posts reached 390.",
     "Two posts move to the morning"),
    ("down", "Restock posts get few saves",
     "1 save per 100 people across 4 restock posts. People liked them but didn&rsquo;t keep them.",
     "Fewer restock posts"),
    ("neutral", "Facebook is too early to call",
     "8 posts, reaching about the same as Instagram on Saturdays and less on Wednesdays. Another month will tell.",
     None),
]


def pillar_compare():
    rows = ""
    for name, desc, before, after in PILLARS_V2:
        direction = "up" if after > before else "down"
        rows += (f'<div class="pillar-cmp"><div class="top"><span class="name">{name}</span>'
                 f'<span class="shift {direction}"><s>{before}%</s> to <b>{after}%</b></span></div>'
                 f'<p class="type-label" style="margin-top:0.125rem">{desc}</p>'
                 f'<div class="bars" aria-label="{before}% before, {after}% now"><span class="before"><i style="width:{before}%"></i></span><span class="after"><i style="width:{after}%"></i></span></div></div>')
    key = '<div class="cmp-key"><span><i style="background:#c9ced8"></i>Version 1</span><span><i style="background:var(--brand)"></i>Version 2</span></div>'
    return f'<section class="panel">{card_head("What you&rsquo;ll post about", "Still 4 themes. Two get more of the month, two get less.")}{rows}{key}</section>'


def week_grid(plan, before=False, moved=()):
    html = '<span></span>' + "".join(f'<span class="wk-day">{d}</span>' for d in DAYS)
    for platform, label, alt in [("instagram", "Instagram", ""), ("facebook", "Facebook", " alt")]:
        html += f'<span class="plat">{icon(platform)}<span>{label}</span></span>'
        for day in DAYS:
            time = plan[platform].get(day)
            if not time:
                html += '<span class="wk-slot">&ndash;</span>'
                continue
            mark = " moved" if (platform, day) in moved else ""
            html += f'<span class="wk-slot on{alt}{mark}">{time}</span>'
    cls = "plan-week before" if before else "plan-week"
    return f'<div class="{cls}">{html}</div>'


def times_compare():
    moved = {("instagram", "Thu"), ("instagram", "Sun")}
    return f"""<section class="panel">{card_head("When it goes out", "Still 6 posts a week. Two evening posts move to the morning.")}
  <p class="times-label"><span>Version 1</span><span class="type-label">Until today</span></p>
  {week_grid(PLAN_V1, before=True, moved=moved)}
  <p class="times-label"><span>Version 2</span><span class="type-label">Outlined: moved</span></p>
  {week_grid(PLAN_V2, moved=moved)}
  <div class="moves">
    <p>{icon("instagram")}<span>Instagram Thursday: 6 PM to <b style="font-weight:600">8 AM</b></span></p>
    <p>{icon("instagram")}<span>Instagram Sunday: 7 PM to <b style="font-weight:600">11 AM</b></span></p>
  </div>
</section>"""


def change_panel():
    changes = [
        ("target", "What&rsquo;s inside: 30% to 35%", "ingredient close-ups get saved the most."),
        ("target", "Real people: 20% to 25%", "customer reviews bring in new followers."),
        ("target", "Made by hand 35% to 30%, restocks 15% to 10%", "restock posts get few saves; made-by-hand gives up a little room."),
        ("clock", "Thursday and Sunday posts move to the morning", "evening posts reach half as many people."),
    ]
    rows = "".join(f'<div class="change"><span class="icon-wrap">{icon(i)}</span><div><p class="fail-what">{what}</p><p class="because">Because: {why}</p></div></div>'
                   for i, what, why in changes)
    note = ("Your first month showed that people come for what&rsquo;s inside the bar and stay for other customers&rsquo; stories. "
            "So version 2 gives ingredients and reviews more room, cuts back on restock posts, and moves the two evening posts to the morning, "
            "when your posts reached twice as many people. Everything else stays the same.")
    return f"""<section class="panel" style="margin-bottom:1.25rem">{card_head("What changed and why", "From 4 weeks and 24 posts of your own results.")}
  <div class="agent-words"><span class="icon-wrap">{icon("sparkles")}</span><div><p class="type-label">The strategist&rsquo;s note</p><blockquote>&ldquo;{note}&rdquo;</blockquote></div></div>
  <div class="change-list">{rows}</div>
</section>"""


def learnings_panel():
    arrows = {"up": "&uarr;", "down": "&darr;", "neutral": "&ndash;"}
    names = {"up": "Worked well", "down": "Didn&rsquo;t work", "neutral": "Too early to tell"}
    rows = ""
    for impact, insight, evidence, led in LEARNINGS:
        led_html = f'<span class="led">Led to: {led}</span>' if led else '<span class="led none">No change yet</span>'
        rows += (f'<div class="learn"><span class="impact {impact}" role="img" aria-label="{names[impact]}">{arrows[impact]}</span>'
                 f'<div><p class="insight">{insight}</p><p class="evidence">{evidence}</p></div>{led_html}</div>')
    return f"""<section class="panel" style="margin-bottom:1.25rem">{card_head("What the agent learned", "From your results, 29 September to 26 October. These caused version 2.")}
  {rows}
  <p style="margin-top:0.75rem"><a class="link" href="#" style="margin-left:0">See every result in Analytics{icon("chevron-right")}</a></p>
</section>"""


def strategy_v2():
    """Strategy after the first month: version 2, what changed and why, and before against after."""
    audiences = [("Ingredient checkers", "25&ndash;40, read every label. Most posts speak to them."),
                 ("Shop owners", "Natural-goods stores. One post a week shows what stockists get."),
                 ("Gift buyers", "Tested around holidays with the trial sets.")]
    aud_html = "".join(f'<div class="aud"><p style="font-weight:600">{n}</p><p class="type-label" style="margin-top:0.25rem">{d}</p></div>' for n, d in audiences)
    switch = '<div class="v-switch"><div class="seg sm" role="radiogroup" aria-label="Version"><button>Version 1</button><button class="on">Version 2</button></div></div>'
    banner = f"""<section class="draft-banner" aria-live="polite">
  {countdown_ring(24)}
  <div><h2 class="type-heading">Version 2 is ready to check</h2><p class="type-label" style="margin-top:0.25rem">Your first month&rsquo;s results changed 4 things. It replaces version 1 on its own in 24 minutes if you change nothing. Posts already approved keep their times.</p></div>
  <div class="actions"><button class="btn btn-outline pressable">Ask for changes</button><button class="btn btn-default pressable">{icon("check")}Start now</button></div>
</section>"""
    body = f"""{CSS}
{header("Strategy", "What the agent will post, how often and why.", switch)}
{banner}
<div class="why">
  <div><p class="type-label">Why this plan</p><p style="margin-top:0.25rem"><b>Trust holds sales back:</b> people who try it love it, but few have heard of it. So posts show the ingredients and the hands behind them.</p></div>
  <button class="btn sm btn-ghost pressable">See the research{icon("arrow-right")}</button>
</div>
{change_panel()}
<div class="strat-grid">{pillar_compare()}{times_compare()}</div>
{learnings_panel()}
<section class="panel" style="margin-bottom:1.25rem"><div class="card-head"><div><h2 class="type-heading">Who it talks to</h2><p class="type-label">From your research.</p></div><span class="same-note">{icon("check")}Same as version 1</span></div><div class="g3" style="display:grid;gap:1rem">{aud_html}</div></section>
{tabbar("strategy")}"""
    return as_meow(page("Strategy: version 2", body, "strategy"))


SCREENS = {
    "kit-manual": kit_manual,
    "post-failed-size": post_failed_size,
    "post-failed-connection": post_failed_connection,
    "post-failed-overview": post_failed_overview,
    "post-published": post_published,
    "post-drafting": post_drafting,
    "post-drafts-arrived": post_drafts_arrived,
    "strategy-v2": strategy_v2,
}


def main():
    OUT.mkdir(exist_ok=True)
    for name, make in SCREENS.items():
        (OUT / f"fl-v1-{name}.html").write_text(make(), encoding="utf-8")
    print(f"wrote {len(SCREENS)} screens to {OUT}")


if __name__ == "__main__":
    main()
