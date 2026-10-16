import { CreditCard, Mail, Package, ShoppingCart, Users } from "lucide-react";
import { getServiceColor } from "./colors";
import type { ServicesState } from "./types";

export function ServiceNodes({ services }: { services: ServicesState }) {
  return (
    <>
      {/* Users Service */}
      <g transform="translate(400, 100)">
        <rect
          x="-60"
          y="-30"
          width="120"
          height="60"
          rx="5"
          fill={getServiceColor(services.users.status).bg}
          stroke={getServiceColor(services.users.status).border}
          strokeWidth="2"
        />
        <foreignObject x="-12" y="-25" width="24" height="24">
          <div className="flex items-center justify-center w-full h-full">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
        </foreignObject>
        <rect
          x="-60"
          y="0"
          width="120"
          height="20"
          rx="3"
          fill="#f8fafc"
          stroke="none"
        />
        <text x="0" y="13" textAnchor="middle" fontSize="12" fill="#1e293b">
          Service Utilisateurs
        </text>
        <text
          x="0"
          y="25"
          textAnchor="middle"
          fontSize="10"
          fill={getServiceColor(services.users.status).text}
        >
          {services.users.status === "online"
            ? `Charge: ${services.users.load}`
            : services.users.status === "overloaded"
            ? "Surcharge"
            : "Hors ligne"}
        </text>
      </g>

      {/* Orders Service */}
      <g transform="translate(400, 175)">
        <rect
          x="-60"
          y="-30"
          width="120"
          height="60"
          rx="5"
          fill={getServiceColor(services.orders.status).bg}
          stroke={getServiceColor(services.orders.status).border}
          strokeWidth="2"
        />
        <foreignObject x="-12" y="-25" width="24" height="24">
          <div className="flex items-center justify-center w-full h-full">
            <ShoppingCart className="w-5 h-5 text-green-500" />
          </div>
        </foreignObject>
        <rect
          x="-60"
          y="0"
          width="120"
          height="20"
          rx="3"
          fill="#f8fafc"
          stroke="none"
        />
        <text x="0" y="13" textAnchor="middle" fontSize="12" fill="#1e293b">
          Service Commandes
        </text>
        <text
          x="0"
          y="25"
          textAnchor="middle"
          fontSize="10"
          fill={getServiceColor(services.orders.status).text}
        >
          {services.orders.status === "online"
            ? `Charge: ${services.orders.load}`
            : services.orders.status === "overloaded"
            ? "Surcharge"
            : "Hors ligne"}
        </text>
      </g>

      {/* Payments Service */}
      <g transform="translate(400, 250)">
        <rect
          x="-60"
          y="-30"
          width="120"
          height="60"
          rx="5"
          fill={getServiceColor(services.payments.status).bg}
          stroke={getServiceColor(services.payments.status).border}
          strokeWidth="2"
        />
        <foreignObject x="-12" y="-25" width="24" height="24">
          <div className="flex items-center justify-center w-full h-full">
            <CreditCard className="w-5 h-5 text-amber-500" />
          </div>
        </foreignObject>
        <rect
          x="-60"
          y="0"
          width="120"
          height="20"
          rx="3"
          fill="#f8fafc"
          stroke="none"
        />
        <text x="0" y="13" textAnchor="middle" fontSize="12" fill="#1e293b">
          Service Paiements
        </text>
        <text
          x="0"
          y="25"
          textAnchor="middle"
          fontSize="10"
          fill={getServiceColor(services.payments.status).text}
        >
          {services.payments.status === "online"
            ? `Charge: ${services.payments.load}`
            : services.payments.status === "overloaded"
            ? "Surcharge"
            : "Hors ligne"}
        </text>
      </g>

      {/* Inventory Service */}
      <g transform="translate(400, 325)">
        <rect
          x="-60"
          y="-30"
          width="120"
          height="60"
          rx="5"
          fill={getServiceColor(services.inventory.status).bg}
          stroke={getServiceColor(services.inventory.status).border}
          strokeWidth="2"
        />
        <foreignObject x="-12" y="-25" width="24" height="24">
          <div className="flex items-center justify-center w-full h-full">
            <Package className="w-5 h-5 text-purple-500" />
          </div>
        </foreignObject>
        <rect
          x="-60"
          y="0"
          width="120"
          height="20"
          rx="3"
          fill="#f8fafc"
          stroke="none"
        />
        <text x="0" y="13" textAnchor="middle" fontSize="12" fill="#1e293b">
          Service Inventaire
        </text>
        <text
          x="0"
          y="25"
          textAnchor="middle"
          fontSize="10"
          fill={getServiceColor(services.inventory.status).text}
        >
          {services.inventory.status === "online"
            ? `Charge: ${services.inventory.load}`
            : services.inventory.status === "overloaded"
            ? "Surcharge"
            : "Hors ligne"}
        </text>
      </g>

      {/* Notifications Service */}
      <g transform="translate(400, 400)">
        <rect
          x="-60"
          y="-30"
          width="120"
          height="60"
          rx="5"
          fill={getServiceColor(services.notifications.status).bg}
          stroke={getServiceColor(services.notifications.status).border}
          strokeWidth="2"
        />
        <foreignObject x="-12" y="-25" width="24" height="24">
          <div className="flex items-center justify-center w-full h-full">
            <Mail className="w-5 h-5 text-pink-500" />
          </div>
        </foreignObject>
        <rect
          x="-60"
          y="0"
          width="120"
          height="20"
          rx="3"
          fill="#f8fafc"
          stroke="none"
        />
        <text x="0" y="13" textAnchor="middle" fontSize="12" fill="#1e293b">
          Service Notifications
        </text>
        <text
          x="0"
          y="25"
          textAnchor="middle"
          fontSize="10"
          fill={getServiceColor(services.notifications.status).text}
        >
          {services.notifications.status === "online"
            ? `Charge: ${services.notifications.load}`
            : services.notifications.status === "overloaded"
            ? "Surcharge"
            : "Hors ligne"}
        </text>
      </g>
    </>
  );
}
