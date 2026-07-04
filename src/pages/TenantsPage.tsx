import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTenantData } from "../context/TenantDataContext";

export default function TenantsPage() {
  const { tenants, loadFromFile, clear } = useTenantData();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      await loadFromFile(file);
    } catch (err: any) {
      setError(err.message ?? "Invalid JSON file.");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="w-full px-6 md:px-10 lg:px-16 py-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Choose a Tenant to Explore</h1>
          <p className="text-slate-600 mt-1">See the APIs, Events, and File Templates each tenant has to offer</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => inputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Upload Tenant JSON
          </button>
          {tenants.length > 0 && (
            <button
              onClick={clear}
              className="px-4 py-2 border border-blue-200 bg-white text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50"
            >
              Clear
            </button>
          )}
          <input ref={inputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleUpload} />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

      {tenants.length === 0 ? (
        <div className="mt-16 text-center text-slate-500 bg-white border border-dashed border-slate-300 rounded-xl py-16">
          No tenant data loaded yet. Upload a JSON file to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5 mt-8">
          {tenants.map((tenant) => (
            <button
              key={tenant.id}
              onClick={() => navigate(`/tenants/${tenant.id}`)}
              className="text-left bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 relative"
            >
              <span className="absolute left-0 top-5 bottom-5 w-1 bg-blue-600 rounded-r" />
              <h2 className="text-blue-700 font-semibold text-lg pl-3">{tenant.name}</h2>
              <div className="border-b border-gray-100 my-3" />
              <p className="text-sm text-gray-600 pl-3">{tenant.description}</p>
              <p className="text-xs text-gray-400 pl-3 mt-3">{tenant.apis?.length ?? 0} APIs</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
