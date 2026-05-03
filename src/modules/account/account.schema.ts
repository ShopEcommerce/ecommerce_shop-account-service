import { z } from 'zod';

// --- PROFILE SCHEMAS ---
export const updateProfileSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').optional(),
    fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
    avatarUrl: z.string().url('Invalid URL format').optional(),
    phone: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Invalid Vietnamese phone number').optional(),
  }),
});

// --- ADDRESS SCHEMAS ---
export const createAddressSchema = z.object({
  body: z.object({
    receiverName: z.string({ error: 'Receiver name is required' }).min(2),
    receiverPhone: z.string({ error: 'Receiver phone is required' }).regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Invalid phone number'),
    street: z.string({ error: 'Street is required' }).min(5),
    ward: z.string({ error: 'Ward is required' }),
    district: z.string({ error: 'District is required' }),
    city: z.string({ error: 'City is required' }),
    isDefault: z.boolean().optional().default(false),
    type: z.enum(['HOME', 'OFFICE', 'OTHER']).optional().default('HOME'),
  }),
});

export const updateAddressSchema = z.object({
  body: createAddressSchema.shape.body.partial(), 
});

// Export types cho Controller
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type CreateAddressInput = z.infer<typeof createAddressSchema>['body'];
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>['body'];