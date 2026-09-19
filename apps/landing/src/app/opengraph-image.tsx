import { ImageResponse } from "next/og";
import { APP_NAME } from "@/lib/site";

export const alt = `${APP_NAME}: start with your website.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ImageResponse renders outside the page, so it can't read the CSS tokens.
// These literals mirror --background, --foreground, --muted-foreground and --brand.
const paper = "#f5f6f8";
const ink = "#1a1d26";
const muted = "#5f6879";
const iris = "#4b3fe4";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: paper,
          color: ink,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34, fontWeight: 600 }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: iris }} />
          {APP_NAME}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 104, fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.02 }}>
            Start with your website.
          </div>
          <div style={{ marginTop: 28, fontSize: 36, color: muted }}>
            An agent that runs your social media, and asks before it posts.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
