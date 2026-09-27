# Dark mode check

Nine approved screens rendered in dark (`data-theme="dark"` plus the dark tokens from
`docs/DESIGN.md`, the same way `design/web-v2/screens-hdr/hdr-v1-client-dark.html` does it).
Method: `design/dark-check/build.py` writes `<id>-dark.html` (tokens only) and
`<id>-dark-fixed.html` (tokens plus `dark-overrides.css`) for each screen; both are screenshotted
at 1440 wide. Screens themselves are untouched; `dark-overrides.css` is a proposal only.

Screenshots: `<scratchpad>/misc/dc-<id>-dark.png` (before) and `dc-<id>-fixed.png` (after, for
the four screens with a visible fix below). `<scratchpad>` is
`C:/Users/Rnf-user.DESKTOP-H20A3J8/AppData/Local/Temp/claude/C--Users-Rnf-user-DESKTOP-H20A3J8-Desktop-social-agent/0961f288-92d5-46ce-a429-ea293764a829/scratchpad`.

Five root-cause problems repeat across the sample. Each is one rule in `dark-overrides.css`.

## Problem 1: soft-surface panels are a fixed light grey

`.day`, `.prefill`, `.day-sep`, `.aud`, `.learn-empty`, `.goes-out`, `.kit-meta`, `.what-next`,
`.art`, `.content-table tbody tr:hover`, `.clients-table tbody tr:hover`, `.clients-table tr.new`
and `.brand-card.pending` all set `background: #f7f8fa` (or `#f5f6f8` / `#f2f5fa` / `#fbfbfd` /
`#f4f3fe`) instead of a theme token. In dark mode the card stays light while its text uses
`var(--foreground)`, which the dark tokens make light too: white-on-white.

- Screenshot: `dc-s09-approvals-dark.png` — the "Goes out" card's own time
  (`Thursday 1 October, 1:00 PM`, `.goes-out-when`, no explicit colour) is unreadable against
  `.goes-out`'s `#f7f8fa`.
- Screenshot: `dc-s13-brand-kit-dark.png` — the "A post in your brand" note (`.kit-meta`,
  `#f7f8fa`) is barely visible; fixed in `dc-s13-brand-kit-fixed.png`.
- Same rule, same bug, present in S03, S06, S08, S11, S12 (`.day` mini-calendar, `.prefill`,
  `.aud`, `.learn-empty`) and admin (`.clients-table tr.new`, `.brand-card.pending` — not
  triggered by this mock's data, but the CSS is there and will break the moment a client is
  "new" or a brand is "pending").
- Fix: `dark-overrides.css`, "Problem 1" — repoint each selector's `background` to
  `var(--secondary)` under `:root[data-theme="dark"]`.

## Problem 2: the calendar's weekend columns are hard-coded near-white

`.cal-cell:nth-child(7n+6), .cal-cell:nth-child(7n) { background: #fafbfc; }` (S11,
`s11-v3-month.html`) — every Saturday and Sunday column renders as a solid white block in an
otherwise dark calendar.

- Screenshot: `dc-s11-calendar-month-dark.png` (Sat/Sun columns, all rows) vs
  `dc-s11-calendar-month-fixed.png`.
- Fix: `dark-overrides.css`, "Problem 2" — same selector, `background: var(--secondary)`.

## Problem 3: warning/error text colour is fixed for a light background

`.warn-note`, `.cal-alert` (`color: #8a5708`), `.notice.warning` (`#8a5606`), `.waiting p + p`
(`#6f4a0a`) and `.acct .inline-error` (`#a3263b`) all set a dark, low-luminance ink colour on top
of their own translucent tint (`rgba(183,116,10,0.1)` etc). On the dark background that tint
turns to a near-black brown/red, so the fixed dark text sits close in luminance to it: roughly
3:1, under the 4.5:1 text needs.

- Screenshot: `dc-s09-approvals-dark.png` ("Instagram isn't connected…", `.warn-note`) and
  `dc-s11-calendar-month-dark.png` ("Instagram and Facebook aren't connected…", `.cal-alert`) —
  both readable but dim; `dc-s11-calendar-month-fixed.png` shows the same line in the brighter
  dark-mode warning colour.
