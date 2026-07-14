const fs = require('fs');
let code = fs.readFileSync('apps/web/src/hooks/use-notifications.ts', 'utf8');
code = code.replace(
  'socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/notifications", {',
  'socket = io((process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001") + "/notifications", {'
);
fs.writeFileSync('apps/web/src/hooks/use-notifications.ts', code);
