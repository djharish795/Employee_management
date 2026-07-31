/**
 * seed-real-part2.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Naprocs Technologies — Part 2: Salary Structures + Real Leave Balances
 *                               + Historical Leave Requests
 *
 * Source: UPDATED EMS_NAPROCS TECHNOLOGIES.xlsx — Sheets 04, 21, 22
 *
 * Run AFTER seed-real-data.ts has completed successfully.
 * Safe to re-run — idempotent where possible.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  PrismaClient,
  LeaveRequestStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

// Helper: parse Excel serial date → JS Date at midnight UTC
function excelDateToDate(serial: number): Date {
  return new Date(Math.floor(serial - 25569) * 86400 * 1000);
}

// Helper: parse DD/MM/YYYY string → Date
function parseDMY(str: string): Date {
  const parts = str.trim().split('/');
  const d = parseInt(parts[0]), m = parseInt(parts[1]) - 1, y = parseInt(parts[2]);
  return new Date(Date.UTC(y, m, d));
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║   Naprocs Real Data Seed — Part 2 — Starting...            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // ── Fetch all real employees into a lookup map ──────────────────────────
  const allEmployees = await prisma.employee.findMany({
    select: { id: true, employeeId: true, firstName: true, lastName: true },
  });
  const empMap: Record<string, string> = {}; // employeeId → DB id
  for (const e of allEmployees) empMap[e.employeeId] = e.id;

  // ── CEO is the creator of salary structures ─────────────────────────────
  const ceoId = empMap['NAP/AR/001'];
  if (!ceoId) throw new Error('CEO NAP/AR/001 not found — run seed-real-data.ts first');

  // ──────────────────────────────────────────────────────────────────────────
  // 1. SALARY STRUCTURES (Sheet 04)
  //    - CEO Package   : CTC 54L, Basic 2.25L, HRA 1.125L, Special 1.125L, no PF/ESI
  //    - CTO Package   : CTC 42L, Basic 1.75L, HRA 87.5K, Special 87.5K, no PF/ESI
  //    - HR Manager    : CTC 12L, Basic 50K, HRA 25K, Special 25K, PF yes, no ESI
  //    - SSE           : CTC 9.6L, Basic 40K, HRA 20K, Special 20K, PF yes, no ESI
  //    - Tech Lead     : CTC 14.4L, Basic 60K, HRA 30K, Special 30K, PF yes, no ESI
  //
  //  All other employees (interns/exec) get a standard executive package:
  //    - CTC 2.4L, Basic 10K, HRA 5K, Special 5K, PF TRUE, ESI TRUE (gross ≤ 21K)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('💰 [1/3] Seeding Salary Structures...');

  const effectiveFrom = new Date('2024-04-01');

  type SalaryEntry = {
    employeeId: string;
    ctc: number;
    basic: number;
    hra: number;
    special: number;
    pfEligible: boolean;
    esiEligible: boolean;
    note: string;
  };

  const salaryEntries: SalaryEntry[] = [
    // ── Named / Role-specific salary structures from Sheet 04 ───────────────
    { employeeId: 'NAP/AR/001', ctc: 5400000, basic: 225000, hra: 112500, special: 112500, pfEligible: false, esiEligible: false, note: 'CEO Package — no PF/ESI' },
    { employeeId: 'NAP-002',    ctc: 4200000, basic: 175000, hra:  87500, special:  87500, pfEligible: false, esiEligible: false, note: 'CTO Package' },
    { employeeId: 'NAP/HR/001', ctc: 1200000, basic:  50000, hra:  25000, special:  25000, pfEligible: true,  esiEligible: false, note: 'HR Executive Package' },

    // Senior Software Engineer → Ajay (NAP/TR/001, L2 Senior)
    { employeeId: 'NAP/TR/001', ctc: 960000,  basic:  40000, hra:  20000, special:  20000, pfEligible: true,  esiEligible: false, note: 'Senior Software Engineer' },

    // Tech Lead → Harshitha (NAP/TR/005, L3 Lead)
    { employeeId: 'NAP/TR/005', ctc: 1440000, basic:  60000, hra:  30000, special:  30000, pfEligible: true,  esiEligible: false, note: 'Tech Lead Package' },

    // ── All remaining employees — Standard Executive/Trainee package ─────────
    // Gross = Basic + HRA + Special = 10000 + 5000 + 5000 = 20000 ≤ 21000 → ESI eligible
    { employeeId: 'NAP/TR/002', ctc: 240000, basic: 10000, hra: 5000, special: 5000, pfEligible: true, esiEligible: true, note: 'Standard Trainee Package' },
    { employeeId: 'NAP/TR/003', ctc: 240000, basic: 10000, hra: 5000, special: 5000, pfEligible: true, esiEligible: true, note: 'Standard Trainee Package' },
    { employeeId: 'NAP/TR/004', ctc: 240000, basic: 10000, hra: 5000, special: 5000, pfEligible: true, esiEligible: true, note: 'Standard Trainee Package' },
    { employeeId: 'NAP/TR/006', ctc: 240000, basic: 10000, hra: 5000, special: 5000, pfEligible: true, esiEligible: true, note: 'Standard Trainee Package' },
    { employeeId: 'NAP/TR/007', ctc: 240000, basic: 10000, hra: 5000, special: 5000, pfEligible: true, esiEligible: true, note: 'Standard Trainee Package' },
    { employeeId: 'NAP/TR/008', ctc: 240000, basic: 10000, hra: 5000, special: 5000, pfEligible: true, esiEligible: true, note: 'Standard Trainee Package' },
    { employeeId: 'NAP/TR/009', ctc: 240000, basic: 10000, hra: 5000, special: 5000, pfEligible: true, esiEligible: true, note: 'Standard Trainee Package' },
    { employeeId: 'NAP/TR/010', ctc: 240000, basic: 10000, hra: 5000, special: 5000, pfEligible: true, esiEligible: true, note: 'Standard Trainee Package' },
    { employeeId: 'NAP/TR/011', ctc: 240000, basic: 10000, hra: 5000, special: 5000, pfEligible: true, esiEligible: true, note: 'Standard Trainee Package' },
    { employeeId: 'NAP/TR/012', ctc: 240000, basic: 10000, hra: 5000, special: 5000, pfEligible: true, esiEligible: true, note: 'Standard Trainee Package' },
    { employeeId: 'NAP/TR/013', ctc: 240000, basic: 10000, hra: 5000, special: 5000, pfEligible: true, esiEligible: true, note: 'Standard Trainee Package' },
    { employeeId: 'NAP/TR/014', ctc: 240000, basic: 10000, hra: 5000, special: 5000, pfEligible: true, esiEligible: true, note: 'Standard Trainee Package' },
    { employeeId: 'NAP/TR/015', ctc: 240000, basic: 10000, hra: 5000, special: 5000, pfEligible: true, esiEligible: true, note: 'Standard Trainee Package' },
    { employeeId: 'NAP/TR/016', ctc: 120000, basic:  5000, hra: 2500, special: 2500, pfEligible: false, esiEligible: true, note: 'Intern Stipend' },
    { employeeId: 'NAP/TR/017', ctc: 120000, basic:  5000, hra: 2500, special: 2500, pfEligible: false, esiEligible: true, note: 'Intern Stipend' },
    { employeeId: 'NAP/OR/001', ctc: 240000, basic: 10000, hra: 5000, special: 5000, pfEligible: true, esiEligible: true, note: 'Standard OE Package' },
    { employeeId: 'NAP/OR/002', ctc: 240000, basic: 10000, hra: 5000, special: 5000, pfEligible: true, esiEligible: true, note: 'Standard OE Package' },
    { employeeId: 'NAP/OR/004', ctc: 240000, basic: 10000, hra: 5000, special: 5000, pfEligible: true, esiEligible: true, note: 'Standard CRM Package' },
    { employeeId: 'NAP/DMR/001', ctc: 120000, basic: 5000, hra: 2500, special: 2500, pfEligible: false, esiEligible: true, note: 'Digital Marketing Intern Stipend' },
    { employeeId: 'NAP/DMR/002', ctc: 120000, basic: 5000, hra: 2500, special: 2500, pfEligible: false, esiEligible: true, note: 'Digital Marketing Intern Stipend' },
    { employeeId: 'NAP/DMR/003', ctc: 120000, basic: 5000, hra: 2500, special: 2500, pfEligible: false, esiEligible: true, note: 'Digital Marketing Intern Stipend' },
  ];

  let salaryCount = 0;
  for (const s of salaryEntries) {
    const dbId = empMap[s.employeeId];
    if (!dbId) {
      console.warn(`   ⚠️  Skipping salary for ${s.employeeId} — not found in DB`);
      continue;
    }

    // Check if a salary structure already exists for this employee on this effectiveFrom date
    const existing = await prisma.salaryStructure.findFirst({
      where: { employeeId: dbId, effectiveFrom },
    });

    if (existing) {
      await prisma.salaryStructure.update({
        where: { id: existing.id },
        data: {
          ctc: s.ctc,
          basicSalary: s.basic,
          hra: s.hra,
          specialAllowance: s.special,
          pfEligible: s.pfEligible,
          esiEligible: s.esiEligible,
        },
      });
    } else {
      await prisma.salaryStructure.create({
        data: {
          employeeId: dbId,
          createdById: ceoId,
          effectiveFrom,
          ctc: s.ctc,
          basicSalary: s.basic,
          hra: s.hra,
          specialAllowance: s.special,
          pfEligible: s.pfEligible,
          esiEligible: s.esiEligible,
        },
      });
    }

    console.log(`   ✓ ${s.employeeId} — CTC ₹${(s.ctc / 100000).toFixed(1)}L [${s.note}]`);
    salaryCount++;
  }
  console.log(`   ✓ ${salaryCount} salary structures seeded.\n`);

  // ──────────────────────────────────────────────────────────────────────────
  // 2. REAL LEAVE BALANCES (Sheet 21)
  //    Update existing 2026 CL and FL balances with actual used + carriedOver
  //    values from the Excel. Year in Excel = "2026-2027" fiscal → DB year 2026.
  // ──────────────────────────────────────────────────────────────────────────
  console.log('📊 [2/3] Updating Real Leave Balances from Sheet 21...');

  // Fetch CL and OPTIONAL leave type IDs
  const clType = await prisma.leaveType.findUnique({ where: { code: 'CL' } });
  const optType = await prisma.leaveType.findUnique({ where: { code: 'OPTIONAL' } });
  if (!clType || !optType) throw new Error('CL or OPTIONAL leave type not found');

  type LeaveBalanceEntry = {
    empId: string;         // employee real ID (NAP/...)
    clUsed: number;
    flUsed: number;
    clCarry: number;
    flCarry: number;
  };

  // Data extracted exactly from Sheet 21 rows 3-27
  const leaveBalanceData: LeaveBalanceEntry[] = [
    { empId: 'NAP/TR/001', clUsed: 2,   flUsed: 0, clCarry: 10, flCarry: 2 },
    { empId: 'NAP/TR/002', clUsed: 1,   flUsed: 0, clCarry: 11, flCarry: 2 },
    { empId: 'NAP/TR/003', clUsed: 1,   flUsed: 0, clCarry: 11, flCarry: 2 },
    { empId: 'NAP/TR/004', clUsed: 1,   flUsed: 1, clCarry: 11, flCarry: 1 },
    { empId: 'NAP/TR/005', clUsed: 1,   flUsed: 0, clCarry: 11, flCarry: 2 },
    { empId: 'NAP/TR/006', clUsed: 0,   flUsed: 0, clCarry: 12, flCarry: 2 },
    { empId: 'NAP/TR/007', clUsed: 1,   flUsed: 0, clCarry: 11, flCarry: 2 },
    { empId: 'NAP/TR/008', clUsed: 1,   flUsed: 0, clCarry: 11, flCarry: 2 },
    { empId: 'NAP/TR/009', clUsed: 1,   flUsed: 0, clCarry: 11, flCarry: 2 },
    { empId: 'NAP/TR/010', clUsed: 2,   flUsed: 0, clCarry: 10, flCarry: 2 },
    { empId: 'NAP/TR/011', clUsed: 2,   flUsed: 0, clCarry: 10, flCarry: 2 },
    { empId: 'NAP/TR/012', clUsed: 2,   flUsed: 1, clCarry: 10, flCarry: 1 },
    { empId: 'NAP/TR/013', clUsed: 0,   flUsed: 0, clCarry: 12, flCarry: 2 },
    // NAP/TR/014 mapped to "Tulasi Krishna" (Row 16, Sai Muneesh in excel = wrong name, but real ID NAP/TR/015)
    { empId: 'NAP/TR/014', clUsed: 1,   flUsed: 0, clCarry: 11, flCarry: 2 },
    { empId: 'NAP/TR/015', clUsed: 0,   flUsed: 0, clCarry: 12, flCarry: 2 },
    { empId: 'NAP/TR/016', clUsed: 2,   flUsed: 0, clCarry: 10, flCarry: 2 }, // Charani
    { empId: 'NAP/TR/017', clUsed: 0,   flUsed: 0, clCarry: 0,  flCarry: 0 }, // Harsha Vardhan
    { empId: 'NAP/OR/001', clUsed: 2,   flUsed: 0, clCarry: 10, flCarry: 2 },
    { empId: 'NAP/OR/002', clUsed: 2,   flUsed: 0, clCarry: 10, flCarry: 2 },
    { empId: 'NAP/OR/004', clUsed: 1,   flUsed: 1, clCarry: 1,  flCarry: 1 },
    { empId: 'NAP/HR/001', clUsed: 2,   flUsed: 0, clCarry: 10, flCarry: 1 },
    { empId: 'NAP/AR/001', clUsed: 0,   flUsed: 0, clCarry: 0,  flCarry: 0 },
    { empId: 'NAP/DMR/001', clUsed: 2,  flUsed: 0, clCarry: 10, flCarry: 1 },
    { empId: 'NAP/DMR/002', clUsed: 1,  flUsed: 0, clCarry: 11, flCarry: 2 },
    { empId: 'NAP/DMR/003', clUsed: 1,  flUsed: 0, clCarry: 11, flCarry: 2 },
  ];

  let balanceCount = 0;
  for (const b of leaveBalanceData) {
    const dbId = empMap[b.empId];
    if (!dbId) { console.warn(`   ⚠️  Employee ${b.empId} not found`); continue; }

    // Update CL balance
    await prisma.leaveBalance.upsert({
      where: { employeeId_leaveTypeId_year: { employeeId: dbId, leaveTypeId: clType.id, year: 2026 } },
      update: { allocated: 12, used: b.clUsed, carriedOver: b.clCarry, pending: 0 },
      create: { employeeId: dbId, leaveTypeId: clType.id, year: 2026, allocated: 12, used: b.clUsed, carriedOver: b.clCarry, pending: 0 },
    });

    // Update OPTIONAL balance
    await prisma.leaveBalance.upsert({
      where: { employeeId_leaveTypeId_year: { employeeId: dbId, leaveTypeId: optType.id, year: 2026 } },
      update: { allocated: 2, used: b.flUsed, carriedOver: b.flCarry, pending: 0 },
      create: { employeeId: dbId, leaveTypeId: optType.id, year: 2026, allocated: 2, used: b.flUsed, carriedOver: b.flCarry, pending: 0 },
    });

    console.log(`   ✓ ${b.empId} — CL used:${b.clUsed} carry:${b.clCarry} | OPTIONAL used:${b.flUsed} carry:${b.flCarry}`);
    balanceCount++;
  }
  console.log(`   ✓ ${balanceCount} employees' leave balances updated.\n`);

  // ──────────────────────────────────────────────────────────────────────────
  // 3. HISTORICAL LEAVE REQUESTS (Sheet 22)
  //    All seeded as APPROVED (historical records).
  //    approverId = CEO (Pradeep, NAP/AR/001) — he approved all.
  //    Only rows with actual dates and APPROVED status are included.
  // ──────────────────────────────────────────────────────────────────────────
  console.log('📋 [3/3] Seeding Historical Leave Requests from Sheet 22...');

  // Fetch required leave type IDs
  const ltMap: Record<string, string> = {};
  const allLtypes = await prisma.leaveType.findMany({ select: { id: true, code: true } });
  for (const lt of allLtypes) ltMap[lt.code] = lt.id;

  const approver = ceoId; // CEO approved all

  type LeaveRequestSeed = {
    empId: string;
    ltCode: string;        // EL / SL / CL / FL / BL / PL
    startDate: Date;
    endDate: Date;
    totalDays: number;
    isHalfDay: boolean;
    halfDaySession?: string;
    isEmergency: boolean;
    reason: string;
    appliedAt: Date;
  };

  // Parsed from Sheet 22 rows 3-41 (only rows with Approved status + real dates)
  // For multi-date entries, we use the first date as startDate and last as endDate.
  const leaveRequests: LeaveRequestSeed[] = [
    // ── June 2026 batch ──────────────────────────────────────────────────────
    {
      empId: 'NAP/TR/001', ltCode: 'CL',
      startDate: parseDMY('15/06/2026'), endDate: parseDMY('15/06/2026'),
      totalDays: 1, isHalfDay: false, isEmergency: true,
      reason: 'Personal Leave', appliedAt: parseDMY('15/06/2026'),
    },
    {
      empId: 'NAP/TR/002', ltCode: 'CL',
      startDate: parseDMY('15/06/2026'), endDate: parseDMY('16/06/2026'),
      totalDays: 2, isHalfDay: false, isEmergency: true,
      reason: 'Personal Leave', appliedAt: parseDMY('14/06/2026'),
    },
    {
      empId: 'NAP/TR/003', ltCode: 'CL',
      startDate: parseDMY('24/06/2026'), endDate: parseDMY('24/06/2026'),
      totalDays: 1, isHalfDay: false, isEmergency: true,
      reason: 'Personal Leave', appliedAt: parseDMY('23/06/2026'),
    },
    {
      empId: 'NAP/TR/005', ltCode: 'CL',
      startDate: parseDMY('22/06/2026'), endDate: parseDMY('22/06/2026'),
      totalDays: 1, isHalfDay: false, isEmergency: true,
      reason: 'Personal Leave', appliedAt: parseDMY('21/06/2026'),
    },
    {
      empId: 'NAP/TR/007', ltCode: 'CL',
      startDate: parseDMY('13/06/2026'), endDate: parseDMY('13/06/2026'),
      totalDays: 1, isHalfDay: false, isEmergency: true,
      reason: 'Personal Leave', appliedAt: parseDMY('12/06/2026'),
    },
    {
      empId: 'NAP/TR/008', ltCode: 'CL',
      startDate: parseDMY('22/06/2026'), endDate: parseDMY('22/06/2026'),
      totalDays: 1, isHalfDay: false, isEmergency: true,
      reason: 'Personal Leave (Half Day)', appliedAt: parseDMY('21/06/2026'),
    },
    {
      empId: 'NAP/TR/009', ltCode: 'CL',
      startDate: parseDMY('17/06/2026'), endDate: parseDMY('17/06/2026'),
      totalDays: 1, isHalfDay: false, isEmergency: true,
      reason: 'Personal Leave', appliedAt: parseDMY('16/06/2026'),
    },
    {
      // Pavani — Passport verification (3 days: 8/6, 26/6, 27/6)
      empId: 'NAP/TR/010', ltCode: 'CL',
      startDate: parseDMY('08/06/2026'), endDate: parseDMY('27/06/2026'),
      totalDays: 3, isHalfDay: false, isEmergency: true,
      reason: 'Passport Verification', appliedAt: parseDMY('07/06/2026'),
    },
    {
      empId: 'NAP/TR/012', ltCode: 'CL',
      startDate: parseDMY('13/06/2026'), endDate: parseDMY('13/06/2026'),
      totalDays: 1, isHalfDay: false, isEmergency: true,
      reason: 'Personal Leave', appliedAt: parseDMY('12/06/2026'),
    },
    {
      // Charani — no employee ID in sheet, maps to NAP/TR/016
      empId: 'NAP/TR/016', ltCode: 'CL',
      startDate: parseDMY('15/06/2026'), endDate: parseDMY('16/06/2026'),
      totalDays: 2, isHalfDay: false, isEmergency: true,
      reason: 'Personal Leave', appliedAt: parseDMY('14/06/2026'),
    },
    {
      // Sandeep — 9/6, 10/6, 25/6 = 3 days
      empId: 'NAP/OR/001', ltCode: 'CL',
      startDate: parseDMY('09/06/2026'), endDate: parseDMY('25/06/2026'),
      totalDays: 3, isHalfDay: false, isEmergency: true,
      reason: 'Personal Leave', appliedAt: parseDMY('08/06/2026'),
    },
    {
      // Sandya — 15/6 + 17/6 = 1.5 days (half day afternoon on 17/6)
      empId: 'NAP/OR/002', ltCode: 'CL',
      startDate: parseDMY('15/06/2026'), endDate: parseDMY('17/06/2026'),
      totalDays: 1.5, isHalfDay: true, halfDaySession: 'AFTERNOON', isEmergency: true,
      reason: 'Personal Leave', appliedAt: parseDMY('15/06/2026'),
    },
    {
      // Prince — Sick Leave (SL), 17/6
      empId: 'NAP/HR/001', ltCode: 'SL',
      startDate: parseDMY('17/06/2026'), endDate: parseDMY('17/06/2026'),
      totalDays: 1, isHalfDay: false, isEmergency: true,
      reason: 'Sick Leave', appliedAt: parseDMY('16/06/2026'),
    },

    // ── July 2026 batch ───────────────────────────────────────────────────────
    {
      // Ajay — Emergency leave 7/7-10/7, 13/7, 4.5 days (half day afternoon)
      empId: 'NAP/TR/001', ltCode: 'CL',
      startDate: parseDMY('06/07/2026'), endDate: parseDMY('13/07/2026'),
      totalDays: 4.5, isHalfDay: true, halfDaySession: 'AFTERNOON', isEmergency: true,
      reason: 'Emergency Leave', appliedAt: excelDateToDate(46149),
    },
    {
      // Varsha — Personal + optional leave, 13/7 + 17/7 = 1.5 days
      empId: 'NAP/TR/004', ltCode: 'CL',
      startDate: parseDMY('13/07/2026'), endDate: parseDMY('17/07/2026'),
      totalDays: 1.5, isHalfDay: true, halfDaySession: 'AFTERNOON', isEmergency: true,
      reason: 'Personal Leave / Optional Leave', appliedAt: parseDMY('12/07/2026'),
    },
    {
      // Sumanth — half day morning 29/06 (Excel serial 46210)
      empId: 'NAP/TR/008', ltCode: 'CL',
      startDate: excelDateToDate(46210), endDate: excelDateToDate(46210),
      totalDays: 0.5, isHalfDay: true, halfDaySession: 'MORNING', isEmergency: true,
      reason: 'Personal Leave', appliedAt: excelDateToDate(46180),
    },
    {
      // Pavani — Personal Leave 15/7
      empId: 'NAP/TR/010', ltCode: 'CL',
      startDate: parseDMY('15/07/2026'), endDate: parseDMY('15/07/2026'),
      totalDays: 1, isHalfDay: false, isEmergency: true,
      reason: 'Personal Leave', appliedAt: parseDMY('14/07/2026'),
    },
    {
      // Kumar Sai — Optional (HBDY) + Personal + CL: 2/7-3/7 & 13/7 = 2.5 days
      empId: 'NAP/TR/012', ltCode: 'CL',
      startDate: parseDMY('02/07/2026'), endDate: parseDMY('13/07/2026'),
      totalDays: 2.5, isHalfDay: true, halfDaySession: 'AFTERNOON', isEmergency: false,
      reason: 'Optional Leave (Birthday) + Personal Leave + CL', appliedAt: excelDateToDate(46029),
    },
    {
      // Tulasi Krishna — Personal leave 28/7-31/7 = 3.5 days (NAP/TR/015)
      empId: 'NAP/TR/015', ltCode: 'CL',
      startDate: parseDMY('28/07/2026'), endDate: parseDMY('31/07/2026'),
      totalDays: 3.5, isHalfDay: true, halfDaySession: 'AFTERNOON', isEmergency: true,
      reason: 'Personal Leave', appliedAt: parseDMY('28/07/2026'),
    },
    {
      // Sandeep — Emergency + Personal, 8/7 + 14/7 = 1.5 days
      empId: 'NAP/OR/001', ltCode: 'CL',
      startDate: parseDMY('08/07/2026'), endDate: parseDMY('14/07/2026'),
      totalDays: 1.5, isHalfDay: true, halfDaySession: 'AFTERNOON', isEmergency: true,
      reason: 'Emergency Leave + Personal Leave', appliedAt: parseDMY('07/07/2026'),
    },
    {
      // Sandya — Personal Leave 14/7
      empId: 'NAP/OR/002', ltCode: 'CL',
      startDate: parseDMY('14/07/2026'), endDate: parseDMY('14/07/2026'),
      totalDays: 1, isHalfDay: false, isEmergency: true,
      reason: 'Personal Leave', appliedAt: excelDateToDate(46363),
    },
    {
      // Swetha — Optional (Birthday) + Sick Leave: 28/7 (FL) + 29/7 (SL) = 2 days
      empId: 'NAP/OR/004', ltCode: 'FL',
      startDate: parseDMY('28/07/2026'), endDate: parseDMY('28/07/2026'),
      totalDays: 1, isHalfDay: false, isEmergency: true,
      reason: 'Optional Leave (Birthday)', appliedAt: parseDMY('28/07/2026'),
    },
    {
      empId: 'NAP/OR/004', ltCode: 'SL',
      startDate: parseDMY('29/07/2026'), endDate: parseDMY('29/07/2026'),
      totalDays: 1, isHalfDay: false, isEmergency: false,
      reason: 'Sick Leave', appliedAt: parseDMY('28/07/2026'),
    },
    {
      // Prince — Emergency Leave (Bereavement), 30/6 (Excel serial 46180)
      empId: 'NAP/HR/001', ltCode: 'BL',
      startDate: excelDateToDate(46180), endDate: excelDateToDate(46180),
      totalDays: 1, isHalfDay: false, isEmergency: true,
      reason: 'Bereavement Leave', appliedAt: excelDateToDate(46180),
    },
  ];

  let leaveReqCount = 0;
  for (const lr of leaveRequests) {
    const empDbId = empMap[lr.empId];
    const ltId = ltMap[lr.ltCode];
    if (!empDbId) { console.warn(`   ⚠️  Skip leave req: ${lr.empId} not found`); continue; }
    if (!ltId)    { console.warn(`   ⚠️  Skip leave req: ${lr.ltCode} not found`); continue; }

    // Create (don't skip duplicates — these are historical records)
    const created = await prisma.leaveRequest.create({
      data: {
        employeeId: empDbId,
        leaveTypeId: ltId,
        startDate: lr.startDate,
        endDate: lr.endDate,
        totalDays: lr.totalDays,
        isHalfDay: lr.isHalfDay,
        halfDaySession: lr.halfDaySession ?? null,
        isEmergency: lr.isEmergency,
        reason: lr.reason,
        status: LeaveRequestStatus.APPROVED,
        approverId: approver,
        approvedAt: lr.appliedAt,
        appliedAt: lr.appliedAt,
        paidDays: lr.totalDays,
        unpaidDays: 0,
      },
    });

    console.log(`   ✓ ${lr.empId} — ${lr.ltCode} ${lr.startDate.toISOString().slice(0, 10)} (${lr.totalDays}d) APPROVED`);
    leaveReqCount++;
  }
  console.log(`   ✓ ${leaveReqCount} historical leave requests seeded.\n`);

  // ── FINAL SUMMARY ─────────────────────────────────────────────────────────
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   Naprocs Real Data Seed — Part 2 — COMPLETED ✅           ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  Salary Structures   : 26 (CEO/CTO/HR/SSE/TL + all others) ║');
  console.log('║  Leave Balances (CL/FL): 25 employees updated with real     ║');
  console.log('║                          used/carried-over values           ║');
  console.log('║  Leave Requests (APPROVED): historical June-July 2026       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Seed Part 2 failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
