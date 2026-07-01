import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTenantData } from "../context/TenantDataContext";
import type { Endpoint } from "../types/tenant";

const methodColor: Record<string, string> = {
  GET: "bg-green-100 text-green-700 border-green-200",
  POST: "bg-blue-100 text-blue-700 border-blue-200",
  PUT: "bg-amber-100 text-amber-700 border-amber-200",
  PATCH: "bg-amber-100 text-amber-700 border-amber-200",
  DELETE: "bg-red-100 text-red-700 border-red-200",
};

function EndpointRow({ endpoint }: { endpoint: Endpoint }) {
  const [open, setOpen] = useState(false);
  const method = endpoint.method.toUpperCase();

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 text-left"
      >
        <span className={`text-xs font-bold px-2 py-1 rounded border w-16 text-center ${methodColor[method] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
          {method}
        </span>
        <span className="font-mono text-sm text-gray-800">{endpoint.path}</span>
        <span className="text-sm text-gray-500 ml-2 truncate">{endpoint.summary}</span>
        <span className="ml-auto text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 space-y-4 text-sm">
          {endpoint.description && <p className="text-gray-600">{endpoint.description}</p>}

          {endpoint.parameters && endpoint.parameters.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Parameters</h4>
              <div className="space-y-1.5">
                {endpoint.parameters.map((p) => (
                  <div key={p.name} className="flex gap-2 items-baseline">
                    <span className="font-mono text-gray-800">{p.name}</span>
                    <span className="text-xs text-gray-400">({p.in}{p.required ? ", required" : ""})</span>
                    <span className="text-gray-500">— {p.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {endpoint.requestBody && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Request Body</h4>
              <p className="text-gray-500 mb-1">{endpoint.requestBody.description}</p>
              <pre className="bg-white border border-gray-200 rounded p-3 overflow-x-auto text-xs">
                {JSON.stringify(endpoint.requestBody.content, null, 2)}
              </pre>
            </div>
          )}

          {endpoint.responses && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Responses</h4>
              <div className="space-y-2">
                {Object.entries(endpoint.responses).map(([code, res]) => (
                  <div key={code} className="flex gap-2 items-start">
                    <span className="font-mono text-xs bg-white border border-gray-200 rounded px-2 py-0.5">{code}</span>
                    <span className="text-gray-600">{res.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApiDetailPage() {
  const { tenantId, apiId } = useParams();
  const navigate = useNavigate();
  const { getTenant } = useTenantData();
  const tenant = getTenant(tenantId!);
  const api = tenant?.apis.find((a) => a.id === apiId);

  if (!tenant || !api) {
    return <p className="max-w-5xl mx-auto px-6 py-10 text-gray-500">API not found.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <button onClick={() => navigate(`/tenants/${tenantId}/apis`)} className="text-sm text-blue-600 mb-4">
        ← Back to APIs
      </button>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">{api.name}</h1>
        {api.version && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">v{api.version}</span>}
      </div>
      <p className="text-gray-500 mt-1">{api.description}</p>

      <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
        {api.baseUrl && <span className="font-mono">{api.baseUrl}</span>}
        {api.contact?.email && <span>Contact: {api.contact.email}</span>}
        {api.license?.name && <span>License: {api.license.name}</span>}
      </div>

      <div className="space-y-3 mt-8">
        {api.endpoints.map((ep, i) => (
          <EndpointRow key={`${ep.method}-${ep.path}-${i}`} endpoint={ep} />
        ))}
      </div>
    </div>
  );
}
