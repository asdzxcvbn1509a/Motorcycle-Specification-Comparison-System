import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const MOTORCYCLE_TYPES = ['Sport', 'Naked', 'Adventure', 'Touring', 'Cruiser', 'Scooter'];

export const motorcycleSchema = z.object({
  brand: z.string().min(1).max(50),
  model: z.string().min(1).max(100),
  year: z.coerce.number().int().min(1900).max(2100),
  type: z.enum(MOTORCYCLE_TYPES),
  price: z.coerce.number().nonnegative(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),

  engineCc: z.coerce.number().int().positive(),
  engineType: z.string().max(100).optional().nullable().or(z.literal('')),
  horsepower: z.coerce.number().nonnegative().optional().nullable(),
  torque: z.coerce.number().nonnegative().optional().nullable(),
  transmission: z.string().max(50).optional().nullable().or(z.literal('')),

  frontBrake: z.string().max(100).optional().nullable().or(z.literal('')),
  rearBrake: z.string().max(100).optional().nullable().or(z.literal('')),
  frontSuspension: z.string().max(100).optional().nullable().or(z.literal('')),
  rearSuspension: z.string().max(100).optional().nullable().or(z.literal('')),

  weightKg: z.coerce.number().nonnegative().optional().nullable(),
  seatHeightMm: z.coerce.number().int().nonnegative().optional().nullable(),
  fuelCapacityL: z.coerce.number().nonnegative().optional().nullable(),

  description: z.string().optional().nullable().or(z.literal('')),
});

export const compareSchema = z.object({
  ids: z.array(z.coerce.number().int().positive()).min(2).max(4),
});
