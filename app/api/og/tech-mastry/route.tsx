import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

/**
 * Dynamic OG image for tech-mastry sections
 * Usage: /api/og/tech-mastry?section=ai-mastery&title=...&desc=...
 */

const sectionThemes: Record<string, { gradient: string; accent: string; icon: string }> = {
  "ai-mastery":        { gradient: "from-violet-600 to-pink-600",  accent: "#a78bfa", icon: "✦" },
  "algorithms":        { gradient: "from-blue-600 to-cyan-600",    accent: "#60a5fa", icon: "λ" },
  "data-structures":   { gradient: "from-green-600 to-emerald-600",accent: "#34d399", icon: "⟐" },
  "data-science":      { gradient: "from-sky-600 to-indigo-600",   accent: "#38bdf8", icon: "📊" },
  "system-design":     { gradient: "from-orange-600 to-red-600",   accent: "#fb923c", icon: "⚙" },
  "best-practices":    { gradient: "from-emerald-600 to-teal-600", accent: "#2dd4bf", icon: "✓" },
  "frontend":          { gradient: "from-pink-600 to-rose-600",    accent: "#f472b6", icon: "◈" },
  "backend":           { gradient: "from-amber-600 to-yellow-600", accent: "#fbbf24", icon: "⬡" },
  "security":          { gradient: "from-red-600 to-rose-600",     accent: "#f87171", icon: "🛡" },
  "career":            { gradient: "from-purple-600 to-violet-600",accent: "#c084fc", icon: "🎯" },
  "coding-challenges": { gradient: "from-red-600 to-orange-600",   accent: "#f87171", icon: "⚡" },
  "git-mastery":       { gradient: "from-orange-600 to-amber-600", accent: "#f97316", icon: "⎇" },
  "typescript-mastery": { gradient: "from-blue-600 to-blue-800",   accent: "#3b82f6", icon: "TS" },
  "devops-cloud":      { gradient: "from-cyan-600 to-blue-600",    accent: "#22d3ee", icon: "☁" },
  default:             { gradient: "from-slate-600 to-slate-800",  accent: "#94a3b8", icon: "◆" },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const section = searchParams.get("section") || "default";
    const title = searchParams.get("title") || "TechMastery";
    const desc = searchParams.get("desc") || "Plateforme de maîtrise technique";
    const sub = searchParams.get("sub") || "";

    const theme = sectionThemes[section] || sectionThemes.default;
    const gradientColors = theme.gradient
      .replace("from-", "")
      .replace(" to-", ",")
      .split(",");

    const fromColor = resolveColor(gradientColors[0]);
    const toColor = resolveColor(gradientColors[1]);

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: `linear-gradient(135deg, #030712 0%, #0f172a 50%, #1e293b 100%)`,
            fontFamily: "sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Accent gradient orb top-left */}
          <div
            style={{
              position: "absolute",
              top: "-80px",
              left: "-60px",
              width: "500px",
              height: "500px",
              background: `radial-gradient(circle at center, ${fromColor} 0%, transparent 70%)`,
              opacity: 0.2,
              borderRadius: "50%",
            }}
          />
          {/* Accent gradient orb bottom-right */}
          <div
            style={{
              position: "absolute",
              bottom: "-100px",
              right: "-80px",
              width: "450px",
              height: "450px",
              background: `radial-gradient(circle at center, ${toColor} 0%, transparent 70%)`,
              opacity: 0.15,
              borderRadius: "50%",
            }}
          />
          {/* Grid pattern overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Top bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "40px 60px 0",
              position: "relative",
              zIndex: 1,
            }}
          >
            <span style={{ fontSize: 22, color: theme.accent, fontWeight: 600, letterSpacing: "-0.02em" }}>
              fygs.dev
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 20px",
                backgroundColor: "rgba(30, 41, 59, 0.7)",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span style={{ fontSize: 16, color: "#94a3b8" }}>TechMastery</span>
            </div>
          </div>

          {/* Main content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "0 60px",
              position: "relative",
              zIndex: 1,
              flex: 1,
              justifyContent: "center",
            }}
          >
            {/* Section icon */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: `linear-gradient(135deg, ${fromColor}33, ${toColor}33)`,
                  border: `1px solid ${theme.accent}44`,
                  fontSize: 28,
                }}
              >
                {theme.icon}
              </div>
              {sub && (
                <div
                  style={{
                    display: "flex",
                    padding: "6px 16px",
                    borderRadius: 999,
                    backgroundColor: "rgba(30, 41, 59, 0.8)",
                    border: `1px solid ${theme.accent}33`,
                  }}
                >
                  <span style={{ fontSize: 16, color: theme.accent }}>{sub}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: title.length > 40 ? 48 : 60,
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.1,
                margin: 0,
                marginBottom: 16,
                letterSpacing: "-0.03em",
                maxWidth: "90%",
              }}
            >
              {title}
            </h1>

            {/* Description */}
            <p
              style={{
                fontSize: 24,
                color: "#94a3b8",
                margin: 0,
                lineHeight: 1.4,
                maxWidth: "80%",
              }}
            >
              {desc}
            </p>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 60px 40px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "4px",
                  borderRadius: "2px",
                  background: `linear-gradient(90deg, ${fromColor}, ${toColor})`,
                }}
              />
              <span style={{ fontSize: 16, color: "#64748b" }}>
                De zéro à expert
              </span>
            </div>
            <span style={{ fontSize: 18, color: "#ffffff", fontWeight: 600 }}>
              Fernand SOUALO
            </span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("OG tech-mastry error:", errorMessage);
    return new Response("Failed to generate image", { status: 500 });
  }
}

function resolveColor(name: string): string {
  const colors: Record<string, string> = {
    "violet-600": "#7c3aed",   "pink-600": "#db2777",
    "blue-600": "#2563eb",     "cyan-600": "#0891b2",
    "green-600": "#16a34a",    "emerald-600": "#059669",
    "sky-600": "#0284c7",      "indigo-600": "#4f46e5",
    "orange-600": "#ea580c",   "red-600": "#dc2626",
    "amber-600": "#d97706",    "yellow-600": "#ca8a04",
    "pink-600b": "#db2777",    "rose-600": "#e11d48",
    "teal-600": "#0d9488",     "purple-600": "#9333ea",
    "slate-600": "#475569",    "slate-800": "#1e293b",
    "blue-800": "#1e40af",
  };
  return colors[name] || "#64748b";
}