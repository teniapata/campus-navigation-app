import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Building } from "@/models/schemas/building.schema";
import { Event } from "@/models/schemas/event.schema";
import { User } from "@/models/schemas/user.schema";
import { Building2, Calendar, Users, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getStats() {
  await dbConnect();

  const [buildingCount, eventCount, userCount, upcomingEvents] =
    await Promise.all([
      Building.countDocuments(),
      Event.countDocuments(),
      User.countDocuments(),
      Event.find({ startDate: { $gte: new Date() } })
        .limit(5)
        .populate("building", "name")
        .sort({ startDate: 1 }),
    ]);

  return { buildingCount, eventCount, userCount, upcomingEvents };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Welcome back, {session?.user.name?.split(" ")[0]}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Total Buildings
            </CardTitle>
            <Building2 className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.buildingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Total Events
            </CardTitle>
            <Calendar className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.eventCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Registered Users
            </CardTitle>
            <Users className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Upcoming Events
            </CardTitle>
            <MapPin className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.upcomingEvents.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.upcomingEvents.length === 0 ? (
            <p className="text-neutral-500">No upcoming events</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingEvents.map((event) => (
                <div
                  key={event._id.toString()}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">{event.title}</p>
                    <p className="text-sm text-neutral-500">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(event.building as any)?.name || "Unknown location"}
                    </p>
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {new Date(event.startDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
