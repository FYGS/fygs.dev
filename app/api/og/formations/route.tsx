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
            backgroundColor: "#111827",
            padding: "48px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              maxWidth: "90%",
            }}
          >
            <div
              style={{
                fontSize: "72px",
                fontWeight: 700,
                color: "#ffffff",
                margin: "0 0 16px 0",
                lineHeight: 1.2,
              }}
            >
              Formations
            </div>

            <div
              style={{
                fontSize: "36px",
                color: "#94a3b8",
                margin: "0 0 32px 0",
              }}
            >
              Formations au développement web moderne
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Cloud", "IA"].map((tech) => (
                <div
                  key={tech}
                  style={{
                    backgroundColor: "#1e293b",
                    padding: "12px 24px",
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontSize: "20px",
                  }}
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "32px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#94a3b8",
              fontSize: "20px",
              backgroundColor: "#1e293b",
              padding: "12px 24px",
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                backgroundColor: "#22c55e",
                borderRadius: "50%",
              }}
            />
            Apprenez avec un expert reconnu
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
      error instanceof Error ? error.message : "Erreur inconnue";
    console.error(`Error generating image: ${errorMessage}`);
    return new Response(`Failed to generate image: ${errorMessage}`, {
      status: 500,
    });
  }
}