import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const mfaVerifySchema = z.object({
  code: z.string().min(6).max(6),
  challengeId: z.string().uuid(),
});

export const trustDeviceSchema = z.object({
  challengeId: z.string().uuid(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type MfaVerifyInput = z.infer<typeof mfaVerifySchema>;
