import { PrismaClient } from '@prisma/client';

export async function seedKnowledge(prisma: PrismaClient) {
  console.log('Seeding knowledge base...');

  const admin = await prisma.employee.findFirst();

  if (!admin) {
    console.log('No employee found to author knowledge docs. Skipping.');
    return;
  }

  const docs = [
    {
      slug: 'company-leave-policy-2026',
      title: 'Company Leave Policy 2026',
      content: '<h1>Leave Policy</h1><p>Employees are entitled to 12 days of Casual Leave...</p>',
      category: 'POLICY',
      requiresSignature: true,
      version: '1.0',
      isPublished: true,
      publishedAt: new Date(),
      authorId: admin.id
    },
    {
      slug: 'code-of-conduct',
      title: 'Naprocs Code of Conduct',
      content: '<h1>Code of Conduct</h1><p>Be respectful to all colleagues...</p>',
      category: 'POLICY',
      requiresSignature: true,
      version: '2.0',
      isPublished: true,
      publishedAt: new Date(),
      authorId: admin.id
    },
    {
      slug: 'remote-work-guidelines',
      title: 'Remote Work Guidelines',
      content: '<h1>Remote Work</h1><p>WFH is allowed up to 2 days a week...</p>',
      category: 'SOP',
      requiresSignature: false,
      version: '1.0',
      isPublished: true,
      publishedAt: new Date(),
      authorId: admin.id
    }
  ];

  for (const doc of docs) {
    const existing = await (prisma as any).knowledgeDoc.findUnique({ where: { slug: doc.slug } });
    if (!existing) {
      await (prisma as any).knowledgeDoc.create({
        data: doc
      });
    }
  }

  console.log('Knowledge base seeded.');
}
