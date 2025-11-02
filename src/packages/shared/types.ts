import { z } from "zod";

// Common types used across the monorepo
export interface User {
    id: string;
    email: string;
    name?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Zod schemas for validation
export const UserSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type UserInput = z.infer<typeof UserSchema>;
