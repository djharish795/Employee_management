const XLSX = require('C:/Users/tejes/AppData/Roaming/npm/node_modules/xlsx');
const fs = require('fs');

const wb = XLSX.readFile('C:\\Users\\tejes\\Downloads\\UPDATED EMS_NAPROCS TECHNOLOGIES.xlsx');
console.log('ALL SHEETS:', JSON.stringify(wb.SheetNames));

// Print all data from Sheet 1 (employee master data)
wb.SheetNames.forEach(name => {
  const ws = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  if (data.length > 0) {
    fs.appendFileSync('D:\\naprocs-ems\\packages\\database\\excel-dump.txt', 
      `\n\n========== SHEET: ${name} (${data.length} rows) ==========\n`);
    for (let i = 0; i < data.length; i++) {
      fs.appendFileSync('D:\\naprocs-ems\\packages\\database\\excel-dump.txt', 
        `Row ${i}: ${JSON.stringify(data[i])}\n`);
    }
  }
});
console.log('Done! Check excel-dump.txt');
