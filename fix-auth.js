const fs = require('fs');
let code = fs.readFileSync('apps/web/src/services/auth.service.ts', 'utf8');
code = code.replace(/method: "POST",[\s\n]*headers: {[\s\n]*"Content-Type": "application\/json",[\s\n]*},/g, 'method: "POST",\n      headers: {\n        "Content-Type": "application/json",\n      },\n      credentials: "include",');
fs.writeFileSync('apps/web/src/services/auth.service.ts', code);
