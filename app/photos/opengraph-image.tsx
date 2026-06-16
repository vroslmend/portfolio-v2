import { ImageResponse } from "next/og";

export const alt = "photos · ammar hassan";
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
          ammar hassan
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 110,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              display: "flex",
            }}
          >
            photos
            <span style={{ color: "#686868" }}>.</span>
          </div>
          <div style={{ fontSize: 30, color: "#a1a1a1" }}>
            a quiet wall of shots i&apos;ve taken and liked
          </div>
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
          <div>shot on a Pixel 5</div>
          <div>ammarhassan.dev/photos</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
