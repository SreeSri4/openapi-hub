import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTenantData } from "../context/TenantDataContext";
import type { Endpoint, Parameter } from "../types/tenant";

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

interface ExecuteResult {
  status?: number;
  statusText?: string;
  body?: string;
  headers?: Record<string, string>;
  error?: string;
  durationMs?: number;
}

function buildExampleBody(schema: any): any {
  if (!schema) return {};
  if (schema.type === "object" && schema.properties) {
    const out: Record<string, any> = {};
    for (const [key, prop] of Object.entries<any>(schema.properties)) {
      if (prop.example !== undefined) out[key] = prop.example;
      else if (prop.type === "string") out[key] = "";
      else if (prop.type === "number" || prop.type === "integer") out[key] = 0;
      else if (prop.type === "boolean") out[key] = false;
      else if (prop.type === "object") out[key] = buildExampleBody(prop);
      else out[key] = null;
    }
    return out;
  }
  return {};
}

function EndpointRow({ endpoint, baseUrl, apiKey }: { endpoint: Endpoint; baseUrl?: string; apiKey: string }) {
  const [open, setOpen] = useState(false);
  const [tryItOut, setTryItOut] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [bodyText, setBodyText] = useState<string>(() => {
    const content = endpoint.requestBody?.content?.["application/json"]?.schema;
    return content ? JSON.stringify(buildExampleBody(content), null, 2) : "";
  });
  const [result, setResult] = useState<ExecuteResult | null>(null);
  const [executing, setExecuting] = useState(false);

  const method = endpoint.method.toUpperCase();

  const buildUrl = () => {
    let path = endpoint.path;
    const query: string[] = [];
    (endpoint.parameters ?? []).forEach((p: Parameter) => {
      const val = paramValues[p.name];
      if (p.in === "path" && val) path = path.replace(`{${p.name}}`, encodeURIComponent(val));
      if (p.in === "query" && val) query.push(`${encodeURIComponent(p.name)}=${encodeURIComponent(val)}`);
    });
    const qs = query.length ? `?${query.join("&")}` : "";
    return `${baseUrl ?? ""}${path}${qs}`;
  };

  const curlCommand = () => {
    const url = buildUrl();
    let cmd = `curl -X ${method} "${url}"`;
    if (apiKey) cmd += ` \\\n  -H "Authorization: Bearer ${apiKey}"`;
    if (method !== "GET" && bodyText) {
      cmd += ` \\\n  -H "Content-Type: application/json"`;
      cmd += ` \\\n  -d '${bodyText.replace(/\n/g, "").replace(/'/g, "'\\''")}'`;
    }
    return cmd;
  };

  const execute = async () => {
    setExecuting(true);
    setResult(null);
    const started = performance.now();
    try {
      const headers: Record<string, string> = {};
      if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
      if (method !== "GET" && bodyText) headers["Content-Type"] = "application/json";

      const res = await fetch(buildUrl(), {
        method,
        headers,
        body: method !== "GET" && bodyText ? bodyText : undefined,
      });

      const text = await res.text();
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => (resHeaders[k] = v));

      setResult({
        status: res.status,
        statusText: res.statusText,
        body: text,
        headers: resHeaders,
        durationMs: Math.round(performance.now() - started),
      });
    } catch (err: any) {
      setResult({
        error: err.message ?? "Request failed. This may be blocked by CORS since it's a live external call from the browser.",
        durationMs: Math.round(performance.now() - started),
      });
    } finally {
      setExecuting(false);
    }
  };

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
              <div className="space-y-2">
                {endpoint.parameters.map((p) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <div className="w-40 flex-shrink-0">
                      <div className="font-mono text-[#3b4151] font-medium text-sm">
                        {p.name}
                        {p.required && <span className="text-red-500">*</span>}
                      </div>
                      <div className="text-xs text-gray-400">{p.in}</div>
                    </div>
                    {tryItOut ? (
                      <input
                        type="text"
                        placeholder={p.schema?.example !== undefined ? String(p.schema.example) : p.description}
                        value={paramValues[p.name] ?? ""}
                        onChange={(e) => setParamValues((prev) => ({ ...prev, [p.name]: e.target.value }))}
                        className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    ) : (
                      <span className="text-gray-500 text-sm">{p.description}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {endpoint.requestBody && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2 uppercase text-xs tracking-wide border-b border-gray-200 pb-1">Request Body</h4>
              <p className="text-gray-500 mb-1">{endpoint.requestBody.description}</p>
              {tryItOut ? (
                <textarea
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  rows={Math.min(12, bodyText.split("\n").length + 1)}
                  className="w-full bg-[#41444e] text-[#9cdcfe] border border-gray-700 rounded p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              ) : (
                <pre className="bg-[#41444e] text-[#9cdcfe] border border-gray-700 rounded p-3 overflow-x-auto text-xs">
                  {bodyText}
                </pre>
              )}
            </div>
          )}

          {/* Try it out controls */}
          <div className="flex items-center gap-3 pt-1">
            {!tryItOut ? (
              <button
                onClick={() => setTryItOut(true)}
                className="px-4 py-1.5 rounded border border-[#4990e2] text-[#4990e2] text-sm font-semibold hover:bg-[#ebf3fc]"
              >
                Try it out
              </button>
            ) : (
              <>
                <button
                  onClick={execute}
                  disabled={executing}
                  className="px-4 py-1.5 rounded bg-[#4990e2] text-white text-sm font-semibold hover:bg-[#3a7cc7] disabled:opacity-60"
                >
                  {executing ? "Executing..." : "Execute"}
                </button>
                <button
                  onClick={() => { setTryItOut(false); setResult(null); }}
                  className="px-4 py-1.5 rounded border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          {tryItOut && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2 uppercase text-xs tracking-wide border-b border-gray-200 pb-1">Curl</h4>
              <pre className="bg-[#1b1b1b] text-[#d4d4d4] rounded p-3 overflow-x-auto text-xs whitespace-pre-wrap">{curlCommand()}</pre>
            </div>
          )}

          {result && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2 uppercase text-xs tracking-wide border-b border-gray-200 pb-1">
                Server Response {result.durationMs !== undefined && <span className="normal-case text-gray-400 font-normal">({result.durationMs} ms)</span>}
              </h4>
              {result.error ? (
                <div className="bg-[#fdeded] text-[#f93e3e] rounded p-3 text-xs">{result.error}</div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs px-2 py-0.5 rounded font-semibold ${
                      (result.status ?? 0) < 300 ? "bg-[#e8f9f1] text-[#49cc90]" :
                      (result.status ?? 0) < 400 ? "bg-[#fff5e8] text-[#fca130]" :
                      "bg-[#fdeded] text-[#f93e3e]"
                    }`}>
                      {result.status} {result.statusText}
                    </span>
                  </div>
                  <pre className="bg-[#41444e] text-[#9cdcfe] rounded p-3 overflow-x-auto text-xs max-h-64">
                    {(() => {
                      try { return JSON.stringify(JSON.parse(result.body ?? ""), null, 2); }
                      catch { return result.body; }
                    })()}
                  </pre>
                  {result.headers && (
                    <details className="text-xs text-gray-500">
                      <summary className="cursor-pointer">Response headers</summary>
                      <pre className="bg-gray-50 border border-gray-200 rounded p-2 mt-1 overflow-x-auto">
                        {JSON.stringify(result.headers, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          )}

          {endpoint.responses && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2 uppercase text-xs tracking-wide border-b border-gray-200 pb-1">Responses (Spec)</h4>
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
  const [authorizeOpen, setAuthorizeOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");

  if (!tenant || !api) {
    return <p className="max-w-5xl mx-auto px-6 py-10 text-gray-500">API not found.</p>;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
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
            <div className="flex items-center gap-2">
              {api.version && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">v{api.version}</span>
              )}
              <button
                onClick={() => setAuthorizeOpen((o) => !o)}
                className="text-xs font-semibold border border-[#49cc90] text-[#49cc90] px-3 py-1.5 rounded flex items-center gap-1 hover:bg-[#e8f9f1]"
              >
                🔓 {apiKey ? "Authorized" : "Authorize"}
              </button>
            </div>
          </div>
          <p className="text-gray-500 mt-1">{api.description}</p>

          {authorizeOpen && (
            <div className="mt-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <label className="text-xs font-semibold text-gray-600 uppercase">Bearer Token</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste API key / token"
                  className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={() => setAuthorizeOpen(false)}
                  className="px-3 py-1.5 rounded bg-[#49cc90] text-white text-sm font-semibold hover:bg-[#3fb87f]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500 border-t border-gray-100 pt-3">
            {api.baseUrl && <span className="font-mono bg-gray-50 px-2 py-1 rounded">{api.baseUrl}</span>}
            {api.contact?.email && <span>Contact: {api.contact.email}</span>}
            {api.license?.name && <span>License: {api.license.name}</span>}
          </div>
        </div>

        <div className="space-y-3 mt-6">
          {api.endpoints.map((ep, i) => (
            <EndpointRow key={`${ep.method}-${ep.path}-${i}`} endpoint={ep} baseUrl={api.baseUrl} apiKey={apiKey} />
          ))}
        </div>
      </div>
    </div>
  );
}
