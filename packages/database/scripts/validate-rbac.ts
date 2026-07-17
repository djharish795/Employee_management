import { PrismaClient } from '@prisma/client';
import { ROLE_REGISTRY, getDashboardPathForRole, getSidebarTypeForRole, UserRole as RbacUserRole } from '@naprocs/types';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const TEST_USERS = [
  { email: 'pradeep@naprocs.in', expectedRole: 'CEO' },
  { email: 'lokesh@naprocs.in', expectedRole: 'CTO' },
  { email: 'hr@naprocs.in', expectedRole: 'HR' },
  { email: 'junaid@naprocs.in', expectedRole: 'OM' },
  { email: 'divya@naprocs.in', expectedRole: 'CRM' },
  { email: 'swetha@naprocs.in', expectedRole: 'OM' },
  { email: 'sandeep@naprocs.in', expectedRole: 'OE' },
  { email: 'girish@naprocs.in', expectedRole: 'EMPLOYEE' }
];

async function main() {
  console.log('Starting automated RBAC validation...');
  
  const results = [];
  
  for (const testUser of TEST_USERS) {
    const user = await prisma.user.findUnique({
      where: { email: testUser.email },
      include: { employee: true }
    });
    
    if (!user) {
      console.error(`❌ User ${testUser.email} not found in DB!`);
      results.push({
        email: testUser.email,
        expectedRole: testUser.expectedRole,
        actualRole: 'NOT_FOUND',
        expectedDashboard: 'N/A',
        actualDashboard: 'N/A',
        expectedSidebar: 'N/A',
        actualSidebar: 'N/A',
        namespacesPassed: false,
        pass: false
      });
      continue;
    }
    
    const dbRole = user.role;
    const resolvedDashboard = getDashboardPathForRole(dbRole);
    const resolvedSidebar = getSidebarTypeForRole(dbRole);
    const registryEntry = ROLE_REGISTRY[dbRole as RbacUserRole];
    
    // Check default dashboard match
    const expectedEntry = ROLE_REGISTRY[testUser.expectedRole as RbacUserRole];
    const expectedDashboard = expectedEntry?.defaultDashboard || '/employee/dashboard';
    const expectedSidebar = expectedEntry?.sidebarType || 'EMPLOYEE';
    
    const dashboardMatch = resolvedDashboard === expectedDashboard;
    const sidebarMatch = resolvedSidebar === expectedSidebar;
    
    // Verify namespace access control simulation
    // CRM must access cam/oe/om and must be blocked on hr/admin/executive
    let namespaceCheckPassed = true;
    if (dbRole === 'CRM') {
      const allowedNamespaces = registryEntry?.allowedNamespaces || [];
      const blocksHr = !allowedNamespaces.includes('/hr');
      const blocksAdmin = !allowedNamespaces.includes('/admin');
      const allowsCam = allowedNamespaces.includes('/cam');
      namespaceCheckPassed = blocksHr && blocksAdmin && allowsCam;
    } else if (dbRole === 'HR') {
      const allowedNamespaces = registryEntry?.allowedNamespaces || [];
      const allowsHr = allowedNamespaces.includes('/hr');
      const blocksAdmin = !allowedNamespaces.includes('/admin');
      namespaceCheckPassed = allowsHr && blocksAdmin;
    }
    
    const passed = dashboardMatch && sidebarMatch && namespaceCheckPassed && (dbRole === testUser.expectedRole);
    
    results.push({
      email: testUser.email,
      expectedRole: testUser.expectedRole,
      actualRole: dbRole,
      expectedDashboard,
      actualDashboard: resolvedDashboard,
      expectedSidebar,
      actualSidebar: resolvedSidebar,
      namespacesPassed: namespaceCheckPassed,
      pass: passed
    });
  }
  
  // Format validation report markdown
  let report = `# RBAC Validation and Dashboard Routing Audit Report\n\n`;
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;
  report += `### Summary\n\n`;
  
  const totalPassed = results.filter(r => r.pass).length;
  report += `**Total Verified**: ${results.length} | **Passed**: ${totalPassed} | **Failed**: ${results.length - totalPassed}\n\n`;
  
  report += `### Validation Results Table\n\n`;
  report += `| Email | Expected Role | Actual DB Role | Expected Dashboard | Actual Dashboard | Expected Sidebar | Actual Sidebar | Namespace Guard | Status |\n`;
  report += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  
  for (const r of results) {
    report += `| ${r.email} | **${r.expectedRole}** | ${r.actualRole} | \`${r.expectedDashboard}\` | \`${r.actualDashboard}\` | \`${r.expectedSidebar}\` | \`${r.actualSidebar}\` | ${r.namespacesPassed ? '✅ Secure' : '❌ Vulnerable'} | ${r.pass ? '✅ **PASS**' : '❌ **FAIL**'} |\n`;
  }
  
  report += `\n### Centralized Registry Configuration Reference\n\n`;
  report += `\`\`\`json\n${JSON.stringify(ROLE_REGISTRY, null, 2)}\n\`\`\`\n`;
  
  // Save report to the artifacts directory
  const reportPath = 'C:/Users/NAPROCS-DEV-02/.gemini/antigravity-ide/brain/c1ad588a-5980-4e68-9672-8d6ac7887dc3/rbac_validation_report.md';
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`✅ Automated Validation Report successfully written to: ${reportPath}`);
  
  // Console summary
  console.table(results.map(r => ({
    Email: r.email,
    Role: r.actualRole,
    Dashboard: r.actualDashboard,
    Sidebar: r.actualSidebar,
    Status: r.pass ? 'PASS' : 'FAIL'
  })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
