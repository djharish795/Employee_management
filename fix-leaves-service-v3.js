const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'apps/api/src/modules/leaves/leaves.service.ts');
let content = fs.readFileSync(targetPath, 'utf8');

// We need to inject the currentMonthHalfDaysUsed logic before we map the adjustedBalances.
// Let's find a good spot after activePolicyMonth calculation (around line 102).

const injectionStr = `
    // Calculate how many CL_HALF were used THIS month
    let currentMonthHalfDaysUsed = 0;
    const clHalfType = await this.prisma.leaveType.findUnique({ where: { code: 'CL_HALF' } });
    if (clHalfType) {
      const currentMonthStart = new Date(currentYear, currentMonth, 1);
      const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
      const requests = await this.prisma.leaveRequest.aggregate({
        _sum: { paidDays: true }, // or totalDays
        where: {
          employeeId,
          leaveTypeId: clHalfType.id,
          status: { in: ['APPROVED', 'PENDING'] },
          startDate: { gte: currentMonthStart, lte: currentMonthEnd }
        }
      });
      currentMonthHalfDaysUsed = Number(requests._sum.paidDays || 0);
    }
`;

content = content.replace('const filteredBalances = balances.filter(b => b.leaveType.code !== \'SL\');', injectionStr + '\n    const filteredBalances = balances.filter(b => b.leaveType.code !== \'SL\');');

// Now update the CL_HALF actualAllocated assignment
content = content.replace(
  `} else if (b.leaveType.code === 'CL_HALF') {\n        actualAllocated = activePolicyMonth * 0.5;\n      }`,
  `} else if (b.leaveType.code === 'CL_HALF') {\n        actualAllocated = Number(b.used) + Number(b.pending) + Math.max(0, 0.5 - currentMonthHalfDaysUsed);\n      }`
);

fs.writeFileSync(targetPath, content);
console.log('Fixed CL_HALF logic in leaves.service.ts');
