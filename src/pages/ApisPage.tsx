import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ApiEntry } from "../types/tenant";

export default function ApisPage() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [apis, setApis] = useState<ApiEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    try {
      const text = await file.text();
      const spec = JSON.parse(text);

      const entry: ApiEntry = {
        id: crypto.randomUUID(),
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        spec,
      };
      setApis((prev) => [...prev, entry]);
    } catch (err) {
      setError("Invalid JSON file. Please upload a valid OpenAPI spec.");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <button onClick={() => navigate(`/tenants/${tenantId}`)} className="text-sm text-blue-600 mb-4">
        ← Back to {tenantId}
      </button>
      <h1 className="text-2xl font-semibold text-gray-900">APIs — {tenantId}</h1>
      <p className="text-gray-500 mt-1">Upload OpenAPI JSON specs for this tenant</p>

      <label className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer text-sm font-medium hover:bg-blue-700">
        Upload OpenAPI JSON
        <input type="file" accept=".json,application/json" className="hidden" onChange={handleUpload} />
      </label>

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

      <div className="mt-8 space-y-3">
        {apis.length === 0 && <p className="text-gray-400 text-sm">No APIs uploaded yet.</p>}
        {apis.map((api) => (
          <div key={api.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-900">{api.spec?.info?.title ?? api.fileName}</p>
              <p className="text-xs text-gray-500">
                {api.fileName} · uploaded {new Date(api.uploadedAt).toLocaleString()}
              </p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              v{api.spec?.info?.version ?? "?"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
