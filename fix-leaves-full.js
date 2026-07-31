const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'apps/api/src/modules/leaves/leaves.service.ts');
let content = fs.readFileSync(targetPath, 'utf8');

const correctBlock = `      if (employee) {
        const joiningDate = employee.joiningDate || employee.createdAt;
        let proratedMonths = 12;
        
        if (joiningDate > policyStart) {
          let missed = (joiningDate.getFullYear() - policyStart.getFullYear()) * 12 + joiningDate.getMonth() - policyStart.getMonth();
          proratedMonths = Math.max(0, 12 - missed);
        }

        const leaveTypes = await this.prisma.leaveType.findMany({
          where: { code: { in: ['CL', 'CL_HALF', 'OPTIONAL', 'WFH', 'LOP', 'ML'] } }
        });
        const newBalances = leaveTypes.map(lt => {
          let allocated = 0;
          if (lt.code === 'CL') allocated = proratedMonths; // 1 per month
          else if (lt.code === 'CL_HALF') allocated = proratedMonths * 0.5;
          else if (lt.code === 'OPTIONAL') allocated = 2; // Fixed 2 per year
          else if (lt.code === 'WFH') allocated = proratedMonths; // 1 per month
          else if (lt.code === 'ML') allocated = 182; // Statutory

          return {
            employeeId,
            leaveTypeId: lt.id,
            year: currentYear,`;

// We'll just replace the broken chunk.
const brokenChunkStart = content.indexOf('allocated,');
const brokenChunkContext = content.substring(content.indexOf('where: { id: employeeId }'), brokenChunkStart);

if (brokenChunkContext.includes('if (employee)')) {
   // The file is not as broken as I thought? Let's just do a clean replace from where: { id: employeeId } to allocated,
}

// Let's just restore the whole method getLeavesKPI safely
const getLeavesKPI_Start = content.indexOf('async getLeavesKPI(employeeId: string)');
const getLeavesKPI_End = content.indexOf('async getApprovals(approverId: string)');

const newMethod = `  async getLeavesKPI(employeeId: string): Promise<any> {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const policyStart = new Date(currentYear, 5, 1); // June 1st

    let balances = await this.prisma.leaveBalance.findMany({
      where: { employeeId, year: currentYear },
      include: { leaveType: true }
    });

    if (balances.length === 0) {
      const employee = await this.prisma.employee.findUnique({
        where: { id: employeeId }
      });
      
      if (employee) {
        const joiningDate = employee.joiningDate || employee.createdAt;
        let proratedMonths = 12;
        
        if (joiningDate > policyStart) {
          let missed = (joiningDate.getFullYear() - policyStart.getFullYear()) * 12 + joiningDate.getMonth() - policyStart.getMonth();
          proratedMonths = Math.max(0, 12 - missed);
        }

        const leaveTypes = await this.prisma.leaveType.findMany({
          where: { code: { in: ['CL', 'CL_HALF', 'OPTIONAL', 'WFH', 'LOP', 'ML'] } }
        });
        const newBalances = leaveTypes.map(lt => {
          let allocated = 0;
          if (lt.code === 'CL') allocated = proratedMonths;
          else if (lt.code === 'CL_HALF') allocated = proratedMonths * 0.5;
          else if (lt.code === 'OPTIONAL') allocated = 2;
          else if (lt.code === 'WFH') allocated = proratedMonths;
          else if (lt.code === 'ML') allocated = 182;

          return {
            employeeId,
            leaveTypeId: lt.id,
            year: currentYear,
            allocated,
            carriedOver: 0,
            used: 0,
            pending: 0
          };
        });
        
        if (newBalances.length > 0) {
          await this.prisma.leaveBalance.createMany({ data: newBalances, skipDuplicates: true });
          balances = await this.prisma.leaveBalance.findMany({
            where: { employeeId, year: currentYear },
            include: { leaveType: true }
          });
        }
      }
    }

    let yearlyTotal = 0;
    let accruedTotal = 0;
    let totalUsed = 0;
    let totalPending = 0;

    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    let activePolicyMonth = currentMonth >= 5 ? currentMonth - 5 + 1 : currentMonth + 7 + 1; // Default
    
    if (employee) {
      const joiningDate = employee.joiningDate || employee.createdAt;
      const now = new Date(currentYear, currentMonth, 1);
      if (joiningDate > policyStart) {
        let diff = (now.getFullYear() - joiningDate.getFullYear()) * 12 + now.getMonth() - joiningDate.getMonth();
        activePolicyMonth = Math.max(1, diff + 1);
      }
    }

    // Calculate how many CL_HALF were used THIS month
    let currentMonthHalfDaysUsed = 0;
    const clHalfType = await this.prisma.leaveType.findUnique({ where: { code: 'CL_HALF' } });
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

    // Handle SL by creating a virtual balance identical to CL
    const clBalance = adjustedBalances.find(b => b.leaveType.code === 'CL');
    if (clBalance) {
      const slType = await this.prisma.leaveType.findUnique({ where: { code: 'SL' } });
      if (slType) {
        adjustedBalances.push({
          id: 'virtual-sl',
          employeeId: employeeId,
          leaveTypeId: slType.id,
          year: currentYear,
          allocated: clBalance.allocated,
          carriedOver: clBalance.carriedOver,
          used: clBalance.used,
          pending: clBalance.pending,
          yearlyAllocated: clBalance.yearlyAllocated,
          leaveType: slType
        } as any);
      }
    }

    adjustedBalances.forEach(b => {
      if (['CL', 'OPTIONAL', 'CL_HALF'].includes(b.leaveType.code)) {
        yearlyTotal += b.yearlyAllocated;
        accruedTotal += b.allocated + b.carriedOver;
        totalUsed += b.used;
        totalPending += b.pending;
      }
    });

    return {
      totalLeaves: yearlyTotal,
      accruedLeaves: accruedTotal,
      usedLeaves: totalUsed,
      pendingLeaves: totalPending,
      availableLeaves: Math.max(0, accruedTotal - totalUsed),
      details: adjustedBalances
    };
  }

`;

content = content.substring(0, getLeavesKPI_Start) + newMethod + content.substring(getLeavesKPI_End);

fs.writeFileSync(targetPath, content);
console.log('Restored getLeavesKPI fully!');
