import React, { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { FileUploadArea } from './components/FileUploadArea';
import { TenantTree } from './components/TenantTree';
import { SpecViewer } from './components/SpecViewer';
import { DownloadPanel } from './components/DownloadPanel';
import { Header } from './components/Header';

export const App: React.FC = () => {
  const { tenants } = useAppState();
  const [showUpload, setShowUpload] = useState(tenants.length === 0);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header onNewUpload={() => setShowUpload(true)} />

      {showUpload && (
        <div className="p-6 bg-white m-4 rounded-lg shadow">
          <FileUploadArea onUploadSuccess={() => setShowUpload(false)} />
        </div>
      )}

      <div className="flex flex-1 gap-4 p-4 overflow-hidden">
        {/* Left Sidebar - Tenant Tree */}
        <TenantTree tenants={tenants} />

        {/* Main Panel - Spec Viewer */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow overflow-hidden">
          <SpecViewer />
          <DownloadPanel />
        </div>
      </div>
    </div>
  );
};

export default App;
