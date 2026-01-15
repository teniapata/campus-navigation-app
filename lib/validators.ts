import { z } from "zod";

export const buildingValidator = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["academic", "hostel", "service", "event"]),
  departments: z.array(z.string()).optional(),
  hours: z.string().optional(),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  mapPosition: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
  }),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  amenities: z.array(z.string()).optional(),
  floor_count: z.number().min(1).default(1),
  accessibility: z.boolean().default(false),
});

export const eventValidator = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  building: z.string().min(1, "Building is required"),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  isAllDay: z.boolean().default(false),
  category: z.enum([
    "academic",
    "social",
    "sports",
    "religious",
    "career",
    "other",
  ]),
  organizer: z.string().min(2, "Organizer is required"),
  image: z.string().url().optional().or(z.literal("")),
  attendeeLimit: z.number().positive().optional(),
  isPublic: z.boolean().default(true),
});

export const savedLocationValidator = z.object({
  buildingId: z.string().min(1, "Building ID is required"),
  nickname: z.string().max(50).optional(),
  notes: z.string().max(200).optional(),
});

export const navigationValidator = z.object({
  fromBuildingId: z.string().min(1, "From building is required"),
  toBuildingId: z.string().min(1, "To building is required"),
  accessible: z.boolean().default(false),
});

export type BuildingInput = z.infer<typeof buildingValidator>;
export type EventInput = z.infer<typeof eventValidator>;
export type SavedLocationInput = z.infer<typeof savedLocationValidator>;
export type NavigationInput = z.infer<typeof navigationValidator>;
