import { ImageResponse } from "next/og";

export const alt = "Nebula · Robust gas classification under distribution shift";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// On-brand social card rendered with next/og (no external service). Hex values
// approximate the OKLCH design tokens, since Satori does not parse oklch().
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
          background: "#05060a",
          backgroundImage:
            "radial-gradient(900px 380px at 78% -10%, rgba(97,114,240,0.22), transparent)",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "#11141d",
              border: "1px solid #2a2e3a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: "12px", height: "12px", borderRadius: "999px", background: "#6172f0" }} />
          </div>
          <div style={{ fontSize: "30px", fontWeight: 600, color: "#f4f5f7" }}>Nebula</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: "78px",
              fontWeight: 600,
              color: "#f4f5f7",
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              maxWidth: "940px",
            }}
          >
            <span>Gas classification that </span>
            <span style={{ color: "#8ea2f7" }}>&nbsp;survives&nbsp;</span>
            <span> sensor drift.</span>
          </div>
          <div style={{ marginTop: "28px", fontSize: "30px", color: "#aab0bb", maxWidth: "840px", lineHeight: 1.4 }}>
            CORAL realigns temporal drift. Residualization strips dose bias.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "44px", fontSize: "24px", color: "#7f8590" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "999px", background: "#6172f0" }} />
            <span style={{ color: "#f4f5f7", fontWeight: 600 }}>79.9%</span>
            <span>severe drift</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "999px", background: "#eaa83c" }} />
            <span style={{ color: "#f4f5f7", fontWeight: 600 }}>83.5%</span>
            <span>concentration shift</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
