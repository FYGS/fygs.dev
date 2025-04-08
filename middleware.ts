import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { maintenanceConfig } from "@/config/maintenance";

export function middleware(request: NextRequest) {
  // Vérifier si le mode maintenance est activé
  if (!maintenanceConfig.enabled) {
    return NextResponse.next();
  }

  const requestPath = request.nextUrl.pathname;
  
  // Permettre l'accès à la page de maintenance elle-même
  if (requestPath === "/maintenance") {
    return NextResponse.next();
  }

  // Vérifier si le chemin est autorisé
  if (maintenanceConfig.allowedPaths?.includes(requestPath)) {
    return NextResponse.next();
  }

  // Vérifier si l'IP est autorisée
  const clientIP = request.ip || request.headers.get("x-forwarded-for") || "";
  if (maintenanceConfig.allowedIPs?.includes(clientIP)) {
    return NextResponse.next();
  }

  // Vérifier la période de maintenance si définie
  const now = new Date();
  if (maintenanceConfig.startTime && maintenanceConfig.endTime) {
    if (now < maintenanceConfig.startTime || now > maintenanceConfig.endTime) {
      return NextResponse.next();
    }
  }

  // Rediriger vers la page de maintenance
  return NextResponse.rewrite(new URL("/maintenance", request.url));
}

// Configurer les chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/health (API health check)
     * 2. /maintenance (page de maintenance)
     * 3. /_next (Next.js internal routes)
     * 4. /static (static files)
     * 5. /favicon.ico, /robots.txt, /sitemap.xml
     */
    "/((?!api/health|maintenance|_next|static|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
