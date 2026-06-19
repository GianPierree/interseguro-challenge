/**
 * @file StatsDisplay.tsx
 * @description Renders the statistics returned by the Node.js API.
 */

import type { Statistics } from "@/services/matrixService";

interface StatsDisplayProps {
  stats: Statistics;
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
        {label}
      </span>
      <span className="text-xl font-semibold text-brand-dark font-mono">
        {String(value)}
      </span>
    </div>
  );
}

export default function StatsDisplay({ stats }: StatsDisplayProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-gray-700">
        Estadísticas (Node.js API)
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Máximo" value={stats.max} />
        <StatCard label="Mínimo" value={stats.min} />
        <StatCard label="Promedio" value={stats.average} />
        <StatCard label="Suma total" value={stats.sum} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Q es diagonal"
          value={stats.isDiagonal.Q ? "✅ Sí" : "❌ No"}
        />
        <StatCard
          label="R es diagonal"
          value={stats.isDiagonal.R ? "✅ Sí" : "❌ No"}
        />
      </div>
    </div>
  );
}
