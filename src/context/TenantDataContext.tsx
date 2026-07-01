import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Tenant, TenantData } from "../types/tenant";

const STORAGE_KEY = "openapi-hub-tenant-data";

interface TenantContextValue {
  tenants: Tenant[];
  loaded: boolean;
  loadFromFile: (file: File) => Promise<void>;
  clear: () => void;
  getTenant: (tenantId: string) => Tenant | undefined;
}

const TenantDataContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantDataProvider({ children }: { children: ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed: TenantData = JSON.parse(raw);
        setTenants(parsed.tenants ?? []);
      } catch {
        // ignore corrupt cache
      }
    }
    setLoaded(true);
  }, []);

  const loadFromFile = async (file: File) => {
    const text = await file.text();
    const parsed: TenantData = JSON.parse(text);
    if (!Array.isArray(parsed.tenants)) {
      throw new Error("JSON must contain a top-level 'tenants' array.");
    }
    setTenants(parsed.tenants);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  };

  const clear = () => {
    setTenants([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getTenant = (tenantId: string) => tenants.find((t) => t.id === tenantId);

  return (
    <TenantDataContext.Provider value={{ tenants, loaded, loadFromFile, clear, getTenant }}>
      {children}
    </TenantDataContext.Provider>
  );
}

export function useTenantData() {
  const ctx = useContext(TenantDataContext);
  if (!ctx) throw new Error("useTenantData must be used within TenantDataProvider");
  return ctx;
}
