import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedRoleHierarchy() {
  const allDesignations = await prisma.designation.findMany({
    include: { department: true }
  });

  const designationMap = new Map(allDesignations.map(d => [d.title.toUpperCase(), d]));

  // Define the hierarchy parent -> children
  const hierarchyMap: Record<string, string[]> = {
    "CTO": ["DM", "QM", "SDM"], // Technical top
    "DM": ["SPM"],
    "SPM": ["PM"],
    "PM": ["TL"],
    "TL": ["TR", "TS"],
    "QM": ["QA"],
    "QA": ["QE"],
    "SDM": ["ITM"],
    "ITM": ["ITE"],

    "CFO": ["FM"],
    "FM": ["AC"],

    "COO": ["OM"],
    "OM": ["CEM", "OE", "CRM", "TAM"],

    "CRO": ["HRM"],
    "HRM": ["HRE"],

    "CMO": ["PMM", "PME", "DMM", "DME", "SM", "SE"],
  };

  // Helper to ensure a designation exists
  async function ensureDesignation(title: string, parentId?: string) {
    let desig = designationMap.get(title.toUpperCase());
    if (!desig) {
      // Find or create a generic department for missing roles
      let dept = await prisma.department.findFirst();
      if (!dept) {
        dept = await prisma.department.create({ data: { name: "General", code: "GEN" } });
      }
      desig = await prisma.designation.create({
        data: {
          title,
          departmentId: dept.id,
          reportsToDesignationId: parentId || null
        },
        include: { department: true }
      });
      designationMap.set(title.toUpperCase(), desig);
      console.log(`Created missing designation: ${title}`);
    } else if (parentId) {
      desig = await prisma.designation.update({
        where: { id: desig.id },
        data: { reportsToDesignationId: parentId },
        include: { department: true }
      });
      designationMap.set(title.toUpperCase(), desig);
      console.log(`Updated designation: ${title} to report to parent`);
    }
    return desig;
  }

  // Iterate through the hierarchy and link them
  for (const [parentTitle, childrenTitles] of Object.entries(hierarchyMap)) {
    const parent = await ensureDesignation(parentTitle);
    
    for (const childTitle of childrenTitles) {
      await ensureDesignation(childTitle, parent.id);
    }
  }

  console.log("Role hierarchy seeding complete.");
}

seedRoleHierarchy()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
