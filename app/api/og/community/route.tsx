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
            background: "linear-gradient(to bottom right, #030712, #1e293b)",
            fontFamily: "sans-serif",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-15%",
              left: "-10%",
              width: "500px",
              height: "500px",
              background:
                "radial-gradient(circle at center, #8b5cf6 0%, transparent 70%)",
              opacity: 0.15,
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-10%",
              right: "-10%",
              width: "400px",
              height: "400px",
              background:
                "radial-gradient(circle at center, #3b82f6 0%, transparent 70%)",
              opacity: 0.12,
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
                color: "#a78bfa",
                margin: 0,
                marginBottom: 8,
                letterSpacing: "-0.02em",
              }}
            >
              fygs.dev
            </p>

            <h1
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.1,
                margin: 0,
                marginBottom: 20,
                letterSpacing: "-0.02em",
              }}
            >
              Community
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
              Ask questions, share knowledge & grow together
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
                  padding: "12px 24px",
                  backgroundColor: "rgba(30, 41, 59, 0.8)",
                  borderRadius: 12,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <span style={{ color: "#ffffff", fontSize: 22 }}>Discussions</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 24px",
                  backgroundColor: "rgba(30, 41, 59, 0.8)",
                  borderRadius: 12,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <span style={{ color: "#ffffff", fontSize: 22 }}>Q&A</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 24px",
                  backgroundColor: "rgba(30, 41, 59, 0.8)",
                  borderRadius: 12,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <span style={{ color: "#ffffff", fontSize: 22 }}>Dev Support</span>
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
              by
            </span>
            <span
              style={{
                fontSize: 28,
                color: "#ffffff",
                fontWeight: 700,
              }}
            >
              Fernand SOUALO
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
