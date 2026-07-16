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
  
  // Skip if doesn't contain activeRole
  if (!content.includes('activeRole')) continue;
  
  let modified = false;

  // 1. Remove activeRole from props type definition
  // e.g. interface DashboardPanelProps { activeRole: ... }
  content = content.replace(/activeRole\s*:\s*[A-Za-z]+;/g, '');

  // 2. Replace { activeRole }: Props with ()
  // For export default function Component({ activeRole }: ComponentProps) {
  content = content.replace(/{\s*activeRole\s*}\s*:\s*[A-Za-z]+/g, '()');
  
  // For export default function Component({ activeRole, otherProp }: Props) {
  // We might just leave it and inject the hook. Let's do a smarter approach:
  // We'll inject `const { role } = usePermissions(); const activeRole = role as any;` at the start of the function body.
  
  // Find the export default function line
  const funcRegex = /export\s+default\s+function\s+[A-Za-z]+\s*\([^)]*\)\s*{/g;
  let match;
  while ((match = funcRegex.exec(content)) !== null) {
    const insertPos = match.index + match[0].length;
    
    // Check if we already injected it
    const after = content.slice(insertPos, insertPos + 100);
    if (!after.includes('usePermissions')) {
      content = content.slice(0, insertPos) + '\n  const { role } = usePermissions();\n  const activeRole = role as any;' + content.slice(insertPos);
      modified = true;
    }
  }

  // Find non-default exported functions too
  const funcRegex2 = /export\s+function\s+[A-Za-z]+\s*\([^)]*\)\s*{/g;
  while ((match = funcRegex2.exec(content)) !== null) {
    const insertPos = match.index + match[0].length;
    
    const after = content.slice(insertPos, insertPos + 100);
    if (!after.includes('usePermissions')) {
      content = content.slice(0, insertPos) + '\n  const { role } = usePermissions();\n  const activeRole = role as any;' + content.slice(insertPos);
      modified = true;
    }
  }

  if (modified) {
    // Add import if missing
    if (!content.includes('import { usePermissions }')) {
      // add after first import
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
