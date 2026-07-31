const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'apps/api/src/modules/leaves/leaves.service.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace KPI generation/checking rules:
content = content.replace(/lt\.code === 'CL_FULL'/g, "lt.code === 'CL'");
content = content.replace(/lt\.code === 'OPTIONAL'/g, "lt.code === 'FL'");
content = content.replace(/lt\.code === 'SL' \|\| lt\.code === 'SICK'/g, "lt.code === 'SL'");
content = content.replace(/b\.leaveType\.code === 'CL_FULL'/g, "b.leaveType.code === 'CL'");
content = content.replace(/b\.leaveType\.code === 'OPTIONAL'/g, "b.leaveType.code === 'FL'");
content = content.replace(/d\.leaveType\.code === 'CL_FULL'/g, "d.leaveType.code === 'CL'");
content = content.replace(/d\.leaveType\.code === 'CL_HALF'/g, "d.leaveType.code === 'CL_HALF_UNUSED'");
content = content.replace(/d\.leaveType\.code === 'OPTIONAL'/g, "d.leaveType.code === 'FL'");
content = content.replace(/d\.leaveType\.code === 'SL' \|\| d\.leaveType\.code === 'SICK'/g, "d.leaveType.code === 'SL'");
content = content.replace(/leaveType\.code === 'CL_FULL'/g, "leaveType.code === 'CL'");
content = content.replace(/leaveType\.code === 'OPTIONAL'/g, "leaveType.code === 'FL'");
content = content.replace(/leaveType\.code === 'SL' \|\| leaveType\.code === 'SICK'/g, "leaveType.code === 'SL'");
content = content.replace(/leaveType:\s*\{\s*code:\s*\{\s*in:\s*\['CL_FULL',\s*'SL',\s*'SICK'\]\s*\}\s*\}/g, "leaveType: { code: { in: ['CL', 'SL'] } }");
content = content.replace(/pb\.leaveType\.code === 'CL_FULL'/g, "pb.leaveType.code === 'CL'");

// 2. Fix the CL_HALF checking (since we use data.isHalfDay instead)
content = content.replace(/const hasHalfDay = leaveTypes\.some\(lt => lt\.code === 'CL_HALF'\);/g, "const hasHalfDay = data.isHalfDay;");
content = content.replace(/const hasFullDay = leaveTypes\.some\(lt => lt\.code !== 'CL_HALF'\);/g, "const hasFullDay = !data.isHalfDay;");

// Fix `leaveType.code === 'CL_HALF'`
content = content.replace(/leaveType\.code === 'CL_HALF'/g, "data.isHalfDay");
content = content.replace(/lt\.code === 'CL_HALF'/g, "data.isHalfDay");
content = content.replace(/b\.leaveType\.code === 'CL_HALF'/g, "false");

// 3. MATERNITY check
content = content.replace(/leaveType\.code === 'MATERNITY'/g, "leaveType.code === 'ML'");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed leaves.service.ts');
