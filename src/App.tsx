import { BrowserRouter, Routes, Route } from "react-router-dom";
import TenantsPage from "./pages/TenantsPage";
import TenantDetailPage from "./pages/TenantDetailPage";
import ApisPage from "./pages/ApisPage";
import EventsPage from "./pages/EventsPage";
import FileTemplatesPage from "./pages/FileTemplatesPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TenantsPage />} />
        <Route path="/tenants/:tenantId" element={<TenantDetailPage />} />
        <Route path="/tenants/:tenantId/apis" element={<ApisPage />} />
        <Route path="/tenants/:tenantId/events" element={<EventsPage />} />
        <Route path="/tenants/:tenantId/file-templates" element={<FileTemplatesPage />} />
      </Routes>
    </BrowserRouter>
  );
}
