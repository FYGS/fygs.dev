import { ImageResponse } from "next/og";

export async function GET() {
  try {
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
            background: "linear-gradient(to bottom right, #030712, #0f172a)",
            fontFamily: "sans-serif",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-10%",
              right: "-10%",
              width: "450px",
              height: "450px",
              background:
                "radial-gradient(circle at center, #0ea5e9 0%, transparent 70%)",
              opacity: 0.12,
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-15%",
              left: "-5%",
              width: "350px",
              height: "350px",
              background:
                "radial-gradient(circle at center, #10b981 0%, transparent 70%)",
              opacity: 0.1,
              borderRadius: "50%",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              marginLeft: 80,
              marginRight: 80,
              position: "relative",
              zIndex: 1,
            }}
          >
            <p
              style={{
                fontSize: 24,
                color: "#38bdf8",
                margin: 0,
                marginBottom: 8,
                letterSpacing: "-0.02em",
              }}
            >
              fygs.dev
            </p>

            <h1
              style={{
                fontSize: 68,
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.1,
                margin: 0,
                marginBottom: 16,
                letterSpacing: "-0.02em",
              }}
            >
              Sign In
            </h1>

            <h2
              style={{
                fontSize: 32,
                color: "#94a3b8",
                margin: 0,
                marginBottom: 40,
                lineHeight: 1.4,
                maxWidth: "85%",
              }}
            >
              Access premium courses, track progress & earn certifications
            </h2>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 28px",
                  backgroundColor: "#0ea5e9",
                  borderRadius: 12,
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <span style={{ color: "#ffffff", fontSize: 24, fontWeight: 600 }}>Get Started</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 28px",
                  backgroundColor: "rgba(30, 41, 59, 0.8)",
                  borderRadius: 12,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <span style={{ color: "#ffffff", fontSize: 24 }}>Log In</span>
              </div>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "150px",
              background:
                "linear-gradient(to bottom, transparent, rgba(3, 7, 18, 0.8))",
              zIndex: 0,
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: 60,
              right: 80,
              display: "flex",
              alignItems: "center",
              zIndex: 1,
              background: "rgba(30, 41, 59, 0.8)",
              padding: "12px 24px",
              borderRadius: 12,
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <span
              style={{
                fontSize: 28,
                color: "#94a3b8",
                marginRight: 12,
              }}
            >
              FYGS
            </span>
            <span
              style={{
                fontSize: 28,
                color: "#ffffff",
                fontWeight: 700,
              }}
            >
              Learning Platform
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error generating image:", errorMessage);
    return new Response("Failed to generate image", { status: 500 });
  }
}
