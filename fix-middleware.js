const fs = require('fs');
let code = fs.readFileSync('apps/web/middleware.ts', 'utf8');

// Add new routes to protectedRoutes
code = code.replace(
  /'\/connect'/g,
  "'/connect', '/cam', '/oe', '/om', '/team-lead'"
);

// Add new namespaces to roleNamespaces
code = code.replace(
  /const roleNamespaces = \['\/employee', '\/admin', '\/executive', '\/cto', '\/finance', '\/hr'\];/g,
  "const roleNamespaces = ['/employee', '/admin', '/executive', '/cto', '/finance', '/hr', '/cam', '/oe', '/om', '/team-lead'];"
);

// Add operations head to executive
code = code.replace(
  /else if \(\['CEO', 'COO'\]\.includes\(role\)\) targetDashboard = '\/executive\/dashboard';/g,
  "else if (['CEO', 'COO', 'OPERATIONS_HEAD'].includes(role)) targetDashboard = '/executive/dashboard';"
);

// Add missing roles
code = code.replace(
  /else if \(\['CHRO', 'HR'\]\.includes\(role\)\) targetDashboard = '\/hr\/dashboard';/g,
  "else if (['CHRO', 'HR'].includes(role)) targetDashboard = '/hr/dashboard';\n  else if (role === 'TEAM_LEAD') targetDashboard = '/team-lead/dashboard';\n  else if (role === 'CAM') targetDashboard = '/cam/dashboard';\n  else if (role === 'OE') targetDashboard = '/oe/dashboard';\n  else if (role === 'OM') targetDashboard = '/om/dashboard';"
);

fs.writeFileSync('apps/web/middleware.ts', code);
