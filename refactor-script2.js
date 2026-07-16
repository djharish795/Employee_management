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
  
  let modified = false;

  // 1. Remove activeRole: AnyType;
  content = content.replace(/activeRole\s*:\s*[a-zA-Z0-9_]+;/g, '');
  
  // 2. Replace { activeRole }: AnyType
  content = content.replace(/{\s*activeRole\s*}\s*:\s*[a-zA-Z0-9_]+/g, '()');

  // Insert usePermissions if not there
  const funcRegex = /(export\s+(?:default\s+)?function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*{)/g;
  let match;
  while ((match = funcRegex.exec(content)) !== null) {
    const insertPos = match.index + match[0].length;
    const after = content.slice(insertPos, insertPos + 100);
    if (!after.includes('usePermissions') && content.slice(match.index, insertPos).includes('()')) {
      content = content.slice(0, insertPos) + '\n  const { role } = usePermissions();\n  const activeRole = role as any;' + content.slice(insertPos);
      modified = true;
    }
  }

  if (modified) {
    if (!content.includes('import { usePermissions }')) {
      const firstImport = content.indexOf('import');
      if (firstImport !== -1) {
        const endOfFirstImport = content.indexOf('\n', firstImport) + 1;
        content = content.slice(0, endOfFirstImport) + 'import { usePermissions } from "@/hooks/use-permissions";\n' + content.slice(endOfFirstImport);
      } else {
        content = 'import { usePermissions } from "@/hooks/use-permissions";\n' + content;
      }
    }
    fs.writeFileSync(file, content, 'utf-8');
    console.log('Modified:', file);
    count++;
  }
}

console.log('Fixed files:', count);
