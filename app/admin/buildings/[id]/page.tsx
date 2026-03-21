"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BuildingForm } from "@/components/admin/building-form";
import { toast } from "sonner";
import Link from "next/link";

interface Building {
  _id: string;
  name: string;
  type: "academic" | "hostel" | "service" | "event";
  departments?: string[];
  hours?: string;
  coordinates: { lat: number; lng: number };
  mapPosition: { x: number; y: number };
  description?: string;
  image?: string;
  amenities?: string[];
  floor_count?: number;
  accessibility?: boolean;
}

export default function EditBuildingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [building, setBuilding] = useState<Building | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchBuilding() {
      try {
        const response = await fetch(`/api/buildings/${id}`);
        if (!response.ok) throw new Error("Building not found");
        const data = await response.json();
        setBuilding(data);
      } catch (error) {
        console.error("Error fetching building:", error);
        toast.error("Failed to fetch building");
        router.push("/admin/buildings");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBuilding();
  }, [id, router]);

  async function handleUpdate(data: {
    name: string;
    type: "academic" | "hostel" | "service" | "event";
    departments: string;
    hours?: string;
    lat: number;
    lng: number;
    mapX: number;
    mapY: number;
    description?: string;
    image?: string;
    amenities: string;
    floor_count: number;
    accessibility: boolean;
  }) {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        type: data.type,
        departments: data.departments.split(",").map((d) => d.trim()).filter(Boolean),
        hours: data.hours,
        coordinates: { lat: data.lat, lng: data.lng },
        mapPosition: { x: data.mapX, y: data.mapY },
        description: data.description,
        image: data.image,
        amenities: data.amenities.split(",").map((a) => a.trim()).filter(Boolean),
        floor_count: data.floor_count,
        accessibility: data.accessibility,
      };

      const response = await fetch(`/api/buildings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update building");
      }

      toast.success("Building updated successfully");
      router.push("/admin/buildings");
    } catch (error) {
      console.error("Error updating building:", error);
      toast.error("Failed to update building");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1F7A4D]" />
      </div>
    );
  }

  if (!building) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/buildings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Edit Building</h1>
          <p className="text-neutral-600 dark:text-neutral-400">{building.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Building Details</CardTitle>
        </CardHeader>
        <CardContent>
          <BuildingForm
            initialData={{
              name: building.name,
              type: building.type,
              departments: building.departments,
              hours: building.hours,
              coordinates: building.coordinates,
              mapPosition: building.mapPosition,
              description: building.description,
              image: building.image,
              amenities: building.amenities,
              floor_count: building.floor_count,
              accessibility: building.accessibility,
            }}
            onSubmit={handleUpdate}
            isLoading={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
