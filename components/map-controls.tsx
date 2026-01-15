import { Plus, Minus, Locate, Layers } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
}

export function MapControls({ onZoomIn, onZoomOut, onRecenter }: MapControlsProps) {
  return (
    <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
      {/* Zoom Controls */}
      <div className="bg-white rounded-lg shadow-lg border border-neutral-200 overflow-hidden">
        <button
          onClick={onZoomIn}
          className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center hover:bg-neutral-50 border-b border-neutral-200 transition-colors"
          title="Zoom in"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5 text-neutral-700" />
        </button>
        <button
          onClick={onZoomOut}
          className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center hover:bg-neutral-50 transition-colors"
          title="Zoom out"
        >
          <Minus className="w-4 h-4 md:w-5 md:h-5 text-neutral-700" />
        </button>
      </div>

      {/* Recenter Button */}
      <button
        onClick={onRecenter}
        className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-lg shadow-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors"
        title="Recenter map"
      >
        <Locate className="w-4 h-4 md:w-5 md:h-5 text-neutral-700" />
      </button>

      {/* Layers Button */}
      <button
        className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-lg shadow-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors"
        title="Toggle layers"
      >
        <Layers className="w-4 h-4 md:w-5 md:h-5 text-neutral-700" />
      </button>
    </div>
  );
}