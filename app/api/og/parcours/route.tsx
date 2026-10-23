import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

/** Share image of a learning path without a cover: its title and number of courses. */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = (searchParams.get("title") ?? "Parcours d'apprentissage").slice(0, 80);
  const courses = Math.min(Math.max(parseInt(searchParams.get("courses") ?? "", 10) || 0, 0), 99);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111827",
          padding: "64px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 32, color: "#818cf8", marginBottom: 24 }}>Parcours FYGS</div>
        <div style={{ fontSize: 68, fontWeight: 700, color: "#ffffff", lineHeight: 1.15, maxWidth: "90%" }}>{title}</div>
        {courses > 0 && (
          <div style={{ fontSize: 32, color: "#94a3b8", marginTop: 32 }}>
            {courses} formation{courses > 1 ? "s" : ""} · un certificat à la clé
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
