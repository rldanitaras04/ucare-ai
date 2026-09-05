"use client";

import * as React from "react";

export type ToothCondition =
  | "sound"
  | "caries"
  | "restored"
  | "missing"
  | "crown"
  | "extraction_indicated";

export type ToothSurface =
  | "mesial"
  | "distal"
  | "occlusal"
  | "buccal"
  | "lingual";

export interface OdontogramEntry {
  tooth_number: number;
  surface: ToothSurface;
  condition: ToothCondition;
  procedure_performed?: string;
  notes?: string;
}

interface OdontogramProps {
  entries: OdontogramEntry[];
  onEntryChange: (entries: OdontogramEntry[]) => void;
  activeTool: ToothCondition;
  onToolChange: (tool: ToothCondition) => void;
  disabled?: boolean;
}

const CONDITION_COLORS: Record<ToothCondition, string> = {
  sound: "#94A3B8",
  caries: "#EF4444",
  restored: "#3B82F6",
  missing: "#475569",
  crown: "#F59E0B",
  extraction_indicated: "#DC2626",
};

const CONDITION_LABELS: Record<ToothCondition, string> = {
  sound: "Sound",
  caries: "Caries",
  restored: "Restored",
  missing: "Missing",
  crown: "Crown",
  extraction_indicated: "Extraction",
};

const SURFACE_LABELS: Record<ToothSurface, string> = {
  mesial: "M",
  distal: "D",
  occlusal: "O",
  buccal: "B",
  lingual: "L",
};

// FDI adult teeth: 18-11 (upper right), 21-28 (upper left), 31-38 (lower left), 41-48 (lower right)
const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];

