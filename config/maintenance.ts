interface MaintenanceConfig {
  enabled: boolean;
  startTime?: Date;
  endTime?: Date;
  allowedIPs?: string[];
  allowedPaths?: string[];
}

export const maintenanceConfig: MaintenanceConfig = {
  enabled: false, // Activer/désactiver le mode maintenance
  startTime: new Date("2024-01-01T00:00:00Z"), // Date de début optionnelle
  endTime: new Date("2024-01-01T02:00:00Z"), // Date de fin optionnelle
  // IPs autorisées à accéder au site pendant la maintenance
  allowedIPs: [
    "127.0.0.1",
    "::1"
  ],
  // Chemins toujours accessibles même en maintenance
  allowedPaths: [
    "/api/health",
    "/maintenance"
  ]
};
