import { ImageResponse } from "next/og";

export const alt = "Scout";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          background: "#17181b",
          padding: 80,
          gap: 56,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 220,
            height: 220,
            alignItems: "center",
            justifyContent: "center",
            background: "#1e1e1e",
            borderRadius: 36,
          }}
        >
          <svg
            width="148"
            height="148"
            viewBox="0 0 32 32"
            fill="none"
          >
            <path
              fill="#4ec9b0"
              d="M20.6 8.1h3.1v4.4L27.2 15.4H24.6V26H18.1v-6.2h-4.2V26H7.4V15.4H4.8L16 5.8l4.6 4Z"
            />
            <rect x="13.9" y="19.8" width="4.2" height="6.2" fill="#1e1e1e" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 600,
              letterSpacing: -2,
              color: "#fafafa",
            }}
          >
            Scout
          </div>
          <div style={{ fontSize: 32, color: "#858585" }}>
            Thai property catalog
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
