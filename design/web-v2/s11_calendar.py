"""S11 v3: the Calendar (/c/:brandId/calendar).

Run from design/web-v2: python s11_calendar.py
Desktop shows the month as a grid you can drag posts across; below 1024px it becomes a small month
(or, on a phone, a week picker) above a day-by-day agenda. Every post says where it goes and what it is.
"""

from datetime import date
from pathlib import Path

import build
from build import icon, thumb, page, header, tabbar, FORMATS, PLATFORMS, CONTENT_POSTS, STATUS_BADGE, review_panel, post_facts

OUT = Path(__file__).parent / "screens-s11"
TODAY = date(2026, 9, 28)

STATUS_TEXT = {
    "needs": "Needs approval",
    "waiting": "Waiting for Instagram",
    "scheduled": "Scheduled",
    "published": "Published",
}
BADGE = {
    "needs": STATUS_BADGE["Needs approval"],
    "waiting": f'<span class="badge badge-wait">{icon("alert")}Approved, waiting for Instagram</span>',
    "scheduled": STATUS_BADGE["Scheduled"],
    "published": STATUS_BADGE["Published"],
}


def cal_event(day, time, post, status):
    title, _pillar, platform, fmt, detail, _status, _when, _relative, variant = post
    return {"day": day, "time": time, "title": title, "platform": platform, "fmt": fmt, "detail": detail, "variant": variant, "status": status}


# The six posts the agent drafted (same as Content), placed on their days. Instagram isn't connected,
# so the one approved post waits instead of counting as scheduled.
EVENTS = [
    cal_event(date(2026, 9, 29), "9:00 AM", CONTENT_POSTS[0], "waiting"),
    cal_event(date(2026, 10, 1), "1:00 PM", CONTENT_POSTS[1], "needs"),
    cal_event(date(2026, 10, 3), "5:00 PM", CONTENT_POSTS[2], "needs"),
    cal_event(date(2026, 10, 5), "9:00 AM", CONTENT_POSTS[3], "needs"),
    cal_event(date(2026, 10, 7), "1:00 PM", CONTENT_POSTS[4], "needs"),
    cal_event(date(2026, 10, 9), "5:00 PM", CONTENT_POSTS[5], "needs"),
]

# The strategy's best times that have no post yet (the agent drafts about a week ahead).
FREE = {date(2026, 9, 30): "1:00 PM", date(2026, 10, 2): "1:00 PM", date(2026, 10, 12): "9:00 AM", date(2026, 10, 14): "1:00 PM",
        date(2026, 10, 16): "5:00 PM", date(2026, 10, 20): "9:00 AM", date(2026, 10, 22): "1:00 PM", date(2026, 10, 24): "5:00 PM",
        date(2026, 10, 26): "9:00 AM", date(2026, 10, 28): "1:00 PM", date(2026, 10, 30): "5:00 PM"}

GRID_DAYS = [date(2026, 9, 28 + i) if i < 3 else date(2026, 10, i - 2) if i < 34 else date(2026, 11, 1) for i in range(35)]


def long_date(day):
    return f"{day.strftime('%A')} {day.day} {day.strftime('%B')}"


def kind_of(event):
    fmt_name = FORMATS[event["fmt"]][1].lower()
    where = f"{PLATFORMS[event['platform']]} {'post' if event['fmt'] == 'image' else fmt_name}"
    return f"{where}, {event['detail']}" if event["detail"] else where


def aria(event):
    return f"{kind_of(event)}, {long_date(event['day'])}, {event['time']}, {event['title']}, {STATUS_TEXT[event['status']].lower()}"


def preview(event):
    fmt_icon = FORMATS[event["fmt"]][0]
    return f'<span class="chip-thumb">{thumb(event["variant"])}<span class="fmt">{icon(fmt_icon)}</span></span>'


def format_name(event):
    """The format in words; a single image is an "Image post" so it is never confused with a carousel."""
    return "Image post" if event["fmt"] == "image" else FORMATS[event["fmt"]][1]


def platform_label(event):
    """The network, named and in its own colour, so nobody has to recognise a tiny icon."""
    platform = event["platform"]
    return f'<span class="plat-label p-{platform}">{icon(platform)}{PLATFORMS[platform]}</span>'


