"use client";

import { IBuilding } from "@/models/interface/building.interface";
import { Menu, Loader2 } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { BuildingDetailDrawer } from "./building-detail-drawer";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { useBuildings } from "@/hooks/use-buildings";
import { GoogleMapView } from "./google-map-view";
import { GoogleDirectionsPanel } from "./navigation/google-directions-panel";

interface GoogleDirectionsInfo {
  distance: string;
  duration: string;
  steps: { instruction: string; distance: string }[];
}

interface CustomLocation {
  name: string;
  lat: number;
  lng: number;
}

export default function Navigator() {
  const [activeTab, setActiveTab] = useState<
    "map" | "buildings" | "events" | "saved"
  >("map");
  const [selectedBuilding, setSelectedBuilding] = useState<IBuilding | null>(
    null
  );
  const [hoveredBuilding, setHoveredBuilding] = useState<IBuilding | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Navigation state
  const [navigationMode, setNavigationMode] = useState(false);
  const [fromBuilding, setFromBuilding] = useState<IBuilding | null>(null);
  const [toBuilding, setToBuilding] = useState<IBuilding | null>(null);
  const [customFromLocation, setCustomFromLocation] = useState<CustomLocation | null>(null);
  const [directionsInfo, setDirectionsInfo] = useState<GoogleDirectionsInfo | null>(null);

  // Fetch buildings from API
  const { buildings, isLoading: buildingsLoading } = useBuildings();

  // Filter buildings based on search and filters
  const filteredBuildings = useMemo(() => {
    return buildings.filter((building) => {
      const matchesSearch =
        searchQuery === "" ||
        building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        building.departments?.some((dept) =>
          dept.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesFilter =
        activeFilters.length === 0 ||
        (activeFilters.includes("Buildings") && building.type === "academic") ||
        (activeFilters.includes("Services") && building.type === "service") ||
        (activeFilters.includes("Events") && building.type === "event") ||
        (activeFilters.includes("Hostels") && building.type === "hostel");

      return matchesSearch && matchesFilter;
    });
  }, [buildings, searchQuery, activeFilters]);

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const handleGetDirections = (building: IBuilding) => {
    setNavigationMode(true);
    setToBuilding(building);
    setFromBuilding(null);
    setCustomFromLocation(null);
    setSelectedBuilding(null);
    setDirectionsInfo(null);
  };

  const handleBuildingSelect = (building: IBuilding) => {
    if (navigationMode) {
      // In navigation mode, clicking a building sets it as from or to
      if (!fromBuilding && !customFromLocation) {
        setFromBuilding(building);
        setCustomFromLocation(null);
      } else if (!toBuilding) {
        setToBuilding(building);
      } else {
        // Both are set, update the "from" building
        setFromBuilding(building);
        setCustomFromLocation(null);
        setDirectionsInfo(null);
      }
    } else {
      // Normal mode - open building detail
      setSelectedBuilding(building);
    }
  };

  const handleCancelNavigation = () => {
    setNavigationMode(false);
    setFromBuilding(null);
    setToBuilding(null);
    setCustomFromLocation(null);
    setDirectionsInfo(null);
  };

  const handleDirectionsCalculated = useCallback((result: google.maps.DirectionsResult) => {
    const route = result.routes[0];
    const leg = route.legs[0];

    const steps = leg.steps.map((step) => ({
      instruction: step.instructions.replace(/<[^>]*>/g, ""), // Strip HTML tags
      distance: step.distance?.text || "",
    }));

    setDirectionsInfo({
      distance: leg.distance?.text || "",
      duration: leg.duration?.text || "",
      steps,
    });
  }, []);

  if (buildingsLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#1F7A4D]" />
          <p className="text-neutral-600">Loading campus map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed bottom-6 left-6 z-20 w-12 h-12 bg-[#1F7A4D] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#196841] transition-colors"
          aria-label="Open menu"
          type="button"
        >
          <Menu className="w-6 h-6" />
        </button>

        <Sidebar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilters={activeFilters}
          onToggleFilter={toggleFilter}
          buildings={filteredBuildings}
          onSelectBuilding={handleBuildingSelect}
          hoveredBuilding={hoveredBuilding}
          onHoverBuilding={setHoveredBuilding}
          isOpen={isSidebarOpen}
          onToggleOpen={setIsSidebarOpen}
        />

        <div className="flex-1 relative">
          <GoogleMapView
            buildings={filteredBuildings}
            selectedBuilding={selectedBuilding}
            onSelectBuilding={handleBuildingSelect}
            fromBuilding={fromBuilding}
            toBuilding={toBuilding}
            navigationMode={navigationMode}
            onDirectionsCalculated={handleDirectionsCalculated}
            customFromLocation={customFromLocation}
          />

          {/* Navigation Panel */}
          {navigationMode && (
            <GoogleDirectionsPanel
              fromBuilding={fromBuilding}
              toBuilding={toBuilding}
              directionsInfo={directionsInfo}
              onCancel={handleCancelNavigation}
              onSelectFrom={() => {
                setFromBuilding(null);
                setCustomFromLocation(null);
                setDirectionsInfo(null);
              }}
              onSelectTo={() => {
                setToBuilding(null);
                setDirectionsInfo(null);
              }}
              customFromLocation={customFromLocation}
              onSetCustomFromLocation={(location) => {
                setCustomFromLocation(location);
                setFromBuilding(null);
                if (location) {
                  setDirectionsInfo(null);
                }
              }}
            />
          )}
        </div>

        {selectedBuilding && !navigationMode && (
          <BuildingDetailDrawer
            building={selectedBuilding}
            onClose={() => setSelectedBuilding(null)}
            onGetDirections={handleGetDirections}
          />
        )}
      </div>
    </div>
  );
}
