const fs = require('fs');
const filePath = 'e:\\naprocs-ems\\apps\\web\\src\\app\\(dashboard)\\cam\\scheduler\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all dark:* classes with empty string
content = content.replace(/dark:[A-Za-z0-9\-/\\[\]:]+/g, '');
// Clean up multiple spaces inside class attributes
content = content.replace(/className="([^"]*)"/g, (match, p1) => {
    return 'className="' + p1.replace(/\s+/g, ' ').trim() + '"';
});
content = content.replace(/className={`([^`]*)`}/g, (match, p1) => {
    return 'className={`' + p1.replace(/ +/g, ' ').trim() + '`}';
});

fs.writeFileSync(filePath, content);
console.log("Removed dark mode classes");