- Same `.warn-note` rule (line 808 of every screen file) is shared boilerplate, so it is present
  verbatim in all nine sample screens, plus every other screen in `design/web-v2` that carries
  the standard `<style>` block.
- Fix: `dark-overrides.css`, "Problem 3" — `color: var(--warning)` for the warning-toned classes,
  `color: var(--destructive)` for `.acct .inline-error`.

## Problem 4: a brand's tint tokens are only re-pointed for one brand

The dark tokens override `--tint`, `--tint-strong`, `--tint-foreground` and `--brand-2` for
`.brand-tartine` only. Any other brand class (here: `.brand-meow`, Meow Meow Tweet) keeps its
light-mode tint in dark mode. `.platform.on` sets `background: var(--tint)`, so on S13 both
"Where to post" cards render with a light pink card and `var(--foreground)` (light) text on top:
the platform name is invisible, and "Connected" vs "Access expired" become indistinguishable
(both show the same light-pink card, same red ring from `var(--brand)`).

- Screenshot: `dc-s13-brand-kit-dark.png` (both cards under "Where to post") vs
  `dc-s13-brand-kit-fixed.png`.
- This is the highest-severity finding: it is not cosmetic, the connection status is unreadable.
- Fix: `dark-overrides.css`, "Problem 4" — add a `:root[data-theme="dark"] .brand-meow {...}`
  block, same shape as the existing `.brand-tartine` one. The real fix is process, not just this
  file: every brand class needs its own dark block, generated wherever `.brand-tartine`'s is
  generated (there are at least 4 test-site brands per `docs/MEMORY.md`; a brand switcher for a
  real client's colour will add one per client).

## Problem 5: the sign-in marketing panel ignores the theme entirely

`.auth-panel` (background `#edecfc`), `.auth-panel .ghost` (`#f7f6fe`), `.auth-panel .say h2`
(`#231d6e`) and `.say p` (`#4d4a78`) are all fixed light-lilac values. The panel is internally
readable (dark text on its own light background) but stays a bright light island next to the
rest of the dark sign-in page — it never switches.

- Screenshot: `dc-auth-sign-in-dark.png` vs `dc-auth-sign-in-fixed.png`.
- Fix: `dark-overrides.css`, "Problem 5" — panel background to `var(--secondary)`, the "ghost"
  card to `var(--card)`, heading/body text to `var(--foreground)` / `var(--muted-foreground)`,
  and the dashed `.optional` outline and invite avatar to border/brand tokens instead of the
  fixed purple.

## Not a problem

- The S12 analytics chart (`design/web-v2/screens-s12/s12-v3-month.html`) already uses
  `var(--brand)`, `var(--card)`, `var(--foreground)`, `var(--muted-foreground)` throughout its
  SVG (grid lines, line, dots, legend) — it re-themes correctly with no changes needed.
- `adm-v1-clients.html`'s status/needs badges (`.badge-success/-warning/-danger/-neutral`) use
  `var(--success)/var(--warning)/var(--destructive)`, not fixed hex — they read fine in dark
  (`dc-adm-clients-dark.png`).
- Light grey borders such as `.slot`'s `1.5px dashed #c9d2e0` and `.week-legend .k-free`'s inset
  `#b3bac6` stay visible against the dark background (a light border on a dark surface still
  shows); not worth a fix.

## Questions for the owner

1. Problem 4 is systemic (every brand but Tartine breaks in dark mode) — should the real fix be
   a dark block per brand added wherever brand classes are generated, or should `--tint`/
   `--tint-strong`/`--tint-foreground` be computed from `--brand` at runtime instead of hand-set
   per brand per theme?
2. `dark-overrides.css`'s proposed colours (`--tint`/`--brand-2` for `.brand-meow`, the
   `var(--secondary)` soft-surface swap) are my best match to the existing dark palette — want a
   pass to confirm the exact hex before this becomes real CSS?
3. Should `.warn-note` / `.cal-alert` also get a dark-specific background (not just text colour)
   so the tint hue matches the brighter warning text, or is `var(--warning)` text on the existing
   dim tint enough?
