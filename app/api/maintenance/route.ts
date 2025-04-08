import { NextResponse } from "next/server";
import { maintenanceConfig } from "@/config/maintenance";

// GET /api/maintenance - Obtenir l'état de maintenance
export async function GET() {
  return NextResponse.json({
    enabled: maintenanceConfig.enabled,
    startTime: maintenanceConfig.startTime,
    endTime: maintenanceConfig.endTime,
  });
}

// POST /api/maintenance - Mettre à jour l'état de maintenance
export async function POST(request: Request) {
  const adminKey = process.env.ADMIN_API_KEY;
  const authHeader = request.headers.get("authorization");

  // Vérifier l'authentification
  if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Mettre à jour la configuration
    if (typeof body.enabled === "boolean") {
      maintenanceConfig.enabled = body.enabled;
    }
    
    if (body.startTime) {
      maintenanceConfig.startTime = new Date(body.startTime);
    }
    
    if (body.endTime) {
      maintenanceConfig.endTime = new Date(body.endTime);
    }
    
    if (body.allowedIPs) {
      maintenanceConfig.allowedIPs = body.allowedIPs;
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
    return new NextResponse("Erreur lors de la mise à jour", { status: 400 });
  }
}
