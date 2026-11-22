import { z } from "zod";

const username = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z0-9_.-]{3,30}$/,
    "must be 3-30 characters: letters, numbers, underscore, dot or hyphen"
  );
const email = z.string().trim().toLowerCase().max(254).email("must be a valid email address");
const fullName = z.string().trim().min(2, "must be at least 2 characters").max(80);
// bcrypt only uses the first 72 bytes, so longer passwords would silently weaken.
const newPassword = z
  .string()
  .min(8, "must be at least 8 characters")
  .max(72, "must be at most 72 characters");

export const registerBody = z.object({ username, email, fullName, password: newPassword });

export const loginBody = z
  .object({
    username: z.string().trim().toLowerCase().min(1).max(254).optional(),
    email: z.string().trim().toLowerCase().min(1).max(254).optional(),
    password: z.string().min(1, "is required").max(128),
  })
  .refine((value) => Boolean(value.username ?? value.email), {
    message: "username or email is required",
    path: ["username"],
  });

export const refreshBody = z.object({ refreshToken: z.string().min(1).max(2048).optional() });

export const changePasswordBody = z
  .object({ oldPassword: z.string().min(1, "is required").max(128), newPassword })
  .refine((value) => value.oldPassword !== value.newPassword, {
    message: "must be different from the current password",
    path: ["newPassword"],
  });

export const updateAccountBody = z
  .object({ fullName: fullName.optional(), email: email.optional() })
  .refine((value) => value.fullName !== undefined || value.email !== undefined, {
    message: "provide fullName and/or email",
  });

export const usernameParams = z.object({ username });
