import { PrismaService } from "../../prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";

/**
 * Masks Personally Identifiable Information (PII) for an employee 
 * in compliance with DPDPA 2023 right to erasure, while retaining
 * anonymized statistical data and employment history.
 */
export async function maskEmployeePii(prisma: PrismaService, employeeId: string): Promise<string[]> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    throw new NotFoundException(`Employee with ID ${employeeId} not found`);
  }

  // PII fields to erase
  const piiFields: Record<string, any> = {
    firstName: "ERASED",
    lastName: "USER",
    middleName: null,
    preferredName: null,
    officialEmail: `erased.${employee.id}@naprocs.internal`, // Must be unique still
    personalEmail: null,
    phone: null,
    alternatePhone: null,
    photoUrl: null,
    dateOfBirth: null,
    currentAddress: null,
    permanentAddress: null,
    emergencyContact: null,
    aadhaar: null,
    pan: null,
    passport: null,
    drivingLicence: null,
    voterId: null,
    bankName: null,
    bankBranch: null,
    bankIfsc: null,
    bankAccountEnc: null,
    paymentMode: null,
    documents: [], // Clear documents array
    status: "EXITED", // Force status to EXITED if not already
  };

  const fieldsErased = Object.keys(piiFields);

  await prisma.employee.update({
    where: { id: employeeId },
    data: piiFields,
  });

  return fieldsErased;
}
