import { useNavigate, useParams } from "react-router-dom";

const subsections = [
  { key: "apis", label: "APIs", description: "Upload and manage OpenAPI specs for this tenant." },
  { key: "events", label: "Events", description: "Event catalog for this tenant." },
  { key: "file-templates", label: "File Templates", description: "Reusable file templates for this tenant." },
];

export default function TenantDetailPage() {
  const { tenantId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <button onClick={() => navigate("/")} className="text-sm text-blue-600 mb-4">
        ← Back to Tenants
      </button>
      <h1 className="text-2xl font-semibold text-gray-900 capitalize">{tenantId}</h1>
      <p className="text-gray-500 mt-1">Choose a resource type to explore</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">
        {subsections.map((s) => (
          <button
            key={s.key}
            onClick={() => navigate(`/tenants/${tenantId}/${s.key}`)}
            className="text-left bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 relative"
          >
            <span className="absolute left-0 top-5 bottom-5 w-1 bg-blue-600 rounded-r" />
            <h2 className="text-blue-700 font-semibold text-lg pl-3">{s.label}</h2>
            <div className="border-b border-gray-100 my-3" />
            <p className="text-sm text-gray-600 pl-3">{s.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
