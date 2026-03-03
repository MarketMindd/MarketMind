import { z } from 'zod';

export const userProfileSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  fullName: z.string(),
});

export const signUpPayloadSchema = z.object({
  email: z.email('Invalid email address'),
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .regex(/^[a-zA-Z\s]*$/, 'Full name cannot contain numbers'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signInPayloadSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type SignUpPayload = z.infer<typeof signUpPayloadSchema>;
export type SignInPayload = z.infer<typeof signInPayloadSchema>;

// an object returned by auth endpoints with both the profile and a JWT
export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: userProfileSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;
