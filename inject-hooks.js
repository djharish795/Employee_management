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

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  
  if (!content.includes('Cannot find name \'activeRole\'') && content.includes('activeRole') && !content.includes('const activeRole = role')) {
    // wait we don't have tsc output here directly.
    // just check if file contains "activeRole" but not "const activeRole"
    let funcRegex = /(export\s+(?:default\s+)?function\s+[A-Za-z0-9_]+\s*\(\s*(?:props|[^)]*)?\s*\)\s*\{)/g;
    
    // We will inject at the first match
    let match = funcRegex.exec(content);
    if (match) {
       let insertPos = match.index + match[0].length;
       content = content.slice(0, insertPos) + '\n  const { role } = usePermissions();\n  const activeRole = role as any;' + content.slice(insertPos);
       
       if (!content.includes('import { usePermissions }')) {
          content = 'import { usePermissions } from "@/hooks/use-permissions";\n' + content;
       }
       fs.writeFileSync(file, content, 'utf-8');
       console.log('Injected hook in:', file);
    }
  }
}
