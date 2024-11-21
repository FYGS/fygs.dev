import { ImageResponse } from "@vercel/og";
import { FEATURED_PROJECTS } from "../../../../projects/data";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = FEATURED_PROJECTS.find((p) => p.id === params.id);

    if (!project) {
      return new Response("Project not found", { status: 404 });
    }

    const { title, description, technologies } = project;

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
              {title}
            </div>

            <div
              style={{
                fontSize: "32px",
                color: "#94a3b8",
                margin: "0 0 32px 0",
                maxWidth: "80%",
              }}
            >
              {description.length > 120
                ? description.substring(0, 120) + "..."
                : description}
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {technologies.slice(0, 4).map((tech) => (
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
            View Project Details
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
    console.error(`Error generating image: ${errorMessage}`);
    return new Response(`Failed to generate image: ${errorMessage}`, {
      status: 500,
    });
  }
}
