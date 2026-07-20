import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createContentSchema = z.object({
  type: z.enum(["youtube", "instagram", "link", "note", "idea", "snippet"]).default("link"),
  sourceUrl: z.string().url().optional(),
  rawContent: z.string().max(10000).optional(),
  title: z.string().max(200).optional(),
  manualNote: z.string().max(2000).optional(),
  runAI: z.boolean().optional(),
});

export const updateContentSchema = z.object({
  title: z.string().max(200).optional(),
  rawContent: z.string().max(10000).optional(),
  summary: z.string().max(2000).optional(),
  category: z.string().max(50).optional(),
  tags: z.array(z.string()).max(20).optional(),
  manualNote: z.string().max(2000).optional(),
  isPinned: z.boolean().optional(),
  status: z.enum(["active", "archived", "deleted"]).optional(),
});

export const reviewSchema = z.object({
  result: z.enum(["easy", "good", "hard", "forgot"]),
});

export const userSettingsSchema = z.object({
  preferences: z
    .object({
      reminderTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      timezone: z.string().max(100).optional(),
      emailReminders: z.boolean().optional(),
    })
    .optional(),
  reminderSettings: z
    .object({
      enabled: z.boolean().optional(),
      frequency: z.enum(["daily", "every 2 days", "weekly"]).optional(),
    })
    .optional(),
});
