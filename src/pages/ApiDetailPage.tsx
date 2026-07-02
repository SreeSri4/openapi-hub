import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { useTenantData } from "../context/TenantDataContext";
import { convertToOpenAPI } from "../services/specConverter";
import type { APIDefinition } from "../types";

export default function ApiDetailPage() {
  const { tenantId, apiId } = useParams();
  const navigate = useNavigate();
  const { getTenant } = useTenantData();
  const tenant = getTenant(tenantId!);
  const api = tenant?.apis.find((a) => a.id === apiId);

  // Build a genuine OpenAPI 3.0 document from the tenant's minimal API
  // definition, and expose it through the real Swagger UI component so the
  // page renders/behaves like an actual OpenAPI documentation site
  // (including the native "Authorize" flow, try-it-out console, schemas, etc.)
  const spec = useMemo(() => {
    if (!api) return null;
    const converted = convertToOpenAPI(api as unknown as APIDefinition);
    return {
      ...converted,
      components: {
        ...(converted as any).components,
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
      security: [{ bearerAuth: [] }],
    };
  }, [api]);

  const [collapsed, setCollapsed] = useState(false);

  if (!tenant || !api || !spec) {
    return <p className="w-full px-6 md:px-10 lg:px-16 py-10 text-blue-100/80">API not found.</p>;
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="bg-[#1b1b1b] text-white px-6 md:px-10 lg:px-16 py-3">
        <div className="w-full flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <span className="font-semibold tracking-wide text-sm whitespace-nowrap">🔌 Vistex Industry Template API Hub</span>
            <button
              onClick={() => navigate(`/tenants/${tenantId}/apis`)}
              className="text-xs text-blue-300 hover:text-blue-200 whitespace-nowrap"
            >
              ← Back to {tenant.name} APIs
            </button>
          </div>
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs text-gray-400 font-mono truncate hidden sm:inline">{api.baseUrl}</span>
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="text-xs border border-gray-600 text-gray-300 px-2 py-1 rounded hover:bg-white/10 whitespace-nowrap"
            >
              {collapsed ? "Expand All" : "Collapse All"}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full">
        <SwaggerUI
          key={collapsed ? "collapsed" : "expanded"}
          spec={spec}
          docExpansion={collapsed ? "none" : "list"}
          defaultModelsExpandDepth={1}
          deepLinking
        />
      </div>
    </div>
  );
}
