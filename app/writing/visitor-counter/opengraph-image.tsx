import { ImageResponse } from "next/og";

export const alt = "A visitor counter, taken too seriously";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0e0e0e",
          color: "#eaeaea",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#686868",
          }}
        >
          writing — june 2026
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            width: 920,
          }}
        >
          A visitor counter, taken too seriously
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #232323",
            paddingTop: 28,
            fontSize: 20,
            color: "#686868",
          }}
        >
          <div>ammar hassan</div>
          <div>a build note</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
