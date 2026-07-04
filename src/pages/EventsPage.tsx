import { useNavigate, useParams } from "react-router-dom";
import { useTenantData } from "../context/TenantDataContext";

export default function EventsPage() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const { getTenant } = useTenantData();
  const tenant = getTenant(tenantId!);

  return (
    <div className="w-full px-6 md:px-10 lg:px-16 py-10">
      <button onClick={() => navigate(`/tenants/${tenantId}`)} className="text-sm text-blue-600 mb-4">
        ← Back to {tenant?.name ?? tenantId}
      </button>
      <h1 className="text-2xl font-semibold text-slate-900">Events — {tenant?.name ?? tenantId}</h1>
      <p className="text-slate-500 mt-4 bg-white border border-gray-200 rounded-xl p-5">Coming soon.</p>
    </div>
  );
}
