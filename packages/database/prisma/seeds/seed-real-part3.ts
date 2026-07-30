/**
 * seed-real-part3.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Naprocs Technologies — Part 3: Remaining Modules
 * Courses, Review Cycles, Surveys, Knowledge Base, Jobs, Candidates, Skills
 *
 * Source: UPDATED EMS_NAPROCS TECHNOLOGIES.xlsx
 * Sheets: 09, 10, 11, 12, 14, 15, 16
 *
 * Run AFTER seed-real-part2.ts has completed successfully.
 * Safe to re-run — idempotent where possible.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  PrismaClient,
  LeaveRequestStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║   Naprocs Real Data Seed — Part 3 — Starting...            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // ── Fetch all real employees into a lookup map ──────────────────────────
  const allEmployees = await prisma.employee.findMany({
    select: { id: true, employeeId: true, firstName: true, lastName: true },
  });
  const empMap: Record<string, string> = {}; // employeeId → DB id
  for (const e of allEmployees) empMap[e.employeeId] = e.id;

  const ceoId = empMap['NAP/AR/001'];
  const ctoId = empMap['NAP-002'];
  const hrId = empMap['NAP/HR/001'];
  if (!ceoId || !ctoId || !hrId) throw new Error('Core executives not found in DB');

  // ──────────────────────────────────────────────────────────────────────────
  // 1. COURSES & LEARNING (Sheet 12)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('📚 [1/7] Seeding Courses & Learning...');
  const courses = [
    { title: 'NestJS Fundamentals', category: 'TECHNICAL', provider: 'Internal', hours: 12, internal: true, url: null, desc: 'Intro to NestJS decorators modules and guards.', active: true },
    { title: 'AWS Cloud Practitioner', category: 'TECHNICAL', provider: 'AWS Training', hours: 40, internal: false, url: 'https://aws.amazon.com/training/', desc: 'AWS Certified Cloud Practitioner foundation course.', active: true },
    { title: 'Leadership Essentials for First-Time Managers', category: 'LEADERSHIP', provider: 'Internal', hours: 8, internal: true, url: null, desc: 'Building leadership skills for new managers.', active: true },
    { title: 'POSH Act Compliance Training', category: 'COMPLIANCE', provider: 'Internal', hours: 3, internal: true, url: null, desc: 'Mandatory Prevention of Sexual Harassment training.', active: true },
    { title: 'React Advanced Patterns', category: 'TECHNICAL', provider: 'Udemy', hours: 20, internal: false, url: 'https://www.udemy.com/course/react-advanced/', desc: 'Advanced React hooks patterns and performance optimization.', active: true },
    { title: 'Data Privacy & DPDPA Compliance', category: 'COMPLIANCE', provider: 'Internal', hours: 4, internal: true, url: null, desc: 'India Digital Personal Data Protection Act 2023 compliance.', active: true },
    { title: 'Dental Implant Products Overview', category: 'DOMAIN', provider: 'Internal', hours: 6, internal: true, url: null, desc: 'Product knowledge training for sales and CEM teams.', active: true },
  ];

  for (const c of courses) {
    const ex = await prisma.course.findFirst({ where: { title: c.title } });
    if (!ex) {
      await prisma.course.create({
        data: {
          title: c.title,
          category: c.category as any,
          provider: c.provider,
          durationHours: c.hours,
          isInternal: c.internal,
          courseUrl: c.url,
          description: c.desc,
          isActive: c.active,
        }
      });
    }
  }
  console.log(`   ✓ ${courses.length} courses seeded.`);

  // ──────────────────────────────────────────────────────────────────────────
  // 2. REVIEW CYCLES (Sheet 14)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n📈 [2/7] Seeding Performance Review Cycles...');
  const cycles = [
    { name: 'Q1 FY 2024-25 Review', type: 'QUARTERLY', year: 2024, quarter: 1, start: new Date('2024-07-01'), end: new Date('2024-09-30'), status: 'COMPLETED' },
    { name: 'Q2 FY 2024-25 Review', type: 'QUARTERLY', year: 2024, quarter: 2, start: new Date('2024-10-01'), end: new Date('2024-12-31'), status: 'COMPLETED' },
    { name: 'Q3 FY 2024-25 Review', type: 'QUARTERLY', year: 2025, quarter: 3, start: new Date('2025-01-01'), end: new Date('2025-03-31'), status: 'ACTIVE' },
    { name: 'H1 FY 2024-25 Half Yearly', type: 'HALF_YEARLY', year: 2024, quarter: null, start: new Date('2024-07-01'), end: new Date('2024-12-31'), status: 'COMPLETED' },
    { name: 'Annual Performance Review FY 2024-25', type: 'ANNUAL', year: 2025, quarter: null, start: new Date('2025-04-01'), end: new Date('2025-06-30'), status: 'UPCOMING' },
  ];

  for (const rc of cycles) {
    const ex = await prisma.reviewCycle.findFirst({ where: { name: rc.name } });
    if (!ex) {
      await prisma.reviewCycle.create({
        data: {
          name: rc.name,
          type: rc.type as any,
          year: rc.year,
          quarter: rc.quarter,
          startDate: rc.start,
          endDate: rc.end,
          status: rc.status as any,
        }
      });
    }
  }
  console.log(`   ✓ ${cycles.length} review cycles seeded.`);

  // ──────────────────────────────────────────────────────────────────────────
  // 3. SURVEYS (Sheet 15)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n📋 [3/7] Seeding Employee Surveys...');
  const surveys = [
    { title: 'Monthly Pulse Check — July 2025', type: 'PULSE', audience: 'ALL', anonymous: true, start: new Date('2025-07-01'), end: new Date('2025-07-05'), status: 'DRAFT', q1: 'How satisfied are you with your current role? (1-10)', q2: 'Do you have all tools needed to do your job effectively?' },
    { title: 'Weekly Mood Survey', type: 'MOOD', audience: 'ALL', anonymous: true, start: new Date('2025-07-21'), end: new Date('2025-07-21'), status: 'DRAFT', q1: 'How are you feeling today? (Emoji scale)', q2: 'What is one thing that would make your week better?' },
    { title: 'Onboarding Experience Feedback', type: 'ONBOARDING', audience: 'TEAM', anonymous: false, start: new Date('2025-07-15'), end: new Date('2025-07-20'), status: 'ACTIVE', q1: 'Was your onboarding process smooth and informative?', q2: 'Rate the asset allocation and setup experience (1-5)' },
  ];

  for (const s of surveys) {
    const existing = await prisma.survey.findFirst({ where: { title: s.title } });
    if (!existing) {
      await prisma.survey.create({
        data: {
          title: s.title,
          type: s.type as any,
          targetAudience: s.audience as any,
          isAnonymous: s.anonymous,
          startDate: s.start,
          endDate: s.end,
          status: s.status as any,
          createdById: hrId,
          questions: [
            { order: 1, type: 'TEXT', question: s.q1, isRequired: true },
            { order: 2, type: 'TEXT', question: s.q2, isRequired: true },
          ]
        }
      });
    }
  }
  console.log(`   ✓ ${surveys.length} surveys seeded.`);

  // ──────────────────────────────────────────────────────────────────────────
  // 4. KNOWLEDGE BASE (Sheet 16)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n📖 [4/7] Seeding Knowledge Base Documents...');
  const kbDocs = [
    { title: 'Leave Policy 2024-25', slug: 'leave-policy-2024-25', cat: 'POLICY', ver: '2.0', reqSig: true, pub: true, author: hrId, summary: 'Complete leave policy covering EL SL CL Maternity Paternity LOP with carry-forward conditions and eligibility criteria.' },
    { title: 'Employee Code of Conduct', slug: 'code-of-conduct', cat: 'HR_GUIDELINES', ver: '1.0', reqSig: true, pub: true, author: hrId, summary: 'Professional behavior ethics and workplace conduct standards for all employees.' },
    { title: 'Work From Home Policy', slug: 'wfh-policy', cat: 'POLICY', ver: '1.5', reqSig: false, pub: true, author: hrId, summary: 'WFH request eligibility conditions approval process and guidelines for hybrid work.' },
    { title: 'POSH Policy', slug: 'posh-policy', cat: 'COMPLIANCE', ver: '1.0', reqSig: true, pub: true, author: hrId, summary: 'Prevention of Sexual Harassment policy as per POSH Act 2013. Mandatory for all employees.' },
    { title: 'IT Security Policy', slug: 'it-security-policy', cat: 'POLICY', ver: '1.0', reqSig: true, pub: true, author: ctoId, summary: 'Device usage password policy VPN access and data security guidelines.' },
    { title: 'Onboarding SOP', slug: 'onboarding-sop', cat: 'SOP', ver: '1.0', reqSig: false, pub: true, author: hrId, summary: 'Standard operating procedure for new employee onboarding from Day 0 to Day 30.' },
    { title: 'EMS Architecture Overview', slug: 'ems-architecture-overview', cat: 'ARCHITECTURE', ver: '1.0', reqSig: false, pub: false, author: ctoId, summary: 'Technical architecture documentation for Naprocs EMS platform — internal use only.' },
    { title: 'Data Privacy & DPDPA Guide', slug: 'dpdpa-guide', cat: 'COMPLIANCE', ver: '1.0', reqSig: true, pub: true, author: ctoId, summary: 'DPDPA 2023 compliance guide for all employees handling personal data.' },
  ];

  for (const doc of kbDocs) {
    const ex = await prisma.knowledgeDoc.findFirst({ where: { slug: doc.slug } });
    if (!ex) {
      await prisma.knowledgeDoc.create({
        data: {
          title: doc.title,
          slug: doc.slug,
          category: doc.cat as any,
          version: doc.ver,
          content: doc.summary,
          requiresSignature: doc.reqSig,
          isPublished: doc.pub,
          authorId: doc.author,
        }
      });
    }
  }
  console.log(`   ✓ ${kbDocs.length} knowledge base documents seeded.`);

  // ──────────────────────────────────────────────────────────────────────────
  // 5. JOBS / RECRUITMENT (Sheet 10)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n💼 [5/7] Seeding Open Jobs...');
  const deptDev = await prisma.department.findUnique({ where: { code: 'DEV' } });
  const deptQa = await prisma.department.findUnique({ where: { code: 'QA' } });
  const deptHr = await prisma.department.findUnique({ where: { code: 'HR' } });
  const deptSales = await prisma.department.findUnique({ where: { code: 'SALES' } });

  if (!deptDev || !deptQa || !deptHr || !deptSales) throw new Error('Departments missing for jobs');

  const jobs = [
    { title: 'Senior Software Engineer — Backend', dept: deptDev.id, mgr: ctoId, desc: 'Build high-performance backend microservices using Node.js NestJS PostgreSQL. Strong REST API and AWS skills required.', minExp: 3, maxExp: 6, pos: 2, minCtc: 800000, maxCtc: 1400000, skills: ['Node.js', 'TypeScript', 'PostgreSQL', 'AWS'], targetDate: new Date('2025-02-28'), status: 'OPEN' },
    { title: 'React.js Frontend Developer', dept: deptDev.id, mgr: ctoId, desc: 'Develop responsive frontend apps using React.js TypeScript. Next.js experience preferred.', minExp: 2, maxExp: 5, pos: 1, minCtc: 600000, maxCtc: 1200000, skills: ['React.js', 'TypeScript', 'Next.js'], targetDate: new Date('2025-03-15'), status: 'OPEN' },
    { title: 'QA Engineer', dept: deptQa.id, mgr: ctoId, desc: 'Design and execute test plans. Write automated test cases for web applications.', minExp: 1, maxExp: 4, pos: 1, minCtc: 400000, maxCtc: 800000, skills: ['Selenium', 'Postman', 'Manual Testing'], targetDate: new Date('2025-03-31'), status: 'OPEN' },
    { title: 'HR Executive', dept: deptHr.id, mgr: hrId, desc: 'Support HR operations including onboarding payroll compliance and employee engagement.', minExp: 1, maxExp: 3, pos: 1, minCtc: 350000, maxCtc: 550000, skills: ['HR Policies', 'Communication', 'MS Office'], targetDate: new Date('2025-02-15'), status: 'DRAFT' },
    { title: 'Sales Executive — Dental Distribution', dept: deptSales.id, mgr: ceoId, desc: 'Drive B2B sales of dental implant products to clinics hospitals and distributors.', minExp: 2, maxExp: 5, pos: 3, minCtc: 400000, maxCtc: 700000, skills: ['B2B Sales', 'CRM Tools', 'Dental Industry Knowledge'], targetDate: new Date('2025-04-30'), status: 'OPEN' },
  ];

  const jobIdMap: Record<string, string> = {};
  for (const j of jobs) {
    const created = await prisma.job.create({
      data: {
        title: j.title,
        departmentId: j.dept,
        hiringManagerId: j.mgr,
        jobDescription: j.desc,
        minExperience: j.minExp,
        maxExperience: j.maxExp,
        openPositions: j.pos,
        ctcMin: j.minCtc,
        ctcMax: j.maxCtc,
        requiredSkills: j.skills,
        targetDate: j.targetDate,
        status: j.status as any,
      }
    });
    jobIdMap[j.title] = created.id;
  }
  console.log(`   ✓ ${jobs.length} open jobs seeded.`);

  // ──────────────────────────────────────────────────────────────────────────
  // 6. CANDIDATES (Sheet 11)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n🧑‍💼 [6/7] Seeding Candidates...');
  const candidates = [
    { jobId: jobIdMap['Senior Software Engineer — Backend'], name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', phone: '9988776655', cCtc: 700000, eCtc: 1100000, np: 60, skills: ['Node.js', 'TypeScript', 'PostgreSQL'], source: 'LINKEDIN', stage: 'INTERVIEW' },
    { jobId: jobIdMap['React.js Frontend Developer'], name: 'Priya Nair', email: 'priya.nair@gmail.com', phone: '9876512345', cCtc: 550000, eCtc: 900000, np: 30, skills: ['React.js', 'JavaScript', 'CSS'], source: 'NAUKRI', stage: 'SCREENING' },
    { jobId: jobIdMap['Sales Executive — Dental Distribution'], name: 'Suresh Babu', email: 'suresh.b@gmail.com', phone: '9800123456', cCtc: 420000, eCtc: 600000, np: 30, skills: ['B2B Sales', 'Communication'], source: 'REFERRAL', stage: 'APPLIED' },
    { jobId: jobIdMap['QA Engineer'], name: 'Meera Krishnan', email: 'meera.k@gmail.com', phone: '9765432100', cCtc: 380000, eCtc: 600000, np: 30, skills: ['Selenium', 'Manual Testing'], source: 'NAUKRI', stage: 'APPLIED' },
  ];

  for (const c of candidates) {
    if (c.jobId) {
      const ex = await prisma.candidate.findFirst({ where: { email: c.email } });
      if (!ex) {
        await prisma.candidate.create({
          data: {
            jobId: c.jobId,
            name: c.name,
            email: c.email,
            phone: c.phone,
            currentCTC: c.cCtc,
            expectedCTC: c.eCtc,
            noticePeriod: c.np,
            skills: c.skills,
            sourceChannel: c.source as any,
            currentStage: c.stage as any,
          }
        });
      }
    }
  }
  console.log(`   ✓ ${candidates.length} candidates seeded.`);

  // ──────────────────────────────────────────────────────────────────────────
  // 7. CTO SKILLS MAP (Sheet 09)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n🧠 [7/7] Seeding CTO Skills Map...');
  const skills = await prisma.skill.findMany();
  const getSkillId = (name: string) => skills.find(s => s.name.toLowerCase() === name.toLowerCase())?.id;

  const ctoSkills = [
    { sName: 'TypeScript', prof: 'EXPERT', years: 8, verified: true },
    { sName: 'NestJS', prof: 'EXPERT', years: 5, verified: true },
    { sName: 'AWS', prof: 'ADVANCED', years: 6, verified: true },
    { sName: 'PostgreSQL', prof: 'ADVANCED', years: 6, verified: true },
  ];

  for (const sk of ctoSkills) {
    const sId = getSkillId(sk.sName);
    if (sId) {
      // EmployeeSkill uses a composite unique constraint on employeeId + skillId
      const ex = await prisma.employeeSkill.findFirst({
        where: { employeeId: ctoId, skillId: sId }
      });
      if (!ex) {
        await prisma.employeeSkill.create({
          data: {
            employeeId: ctoId,
            skillId: sId,
            proficiencyLevel: sk.prof as any,
            yearsOfExperience: sk.years,
            isVerified: sk.verified,
          }
        });
      }
    }
  }
  console.log(`   ✓ 4 skills mapped for CTO.`);

  // ── FINAL SUMMARY ─────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║   Naprocs Real Data Seed — Part 3 — COMPLETED ✅           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Seed Part 3 failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
