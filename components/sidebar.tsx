import { IBuilding, IEvent, ISavedLocation } from "@/models/interface/building.interface";
import { Building2, Calendar, Home, Search, Utensils, X, MapPin, Clock, Bookmark, Trash2 } from "lucide-react";

interface SidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilters: string[];
  onToggleFilter: (filter: string) => void;
  buildings: IBuilding[];
  onSelectBuilding: (building: IBuilding) => void;
  hoveredBuilding: IBuilding | null;
  onHoverBuilding: (building: IBuilding | null) => void;
  isOpen: boolean;
  onToggleOpen: (open: boolean) => void;
  activeTab?: string;
  events?: IEvent[];
  eventCategory?: string;
  onEventCategoryChange?: (category: string) => void;
  savedLocations?: ISavedLocation[];
  onRemoveSavedLocation?: (id: string) => void;
}

export function Sidebar({
  searchQuery,
  onSearchChange,
  activeFilters,
  onToggleFilter,
  buildings,
  onSelectBuilding,
  hoveredBuilding,
  onHoverBuilding,
  isOpen,
  onToggleOpen,
  activeTab,
  events = [],
  eventCategory = "all",
  onEventCategoryChange,
  savedLocations = [],
  onRemoveSavedLocation,
}: SidebarProps) {
  const filters = [
    { id: "Buildings", label: "Buildings", icon: Building2 },
    { id: "Services", label: "Services", icon: Utensils },
    { id: "Events", label: "Events", icon: Calendar },
    { id: "Hostels", label: "Hostels", icon: Home },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "academic":
        return <Building2 className="w-4 h-4" />;
      case "service":
        return <Utensils className="w-4 h-4" />;
      case "event":
        return <Calendar className="w-4 h-4" />;
      case "hostel":
        return <Home className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      academic: "bg-blue-50 text-blue-700 border-blue-200",
      service: "bg-amber-50 text-amber-700 border-amber-200",
      event: "bg-purple-50 text-purple-700 border-purple-200",
      hostel: "bg-green-50 text-green-700 border-green-200",
    };
    return styles[type as keyof typeof styles] || styles.academic;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => onToggleOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        w-80 max-w-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col
        md:relative fixed inset-y-0 left-0 z-40 transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Mobile close button */}
        <button
          onClick={() => onToggleOpen(false)}
          className="md:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 z-50"
        >
          <X className="w-5 h-5 text-neutral-600" />
        </button>

        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search buildings, departments..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F7A4D] focus:border-transparent text-sm md:text-base bg-white dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => onToggleFilter(filter.id)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs md:text-sm flex items-center gap-1.5 border transition-colors
                    ${
                      activeFilters.includes(filter.id)
                        ? "bg-[#1F7A4D] text-white border-[#1F7A4D]"
                        : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:border-[#1F7A4D]"
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "saved" ? (
            <div className="p-3">
              <div className="text-xs text-neutral-500 mb-2 px-1">
                {savedLocations.length}{" "}
                {savedLocations.length === 1 ? "saved location" : "saved locations"}
              </div>

              {savedLocations.length === 0 ? (
                <div className="text-center py-8">
                  <Bookmark className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-400">No saved locations yet</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Click the bookmark icon on a building to save it
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedLocations.map((saved) => (
                    <div
                      key={saved.id}
                      className="w-full text-left p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-[#1F7A4D] hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                          <Bookmark className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => {
                              if (saved.building) {
                                onSelectBuilding(saved.building);
                                onToggleOpen(false);
                              }
                            }}
                            className="block text-left w-full"
                          >
                            <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-[#1F7A4D]">
                              {saved.nickname || saved.building?.name || "Unknown"}
                            </div>
                            {saved.nickname && saved.building && (
                              <div className="text-xs text-neutral-500 mt-0.5">
                                {saved.building.name}
                              </div>
                            )}
                            {saved.notes && (
                              <div className="text-xs text-neutral-400 mt-0.5 italic">
                                {saved.notes}
                              </div>
                            )}
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveSavedLocation?.(saved.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === "events" ? (
            <div className="p-3">
              {/* Event Category Filters */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[
                  { id: "all", label: "All" },
                  { id: "academic", label: "Academic" },
                  { id: "social", label: "Social" },
                  { id: "sports", label: "Sports" },
                  { id: "religious", label: "Religious" },
                  { id: "career", label: "Career" },
                  { id: "other", label: "Other" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onEventCategoryChange?.(cat.id)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                      eventCategory === cat.id
                        ? "bg-[#1F7A4D] text-white border-[#1F7A4D]"
                        : "bg-white text-neutral-600 border-neutral-300 hover:border-[#1F7A4D]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="text-xs text-neutral-500 mb-2 px-1">
                {events.length} {events.length === 1 ? "event" : "events"} found
              </div>

              <div className="space-y-2">
                {events.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400 text-sm">
                    No events found
                  </div>
                ) : (
                  events.map((event) => {
                    const categoryColors: Record<string, string> = {
                      academic: "bg-blue-50 text-blue-700 border-blue-200",
                      social: "bg-pink-50 text-pink-700 border-pink-200",
                      sports: "bg-green-50 text-green-700 border-green-200",
                      religious: "bg-purple-50 text-purple-700 border-purple-200",
                      career: "bg-amber-50 text-amber-700 border-amber-200",
                      other: "bg-gray-50 text-gray-700 border-gray-200",
                    };
                    return (
                      <div
                        key={event.id}
                        className="w-full text-left p-3 rounded-lg border border-neutral-200 hover:border-[#1F7A4D] hover:bg-neutral-50 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-neutral-900">
                              {event.title}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                                  categoryColors[event.category] || categoryColors.other
                                }`}
                              >
                                {event.category}
                              </span>
                            </div>
                            {event.building && (
                              <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                                <MapPin className="w-3 h-3" />
                                {event.building.name}
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-xs text-neutral-400 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {new Date(event.startDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="p-3">
              <div className="text-xs text-neutral-500 mb-2 px-1">
                {buildings.length}{" "}
                {buildings.length === 1 ? "location" : "locations"} found
              </div>

              <div className="space-y-2">
                {buildings.map((building) => {
                  const isHovered = hoveredBuilding?.id === building.id;
                  return (
                    <button
                      key={building.id}
                      onClick={() => {
                        onSelectBuilding(building);
                        onToggleOpen(false);
                      }}
                      onMouseEnter={() => onHoverBuilding(building)}
                      onMouseLeave={() => onHoverBuilding(null)}
                      className={`
                        w-full text-left p-3 rounded-lg transition-all duration-200 border group
                        ${
                          isHovered
                            ? "bg-[#1F7A4D]/5 border-[#1F7A4D] shadow-sm"
                            : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-[#1F7A4D] hover:bg-neutral-50 dark:hover:bg-neutral-750"
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`
                          w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border transition-all duration-200
                          ${
                            isHovered
                              ? "bg-[#1F7A4D] text-white border-[#1F7A4D] shadow-sm"
                              : getTypeBadge(building.type)
                          }
                        `}
                        >
                          {getTypeIcon(building.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div
                            className={`
                            font-medium transition-colors duration-200 text-sm md:text-base
                            ${
                              isHovered
                                ? "text-[#1F7A4D]"
                                : "text-neutral-900 dark:text-neutral-100 group-hover:text-[#1F7A4D]"
                            }
                          `}
                          >
                            {building.name}
                          </div>
                          {building.departments &&
                            building.departments.length > 0 && (
                              <div className="text-xs text-neutral-500 mt-0.5 truncate">
                                {building.departments[0]}
                                {building.departments.length > 1 &&
                                  ` +${building.departments.length - 1} more`}
                              </div>
                            )}
                          {building.hours && (
                            <div className="text-xs text-neutral-400 mt-1">
                              {building.hours}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
