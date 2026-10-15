import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs"; // the rate limiter uses Redis (TCP), unavailable on the edge runtime

/**
 * Generate Open Graph image for individual review
 * GET /api/og/review?title=Course&rating=5&author=John
 */
export async function GET(request: NextRequest) {
  const limited = await enforceRateLimit(request, "og", {
    limit: 60,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title") || "Formation";
    const rating = parseInt(searchParams.get("rating") || "5");
    const author = searchParams.get("author") || "Anonyme";

    // For now, return a simple response. In production, you would use a service like Vercel OG
    // or generate images using canvas/headless browser

    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea"/>
            <stop offset="100%" style="stop-color:#764ba2"/>
          </linearGradient>
        </defs>
        
        <rect width="1200" height="630" fill="url(#bg)"/>
        
        <rect x="100" y="100" width="1000" height="430" rx="20" fill="rgba(255,255,255,0.95)" stroke="none"/>
        
        <text x="600" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#111827">Avis étudiant</text>
        
        <text x="600" y="240" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="600" fill="#374151">${title}</text>
        
        <text x="600" y="300" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" fill="#fbbf24">${"★".repeat(
          rating
        )}${"☆".repeat(5 - rating)}</text>
        
        <text x="600" y="340" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#374151">${rating}/5 étoiles</text>
        
        <text x="600" y="400" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#6b7280">par ${author}</text>
        
        <text x="600" y="480" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af">FYGS Academy • Plateforme de formation en ligne</text>
      </svg>
    `;

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error generating review OG image:", error);

    return new NextResponse("Failed to generate image", {
      status: 500,
    });
  }
}
