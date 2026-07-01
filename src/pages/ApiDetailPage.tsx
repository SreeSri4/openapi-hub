import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTenantData } from "../context/TenantDataContext";
import type { Endpoint } from "../types/tenant";

const methodStyle: Record<string, string> = {
  GET: "bg-[#61affe] border-[#61affe]",
  POST: "bg-[#49cc90] border-[#49cc90]",
  PUT: "bg-[#fca130] border-[#fca130]",
  PATCH: "bg-[#50e3c2] border-[#50e3c2]",
  DELETE: "bg-[#f93e3e] border-[#f93e3e]",
};

const methodBorder: Record<string, string> = {
  GET: "border-l-[#61affe] bg-[#ebf7ff]",
  POST: "border-l-[#49cc90] bg-[#e8f9f1]",
  PUT: "border-l-[#fca130] bg-[#fff5e8]",
  PATCH: "border-l-[#50e3c2] bg-[#e8fbf6]",
  DELETE: "border-l-[#f93e3e] bg-[#fdeded]",
};

function EndpointRow({ endpoint }: { endpoint: Endpoint }) {
  const [open, setOpen] = useState(false);
  const method = endpoint.method.toUpperCase();

  return (
    <div className={`border border-gray-200 border-l-4 rounded-md overflow-hidden shadow-sm ${methodBorder[method] ?? "border-l-gray-300 bg-white"}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:brightness-95 text-left"
      >
        <span className={`text-xs font-bold text-white px-3 py-1.5 rounded w-20 text-center tracking-wide ${methodStyle[method] ?? "bg-gray-400 border-gray-400"}`}>
          {method}
        </span>
        <span className="font-mono text-sm text-gray-800 font-semibold">{endpoint.path}</span>
        <span className="text-sm text-gray-500 ml-2 truncate">{endpoint.summary}</span>
        <span className="ml-auto text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 py-4 bg-white border-t border-gray-200 space-y-4 text-sm">
          {endpoint.description && <p className="text-gray-600">{endpoint.description}</p>}

          {endpoint.parameters && endpoint.parameters.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2 uppercase text-xs tracking-wide border-b border-gray-200 pb-1">Parameters</h4>
              <div className="space-y-1.5">
                {endpoint.parameters.map((p) => (
                  <div key={p.name} className="flex gap-2 items-baseline">
                    <span className="font-mono text-[#3b4151] font-medium">{p.name}</span>
                    <span className="text-xs text-gray-400">({p.in}{p.required ? ", required" : ""})</span>
                    <span className="text-gray-500">— {p.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {endpoint.requestBody && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2 uppercase text-xs tracking-wide border-b border-gray-200 pb-1">Request Body</h4>
              <p className="text-gray-500 mb-1">{endpoint.requestBody.description}</p>
              <pre className="bg-[#41444e] text-[#9cdcfe] border border-gray-700 rounded p-3 overflow-x-auto text-xs">
                {JSON.stringify(endpoint.requestBody.content, null, 2)}
              </pre>
            </div>
          )}

          {endpoint.responses && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2 uppercase text-xs tracking-wide border-b border-gray-200 pb-1">Responses</h4>
              <div className="space-y-2">
                {Object.entries(endpoint.responses).map(([code, res]) => (
                  <div key={code} className="flex gap-2 items-start">
                    <span className={`font-mono text-xs px-2 py-0.5 rounded font-semibold ${code.startsWith("2") ? "bg-[#e8f9f1] text-[#49cc90]" : code.startsWith("4") ? "bg-[#fdeded] text-[#f93e3e]" : "bg-gray-100 text-gray-600"}`}>
                      {code}
                    </span>
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
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Swagger-style top bar */}
      <div className="bg-[#1b1b1b] text-white px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-semibold tracking-wide text-sm">OpenAPI Hub</span>
          <span className="text-xs text-gray-400 font-mono">{api.baseUrl}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <button onClick={() => navigate(`/tenants/${tenantId}/apis`)} className="text-sm text-blue-600 mb-4">
          ← Back to APIs
        </button>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h1 className="text-2xl font-bold text-[#3b4151]">{api.name}</h1>
            {api.version && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">v{api.version}</span>
            )}
          </div>
          <p className="text-gray-500 mt-1">{api.description}</p>

          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500 border-t border-gray-100 pt-3">
            {api.baseUrl && <span className="font-mono bg-gray-50 px-2 py-1 rounded">{api.baseUrl}</span>}
            {api.contact?.email && <span>Contact: {api.contact.email}</span>}
            {api.license?.name && <span>License: {api.license.name}</span>}
          </div>
        </div>

        <div className="space-y-3 mt-6">
          {api.endpoints.map((ep, i) => (
            <EndpointRow key={`${ep.method}-${ep.path}-${i}`} endpoint={ep} />
          ))}
        </div>
      </div>
    </div>
  );
}
