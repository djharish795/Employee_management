import * as fs from 'fs';
import * as path from 'path';

function walkDir(dir: string, callback: (filePath: string) => void) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      callback(filePath);
    }
  }
}

const srcDir = 'e:/Naprocs-ems/apps/web/src';
console.log('Scanning directories in:', srcDir);

walkDir(srcDir, (filePath) => {
  const buffer = fs.readFileSync(filePath);
  try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    decoder.decode(buffer);
  } catch (e) {
    console.log(`⚠️ Invalid UTF-8 detected in: ${filePath}`);
    // Read as Windows-1252 (which handles 0x97 as em dash) and save as standard UTF-8
    const win1252Decoder = new TextDecoder('windows-1252');
    const decodedText = win1252Decoder.decode(buffer);
    fs.writeFileSync(filePath, decodedText, 'utf-8');
    console.log(`✅ Converted to UTF-8: ${filePath}`);
  }
});
