const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'apps', 'web', 'src', 'components', 'modules');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk(srcDir);
let count = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  if (!content.includes('activeRole')) continue;
  
  const original = content;

  // 1. Remove `activeRole: SettingsRole;` from props interfaces
  content = content.replace(/activeRole\s*:\s*[A-Za-z0-9_]+;/g, '');

  // 2. Replace `{ activeRole }: Props` with `()`
  content = content.replace(/{\s*activeRole\s*}\s*:\s*[A-Za-z0-9_]+/g, '()');

  if (content !== original) {
    // Add import if missing
    if (!content.includes('import { usePermissions }')) {
      content = 'import { usePermissions } from "@/hooks/use-permissions";\n' + content;
    }

    // Inject hook
    if (!content.includes('const activeRole = role')) {
      content = content.replace(
        /(export\s+(?:default\s+)?function\s+[A-Za-z0-9_]+\s*\(\s*\)\s*\{)/g,
        "$1\n  const { role } = usePermissions();\n  const activeRole = role as any;"
      );
    }

    fs.writeFileSync(file, content, 'utf-8');
    console.log('Modified:', file);
    count++;
  }
}

console.log('Fixed files:', count);
