const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'apps/api/src/modules/leaves/leaves.service.ts');
let content = fs.readFileSync(filePath, 'utf8');

// First, inject mapping before finding leave types
const mapLogic = `
    const mappedIds = data.leaveTypeIds.map((t: string) => t === 'CL_FULL' || t === 'CL_HALF' ? 'CL' : t === 'OPTIONAL' ? 'FL' : t === 'SICK' ? 'SL' : t);
    const leaveTypes = await this.prisma.leaveType.findMany({
      where: { code: { in: mappedIds } }
    });
`;
content = content.replace(
  /const leaveTypes = await this\.prisma\.leaveType\.findMany\(\{\s*where: \{ code: \{ in: data\.leaveTypeIds \} \}\s*\}\);/,
  mapLogic.trim()
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed leaveTypeIds mapping');