def cell_post(event, extra=""):
    """A post inside a month cell: preview, time, platform and format, title, status."""
    return (f'<a class="cal-post s-{event["status"]} {extra}" href="#" draggable="true" aria-label="{aria(event)}">{preview(event)}'
            f'<span class="cp-body">{platform_label(event)}<span class="cp-time">{event["time"]}</span>'
            f'<span class="cp-where">{format_name(event)}</span>'
            f'<span class="cp-title">{event["title"]}</span><span class="cp-status">{STATUS_TEXT[event["status"]]}</span></span></a>')


def free_slot(time):
    return f'<div class="cal-free"><b>{time}</b> free best time</div>'


def day_label(day):
    if day == TODAY:
        return f'<span class="n"><b>{day.day}</b><span class="today-tag">Today</span></span>'
    show_month = day.day == 1 or day == GRID_DAYS[0]
    number = f"{day.day} {day.strftime('%b')}" if show_month else str(day.day)
    return f'<span class="n"><b>{number}</b></span>'


def month_grid(events, free, cell_extras=None):
    cell_extras = cell_extras or {}
    dows = "".join(f'<div class="cal-dow">{d}</div>' for d in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
    cells = ""
    for day in GRID_DAYS:
        cls = "cal-cell"
        if day.month != 10:
            cls += " out"
        if day == TODAY:
            cls += " today"
        extra_cls, extra_html = cell_extras.get(day, ("", ""))
        inner = day_label(day)
        inner += "".join(cell_post(e) for e in events if e["day"] == day)
        if day in free:
            inner += free_slot(free[day])
        cells += f'<div class="{cls} {extra_cls}">{inner}{extra_html}</div>'
    return f'<div class="cal-desk"><div class="cal-dows">{dows}</div><div class="cal-grid">{cells}</div></div>'


def dots(day, events, free):
    marks = "".join(f'<i class="d-{e["status"]}"></i>' for e in events if e["day"] == day)
    if day in free:
        marks += '<i class="d-free"></i>'
    return f'<span class="dots">{marks}</span>'


def mini_day(day, events, free, selected=None, letter=""):
    cls = "md"
    if day.month != 10:
        cls += " out"
    if day == TODAY:
        cls += " today"
    if day == selected:
        cls += " sel"
    letter_html = f'<span class="wd">{letter}</span>' if letter else ""
    return f'<button class="{cls}" aria-label="{long_date(day)}">{letter_html}<span class="num">{day.day}</span>{dots(day, events, free)}</button>'


def mini_month(events, free, selected=None):
    letters = "".join(f'<span class="mdow">{d}</span>' for d in ["M", "T", "W", "T", "F", "S", "S"])
    days = "".join(mini_day(d, events, free, selected) for d in GRID_DAYS)
    return (f'<div class="mini-card"><div class="mini-head"><button class="btn icon btn-outline" aria-label="Previous month">{icon("chevron-left")}</button>'
            f'<b>October 2026</b><button class="btn icon btn-outline" aria-label="Next month">{icon("chevron-right")}</button></div>'
            f'<div class="mini-grid">{letters}{days}</div>'
            f'<button class="btn sm btn-ghost pressable mini-today">Go to today</button></div>')


def week_picker(events, free, selected=None):
    week = GRID_DAYS[:7]
    days = "".join(mini_day(d, events, free, selected, d.strftime("%a")[0]) for d in week)
    return (f'<div class="week-pick"><div class="wp-head">'
            f'<button class="btn icon btn-outline" aria-label="Previous week">{icon("chevron-left")}</button>'
            f'<b>28 Sep to 4 Oct</b>'
            f'<button class="btn icon btn-outline" aria-label="Next week">{icon("chevron-right")}</button>'
            f'<button class="btn sm btn-outline pressable wp-month">{icon("calendar-days")}Month</button></div>'
            f'<div class="wp-days">{days}</div></div>')


def agenda_post(event):
    return (f'<a class="ag-post s-{event["status"]}" href="#" aria-label="{aria(event)}">{preview(event)}'
            f'<span class="cp-body"><span class="ag-where">{platform_label(event)}<span>{format_name(event)}{", " + event["detail"] if event["detail"] else ""}</span></span>'
            f'<span class="ag-line"><b>{event["time"]}</b> {event["title"]}</span>{BADGE[event["status"]]}</span>'
            f'<span class="go">{icon("chevron-right")}</span></a>')


WEEKS = [("This week", "28 September to 4 October", 0), ("Next week", "5 to 11 October", 7), ("12 to 18 October", "", 14),
         ("19 to 25 October", "", 21), ("26 October to 1 November", "", 28)]


def agenda(events, free, selected=None):
    html = ""
    for title, sub, start in WEEKS:
        rows = ""
        for day in GRID_DAYS[start:start + 7]:
            posts = "".join(agenda_post(e) for e in events if e["day"] == day)
            slot = free_slot(free[day]) if day in free else ""
            if not posts and not slot and day != TODAY:
                continue
            items = posts + slot or '<span class="ag-empty">Nothing planned</span>'
            name = "Today" if day == TODAY else day.strftime("%a")
            cls = "ag-day" + (" today" if day == TODAY else "") + (" sel" if day == selected else "")
            rows += f'<div class="{cls}"><div class="ag-date"><span>{name}</span><b>{day.day}</b><span class="ag-mon">{day.strftime("%b")}</span></div><div class="ag-items">{items}</div></div>'
        sub_html = f' <span class="muted">{sub}</span>' if sub else ""
        week_days = GRID_DAYS[start:start + 7]
        has_posts = any(e["day"] in week_days for e in events)
        if not has_posts and TODAY not in week_days:
            # A week with nothing but free slots folds into one line, so the phone list stays short.
            count = sum(1 for d in week_days if d in free)
            rows = f'<button class="ag-folded pressable">{icon("clock")}<span>{count} free best times, no posts yet</span><span class="ag-show">Show{icon("chevron-down")}</span></button>'
        html += f'<section class="ag-week"><h3 class="ag-week-title">{title}{sub_html}</h3>{rows}</section>'
    return f'<div class="agenda">{html}</div>'


LEGEND = ('<div class="week-legend cal-legend"><span><i class="k-needs"></i>Needs approval</span><span><i class="k-scheduled"></i>Scheduled</span>'
          '<span><i class="k-waiting"></i>Approved, waiting for a connection</span><span><i class="k-published"></i>Published</span>'
          '<span><i class="k-free"></i>Free best time</span></div>')


def calendar_body(events=EVENTS, free=FREE, cell_extras=None, selected=None, show_month=False):
    alert = (f'<div class="cal-alert" role="status"><p>{icon("alert")}<span>Instagram and Facebook aren&rsquo;t connected, so approved posts wait here instead of going out.</span></p>'
             f'<button class="btn sm btn-outline pressable">Connect accounts</button></div>')
    nav = (f'<div class="month-nav"><h2 class="type-heading" aria-live="polite">October 2026</h2><div class="navgroup">'
           f'<button class="btn icon btn-outline" aria-label="Previous month">{icon("chevron-left")}</button>'
           f'<button class="btn sm btn-outline pressable">Today</button>'
           f'<button class="btn icon btn-outline" aria-label="Next month">{icon("chevron-right")}</button></div></div>')
    summary = ('<p class="cal-summary">6 posts this month: 5 need your approval, 1 is approved and waiting for Instagram. '
               '11 best times are still free; the agent drafts about a week ahead.'
               '<span class="desk-only"> Drag a post to another day to move it, or open it to pick an exact time.</span></p>')
    compact_cls = "cal-compact show-month" if show_month else "cal-compact"
    phone_top = ('<div class="phone-top"><p class="phone-summary"><b>5 need your approval</b>, 1 waiting for Instagram</p>'
                 f'<details class="phone-legend"><summary>What the colours mean</summary>{LEGEND}</details></div>')
    compact = f'<div class="{compact_cls}">{phone_top}{mini_month(events, free, selected)}{week_picker(events, free, selected)}{agenda(events, free, selected)}</div>'
    filters = f'<button class="filter-btn pressable">{icon("layers")}All platforms{icon("chevron-down")}</button>'
    return (f'<style>{CSS}</style>'
            + header("Calendar", "What goes out and when. Tap a post to read it, approve it or change its time.", filters)
            + alert
            + f'<section class="panel cal-panel"><div class="cal-bar">{nav}{LEGEND}</div>{summary}{month_grid(events, free, cell_extras)}{compact}</section>'
            + tabbar("more"))


def day_details(event, other_times):
    """What a chosen day holds: the post in full, how to change its time, and the day's free best times."""
    pills = "".join(f'<span class="pill">{t}</span>' for t in other_times)
    return (f'<div class="dp-head"><div><p class="dp-title">{long_date(event["day"])}</p><p class="type-label">1 post, 1 free best time</p></div>'
            f'<button class="icon-close" aria-label="Close">{icon("x")}</button></div>'
            f'<div class="dp-post">{preview(event)}<div class="dp-body">{post_facts(event["platform"], event["fmt"], event["detail"], event["time"])}'
            f'<p class="dp-post-title">{event["title"]}</p>{BADGE[event["status"]]}</div></div>'
            f'<div class="dp-actions"><button class="btn sm btn-default pressable">Review post</button>'
            f'<button class="btn sm btn-outline pressable">{icon("clock")}Change time</button></div>'
            f'<div class="dp-free"><p class="type-label">Free best time this day</p><div class="pills">{pills}'
            f'<button class="pill pressable">{icon("sparkles")}Ask the agent for a post</button></div></div>')


def state_month():
    """a) The month with every post, its status, and the strategy's free best times."""
    return page("Calendar", calendar_body(), "calendar")


def state_drag():
    """b) Desktop: dragging Thursday's carousel onto Friday's free best time. The drop target says exactly where it lands."""
    moving = EVENTS[1]
    ghost = f'<div class="cal-ghost" aria-hidden="true">{icon("clock")}Moving from 1:00 PM</div>'
    lifted = cell_post(moving, "lifted")
    hint = f'<div class="drop-hint" role="status">Drop to move it to <b>Friday 2 October, 1:00 PM</b>, a best time. It still needs your approval.</div>'
    events = [e for e in EVENTS if e is not moving]
    extras = {date(2026, 10, 1): ("", ghost), date(2026, 10, 2): ("drop", lifted + hint)}
    return page("Calendar: moving a post", calendar_body(events, FREE, extras), "calendar")


def state_moved():
    """c) After the drop: the post sits on Friday, Thursday's best time is free again, and Undo is one tap away."""
    moved = dict(EVENTS[1], day=date(2026, 10, 2))
    events = [moved if e is EVENTS[1] else e for e in EVENTS]
    free = dict(FREE)
    free.pop(date(2026, 10, 2))
    free[date(2026, 10, 1)] = "1:00 PM"
    toast = ('<div class="toast" role="status"><div class="toast-row"><p><b>Moved to Friday 2 October, 1:00 PM.</b> '
             '<span class="muted">It still needs your approval.</span></p><button class="btn sm btn-outline pressable">Undo</button></div></div>')
    return page("Calendar: post moved", calendar_body(events, free, {date(2026, 10, 2): ("flash", "")}) + toast, "calendar")


def state_day():
    """d) A day chosen: a popover on desktop, a sheet from the bottom on tablet and phone."""
    event = EVENTS[1]
    details = day_details(event, ["6:00 PM"])
    pop = f'<div class="day-pop" role="dialog" aria-label="{long_date(event["day"])}">{details}</div>'
    sheet = f'<div class="day-scrim"></div><div class="day-sheet" role="dialog" aria-label="{long_date(event["day"])}"><span class="grabber"></span>{details}</div>'
    body = calendar_body(cell_extras={event["day"]: ("selected", pop)}, selected=event["day"])
    return page("Calendar: day chosen", body, "calendar", overlay=sheet)


def state_post():
    """e) Tapping a post opens the S08 review panel, where the date and time can be changed."""
    return page("Calendar: review post", calendar_body(), "calendar", overlay=review_panel())


def state_phone_month():
    """f) Phone with the whole month open above the agenda (the week picker's Month button)."""
    return page("Calendar: month on phone", calendar_body(show_month=True), "calendar")


CSS = """
.cal-alert { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem 0.875rem 0.75rem 1.125rem; margin-bottom: 1.25rem; border-radius: 1.125rem; background: rgba(183, 116, 10, 0.1); color: #8a5708; font-size: 0.875rem; line-height: 1.45; }
.cal-alert p { display: flex; gap: 0.625rem; align-items: flex-start; }
.cal-alert p .i { flex: none; margin-top: 0.15rem; }
.cal-alert .btn { flex: none; background: var(--card); }
.cal-panel { padding: 1.25rem 1.25rem 0.75rem; }
.cal-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem 1.5rem; margin-bottom: 0.5rem; }
.month-nav { display: flex; align-items: center; gap: 1rem; }
.navgroup { display: flex; align-items: center; gap: 0.375rem; }
.cal-legend { margin-bottom: 0; }
.week-legend .k-waiting { background: transparent; box-shadow: inset 0 0 0 2px var(--brand); }
.week-legend .k-published { background: var(--success); }
.cal-summary { font-size: 0.8125rem; color: var(--muted-foreground); margin-bottom: 1rem; max-width: 90ch; }

/* Desktop month grid */
.cal-dows, .cal-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
.cal-dow { padding: 0 0.625rem 0.5rem; font-size: 0.8125rem; color: var(--muted-foreground); }
.cal-cell { position: relative; min-width: 0; min-height: 8.5rem; padding: 0.5rem 0.375rem; border-top: 1px solid var(--border); border-left: 1px solid var(--border); display: flex; flex-direction: column; gap: 0.375rem; }
.cal-cell:nth-child(7n+1) { border-left: 0; }
.cal-cell:nth-child(7n+6), .cal-cell:nth-child(7n) { background: #fafbfc; }
.cal-cell .n { display: flex; align-items: center; gap: 0.375rem; padding: 0 0.25rem; min-height: 1.625rem; font-size: 0.8125rem; }
.cal-cell .n b { font-weight: 500; }
.cal-cell.out .n b { color: #b3bac6; }
.cal-cell.today { background: var(--tint); }
.cal-cell.today .n b { display: grid; place-items: center; width: 1.625rem; height: 1.625rem; border-radius: 999px; background: var(--brand); color: #fff; font-weight: 600; }
.today-tag { font-size: 0.75rem; font-weight: 600; color: var(--tint-foreground); }
.cal-cell.selected { background: var(--tint); box-shadow: inset 0 0 0 2px var(--brand); }
.cal-cell.drop { background: var(--tint); box-shadow: inset 0 0 0 2px var(--brand); }
.cal-cell.flash { background: var(--tint); }

.cal-post { position: relative; display: flex; align-items: flex-start; gap: 0.5rem; padding: 0.375rem 0.375rem 0.375rem 0.5rem; border-radius: 0.75rem; background: var(--card); box-shadow: var(--elevation-raised); font-size: 0.75rem; line-height: 1.3; color: inherit; text-decoration: none; cursor: grab; min-width: 0; overflow: hidden; }
.cal-post::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--brand); }
.cal-post:hover { box-shadow: var(--elevation-floating); }
.cal-post .thumb { width: 2.25rem; height: 2.25rem; border-radius: 0.5rem; }
.cal-post .chip-thumb .fmt { width: 1rem; height: 1rem; top: 0.125rem; right: 0.125rem; }
.cal-post .chip-thumb .fmt .i { width: 0.55rem; height: 0.55rem; }
.cp-body { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.cp-time { font-weight: 600; }
.cp-where { display: flex; align-items: center; gap: 0.25rem; font-size: 0.6875rem; font-weight: 500; color: var(--muted-foreground); }
.cp-where .i { width: 0.75rem; height: 0.75rem; flex: none; }
.cp-title { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: var(--muted-foreground); }
.cp-status { margin-top: 0.125rem; font-size: 0.6875rem; font-weight: 600; line-height: 1.2; }
.s-needs.cal-post::before, .s-needs.ag-post::before { background: var(--warning); }
.s-needs .cp-status { color: var(--warning); }
.s-waiting.cal-post::before, .s-waiting.ag-post::before { background: repeating-linear-gradient(180deg, var(--brand) 0 4px, transparent 4px 7px); }
.s-waiting .cp-status { color: var(--tint-foreground); }
.s-scheduled .cp-status { color: var(--tint-foreground); }
.s-published.cal-post::before, .s-published.ag-post::before { background: var(--success); }
.s-published .cp-status { color: var(--success); }
.cal-free { border: 1.5px dashed #c9d2e0; border-radius: 0.625rem; padding: 0.3125rem 0.5rem; font-size: 0.6875rem; line-height: 1.3; color: var(--muted-foreground); }
.cal-free b { font-weight: 600; color: var(--foreground); }

/* Moving a post */
.cal-ghost { display: flex; align-items: center; gap: 0.375rem; min-height: 3.75rem; padding: 0.5rem; border-radius: 0.75rem; border: 1.5px dashed #b3bac6; font-size: 0.6875rem; color: var(--muted-foreground); }
.cal-ghost .i { width: 0.8rem; height: 0.8rem; flex: none; }
.cal-post.lifted { position: absolute; z-index: 5; top: 2.4rem; left: -0.75rem; right: 0.75rem; transform: rotate(-2deg) scale(1.04); box-shadow: 0 2px 6px rgba(20, 24, 34, 0.08), 0 24px 48px -12px rgba(20, 24, 34, 0.35); cursor: grabbing; }
.drop-hint { position: absolute; z-index: 6; top: 7.25rem; left: 0.25rem; width: 16rem; padding: 0.625rem 0.75rem; border-radius: 0.875rem; background: #1c2433; color: #fff; font-size: 0.75rem; line-height: 1.4; box-shadow: var(--elevation-floating); }
.drop-hint b { font-weight: 600; }
.toast-row { display: flex; align-items: center; gap: 0.75rem; justify-content: space-between; }

/* A chosen day */
.day-pop { position: absolute; z-index: 6; top: calc(100% - 0.5rem); left: 0.25rem; width: 23rem; padding: 1rem; border-radius: 1.25rem; background: var(--card); box-shadow: var(--elevation-floating), 0 0 0 1px var(--border); display: grid; gap: 0.875rem; cursor: default; }
.dp-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; }
.dp-title { font-size: 1rem; font-weight: 600; letter-spacing: -0.01em; }
.dp-post { display: grid; grid-template-columns: 4.5rem minmax(0, 1fr); gap: 0.875rem; align-items: start; }
.dp-post .thumb { width: 4.5rem; height: 5.625rem; border-radius: 0.75rem; }
.dp-body { display: grid; gap: 0.5rem; justify-items: start; min-width: 0; }
.dp-body .post-facts { gap: 0.375rem; }
.dp-body .fact { font-size: 0.75rem; padding: 0.25rem 0.625rem; }
.dp-post-title { font-weight: 500; font-size: 0.875rem; }
.dp-actions { display: flex; gap: 0.5rem; }
.dp-actions .btn { flex: 1; }
.dp-free { display: grid; gap: 0.5rem; padding-top: 0.875rem; border-top: 1px solid var(--border); }
.dp-free .pill { display: inline-flex; align-items: center; gap: 0.375rem; }
.dp-free .pill .i { width: 0.875rem; height: 0.875rem; }
.day-scrim, .day-sheet { display: none; }

.badge-wait { background: var(--tint); color: var(--tint-foreground); }

/* Tablet and phone: small month or week picker, then the agenda */
.cal-compact { display: none; }
.mini-card { padding: 0.875rem; border-radius: 1.125rem; box-shadow: 0 0 0 1px var(--border); }
.mini-head, .wp-head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.5rem; }
.mini-head b, .wp-head b { font-weight: 600; font-size: 0.9375rem; }
.mini-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 0.125rem; text-align: center; }
.mdow { padding: 0.25rem 0; font-size: 0.6875rem; font-weight: 500; color: var(--muted-foreground); }
.md { display: flex; flex-direction: column; align-items: center; gap: 0.1875rem; padding: 0.25rem 0 0.375rem; border-radius: 0.75rem; font-size: 0.8125rem; font-weight: 500; min-height: 2.75rem; }
.md .num { display: grid; place-items: center; width: 1.75rem; height: 1.75rem; border-radius: 999px; }
.md .wd { font-size: 0.6875rem; color: var(--muted-foreground); }
.md.out .num { color: #b3bac6; }
.md.today .num { background: var(--brand); color: #fff; font-weight: 600; }
.md.sel { background: var(--tint); box-shadow: inset 0 0 0 1.5px var(--brand); }
.dots { display: flex; gap: 0.1875rem; height: 0.375rem; }
.dots i { width: 0.375rem; height: 0.375rem; border-radius: 999px; }
.dots .d-needs { background: var(--warning); }
.dots .d-scheduled { background: var(--brand); }
.dots .d-waiting { box-shadow: inset 0 0 0 1.5px var(--brand); }
.dots .d-published { background: var(--success); }
.dots .d-free { box-shadow: inset 0 0 0 1.5px #b3bac6; }
.mini-today { width: 100%; margin-top: 0.375rem; }
.week-pick { display: none; }
.wp-head b { flex: 1; text-align: center; }
.wp-days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 0.125rem; }
.wp-month { margin-left: 0.25rem; }

.agenda { display: grid; gap: 1.25rem; min-width: 0; }
.ag-week-title { font-size: 0.9375rem; font-weight: 600; margin-bottom: 0.25rem; }
.ag-week-title .muted { font-weight: 400; font-size: 0.8125rem; margin-left: 0.25rem; }
.ag-day { display: grid; grid-template-columns: 3rem minmax(0, 1fr); gap: 0.75rem; align-items: start; padding: 0.625rem 0.5rem; border-top: 1px solid var(--border); border-radius: 0; }
.ag-day.today, .ag-day.sel { background: var(--tint); border-radius: 0.875rem; border-top-color: transparent; }
.ag-date { display: flex; flex-direction: column; font-size: 0.75rem; color: var(--muted-foreground); line-height: 1.2; padding-top: 0.25rem; }
.ag-date b { font-size: 1.25rem; font-weight: 600; color: var(--foreground); letter-spacing: -0.01em; }
.ag-day.today .ag-date, .ag-day.today .ag-date b { color: var(--tint-foreground); }
.ag-items { display: grid; gap: 0.5rem; min-width: 0; }
.ag-empty { font-size: 0.8125rem; color: var(--muted-foreground); padding-top: 0.5rem; }
.ag-post { position: relative; display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.5rem 0.5rem 0.75rem; border-radius: 0.875rem; background: var(--card); box-shadow: var(--elevation-raised); color: inherit; text-decoration: none; overflow: hidden; font-size: 0.8125rem; line-height: 1.35; }
.ag-post::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--brand); }
.ag-post .thumb { width: 3.25rem; height: 3.25rem; border-radius: 0.625rem; }
.ag-post .cp-body { gap: 0.25rem; align-items: flex-start; }
.ag-where { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; font-weight: 600; color: var(--muted-foreground); }
.ag-where .i { width: 0.875rem; height: 0.875rem; flex: none; }
.ag-line b { font-weight: 600; }
.ag-post .badge { white-space: normal; text-align: left; line-height: 1.3; }
.ag-post .go { color: var(--muted-foreground); flex: none; }
.ag-items .cal-free { font-size: 0.8125rem; padding: 0.625rem 0.75rem; }

@media (max-width: 1023px) {
  .cal-desk, .month-nav, .desk-only { display: none; }
  .cal-compact { display: grid; grid-template-columns: 17.5rem minmax(0, 1fr); gap: 1.25rem; align-items: start; }
  .cal-panel { padding: 1.25rem; }
  .cal-bar { margin-bottom: 0.25rem; }
  .day-pop { display: none; }
  .day-scrim { display: block; position: fixed; inset: 0; z-index: 50; background: rgba(20, 24, 34, 0.38); }
  .day-sheet { display: grid; gap: 0.875rem; position: fixed; z-index: 60; left: 0.75rem; right: 0.75rem; bottom: 0.75rem; padding: 0.625rem 1.25rem 1.25rem; border-radius: 1.75rem; background: var(--card); box-shadow: var(--elevation-floating); max-width: 32rem; margin: 0 auto; }
  .grabber { justify-self: center; width: 2.5rem; height: 0.3125rem; border-radius: 999px; background: #d5dae3; }
}
@media (max-width: 640px) {
  .cal-compact { grid-template-columns: minmax(0, 1fr); gap: 1rem; }
  .cal-compact .mini-card { display: none; }
  .cal-compact .week-pick { display: block; }
  .cal-compact.show-month .mini-card { display: block; }
  .cal-compact.show-month .week-pick { display: none; }
  .cal-panel { padding: 1rem; }
  .cal-alert { flex-direction: column; align-items: stretch; }
  .cal-legend { gap: 0.375rem 0.875rem; font-size: 0.75rem; }
  .ag-day { grid-template-columns: 2.5rem minmax(0, 1fr); gap: 0.5rem; padding: 0.5rem 0.375rem; }
  .ag-post { gap: 0.625rem; }
  .ag-post .thumb { width: 2.75rem; height: 2.75rem; }
  .ag-post .go { display: none; }
  .day-sheet { left: 0; right: 0; bottom: 0; border-radius: 1.75rem 1.75rem 0 0; padding-bottom: 1.5rem; }
  .toast-row { flex-wrap: wrap; }
}

/* Platform named and coloured on every post (owner: "clearly show the platform"). */
.plat-label { display: inline-flex; align-items: center; gap: 0.25rem; width: fit-content; max-width: 100%; padding: 0.0625rem 0.4375rem 0.0625rem 0.3125rem; border-radius: 999px; font-size: 0.6875rem; font-weight: 600; line-height: 1.5; white-space: nowrap; }
.plat-label .i { width: 0.75rem; height: 0.75rem; flex: none; }
.plat-label.p-instagram { background: #fbe7f1; color: #a3206b; }
.plat-label.p-facebook { background: #e7f0fe; color: #1459c7; }
.plat-label.p-linkedin { background: #e5f0f8; color: #0a5a9e; }
.plat-label.p-tiktok { background: #ececef; color: #16161a; }
.cal-post .plat-label { margin-bottom: 0.1875rem; }
.ag-where { display: flex; flex-wrap: wrap; align-items: center; gap: 0.375rem; }

/* Phone: a one-line summary and a folded key replace the full legend; empty weeks fold to one line. */
.phone-top { display: none; }
.ag-folded { display: flex; width: 100%; align-items: center; gap: 0.5rem; padding: 0.75rem 0.875rem; border-radius: 0.875rem; border: 1.5px dashed #c9d2e0; font-size: 0.8125rem; color: var(--muted-foreground); text-align: left; background: transparent; }
.ag-folded .i { width: 0.9rem; height: 0.9rem; flex: none; }
.ag-folded .ag-show { margin-left: auto; display: inline-flex; align-items: center; gap: 0.25rem; font-weight: 600; color: var(--foreground); }
@media (max-width: 560px) {
  .cal-bar .cal-legend, .cal-summary { display: none; }
  .phone-top { display: grid; gap: 0.5rem; margin-bottom: 0.75rem; }
  .phone-summary { font-size: 0.875rem; }
  .phone-legend summary { font-size: 0.8125rem; font-weight: 600; color: var(--tint-foreground); cursor: pointer; }
  .phone-legend .cal-legend { margin-top: 0.5rem; }
}
"""

STATES = {
    "month": state_month,
    "drag": state_drag,
    "moved": state_moved,
    "day": state_day,
    "post": state_post,
    "phone-month": state_phone_month,
}


def main():
    OUT.mkdir(exist_ok=True)
    for name, render in STATES.items():
        (OUT / f"s11-v3-{name}.html").write_text(render(), encoding="utf-8")
    print(f"wrote {len(STATES)} screens to {OUT}")


if __name__ == "__main__":
    main()
