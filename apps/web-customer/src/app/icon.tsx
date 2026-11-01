import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{ alignItems: "center", background: "#FFFFFF", borderRadius: 16, color: "#086B4F", display: "flex", fontSize: 44, height: "100%", justifyContent: "center", width: "100%" }}>
      ◈
    </div>,
    size
  );
}
