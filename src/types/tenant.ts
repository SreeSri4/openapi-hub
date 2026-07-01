export interface Tenant {
  id: string;
  name: string;
  description: string;
}

export interface ApiEntry {
  id: string;
  fileName: string;
  uploadedAt: string;
  spec: any; // parsed OpenAPI JSON
}
