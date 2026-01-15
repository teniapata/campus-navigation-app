import { IBuilding, INavigationRoute } from "@/models/interface/building.interface";
import { Building2, Calendar, Home, MapPin, Utensils } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MapViewProps {
  buildings: IBuilding[];
  selectedBuilding: IBuilding | null;
  onSelectBuilding: (building: IBuilding) => void;
  hoveredBuilding: IBuilding | null;
  zoom: number;
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  route?: INavigationRoute | null;
  fromBuilding?: IBuilding | null;
  toBuilding?: IBuilding | null;
}

export function MapView({
  buildings,
  selectedBuilding,
  onSelectBuilding,
  hoveredBuilding,
  zoom,
  position,
  onPositionChange,
  route,
  fromBuilding,
  toBuilding,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      e.target === mapRef.current ||
      (e.target as HTMLElement).closest(".map-background")
    ) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      onPositionChange({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = "grabbing";
    } else {
      document.body.style.cursor = "default";
    }
    return () => {
      document.body.style.cursor = "default";
    };
  }, [isDragging]);

  const getPinColor = (
    type: string,
    isSelected: boolean,
    isHovered: boolean,
    isFromBuilding: boolean,
    isToBuilding: boolean
  ) => {
    if (isFromBuilding)
      return "bg-green-500 text-white border-green-600 shadow-lg scale-110";
    if (isToBuilding)
      return "bg-red-500 text-white border-red-600 shadow-lg scale-110";
    if (isSelected)
      return "bg-[#1F7A4D] text-white border-[#1F7A4D] shadow-lg scale-110";
    if (isHovered)
      return "bg-[#1F7A4D] text-white border-[#1F7A4D] shadow-lg scale-110";
    switch (type) {
      case "academic":
        return "bg-blue-500 text-white border-blue-600 hover:scale-110";
      case "service":
        return "bg-amber-500 text-white border-amber-600 hover:scale-110";
      case "event":
        return "bg-purple-500 text-white border-purple-600 hover:scale-110";
      case "hostel":
        return "bg-green-500 text-white border-green-600 hover:scale-110";
      default:
        return "bg-blue-500 text-white border-blue-600 hover:scale-110";
    }
  };

  const getPinIcon = (type: string) => {
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
        return <MapPin className="w-4 h-4" />;
    }
  };

  // Generate route path SVG
  const getRoutePath = () => {
    if (!route || route.path.length < 2) return null;

    const points = route.path
      .map((p) => `${p.mapPosition.x}%,${p.mapPosition.y}%`)
      .join(" ");

    return (
      <polyline
        points={points}
        fill="none"
        stroke="#1F7A4D"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="8,8"
        className="animate-dash"
      />
    );
  };

  return (
    <div
      ref={mapRef}
      className="w-full h-full bg-neutral-100 overflow-hidden relative cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Map Background */}
      <div
        className="map-background absolute inset-0 transition-transform duration-200"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        {/* Campus Paths and Areas */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Main pathways */}
          <line
            x1="20%"
            y1="50%"
            x2="80%"
            y2="50%"
            stroke="#d4d4d4"
            strokeWidth="6"
          />
          <line
            x1="50%"
            y1="20%"
            x2="50%"
            y2="80%"
            stroke="#d4d4d4"
            strokeWidth="6"
          />
          {/* Cross paths */}
          <line
            x1="30%"
            y1="30%"
            x2="70%"
            y2="70%"
            stroke="#e5e5e5"
            strokeWidth="4"
          />
          <line
            x1="30%"
            y1="70%"
            x2="70%"
            y2="30%"
            stroke="#e5e5e5"
            strokeWidth="4"
          />

          {/* Green spaces */}
          <circle cx="35%" cy="35%" r="8%" fill="#e8f5e9" opacity="0.5" />
          <circle cx="65%" cy="65%" r="10%" fill="#e8f5e9" opacity="0.5" />
          <rect
            x="15%"
            y="60%"
            width="15%"
            height="15%"
            fill="#e8f5e9"
            opacity="0.5"
            rx="10"
          />

          {/* Parking lots */}
          <rect
            x="10%"
            y="15%"
            width="12%"
            height="8%"
            fill="#f5f5f5"
            stroke="#d4d4d4"
            strokeWidth="1"
            rx="5"
          />
          <rect
            x="75%"
            y="70%"
            width="15%"
            height="10%"
            fill="#f5f5f5"
            stroke="#d4d4d4"
            strokeWidth="1"
            rx="5"
          />

          {/* Navigation Route */}
          {getRoutePath()}
        </svg>

        {/* Building Pins */}
        {buildings.map((building) => {
          const isSelected = selectedBuilding?.id === building.id;
          const isHovered = hoveredBuilding?.id === building.id;
          const isFromBuilding = fromBuilding?.id === building.id;
          const isToBuilding = toBuilding?.id === building.id;

          return (
            <button
              key={building.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectBuilding(building);
              }}
              className="absolute transition-all duration-200"
              style={{
                left: `${building.coordinates.x}%`,
                top: `${building.coordinates.y}%`,
                transform: "translate(-50%, -100%)",
                pointerEvents: "auto",
              }}
            >
              {/* Pin */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full border-2 flex items-center justify-center
                    shadow-md transition-all duration-200
                    ${getPinColor(building.type, isSelected, isHovered, isFromBuilding, isToBuilding)}
                  `}
                >
                  {getPinIcon(building.type)}
                </div>
                <div className="w-1 h-3 bg-current opacity-60" />

                {/* Label */}
                <div
                  className={`
                    absolute top-12 whitespace-nowrap px-2 py-1 rounded text-xs
                    shadow-sm border pointer-events-none transition-opacity duration-200
                    ${
                      isSelected || isFromBuilding || isToBuilding
                        ? "bg-[#1F7A4D] text-white border-[#1F7A4D] opacity-100"
                        : "bg-white text-neutral-700 border-neutral-200 opacity-0 group-hover:opacity-100"
                    }
                  `}
                >
                  {building.name}
                </div>
              </div>
            </button>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg border border-neutral-200 p-3 md:p-4 pointer-events-auto max-w-[calc(100vw-3rem)] md:max-w-none">
          <div className="text-xs font-medium text-neutral-900 mb-2">
            Legend
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 border border-blue-600 flex-shrink-0" />
              <span className="text-neutral-600">Academic Buildings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500 border border-amber-600 flex-shrink-0" />
              <span className="text-neutral-600">Services</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 border border-green-600 flex-shrink-0" />
              <span className="text-neutral-600">Hostels</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500 border border-purple-600 flex-shrink-0" />
              <span className="text-neutral-600">Events</span>
            </div>
          </div>
        </div>

        {/* Compass */}
        <div className="absolute top-6 right-6 bg-white rounded-full shadow-lg border border-neutral-200 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center pointer-events-auto">
          <div className="relative w-6 h-6 md:w-8 md:h-8">
            <div className="absolute inset-0 flex items-center justify-center text-xs text-[#1F7A4D]">
              N
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-4 md:h-6 bg-[#1F7A4D] opacity-20" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -16;
          }
        }
        .animate-dash {
          animation: dash 0.5s linear infinite;
        }
      `}</style>
    </div>
  );
}
