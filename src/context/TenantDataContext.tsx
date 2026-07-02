import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Tenant, TenantData } from "../types/tenant";

const STORAGE_KEY = "openapi-hub-tenant-data";
const DEFAULT_CONFIG_URL = "/public/sample-tenant-config.json"; // served from /public

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

  const applyParsed = (parsed: TenantData, persist: boolean) => {
    if (!Array.isArray(parsed.tenants)) {
      throw new Error("JSON must contain a top-level 'tenants' array.");
    }
    setTenants(parsed.tenants);
    if (persist) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  };

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed: TenantData = JSON.parse(raw);
        setTenants(parsed.tenants ?? []);
        setLoaded(true);
        return;
      } catch {
        // ignore corrupt cache, fall through to default load
      }
    }

    // No valid cached data yet — load the bundled sample config by default.
    fetch(DEFAULT_CONFIG_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch ${DEFAULT_CONFIG_URL}: ${res.status}`);
        return res.json();
      })
      .then((parsed: TenantData) => {
        setTenants(parsed.tenants ?? []);
        // Not persisting to localStorage here, so the bundled default
        // keeps loading fresh each visit until the user uploads their own file.
      })
      .catch((err) => {
        console.error("Error loading default tenant config:", err);
      })
      .finally(() => setLoaded(true));
  }, []);

  const loadFromFile = async (file: File) => {
    const text = await file.text();
    const parsed: TenantData = JSON.parse(text);
    applyParsed(parsed, true);
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