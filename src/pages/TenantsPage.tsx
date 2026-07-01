import { useNavigate } from "react-router-dom";
import type { Tenant } from "../types/tenant";

const tenants: Tenant[] = [
  { id: "acme-corp", name: "Acme Corp", description: "Retail division tenant covering order and inventory APIs." },
  { id: "globex", name: "Globex Industries", description: "Manufacturing tenant with supply chain integrations." },
  { id: "initech", name: "Initech", description: "Finance tenant hosting billing and payments services." },
  { id: "umbrella", name: "Umbrella Health", description: "Healthcare tenant with patient data and scheduling APIs." },
];

export default function TenantsPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">Choose a Tenant to Explore</h1>
      <p className="text-gray-500 mt-1">See the APIs, Events, and File Templates each tenant has to offer</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
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
          </button>
        ))}
      </div>
    </div>
  );
}
