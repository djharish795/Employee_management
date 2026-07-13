const fs = require('fs');
const path = require('path');

const dir = 'e:\\Naprocs-ems\\apps\\web\\src\\components\\modules\\settings';
const files = fs.readdirSync(dir).filter(f => f.endsWith('-panel.tsx'));

const replacements = {
  'workflows-panel.tsx': 'const { canManageSettings: canManage } = usePermissions();',
  'users-panel.tsx': 'const { canManageSettings: canManageUsers } = usePermissions();',
  'permissions-panel.tsx': 'const { isAdmin: canManageRBAC } = usePermissions();',
  'security-panel.tsx': 'const { isAdmin: canManageSecurity } = usePermissions();',
  'org-panel.tsx': 'const { canManageSettings: canEdit } = usePermissions();',
  'notifications-panel.tsx': 'const { canManageSettings: canManage } = usePermissions();',
  'integrations-panel.tsx': 'const { isAdmin: canManage } = usePermissions();',
  'compliance-panel.tsx': 'const { canManageCompliance: canManage } = usePermissions();',
};

files.forEach(file => {
  if (!replacements[file]) return;
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Add import if not exists
  if (!content.includes('use-permissions')) {
    content = content.replace('import React', 'import { usePermissions } from "@/hooks/use-permissions";\nimport React');
  }

  // Replace the includes line
  content = content.replace(/const\s+\w+\s*=\s*\[.*?\]\.includes\(activeRole\);/g, replacements[file]);
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
