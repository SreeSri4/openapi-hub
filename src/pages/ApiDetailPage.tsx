import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { useTenantData } from "../context/TenantDataContext";
import { convertToOpenAPI, specToJSON, specToYAML } from "../services/specConverter";
import type { APIDefinition } from "../types";

const OAUTH_SCOPE = "GtmsApi";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "api";
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function requestClientCredentialsToken(tokenUrl: string, clientId: string, clientSecret: string, scope: string) {
  const body = new URLSearchParams();
  body.set("grant_type", "client_credentials");
  body.set("client_id", clientId);
  body.set("client_secret", clientSecret);
  body.set("scope", scope);

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    // non-JSON response body
  }

  if (!res.ok) {
    const msg = data?.error_description || data?.error || text || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  if (!data?.access_token) {
    throw new Error("Token endpoint responded successfully but returned no access_token.");
  }
  return data as { access_token: string; expires_in?: number; token_type?: string };
}

type AuthMode = "bearer" | "oauth2";

function AuthorizePanel({
  authMode,
  setAuthMode,
  bearerInput,
  setBearerInput,
  appliedBearerToken,
  onApplyBearer,
  onClearBearer,
  tokenUrl,
  setTokenUrl,
  clientId,
  setClientId,
  clientSecret,
  setClientSecret,
  oauthStatus,
  oauthError,
  oauthToken,
  onRequestToken,
  onClearOAuth,
  onClose,
}: {
  authMode: AuthMode;
  setAuthMode: (m: AuthMode) => void;
  bearerInput: string;
  setBearerInput: (v: string) => void;
  appliedBearerToken: string;
  onApplyBearer: () => void;
  onClearBearer: () => void;
  tokenUrl: string;
  setTokenUrl: (v: string) => void;
  clientId: string;
  setClientId: (v: string) => void;
  clientSecret: string;
  setClientSecret: (v: string) => void;
  oauthStatus: "idle" | "loading" | "success" | "error";
  oauthError: string | null;
  oauthToken: string | null;
  onRequestToken: () => void;
  onClearOAuth: () => void;
  onClose: () => void;
}) {
  const bearerApplied = appliedBearerToken.length > 0 && appliedBearerToken === bearerInput.trim();

  return (
    <div className="absolute right-6 md:right-10 lg:right-16 top-full mt-2 w-[360px] bg-white text-[#3b4151] rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-sm">Authorize</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
      </div>

      <div className="px-4 pt-3 flex gap-4 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="auth-mode"
            checked={authMode === "bearer"}
            onChange={() => setAuthMode("bearer")}
          />
          Bearer Token
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="auth-mode"
            checked={authMode === "oauth2"}
            onChange={() => setAuthMode("oauth2")}
          />
          OAuth2 Client Credentials
        </label>
      </div>

      <div className="p-4">
        {authMode === "bearer" ? (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bearer Token</label>
            <input
              type="text"
              value={bearerInput}
              onChange={(e) => setBearerInput(e.target.value)}
              placeholder="Paste access token"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onApplyBearer}
                disabled={!bearerInput.trim()}
                className="px-3 py-1.5 rounded bg-[#49cc90] text-white text-xs font-semibold hover:bg-[#3fb87f] disabled:opacity-50"
              >
                Apply
              </button>
              {appliedBearerToken && (
                <button onClick={onClearBearer} className="px-3 py-1.5 rounded border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50">
                  Clear
                </button>
              )}
              {bearerApplied && <span className="text-xs text-[#49cc90] font-medium">✓ Applied</span>}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Token URL</label>
              <input
                type="text"
                value={tokenUrl}
                onChange={(e) => setTokenUrl(e.target.value)}
                placeholder="https://auth.example.com/oauth2/token"
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Client Id</label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Client Id"
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Client Secret</label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Client Secret"
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Scope</label>
              <div className="text-sm font-mono bg-gray-100 text-gray-600 rounded px-2 py-1.5">{OAUTH_SCOPE}</div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onRequestToken}
                disabled={!tokenUrl.trim() || !clientId.trim() || !clientSecret.trim() || oauthStatus === "loading"}
                className="px-3 py-1.5 rounded bg-[#49cc90] text-white text-xs font-semibold hover:bg-[#3fb87f] disabled:opacity-50"
              >
                {oauthStatus === "loading" ? "Requesting..." : "Get Token"}
              </button>
              {oauthToken && (
                <button onClick={onClearOAuth} className="px-3 py-1.5 rounded border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50">
                  Clear
                </button>
              )}
            </div>

            {oauthStatus === "success" && oauthToken && (
              <p className="text-xs text-[#49cc90] font-medium">✓ Token acquired</p>
            )}
            {oauthStatus === "error" && oauthError && (
              <p className="text-xs text-[#f93e3e]">{oauthError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApiDetailPage() {
  const { tenantId, apiId } = useParams();
  const navigate = useNavigate();
  const { getTenant } = useTenantData();
  const tenant = getTenant(tenantId!);
  const api = tenant?.apis.find((a) => a.id === apiId);

  const [collapsed, setCollapsed] = useState(false);

  // --- custom authorize state (replaces Swagger UI's built-in Authorize dialog) ---
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("bearer");

  const [bearerInput, setBearerInput] = useState("");
  const [appliedBearerToken, setAppliedBearerToken] = useState("");

  const [tokenUrl, setTokenUrl] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [oauthToken, setOauthToken] = useState<string | null>(null);
  const [oauthStatus, setOauthStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [oauthError, setOauthError] = useState<string | null>(null);

  const effectiveToken = authMode === "bearer" ? appliedBearerToken : oauthToken ?? "";
  const isAuthorized = effectiveToken.length > 0;

  const handleApplyBearer = () => setAppliedBearerToken(bearerInput.trim());
  const handleClearBearer = () => {
    setBearerInput("");
    setAppliedBearerToken("");
  };

  const handleRequestToken = async () => {
    setOauthStatus("loading");
    setOauthError(null);
    try {
      const data = await requestClientCredentialsToken(tokenUrl.trim(), clientId.trim(), clientSecret, OAUTH_SCOPE);
      setOauthToken(data.access_token);
      setOauthStatus("success");
    } catch (err: any) {
      setOauthToken(null);
      setOauthStatus("error");
      setOauthError(err.message ?? "Failed to obtain token.");
    }
  };
  const handleClearOAuth = () => {
    setOauthToken(null);
    setOauthStatus("idle");
    setOauthError(null);
  };

  // Build a genuine OpenAPI 3.0 document from the tenant's minimal API
  // definition, and expose it through the real Swagger UI component so the
  // page renders/behaves like an actual OpenAPI documentation site
  // (try-it-out console, schemas, etc). Authorization itself is handled by
  // our own panel above rather than Swagger UI's built-in Authorize dialog.
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

  if (!tenant || !api || !spec) {
    return <p className="w-full px-6 md:px-10 lg:px-16 py-10 text-blue-100/80">API not found.</p>;
  }

  const fileBaseName = `${slugify(tenant.name)}-${slugify(api.name)}-openapi`;

  const handleDownloadJSON = () => {
    downloadFile(specToJSON(spec as any), `${fileBaseName}.json`, "application/json");
  };

  const handleDownloadYAML = () => {
    downloadFile(specToYAML(spec as any), `${fileBaseName}.yaml`, "application/yaml");
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="relative bg-[#1b1b1b] text-white px-6 md:px-10 lg:px-16 py-3">
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
              onClick={handleDownloadJSON}
              className="text-xs border border-gray-600 text-gray-300 px-2 py-1 rounded hover:bg-white/10 whitespace-nowrap"
              title="Download OpenAPI spec as JSON"
            >
              ⬇ JSON
            </button>
            <button
              onClick={handleDownloadYAML}
              className="text-xs border border-gray-600 text-gray-300 px-2 py-1 rounded hover:bg-white/10 whitespace-nowrap"
              title="Download OpenAPI spec as YAML"
            >
              ⬇ YAML
            </button>
            <button
              onClick={() => setAuthOpen((o) => !o)}
              className={`text-xs px-2 py-1 rounded whitespace-nowrap font-semibold border ${
                isAuthorized
                  ? "border-[#49cc90] text-[#49cc90] hover:bg-[#49cc90]/10"
                  : "border-gray-600 text-gray-300 hover:bg-white/10"
              }`}
            >
              {isAuthorized ? "🔒 Authorized" : "🔓 Authorize"}
            </button>
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="text-xs border border-gray-600 text-gray-300 px-2 py-1 rounded hover:bg-white/10 whitespace-nowrap"
            >
              {collapsed ? "Expand All" : "Collapse All"}
            </button>
          </div>
        </div>

        {authOpen && (
          <AuthorizePanel
            authMode={authMode}
            setAuthMode={setAuthMode}
            bearerInput={bearerInput}
            setBearerInput={setBearerInput}
            appliedBearerToken={appliedBearerToken}
            onApplyBearer={handleApplyBearer}
            onClearBearer={handleClearBearer}
            tokenUrl={tokenUrl}
            setTokenUrl={setTokenUrl}
            clientId={clientId}
            setClientId={setClientId}
            clientSecret={clientSecret}
            setClientSecret={setClientSecret}
            oauthStatus={oauthStatus}
            oauthError={oauthError}
            oauthToken={oauthToken}
            onRequestToken={handleRequestToken}
            onClearOAuth={handleClearOAuth}
            onClose={() => setAuthOpen(false)}
          />
        )}
      </div>

      <div className="w-full">
        <SwaggerUI
          key={`${collapsed ? "collapsed" : "expanded"}-${effectiveToken || "anon"}`}
          spec={spec}
          docExpansion={collapsed ? "none" : "list"}
          defaultModelsExpandDepth={1}
          deepLinking
          requestInterceptor={(req: any) => {
            if (effectiveToken) {
              req.headers = { ...req.headers, Authorization: `Bearer ${effectiveToken}` };
            }
            return req;
          }}
        />
      </div>
    </div>
  );
}