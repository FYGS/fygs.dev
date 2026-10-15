import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs"; // the rate limiter uses Redis (TCP), unavailable on the edge runtime

/**
 * Generate Open Graph image for course reviews overview
 * GET /api/og/course-reviews?title=Course&rating=4.5&count=25
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
    const rating = parseFloat(searchParams.get("rating") || "5");
    const count = parseInt(searchParams.get("count") || "0");
    const instructor = searchParams.get("instructor") || "";

    // Create full star count and partial star
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea"/>
            <stop offset="100%" style="stop-color:#764ba2"/>
          </linearGradient>
          <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ffffff"/>
            <stop offset="100%" style="stop-color:#f8fafc"/>
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="1200" height="630" fill="url(#bg)"/>
        
        <!-- Main Card -->
        <rect x="80" y="80" width="1040" height="470" rx="20" fill="url(#cardBg)" stroke="none" opacity="0.95"/>
        
        <!-- Header Badge -->
        <rect x="480" y="120" width="240" height="40" rx="20" fill="#10b981"/>
        <text x="600" y="145" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="600" fill="white">Avis étudiants</text>
        
        <!-- Course Title -->
        <text x="600" y="210" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#111827">${
          title.length > 40 ? title.substring(0, 40) + "..." : title
        }</text>
        
        ${
          instructor
            ? `<text x="600" y="240" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#6b7280">par ${instructor}</text>`
            : ""
        }
        
        <!-- Rating Section -->
        <g transform="translate(420, 280)">
          <!-- Stars -->
          <text x="0" y="0" font-family="Arial, sans-serif" font-size="48" fill="#fbbf24">${"★".repeat(
            fullStars
          )}${hasHalfStar ? "⯨" : ""}${"☆".repeat(emptyStars)}</text>
          
          <!-- Rating Number -->
          <text x="180" y="0" font-family="Arial, sans-serif" font-size="32" font-weight="600" fill="#374151">${rating.toFixed(
            1
          )}/5</text>
        </g>
        
        <!-- Review Count -->
        <text x="600" y="350" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#374151">${count} avis étudiant${
      count > 1 ? "s" : ""
    }</text>
        
        <!-- Statistics -->
        <g transform="translate(300, 380)">
          <rect x="0" y="0" width="600" height="60" rx="10" fill="rgba(255,255,255,0.5)" stroke="#e5e7eb"/>
          
          <!-- 5 stars bar -->
          <rect x="20" y="15" width="120" height="8" rx="4" fill="#e5e7eb"/>
          <rect x="20" y="15" width="${Math.min(
            120,
            rating >= 4.5 ? 80 : 40
          )}" height="8" rx="4" fill="#10b981"/>
          <text x="150" y="24" font-family="Arial, sans-serif" font-size="12" fill="#6b7280">5★</text>
          
          <!-- 4 stars bar -->
          <rect x="200" y="15" width="120" height="8" rx="4" fill="#e5e7eb"/>
          <rect x="200" y="15" width="${Math.min(
            120,
            rating >= 3.5 && rating < 4.5 ? 60 : 30
          )}" height="8" rx="4" fill="#10b981"/>
          <text x="330" y="24" font-family="Arial, sans-serif" font-size="12" fill="#6b7280">4★</text>
          
          <!-- 3 stars bar -->
          <rect x="380" y="15" width="120" height="8" rx="4" fill="#e5e7eb"/>
          <rect x="380" y="15" width="${Math.min(
            120,
            rating >= 2.5 && rating < 3.5 ? 40 : 20
          )}" height="8" rx="4" fill="#fbbf24"/>
          <text x="510" y="24" font-family="Arial, sans-serif" font-size="12" fill="#6b7280">3★</text>
          
          <text x="300" y="45" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">Répartition des notes</text>
        </g>
        
        <!-- Footer -->
        <text x="600" y="510" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af">FYGS Academy • Plateforme de formation en ligne</text>
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
    console.error("Error generating course reviews OG image:", error);

    return new NextResponse("Failed to generate image", {
      status: 500,
    });
  }
}
