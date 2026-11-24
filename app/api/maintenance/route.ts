import { NextResponse } from "next/server";
import { maintenanceConfig } from "@/config/maintenance";
import { checkBearer } from "@/lib/bearer";
import { readJsonBody } from "@/lib/http/read-body";
import { enforceRateLimit } from "@/lib/rate-limit";

// GET /api/maintenance - Obtenir l'état de maintenance
export async function GET() {
  // Only whether the site is in maintenance: the window and the rest of the configuration are not public
  return NextResponse.json({
    enabled: maintenanceConfig.enabled,
  });
}

// POST /api/maintenance - Mettre à jour l'état de maintenance
export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "maintenance-admin", {
    limit: 10,
    windowSeconds: 60,
  });
  if (limited) return limited;

  // Constant-time comparison; a key that is missing or shorter than 32 characters never opens this endpoint
  if (!checkBearer(request, process.env.ADMIN_API_KEY)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const parsed = await readJsonBody(request, 4 * 1024);
    if (!parsed.ok || !parsed.value || typeof parsed.value !== "object") {
      return new NextResponse("Requête invalide", { status: parsed.ok ? 400 : parsed.status });
    }
    const body = parsed.value as Record<string, unknown>;

    // Mettre à jour la configuration
    if (typeof body.enabled === "boolean") {
      maintenanceConfig.enabled = body.enabled;
    }

    if (body.startTime) {
      const start = new Date(String(body.startTime));
      if (Number.isNaN(start.getTime())) return new NextResponse("Date de début invalide", { status: 400 });
      maintenanceConfig.startTime = start;
    }

    if (body.endTime) {
      const end = new Date(String(body.endTime));
      if (Number.isNaN(end.getTime())) return new NextResponse("Date de fin invalide", { status: 400 });
      maintenanceConfig.endTime = end;
    }

    if (body.allowedIPs !== undefined) {
      // Plain addresses only, a handful of them: this list decides who sees the site while it is closed
      const list = body.allowedIPs;
      if (
        !Array.isArray(list) ||
        list.length > 20 ||
        !list.every((ip) => typeof ip === "string" && /^[0-9a-fA-F:.]{3,45}$/.test(ip))
      ) {
        return new NextResponse("Liste d'adresses invalide", { status: 400 });
      }
      maintenanceConfig.allowedIPs = list as string[];
    }

    return NextResponse.json({
      message: "Configuration mise à jour avec succès",
      config: {
        enabled: maintenanceConfig.enabled,
        startTime: maintenanceConfig.startTime,
        endTime: maintenanceConfig.endTime,
        allowedIPs: maintenanceConfig.allowedIPs,
      },
    });
  } catch (error) {
    console.error("Maintenance update error:", error);
    return new NextResponse("Erreur lors de la mise à jour", { status: 400 });
  }
}
