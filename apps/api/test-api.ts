import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
const prisma = new PrismaClient();

async function run() {
  try {
    const tl = await prisma.employee.findFirst({
      where: { designation: { title: 'Team Lead' } }
    });
    
    if (!tl) {
      console.log('No TL found');
      return;
    }
    
    const user = await prisma.user.findUnique({
      where: { employeeId: tl.id }
    });
    
    const token = jwt.sign({
      sub: user.id,
      email: user.email,
      role: 'TEAM_LEAD',
      employeeId: tl.id
    }, process.env.JWT_SECRET || 'naprocs-secret-key-2024');
    
    const body = JSON.stringify({
      title: 'Debug Task',
      description: 'Testing if it hangs',
      type: 'TASK',
      priority: 'MEDIUM',
    });

    const res = await fetch('http://localhost:3001/api/v1/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body
    });
    
    const text = await res.text();
    console.log('STATUS:', res.status);
    console.log('RESPONSE:', text);

  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
