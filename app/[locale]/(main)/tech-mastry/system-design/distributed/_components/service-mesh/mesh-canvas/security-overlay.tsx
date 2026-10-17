import { Lock, Shield } from "lucide-react";

export function SecurityOverlay() {
  return (
    <div className="absolute top-4 right-4 bg-gray-800/80 p-3 rounded-lg shadow-xs border text-xs space-y-1">
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4 text-green-500" />
        <span>Communication sécurisée par mTLS</span>
      </div>
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-blue-500" />
        <span>Politiques d&apos;autorisation appliquées</span>
      </div>
    </div>
  );
}
