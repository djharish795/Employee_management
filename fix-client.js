const fs = require('fs');
let code = fs.readFileSync('apps/web/src/lib/api/client.ts', 'utf8');
code = code.replace(/export const apiClient = axios\.create\(\{\n  baseURL: process\.env\.NEXT_PUBLIC_API_URL!,\n\}\);/, 'export const apiClient = axios.create({\n  baseURL: process.env.NEXT_PUBLIC_API_URL!,\n  withCredentials: true,\n});');
fs.writeFileSync('apps/web/src/lib/api/client.ts', code);
