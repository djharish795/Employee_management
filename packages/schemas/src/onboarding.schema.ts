import { z } from "zod";

export const initiateOnboardingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  preferredName: z.string().optional(),
  email: z.string().email("Invalid email"),
  department: z.string().min(1, "Department is required"),
  aadhaar: z.string().length(12, "Aadhaar must be 12 digits").optional().or(z.literal("")),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format").optional().or(z.literal("")),
  accountNo: z.string().optional(),
  ifsc: z.string().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional().or(z.literal("")),
  dob: z.string().datetime().optional(),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say", "MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  emergencyName: z.string().optional(),
  emergencyRelation: z.string().optional(),
  emergencyPhone: z.string().optional(),
  location: z.string().optional(),
  joinDate: z.string().datetime().optional(),
  bgvStatus: z.enum(["Pending", "Completed"]).optional(),
  employmentType: z.enum(["Full-time", "Contract", "Intern"]).optional(),
  laptopType: z.string().optional(),
  accessories: z.array(z.string()).optional(),
  software: z.array(z.string()).optional(),
});

export type InitiateOnboardingInput = z.infer<typeof initiateOnboardingSchema>;
