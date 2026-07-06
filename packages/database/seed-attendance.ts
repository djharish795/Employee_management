import { PrismaClient, AttendanceStatus, CheckInMethod, LeaveRequestStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting attendance seeding...");

  // Get all employees
  const employees = await prisma.employee.findMany();
  if (employees.length === 0) {
    console.log("No employees found. Run employee seed first.");
    return;
  }

  // Get a leave type for LeaveRequests
  let leaveType = await prisma.leaveType.findFirst();
  if (!leaveType) {
    leaveType = await prisma.leaveType.create({
      data: {
        code: 'CL',
        name: 'Casual Leave',
        maxDaysPerYear: 12,
      }
    });
  }

  // Define date ranges
  const today = new Date();
  today.setHours(5, 30, 0, 0); // Start of day in IST

  const datesToSeed: Date[] = [];
  for (let i = 0; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // Skip weekends for general attendance
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      datesToSeed.push(d);
    }
  }

  console.log(`Seeding attendance for ${datesToSeed.length} days for ${employees.length} employees...`);

  // Clear existing attendance and leaves (optional, but good for clean slate)
  await prisma.attendanceRecord.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  
  let attendanceCount = 0;
  let leaveCount = 0;

  for (const date of datesToSeed) {
    const isToday = date.getTime() === today.getTime();

    for (const emp of employees) {
      const rand = Math.random();
      
      if (rand < 0.05) {
        // 5% chance of being on leave
        await prisma.attendanceRecord.create({
          data: {
            employeeId: emp.id,
            date: date,
            status: AttendanceStatus.ON_LEAVE,
          }
        });
        
        // Create leave request
        await prisma.leaveRequest.create({
          data: {
            employeeId: emp.id,
            leaveTypeId: leaveType.id,
            startDate: date,
            endDate: date,
            status: LeaveRequestStatus.APPROVED,
            reason: "Personal work",
            totalDays: 1,
            appliedAt: date,
          }
        });
        
        attendanceCount++;
        leaveCount++;
        
      } else if (rand < 0.10) {
        // 5% chance of absent
        await prisma.attendanceRecord.create({
          data: {
            employeeId: emp.id,
            date: date,
            status: AttendanceStatus.ABSENT,
          }
        });
        attendanceCount++;
      } else {
        // Present
        const checkInTime = new Date(date);
        // Random check-in between 9:00 AM and 10:30 AM
        // Late arrival is usually after 10:00 AM
        const hour = 9 + Math.floor(Math.random() * 2);
        const minute = Math.floor(Math.random() * 60);
        checkInTime.setHours(hour, minute, 0, 0);

        let checkOutTime: Date | null = new Date(date);
        if (isToday) {
           // For today, some might not have checked out yet
           if (Math.random() > 0.5) {
             checkOutTime = null;
           } else {
             checkOutTime.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
           }
        } else {
           // Past days must have checkout, maybe a few missing for exceptions
           if (Math.random() < 0.05) {
             checkOutTime = null; // Exception (missing checkout)
           } else {
             checkOutTime.setHours(17 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0, 0);
           }
        }
        
        const workHours = checkOutTime ? (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60) : null;

        await prisma.attendanceRecord.create({
          data: {
            employeeId: emp.id,
            date: date,
            status: AttendanceStatus.PRESENT,
            checkInTime,
            checkOutTime,
            checkInMethod: CheckInMethod.WEB,
            workHours: workHours ? parseFloat(workHours.toFixed(2)) : null,
          }
        });
        attendanceCount++;
      }
    }
  }

  console.log(`✅ Successfully seeded ${attendanceCount} attendance records.`);
  console.log(`✅ Successfully seeded ${leaveCount} leave requests.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
