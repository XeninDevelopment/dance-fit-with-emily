import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/config";

export const alt = SITE_NAME;
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
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(120deg, #5666e6, #ec4d9a)",
          color: "white",
          fontFamily: "sans-serif",
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -2 }}>{SITE_NAME}</div>
        <div style={{ fontSize: 36, marginTop: 20, opacity: 0.92 }}>
          Feel-good dance fitness classes
        </div>
      </div>
    ),
    { ...size },
  );
}
