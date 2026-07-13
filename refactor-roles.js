const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace activeRole !== "CEO" && activeRole !== "MANAGER"
  content = content.replace(/activeRole !== "CEO" && activeRole !== "MANAGER"/g, "!canManageEmployees");
  
  // Replace role !== "CEO" && role !== "CHRO" && role !== "SUPER_ADMIN" && role !== "HR"
  content = content.replace(/role !== "CEO" && role !== "CHRO" && role !== "SUPER_ADMIN" && role !== "HR"/g, "!canManageEmployees");

  // Replace role === "HR" || role === "CEO"
  content = content.replace(/role === "HR" \|\| role === "CEO"/g, "canView('audit')");
  content = content.replace(/activeRole === "HR" \|\| activeRole === "CEO"/g, "canView('audit')");

  // Replace if (role !== "HR") { ... }
  content = content.replace(/if\s*\(\s*role !== "HR"\s*\)/g, "if (!canEdit('employees'))");

  // Replace if (role !== "CEO") { ... }
  content = content.replace(/if\s*\(\s*role !== "CEO"\s*\)/g, "if (!isExecutive)");
  
  // Replace if (role !== "CTO") { ... }
  content = content.replace(/if\s*\(\s*role !== "CTO"\s*\)/g, "if (!isExecutive)");
  
  // Replace role === 'CTO'
  content = content.replace(/role === 'CTO'/g, "isExecutive");
  content = content.replace(/role === "CTO"/g, "isExecutive");
  
  // Replace role === 'CEO'
  content = content.replace(/role === 'CEO'/g, "isExecutive");
  content = content.replace(/role === "CEO"/g, "isExecutive");

  // Replace role === 'HR'
  content = content.replace(/role === 'HR'/g, "canEdit('employees')");
  content = content.replace(/role === "HR"/g, "canEdit('employees')");
  content = content.replace(/activeRole === "HR"/g, "canEdit('employees')");

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

walk('apps/web/src/app');
walk('apps/web/src/components');
