const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'apps', 'web', 'src');

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
  const original = content;

  // Remove `activeRole={something}` from JSX
  content = content.replace(/activeRole=\{[^}]*\}/g, '');
  // Also remove `activeRole="something"`
  content = content.replace(/activeRole="[^"]*"/g, '');
  // Remove `onRoleChange={something}` from JSX
  content = content.replace(/onRoleChange=\{[^}]*\}/g, '');

  // Fix Layout props where `{ children, activeRole }` is used
  content = content.replace(/\{\s*children\s*,\s*activeRole\s*\}/g, '{ children }');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    count++;
  }
}

console.log('Fixed jsx files:', count);
