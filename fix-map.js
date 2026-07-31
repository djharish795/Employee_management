const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'apps/api/src/modules/leaves/leaves.service.ts');
let content = fs.readFileSync(targetPath, 'utf8');

// Find the index of currentMonthHalfDaysUsed logic
const startIndex = content.indexOf('const clHalfType = await this.prisma.leaveType.findUnique({ where: { code: \'CL_HALF\' } });');

// Find the end of the map function (where it pushes virtual SL)
const endIndex = content.indexOf('// Handle SL by creating a virtual balance identical to CL');

if (startIndex === -1 || endIndex === -1) {
  console.log('Could not find injection points');
  process.exit(1);
}

const replacement = `const clHalfType = await this.prisma.leaveType.findUnique({ where: { code: 'CL_HALF' } });
    if (clHalfType) {
      const currentMonthStart = new Date(currentYear, currentMonth, 1);
      const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
      const requests = await this.prisma.leaveRequest.aggregate({
        _sum: { paidDays: true },
        where: {
          employeeId,
          leaveTypeId: clHalfType.id,
          status: { in: ['APPROVED', 'PENDING'] },
          startDate: { gte: currentMonthStart, lte: currentMonthEnd }
        }
      });
      currentMonthHalfDaysUsed = Number(requests._sum.paidDays || 0);
    }

    const filteredBalances = balances.filter(b => b.leaveType.code !== 'SL');

    const adjustedBalances = filteredBalances.map(b => {
      let actualAllocated = Number(b.allocated);

      if (b.leaveType.code === 'CL') {
        actualAllocated = Math.min(Number(b.allocated), activePolicyMonth);
      } else if (b.leaveType.code === 'CL_HALF') {
        // Enforce strict non-cumulative monthly 0.5 day logic
        actualAllocated = Number(b.used) + Number(b.pending) + Math.max(0, 0.5 - currentMonthHalfDaysUsed);
      } else if (b.leaveType.code === 'WFH') {
        actualAllocated = activePolicyMonth;
      }

      let staticYearly = Number(b.leaveType.maxDaysPerYear || 0);

      return {
        ...b,
        yearlyAllocated: staticYearly, 
        allocated: actualAllocated,
        carriedOver: Number(b.carriedOver),
        used: Number(b.used),
        pending: Number(b.pending)
      };
    });

    `;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);

fs.writeFileSync(targetPath, newContent);
console.log('Restored map function!');
