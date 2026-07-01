import { useNavigate, useParams } from "react-router-dom";
import { useTenantData } from "../context/TenantDataContext";

export default function FileTemplatesPage() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const { getTenant } = useTenantData();
  const tenant = getTenant(tenantId!);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <button onClick={() => navigate(`/tenants/${tenantId}`)} className="text-sm text-blue-600 mb-4">
        ← Back to {tenant?.name ?? tenantId}
      </button>
      <h1 className="text-2xl font-semibold text-gray-900">File Templates — {tenant?.name ?? tenantId}</h1>
      <p className="text-gray-400 mt-4">Coming soon.</p>
    </div>
  );
}
