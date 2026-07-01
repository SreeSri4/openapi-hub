# 🔌 OpenAPI Hub - Multi-Tenant API Documentation

A modern web application for managing and documenting multiple APIs across different tenants. Upload a JSON configuration file and instantly get interactive OpenAPI documentation with download capabilities.

## ✨ Features

- **📋 Multi-Tenant Management**: Organize APIs by tenant with hierarchical tree view
- **📘 OpenAPI 3.0 Support**: Automatic conversion from minimal schema to full OpenAPI specs
- **🎨 Interactive Documentation**: Built-in Swagger UI for exploring APIs
- **📥 Multiple Download Formats**: Export as JSON, YAML, or bundled ZIP
- **☁️ Cloud Foundry Ready**: Deploy directly to Cloud Foundry
- **⚡ Zero Dependencies on External APIs**: All data embedded in configuration
- **🎯 Simple JSON Format**: Easy-to-understand tenant configuration format

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/SreeSri4/openapi-hub.git
cd openapi-hub

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Build for Production

```bash
npm run build
npm start
```

## 📝 Configuration Format

Create a JSON file with your tenant and API information:

```json
{
  "tenants": [
    {
      "id": "tenant-001",
      "name": "Acme Corporation",
      "description": "Acme Corp APIs",
      "apis": [
        {
          "id": "api-001",
          "name": "User API",
          "description": "User management service",
          "baseUrl": "https://api.acme.com/v1",
          "version": "1.0.0",
          "contact": {
            "name": "Support",
            "email": "support@acme.com"
          },
          "endpoints": [
            {
              "path": "/users",
              "method": "GET",
              "summary": "List users",
              "description": "Get all users",
              "tags": ["Users"],
              "parameters": [
                {
                  "name": "page",
                  "in": "query",
                  "description": "Page number",
                  "required": false,
                  "schema": { "type": "integer" }
                }
              ],
              "responses": {
                "200": {
                  "description": "List of users"
                }
              }
            }
          ]
        }
      ]
    }
  ]
}
```

## 📂 Project Structure

```
openapi-hub/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/
│   │   ├── FileUploadArea.tsx  # File upload component
│   │   ├── TenantTree.tsx      # Tenant navigation tree
│   │   ├── ApiNode.tsx         # Individual API node
│   │   ├── SpecViewer.tsx      # OpenAPI spec viewer
│   │   ├── DownloadPanel.tsx   # Download options
│   │   └── Header.tsx          # App header
│   ├── services/
│   │   ├── specConverter.ts    # Convert to OpenAPI format
│   │   └── fileParser.ts       # Parse config files
│   ├── hooks/
│   │   └── useAppState.ts      # Global state management
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # Entry point
│   └── index.css               # Tailwind styles
├── src/server/
│   └── index.ts                # Express server
├── manifest.yml                # Cloud Foundry config
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
└── README.md                   # This file
```

## 🔧 Technologies

- **Frontend**: React 18 + TypeScript
- **Build**: Vite
- **State Management**: Zustand
- **API Documentation**: Swagger UI
- **Styling**: Tailwind CSS
- **Server**: Express.js (for CF deployment)
- **Export**: jszip for bundled downloads

## 📥 Using the App

1. **Prepare Configuration**: Create a JSON file with tenant and API definitions
2. **Upload**: Drag & drop or click to upload the JSON file
3. **Browse**: Select tenant → select API to view documentation
4. **Download**: Export individual specs as JSON/YAML or bundle all APIs for a tenant

## ☁️ Deploy to Cloud Foundry

### Prerequisites

- Cloud Foundry CLI installed
- Access to a Cloud Foundry environment

### Deployment Steps

```bash
# Build the application
npm run build

# Login to Cloud Foundry
cf login -a https://api.us-south.containers.cloud.ibm.com

# Push to Cloud Foundry
cf push

# View logs
cf logs openapi-hub --recent
```

### Update manifest.yml

Edit `manifest.yml` to match your CF environment:

```yaml
---
applications:
  - name: openapi-hub
    memory: 512M
    instances: 1
    buildpacks:
      - nodejs_buildpack
    command: npm start
    routes:
      - route: openapi-hub.your-domain.com
    env:
      NODE_ENV: production
      PORT: 8080
```

## 🔄 Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Start production server
npm start

# Type checking
npm run type-check
```

## 📋 Configuration Format Details

### Tenant Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | Unique tenant identifier |
| name | string | ✅ | Display name |
| description | string | ❌ | Tenant description |
| apis | APIDefinition[] | ✅ | Array of API definitions |

### APIDefinition Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | Unique API identifier |
| name | string | ✅ | API display name |
| description | string | ❌ | API description |
| baseUrl | string | ✅ | API base URL |
| version | string | ❌ | API version (default: 1.0.0) |
| contact | Contact | ❌ | Contact information |
| license | License | ❌ | License information |
| endpoints | EndpointDefinition[] | ✅ | Array of endpoints |
| tags | Tag[] | ❌ | API tags for grouping |

### EndpointDefinition Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| path | string | ✅ | Endpoint path (e.g., /users/{id}) |
| method | string | ✅ | HTTP method (GET, POST, PUT, DELETE, PATCH) |
| summary | string | ❌ | Short endpoint description |
| description | string | ❌ | Detailed description |
| parameters | Parameter[] | ❌ | Query, path, or header parameters |
| requestBody | RequestBody | ❌ | Request body definition |
| responses | Response[] | ❌ | Possible responses |
| tags | string[] | ❌ | Tags for grouping |

## 🎨 UI/UX Overview

- **Header**: App title and "Upload New Config" button
- **Left Sidebar**: Hierarchical tree view of tenants and APIs
- **Main Panel**: Swagger UI viewer for selected API
- **Download Panel**: Options to download JSON, YAML, or bundle

## 🐛 Troubleshooting

### "Invalid config: missing 'tenants' array"
- Ensure your JSON file has a top-level `tenants` array

### "Invalid tenant: missing 'id' or 'name'"
- Each tenant must have `id` and `name` fields

### "Invalid API: missing required fields"
- Each API must have `id`, `name`, `baseUrl`, and `endpoints` array

### "Failed to convert spec"
- Check that all endpoints have valid `path` and `method` fields
- Valid methods: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD

## 📖 Sample Configuration

See `sample-tenant-config.json` for a complete example with multiple tenants and APIs.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For issues, questions, or suggestions, please open a GitHub issue.

## 🗺️ Roadmap

- [ ] Support for Events definitions (Phase 2)
- [ ] Support for File Templates (Phase 2)
- [ ] API versioning and comparison
- [ ] Search across all APIs
- [ ] Dark mode
- [ ] API schema validation
- [ ] Code generation from specs
- [ ] Integration with external API registries
