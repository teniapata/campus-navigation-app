"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventForm, EventFormValues } from "@/components/admin/event-form";
import { toast } from "sonner";
import Link from "next/link";

function toLocalDatetimeString(dateStr: string) {
  const d = new Date(dateStr);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) throw new Error("Event not found");
        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Failed to fetch event");
        router.push("/admin/events");
      } finally {
        setIsLoading(false);
      }
    }
    fetchEvent();
  }, [id, router]);

  async function handleUpdate(data: EventFormValues) {
    setIsSubmitting(true);
    try {
      const body = {
        ...data,
        attendeeLimit: data.attendeeLimit ? parseInt(data.attendeeLimit) : undefined,
        image: data.image || undefined,
      };

      const response = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to update event");
      }

      toast.success("Event updated successfully");
      router.push("/admin/events");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update event");
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

  if (!event) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/events">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Edit Event</h1>
          <p className="text-neutral-600 dark:text-neutral-400">{event.title as string}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <EventForm
            initialData={{
              title: event.title as string,
              description: event.description as string,
              building: (event.building as Record<string, unknown>)?._id as string || "",
              startDate: toLocalDatetimeString(event.startDate as string),
              endDate: toLocalDatetimeString(event.endDate as string),
              isAllDay: event.isAllDay as boolean,
              category: event.category as "academic" | "social" | "sports" | "religious" | "career" | "other",
              organizer: event.organizer as string,
              image: event.image as string,
              attendeeLimit: event.attendeeLimit as number,
              isPublic: event.isPublic as boolean,
            }}
            onSubmit={handleUpdate}
            isLoading={isSubmitting}
            submitLabel="Update Event"
          />
        </CardContent>
      </Card>
    </div>
  );
}
