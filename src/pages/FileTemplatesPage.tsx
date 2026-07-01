// EventsPage.tsx
import { useNavigate, useParams } from "react-router-dom";

export default function EventsPage() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <button onClick={() => navigate(`/tenants/${tenantId}`)} className="text-sm text-blue-600 mb-4">
        ← Back to {tenantId}
      </button>
      <h1 className="text-2xl font-semibold text-gray-900">Events — {tenantId}</h1>
      <p className="text-gray-400 mt-4">Coming soon.</p>
    </div>
  );
}
