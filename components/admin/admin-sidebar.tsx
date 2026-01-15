"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Calendar,
  Users,
  LayoutDashboard,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/models/schemas/user.schema";

interface AdminSidebarProps {
  userRole: UserRole;
}

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/buildings", label: "Buildings", icon: Building2 },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/users", label: "Users", icon: Users, superAdminOnly: true },
];

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();

  const filteredNav = adminNav.filter(
    (item) => !item.superAdminOnly || userRole === "super_admin"
  );

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">
      <div className="p-4 border-b border-neutral-200">
        <Link
          href="/"
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to App</span>
        </Link>
        <div className="flex items-center gap-2 mt-4">
          <div className="w-8 h-8 rounded-lg bg-[#1F7A4D] flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">
              Admin Panel
            </h1>
            <p className="text-xs text-neutral-500">Campus Navigator</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-[#1F7A4D]/10 text-[#1F7A4D]"
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-neutral-200">
        <div className="text-xs text-neutral-500">
          Role: <span className="font-medium capitalize">{userRole.replace("_", " ")}</span>
        </div>
      </div>
    </aside>
  );
}
