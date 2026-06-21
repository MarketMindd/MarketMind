import { z } from 'zod';
import { RiskTolerance } from '../enums/risk-tolerance';
import { SectorInterest } from '../enums/sector-interest';

export const userProfileSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  fullName: z.string(),
  riskTolerance: z.enum(RiskTolerance),
  interests: z.array(z.enum(SectorInterest)),
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

export const googleTokensSchema = z.object({
  id_token: z.string(),
});

export const googleSignInPayloadSchema = z.object({
  authCode: z.string(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type SignUpPayload = z.infer<typeof signUpPayloadSchema>;
export type SignInPayload = z.infer<typeof signInPayloadSchema>;
export type GoogleSignInPayload = z.infer<typeof googleSignInPayloadSchema>;

export const updateProfileSchema = z.object({
  riskTolerance: z.enum(RiskTolerance).optional(),
  interests: z.array(z.enum(SectorInterest)).optional(),
});
export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>;

export const authResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: userProfileSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type OAuthResponse = Omit<AuthResponse, 'user'> & {
  user: UserProfile & { isNewUser: boolean };
};