function ToothIcon({
  toothNumber,
  entries,
  activeTool,
  onSurfaceClick,
  selected,
  onSelect,
  disabled,
}: {
  toothNumber: number;
  entries: OdontogramEntry[];
  activeTool: ToothCondition;
  onSurfaceClick: (tooth: number, surface: ToothSurface, condition: ToothCondition) => void;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  const getCondition = (surface: ToothSurface): ToothCondition => {
    const entry = entries.find(
      (e) => e.tooth_number === toothNumber && e.surface === surface
    );
    return entry?.condition ?? "sound";
  };

  const m = getCondition("mesial");
  const d = getCondition("distal");
  const o = getCondition("occlusal");
  const b = getCondition("buccal");
  const l = getCondition("lingual");

  const isMissing = m === "missing" && d === "missing" && o === "missing" && b === "missing" && l === "missing";

  const handleClick = (surface: ToothSurface) => {
    if (disabled) return;
    onSurfaceClick(toothNumber, surface, activeTool);
  };

  return (
    <g
      className={`cursor-pointer transition-opacity ${disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Tooth outline */}
      <rect
        x="0"
        y="0"
        width="36"
        height="44"
        rx="4"
        fill="white"
        stroke={selected ? "#1E40AF" : "#CBD5E1"}
        strokeWidth={selected ? 2.5 : 1.5}
      />

      {/* Missing cross */}
      {isMissing && (
        <>
          <line x1="4" y1="4" x2="32" y2="40" stroke="#475569" strokeWidth="2.5" />
          <line x1="32" y1="4" x2="4" y2="40" stroke="#475569" strokeWidth="2.5" />
        </>
      )}

      {/* Surfaces - clickable regions */}
      {/* Mesial (left) */}
      <rect
        x="1"
        y="1"
        width="10"
        height="20"
        fill={CONDITION_COLORS[m]}
        opacity={m === "sound" ? 0.3 : 0.85}
        className={disabled ? "" : "cursor-pointer"}
        onClick={(e) => {
          e.stopPropagation();
          handleClick("mesial");
        }}
      />
      {/* Distal (right) */}
      <rect
        x="25"
        y="1"
        width="10"
        height="20"
        fill={CONDITION_COLORS[d]}
        opacity={d === "sound" ? 0.3 : 0.85}
        className={disabled ? "" : "cursor-pointer"}
        onClick={(e) => {
          e.stopPropagation();
          handleClick("distal");
        }}
      />
      {/* Occlusal (center) */}
      <rect
        x="11"
        y="1"
        width="14"
        height="20"
        fill={CONDITION_COLORS[o]}
        opacity={o === "sound" ? 0.3 : 0.85}
        className={disabled ? "" : "cursor-pointer"}
        onClick={(e) => {
          e.stopPropagation();
          handleClick("occlusal");
        }}
      />
      {/* Buccal (bottom-left) */}
      <rect
        x="1"
        y="21"
        width="17"
        height="22"
        fill={CONDITION_COLORS[b]}
        opacity={b === "sound" ? 0.3 : 0.85}
        className={disabled ? "" : "cursor-pointer"}
        onClick={(e) => {
          e.stopPropagation();
          handleClick("buccal");
        }}
      />
      {/* Lingual (bottom-right) */}
      <rect
        x="18"
        y="21"
        width="17"
        height="22"
        fill={CONDITION_COLORS[l]}
        opacity={l === "sound" ? 0.3 : 0.85}
        className={disabled ? "" : "cursor-pointer"}
        onClick={(e) => {
          e.stopPropagation();
          handleClick("lingual");
        }}
      />

      {/* Surface labels */}
      <text x="6" y="13" textAnchor="middle" className="pointer-events-none" fontSize="5" fill="#475569">M</text>
      <text x="30" y="13" textAnchor="middle" className="pointer-events-none" fontSize="5" fill="#475569">D</text>
      <text x="18" y="13" textAnchor="middle" className="pointer-events-none" fontSize="5" fill="#475569">O</text>
      <text x="9" y="35" textAnchor="middle" className="pointer-events-none" fontSize="5" fill="#475569">B</text>
      <text x="27" y="35" textAnchor="middle" className="pointer-events-none" fontSize="5" fill="#475569">L</text>

      {/* Extraction indicator */}
      {o === "extraction_indicated" && (
        <>
          <line x1="6" y1="4" x2="30" y2="40" stroke="#DC2626" strokeWidth="2" />
          <line x1="30" y1="4" x2="6" y2="40" stroke="#DC2626" strokeWidth="2" />
        </>
      )}

      {/* Crown indicator */}
      {o === "crown" && (
        <rect
          x="2"
          y="2"
          width="32"
          height="40"
          rx="4"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
      )}

      {/* Tooth number */}
      <text
        x="18"
        y="-4"
        textAnchor="middle"
        fontSize="8"
        fontWeight="600"
        fill="#1E293B"
      >
        {toothNumber}
      </text>
    </g>
  );
}

function ArchRow({
  teeth,
  entries,
  activeTool,
  onSurfaceClick,
  selectedTooth,
  onSelectTooth,
  disabled,
  label,
}: {
  teeth: number[];
  entries: OdontogramEntry[];
  activeTool: ToothCondition;
  onSurfaceClick: (tooth: number, surface: ToothSurface, condition: ToothCondition) => void;
  selectedTooth: number | null;
  onSelectTooth: (tooth: number) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <svg
        viewBox={`0 0 ${teeth.length * 42} 56`}
        className="w-full"
        style={{ maxWidth: `${teeth.length * 42}px` }}
      >
        {teeth.map((tooth, i) => (
          <g key={tooth} transform={`translate(${i * 42 + 3}, 10)`}>
            <ToothIcon
              toothNumber={tooth}
              entries={entries}
              activeTool={activeTool}
              onSurfaceClick={onSurfaceClick}
              selected={selectedTooth === tooth}
              onSelect={() => onSelectTooth(tooth)}
              disabled={disabled}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

export function Odontogram({
  entries,
  onEntryChange,
  activeTool,
  onToolChange,
  disabled = false,
}: OdontogramProps) {
  const [selectedTooth, setSelectedTooth] = React.useState<number | null>(null);

  const handleSurfaceClick = React.useCallback(
    (toothNumber: number, surface: ToothSurface, condition: ToothCondition) => {
      if (disabled) return;

      const updated = [...entries];
      const idx = updated.findIndex(
        (e) => e.tooth_number === toothNumber && e.surface === surface
      );

      if (condition === "sound") {
        // Remove entry if setting back to sound
        if (idx !== -1) {
          updated.splice(idx, 1);
        }
      } else {
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], condition };
        } else {
          updated.push({ tooth_number: toothNumber, surface, condition });
        }
      }

      onEntryChange(updated);
    },
    [entries, onEntryChange, disabled]
  );

  const conditionCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of entries) {
      if (entry.condition !== "sound") {
        counts[entry.condition] = (counts[entry.condition] || 0) + 1;
      }
    }
    return counts;
  }, [entries]);

  return (
    <div className="space-y-4">
      {/* Tool Palette */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Charting Tools</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CONDITION_COLORS) as ToothCondition[]).map((condition) => (
            <button
              key={condition}
              type="button"
              disabled={disabled}
              onClick={() => onToolChange(condition)}
              className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all min-h-[40px] ${
                activeTool === condition
                  ? "border-primary ring-2 ring-primary"
                  : "border-border hover:border-muted-foreground/50"
              }`}
            >
              <div
                className="h-4 w-4 rounded-sm"
                style={{ backgroundColor: CONDITION_COLORS[condition] }}
              />
              {CONDITION_LABELS[condition]}
            </button>
          ))}
        </div>
      </div>

      {/* Tooth Chart */}
      <div className="overflow-x-auto">
        <div className="space-y-2 min-w-fit">
          {/* Maxillary (Upper) Arch */}
          <ArchRow
            teeth={[...UPPER_RIGHT, ...UPPER_LEFT]}
            entries={entries}
            activeTool={activeTool}
            onSurfaceClick={handleSurfaceClick}
            selectedTooth={selectedTooth}
            onSelectTooth={setSelectedTooth}
            disabled={disabled}
            label="Maxillary (Upper)"
          />

          {/* Mandibular (Lower) Arch */}
          <ArchRow
            teeth={[...LOWER_LEFT, ...LOWER_RIGHT]}
            entries={entries}
            activeTool={activeTool}
            onSurfaceClick={handleSurfaceClick}
            selectedTooth={selectedTooth}
            onSelectTooth={setSelectedTooth}
            disabled={disabled}
            label="Mandibular (Lower)"
          />
        </div>
      </div>

      {/* Legend & Counts */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-semibold">FDI Notation:</span>
        <span>11-18 Upper Right</span>
        <span>21-28 Upper Left</span>
        <span>31-38 Lower Left</span>
        <span>41-48 Lower Right</span>
        {Object.entries(conditionCounts).map(([condition, count]) => (
          <span key={condition} className="flex items-center gap-1">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: CONDITION_COLORS[condition as ToothCondition] }}
            />
            {CONDITION_LABELS[condition as ToothCondition]}: {count}
          </span>
        ))}
      </div>

      {/* Selected tooth info */}
      {selectedTooth !== null && (
        <div className="rounded-md bg-muted p-3 text-sm">
          <span className="font-semibold">Selected: Tooth {selectedTooth}</span>
          <span className="text-muted-foreground">
            {" "}&middot; Click a surface to apply {CONDITION_LABELS[activeTool]}
          </span>
        </div>
      )}
    </div>
  );
}

export { CONDITION_COLORS, CONDITION_LABELS, SURFACE_LABELS };
