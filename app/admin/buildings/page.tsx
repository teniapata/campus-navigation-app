"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BuildingForm } from "@/components/admin/building-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Building {
  _id: string;
  name: string;
  type: "academic" | "hostel" | "service" | "event";
  departments?: string[];
  hours?: string;
  coordinates: { lat: number; lng: number };
  mapPosition: { x: number; y: number };
  description?: string;
  accessibility?: boolean;
}

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchBuildings();
  }, []);

  async function fetchBuildings() {
    try {
      const response = await fetch("/api/buildings");
      const data = await response.json();
      setBuildings(data);
    } catch (error) {
      console.error("Error fetching buildings:", error);
      toast.error("Failed to fetch buildings");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(data: {
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

      const response = await fetch("/api/buildings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create building");
      }

      toast.success("Building created successfully");
      setIsDialogOpen(false);
      fetchBuildings();
    } catch (error) {
      console.error("Error creating building:", error);
      toast.error("Failed to create building");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/buildings/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete building");
      }

      toast.success("Building deleted successfully");
      fetchBuildings();
    } catch (error) {
      console.error("Error deleting building:", error);
      toast.error("Failed to delete building");
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "academic":
        return "default";
      case "hostel":
        return "secondary";
      case "service":
        return "outline";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1F7A4D]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Buildings</h1>
          <p className="text-neutral-600">Manage campus buildings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1F7A4D] hover:bg-[#196841]">
              <Plus className="w-4 h-4 mr-2" />
              Add Building
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Building</DialogTitle>
            </DialogHeader>
            <BuildingForm onSubmit={handleCreate} isLoading={isSubmitting} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            All Buildings ({buildings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {buildings.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              No buildings found. Add your first building to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Departments</TableHead>
                  <TableHead>Accessible</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buildings.map((building) => (
                  <TableRow key={building._id}>
                    <TableCell className="font-medium">
                      {building.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(building.type)}>
                        {building.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {building.departments?.slice(0, 2).join(", ")}
                      {(building.departments?.length || 0) > 2 && "..."}
                    </TableCell>
                    <TableCell>
                      {building.accessibility ? "Yes" : "No"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/buildings/${building._id}`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Building</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{building.name}&quot;?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(building._id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
