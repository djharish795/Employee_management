const fs = require('fs');
const path = require('path');

const replacements = [
  {
    file: 'e:\\Naprocs-ems\\apps\\web\\src\\components\\modules\\compliance\\policies-panel.tsx',
    search: /const\s+canManagePolicies\s*=\s*\[.*?\]\.includes\(activeRole\);/g,
    replace: 'const { canManageCompliance: canManagePolicies } = usePermissions();'
  },
  {
    file: 'e:\\Naprocs-ems\\apps\\web\\src\\components\\modules\\compliance\\requests-panel.tsx',
    search: /const\s+canProcess\s*=\s*\[.*?\]\.includes\(activeRole\);/g,
    replace: 'const { canManageCompliance: canProcess } = usePermissions();'
  },
  {
    file: 'e:\\Naprocs-ems\\apps\\web\\src\\components\\modules\\compliance\\consents-panel.tsx',
    search: /const\s+isPrivileged\s*=\s*\[.*?\]\.includes\(activeRole\);/g,
    replace: 'const { canManageCompliance: isPrivileged } = usePermissions();'
  },
  {
    file: 'e:\\Naprocs-ems\\apps\\web\\src\\components\\modules\\assets\\inventory-panel.tsx',
    search: /const\s+canEdit\s*=\s*\[.*?\]\.includes\(activeRole\);/g,
    replace: 'const { isAdmin: canEdit } = usePermissions();'
  },
  {
    file: 'e:\\Naprocs-ems\\apps\\web\\src\\components\\modules\\assets\\requests-panel.tsx',
    search: /const\s+canApprove\s*=\s*\[.*?\]\.includes\(activeRole\);/g,
    replace: 'const { isAdmin: canApprove } = usePermissions();'
  },
  {
    file: 'e:\\Naprocs-ems\\apps\\web\\src\\components\\modules\\assets\\dashboard-panel.tsx',
    search: /const\s+isITOrAdmin\s*=\s*\[.*?\]\.includes\(activeRole\);/g,
    replace: 'const { isAdmin: isITOrAdmin } = usePermissions();'
  },
  {
    file: 'e:\\Naprocs-ems\\apps\\web\\src\\components\\modules\\assets\\requests-panel.tsx',
    search: /\{\(isEmployee\s*\|\|\s*\[.*?\]\.includes\(activeRole\)\)\s*&&\s*\(/g,
    replace: '{true && ('
  },
  {
    file: 'e:\\Naprocs-ems\\apps\\web\\src\\app\\(dashboard)\\org-chart\\page.tsx',
    search: /const\s+isRestrictedRole\s*=\s*\[.*?\]\.includes\(activeRole\);/g,
    replace: 'const { isExecutive, canManageOrg } = usePermissions();\n  const isRestrictedRole = !(isExecutive || canManageOrg);'
  },
  {
    file: 'e:\\Naprocs-ems\\apps\\web\\src\\app\\(dashboard)\\layout.tsx',
    search: /const\s+isPrivileged\s*=\s*\[.*?\]\.includes\(activeRole\);/g,
    replace: 'const { isExecutive, canManageOrg, canManageEmployees, isAdmin } = usePermissions();\n  const isPrivileged = isExecutive || canManageOrg || canManageEmployees || isAdmin;'
  },
  {
    file: 'e:\\Naprocs-ems\\apps\\web\\src\\components\\modules\\leaves\\leaves-layout.tsx',
    search: /return\s*!\[.*?\]\.includes\(activeRole\);/g,
    replace: 'const { canManageLeaves } = usePermissions(); return canManageLeaves;'
  }
];

replacements.forEach(({ file, search, replace }) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    if (!content.includes('use-permissions')) {
      content = content.replace('import React', 'import { usePermissions } from "@/hooks/use-permissions";\nimport React');
      if (content === fs.readFileSync(file, 'utf-8')) {
          content = 'import { usePermissions } from "@/hooks/use-permissions";\n' + content;
      }
    }
    content = content.replace(search, replace);
    fs.writeFileSync(file, content);
    console.log(`Updated ${path.basename(file)}`);
  } else {
    console.log(`Not found: ${file}`);
  }
});
