export interface EndpointDefinition {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  description?: string;
  summary?: string;
  parameters?: ParameterDefinition[];
  requestBody?: RequestBodyDefinition;
  responses?: Record<string, ResponseDefinition>;
  tags?: string[];
}

export interface ParameterDefinition {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  description?: string;
  required?: boolean;
  schema?: SchemaDefinition;
}

export interface RequestBodyDefinition {
  description?: string;
  required?: boolean;
  content?: Record<string, { schema?: SchemaDefinition }>;
}

export interface ResponseDefinition {
  description: string;
  content?: Record<string, { schema?: SchemaDefinition }>;
}

export interface SchemaDefinition {
  type?: string;
  format?: string;
  example?: any;
  items?: SchemaDefinition;
  properties?: Record<string, SchemaDefinition>;
  required?: string[];
}

export interface APIDefinition {
  id: string;
  name: string;
  description?: string;
  baseUrl: string;
  version?: string;
  contact?: {
    name?: string;
    url?: string;
    email?: string;
  };
  license?: {
    name?: string;
    url?: string;
  };
  endpoints: EndpointDefinition[];
  tags?: Array<{ name: string; description?: string }>;
}

export interface Tenant {
  id: string;
  name: string;
  description?: string;
  apis: APIDefinition[];
}

export interface TenantConfig {
  tenants: Tenant[];
}

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
    contact?: {
      name?: string;
      url?: string;
      email?: string;
    };
    license?: {
      name?: string;
      url?: string;
    };
  };
  servers?: Array<{ url: string; description?: string }>;
  paths: Record<string, Record<string, any>>;
  components?: {
    schemas?: Record<string, SchemaDefinition>;
  };
  tags?: Array<{ name: string; description?: string }>;
}

export interface AppState {
  tenants: Tenant[];
  selectedTenantId: string | null;
  selectedApiId: string | null;
  loadingSpec: boolean;
  specError: string | null;
  currentSpec: OpenAPISpec | null;
  setTenants: (tenants: Tenant[]) => void;
  setSelectedTenant: (tenantId: string | null) => void;
  setSelectedApi: (apiId: string | null) => void;
  setCurrentSpec: (spec: OpenAPISpec | null) => void;
  setLoadingSpec: (loading: boolean) => void;
  setSpecError: (error: string | null) => void;
}
