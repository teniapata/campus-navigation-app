"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Loader2, LocateFixed } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

const buildingFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["academic", "hostel", "service", "event"]),
  departments: z.string(),
  hours: z.string().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  mapX: z.number().min(0).max(100),
  mapY: z.number().min(0).max(100),
  description: z.string().optional(),
  image: z.string().optional(),
  amenities: z.string(),
  floor_count: z.number().min(1),
  accessibility: z.boolean(),
});

type BuildingFormValues = z.infer<typeof buildingFormSchema>;

interface BuildingFormProps {
  initialData?: {
    name?: string;
    type?: "academic" | "hostel" | "service" | "event";
    departments?: string[];
    hours?: string;
    coordinates?: { lat: number; lng: number };
    mapPosition?: { x: number; y: number };
    description?: string;
    image?: string;
    amenities?: string[];
    floor_count?: number;
    accessibility?: boolean;
  };
  onSubmit: (data: BuildingFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function BuildingForm({
  initialData,
  onSubmit,
  isLoading,
}: BuildingFormProps) {
  const [isLocating, setIsLocating] = useState(false);

  const form = useForm<BuildingFormValues>({
    resolver: zodResolver(buildingFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      type: initialData?.type ?? "academic",
      departments: initialData?.departments?.join(", ") ?? "",
      hours: initialData?.hours ?? "",
      lat: initialData?.coordinates?.lat ?? 6.6735,
      lng: initialData?.coordinates?.lng ?? 3.158,
      mapX: initialData?.mapPosition?.x ?? 50,
      mapY: initialData?.mapPosition?.y ?? 50,
      description: initialData?.description ?? "",
      image: initialData?.image ?? "",
      amenities: initialData?.amenities?.join(", ") ?? "",
      floor_count: initialData?.floor_count ?? 1,
      accessibility: initialData?.accessibility ?? false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Building Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., College of Science and Technology"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="hostel">Hostel</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="event">Event Venue</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of the building..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="departments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departments (comma-separated)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Computer Science, Physics, Mathematics"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Operating Hours</FormLabel>
                <FormControl>
                  <Input placeholder="Mon-Fri: 8:00 AM - 6:00 PM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Location Coordinates</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLocating}
              onClick={() => {
                if (!navigator.geolocation) {
                  alert("Geolocation is not supported by your browser");
                  return;
                }
                setIsLocating(true);
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    form.setValue("lat", parseFloat(lat.toFixed(6)));
                    form.setValue("lng", parseFloat(lng.toFixed(6)));

                    // Estimate mapX/mapY relative to campus bounds
                    // Campus approx bounds: lat 6.670-6.678, lng 3.154-3.163
                    const mapX = Math.min(100, Math.max(0, ((lng - 3.154) / (3.163 - 3.154)) * 100));
                    const mapY = Math.min(100, Math.max(0, ((lat - 6.678) / (6.670 - 6.678)) * 100));
                    form.setValue("mapX", parseFloat(mapX.toFixed(1)));
                    form.setValue("mapY", parseFloat(mapY.toFixed(1)));

                    setIsLocating(false);
                  },
                  (error) => {
                    console.error("Geolocation error:", error);
                    alert("Unable to get your location. Please check permissions.");
                    setIsLocating(false);
                  },
                  { enableHighAccuracy: true, timeout: 10000 }
                );
              }}
              className="flex items-center gap-1.5"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LocateFixed className="w-3.5 h-3.5" />
              )}
              {isLocating ? "Getting location..." : "Use Current Location"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="lat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input type="number" step="0.0001" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lng"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input type="number" step="0.0001" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mapX"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Map X (%)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="100" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mapY"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Map Y (%)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="100" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amenities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amenities (comma-separated)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Computer Labs, Library, Cafeteria"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="floor_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Floors</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Building Image</FormLabel>
              <FormControl>
                <ImageUpload value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accessibility"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0">Wheelchair Accessible</FormLabel>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="bg-[#1F7A4D] hover:bg-[#196841]"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isLoading ? "Saving..." : "Save Building"}
        </Button>
      </form>
    </Form>
  );
}
