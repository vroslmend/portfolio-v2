import { ImageResponse } from "next/og";

export const ESSAY_OG_SIZE = { width: 1200, height: 630 };

export function createEssayOpenGraph({
  title,
  eyebrow,
  kind,
  titleSize = 64,
  titleWidth = 920,
}: {
  title: string;
  eyebrow: string;
  kind: string;
  titleSize?: number;
  titleWidth?: number;
}) {
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
          {eyebrow}
        </div>
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            width: titleWidth,
          }}
        >
          {title}
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
          <div>{kind}</div>
        </div>
      </div>
    ),
    { ...ESSAY_OG_SIZE },
  );
}
