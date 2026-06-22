const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  { regex: /bg-blue-600/g, replacement: 'bg-slate-900' },
  { regex: /bg-blue-700/g, replacement: 'bg-slate-800' },
  { regex: /bg-blue-800/g, replacement: 'bg-slate-950' },
  { regex: /bg-blue-500/g, replacement: 'bg-slate-700' },
  { regex: /bg-blue-50/g, replacement: 'bg-slate-100' },
  { regex: /bg-blue-100/g, replacement: 'bg-slate-200' },
  { regex: /text-blue-600/g, replacement: 'text-slate-900' },
  { regex: /text-blue-700/g, replacement: 'text-slate-900' },
  { regex: /text-blue-500/g, replacement: 'text-slate-700' },
  { regex: /text-blue-800/g, replacement: 'text-slate-950' },
  { regex: /text-blue-900/g, replacement: 'text-slate-950' },
  { regex: /border-blue-600/g, replacement: 'border-slate-900' },
  { regex: /border-blue-500/g, replacement: 'border-slate-700' },
  { regex: /border-blue-200/g, replacement: 'border-slate-300' },
  { regex: /border-blue-100/g, replacement: 'border-slate-200' },
  { regex: /ring-blue-500/g, replacement: 'ring-slate-900' },
  { regex: /ring-blue-600/g, replacement: 'ring-slate-900' },
  { regex: /shadow-blue-500\/10/g, replacement: 'shadow-slate-900/10' },
  { regex: /\[#2563EB\]/g, replacement: 'slate-900' },
  { regex: /\[#1D4ED8\]/g, replacement: 'slate-800' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const rule of replacements) {
        content = content.replace(rule.regex, rule.replacement);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

console.log('Starting global theme migration...');
processDirectory(srcDir);
console.log('Theme migration complete!');
