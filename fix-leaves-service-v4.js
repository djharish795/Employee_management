const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'apps/api/src/modules/leaves/leaves.service.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Map incoming frontend IDs to DB codes BEFORE querying DB
const mapLogic = `
    const mappedIds = data.leaveTypeIds.map((t: string) => 
      t === 'CL_FULL' || t === 'CL_HALF' ? 'CL' : 
      t === 'OPTIONAL' ? 'FL' : 
      t === 'SICK' ? 'SL' : t
    );
    const leaveTypes = await this.prisma.leaveType.findMany({
      where: { code: { in: mappedIds } }
    });
`;
content = content.replace(
  /const leaveTypes = await this\.prisma\.leaveType\.findMany\(\{\s*where: \{ code: \{ in: data\.leaveTypeIds \} \}\s*\}\);/g,
  mapLogic.trim()
);

// 2. Fix hasHalfDay/hasFullDay to rely on payload instead of fake codes
content = content.replace(
  /const hasHalfDay = leaveTypes\.some\(lt => lt\.code === 'CL_HALF'\);/g,
  "const hasHalfDay = data.isHalfDay;"
);
content = content.replace(
  /const hasFullDay = leaveTypes\.some\(lt => lt\.code !== 'CL_HALF'\);/g,
  "const hasFullDay = !data.isHalfDay;"
);

// 3. Replace all string literals that expect the old codes from the DB
content = content.replace(/'CL_FULL'/g, "'CL'");
content = content.replace(/'OPTIONAL'/g, "'FL'");
content = content.replace(/'SICK'/g, "'SL'");
content = content.replace(/'MATERNITY'/g, "'ML'");

// 4. Any remaining 'CL_HALF' checks inside the service are now obsolete because 
//    `lt.code` will be 'CL', but we need to check if it's half day.
//    Instead of checking `lt.code === 'CL_HALF'`, we check `(lt.code === 'CL' && data.isHalfDay)`
//    Wait, in `applyLeave`, it does `if (leaveType.code === 'CL_HALF')`.
//    Since we replaced 'CL_FULL' with 'CL', now both are 'CL'.
//    Only in applyLeave where `data.isHalfDay` exists!
content = content.replace(/leaveType\.code === 'CL_HALF'/g, "(leaveType.code === 'CL' && data.isHalfDay)");
content = content.replace(/lt\.code === 'CL_HALF'/g, "(lt.code === 'CL' && typeof data !== 'undefined' && data.isHalfDay)");
content = content.replace(/b\.leaveType\.code === 'CL_HALF'/g, "false /* half days don't have separate balance */");
content = content.replace(/'CL_HALF'/g, "'CL_HALF_UNUSED'");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed leaves.service.ts v4');
