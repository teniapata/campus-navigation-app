"use client";

import { MapPin, Building2, Calendar, Bookmark } from "lucide-react";
import { UserMenu } from "./auth/user-menu";
import { ThemeToggle } from "./theme-toggle";

interface TopNavProps {
  activeTab: "map" | "buildings" | "events" | "saved";
  onTabChange: (tab: "map" | "buildings" | "events" | "saved") => void;
}

export function TopNav({ activeTab, onTabChange }: TopNavProps) {
  const tabs = [
    { id: "map" as const, label: "Map", icon: MapPin },
    { id: "buildings" as const, label: "Buildings", icon: Building2 },
    { id: "events" as const, label: "Events", icon: Calendar },
    { id: "saved" as const, label: "Saved", icon: Bookmark },
  ];

  return (
    <nav className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 md:px-6 h-14 md:h-16 flex items-center gap-4 md:gap-8">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#1F7A4D] flex items-center justify-center">
          <MapPin className="w-4 h-4 md:w-6 md:h-6 text-white" />
        </div>
        <div className="hidden sm:block">
          <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm md:text-base">
            Campus Navigator
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Covenant University</div>
        </div>
      </div>

      <div className="flex gap-1 ml-auto md:ml-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                px-2 md:px-4 py-1.5 md:py-2 rounded-lg flex items-center gap-1.5 md:gap-2 transition-colors text-sm md:text-base
                ${
                  activeTab === tab.id
                    ? "bg-[#1F7A4D]/10 text-[#1F7A4D]"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </nav>
  );
}
