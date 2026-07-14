const fs = require('fs');
const filePath = 'apps/api/src/modules/notifications/in-app.service.ts';
let code = fs.readFileSync(filePath, 'utf8');

// Fix CORS
code = code.replace(
  /origin: '\*',/g,
  "origin: process.env.WS_CORS_ORIGIN || '*',"
);

// Fix JWT validation
code = code.replace(
  /const decoded = jwt\.decode\(token\) as any;/g,
  "const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;"
);

fs.writeFileSync(filePath, code);
