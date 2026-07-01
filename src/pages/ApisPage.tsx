import { useNavigate, useParams } from "react-router-dom";
import { useTenantData } from "../context/TenantDataContext";

const methodColor: Record<string, string> = {
  GET: "bg-green-100 text-green-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-amber-100 text-amber-700",
  PATCH: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
};

export default function ApisPage() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const { getTenant } = useTenantData();
  const tenant = getTenant(tenantId!);

  if (!tenant) return <p className="max-w-5xl mx-auto px-6 py-10 text-gray-500">Tenant not found.</p>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <button onClick={() => navigate(`/tenants/${tenantId}`)} className="text-sm text-blue-600 mb-4">
        ← Back to {tenant.name}
      </button>
      <h1 className="text-2xl font-semibold text-gray-900">APIs — {tenant.name}</h1>
      <p className="text-gray-500 mt-1">{tenant.apis?.length ?? 0} API{tenant.apis?.length === 1 ? "" : "s"} available</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
        {(tenant.apis ?? []).map((api) => {
          const methods = Array.from(new Set(api.endpoints.map((e) => e.method.toUpperCase())));
          return (
            <button
              key={api.id}
              onClick={() => navigate(`/tenants/${tenantId}/apis/${api.id}`)}
              className="text-left bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-blue-700 font-semibold text-lg">{api.name}</h2>
                {api.version && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">v{api.version}</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">{api.description}</p>
              {api.baseUrl && <p className="text-xs text-gray-400 mt-2 font-mono">{api.baseUrl}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                {methods.map((m) => (
                  <span key={m} className={`text-xs font-medium px-2 py-0.5 rounded ${methodColor[m] ?? "bg-gray-100 text-gray-600"}`}>
                    {m}
                  </span>
                ))}
                <span className="text-xs text-gray-400 ml-auto">{api.endpoints.length} endpoints</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
