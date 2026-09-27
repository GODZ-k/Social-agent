"""Dark mode check: renders approved screens in dark, as-is and with the proposed overrides.

Run from the repo root: python design/dark-check/build.py
Reads the approved HTML (never edits it) and writes design/dark-check/screens/<id>-dark.html (the dark tokens
only, the way design/web-v2/screens-hdr/hdr-v1-client-dark.html does it) and <id>-dark-fixed.html (the same
plus dark-overrides.css).
"""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).parent
OUT = HERE / "screens"
WEB = ROOT / "design" / "web-v2"

SCREENS = {
    "s03-overview": WEB / "screens-s03" / "s03-v3-overview.html",
    "s06-content": WEB / "screens-s06" / "s06-v3-content.html",
    "s08-review-post": WEB / "screens-s08" / "s08-v3-review-post.html",
    "s09-approvals": WEB / "screens-s09" / "s09a-approvals.html",
    "s11-calendar-month": WEB / "screens-s11" / "s11-v3-month.html",
    "s12-analytics-month": WEB / "screens-s12" / "s12-v3-month.html",
    "s13-brand-kit": WEB / "screens-s13" / "s13-v3-brand-kit.html",
    "auth-sign-in": WEB / "screens-auth" / "auth-v1-sign-in.html",
    "adm-clients": WEB / "screens-admin" / "adm-v1-clients.html",
}

# Copied from header_design.py: the only dark block any mockup has today.
DARK_TOKENS = """
/* Dark theme values from docs/DESIGN.md, for the dark check. */
:root[data-theme="dark"] {
  --background: #0f1116; --foreground: #eceef2; --card: #171a21; --secondary: #1f232c; --accent: #232833;
  --muted-foreground: #9aa3b2; --border: #272c37; --input: #343a47; --success: #4cc596; --warning: #e5a53d; --destructive: #ec6b80;
  --material: rgba(27, 31, 40, 0.88); --material-edge: rgba(255, 255, 255, 0.06);
  --elevation-raised: 0 1px 2px rgba(0, 0, 0, 0.3), 0 6px 18px -8px rgba(0, 0, 0, 0.5);
  --elevation-floating: 0 2px 6px rgba(0, 0, 0, 0.3), 0 24px 60px -18px rgba(0, 0, 0, 0.7);
}
:root[data-theme="dark"] .brand-tartine { --tint: #1b283f; --tint-strong: #1e2f56; --tint-foreground: #8fb2f2; --brand-2: #3a5a94; }
:root[data-theme="dark"] .path-sep { color: #4a5261; }
"""


def to_dark(html, extra_css=""):
    html = re.sub(r'<html lang="en" data-theme="light">', '<html lang="en" data-theme="dark">', html, count=1)
    return html.replace("</head>", f"<style>{DARK_TOKENS}{extra_css}</style>\n</head>", 1)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    overrides = (HERE / "dark-overrides.css").read_text(encoding="utf-8")
    for name, source in SCREENS.items():
        html = source.read_text(encoding="utf-8")
        (OUT / f"{name}-dark.html").write_text(to_dark(html), encoding="utf-8")
        (OUT / f"{name}-dark-fixed.html").write_text(to_dark(html, overrides), encoding="utf-8")
        print(f"wrote screens/{name}-dark.html and -dark-fixed.html")


if __name__ == "__main__":
    main()
