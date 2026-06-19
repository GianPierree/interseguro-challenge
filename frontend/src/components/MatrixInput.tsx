/**
 * @file MatrixInput.tsx
 * @description Component to input an N×M matrix as a text area (JSON format)
 * with real-time parse feedback.
 */

import { useState } from "react";

interface MatrixInputProps {
  onSubmit: (matrix: number[][]) => void;
  disabled?: boolean;
}

const EXAMPLE = JSON.stringify(
  [
    [1, 2],
    [3, 4],
    [5, 6],
  ],
  null,
  2
);

export default function MatrixInput({ onSubmit, disabled }: MatrixInputProps) {
  const [raw, setRaw] = useState(EXAMPLE);
  const [parseError, setParseError] = useState<string | null>(null);

  function handleSubmit() {
    try {
      const parsed: unknown = JSON.parse(raw);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("Debe ser un array de arrays.");
      }
      const cols = (parsed[0] as unknown[]).length;
      for (const row of parsed as unknown[][]) {
        if (!Array.isArray(row) || row.length !== cols) {
          throw new Error("Todas las filas deben tener el mismo número de columnas.");
        }
        if (row.some((v) => typeof v !== "number")) {
          throw new Error("Todos los elementos deben ser números.");
        }
      }
      if (parsed.length < cols) {
        throw new Error("La matriz debe tener filas ≥ columnas para QR.");
      }

      setParseError(null);
      onSubmit(parsed as number[][]);
    } catch (e) {
      setParseError((e as Error).message);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-medium text-gray-700">
        Ingresa la matriz en formato JSON (array de arrays):
      </label>
      <textarea
        className="w-full h-48 font-mono text-sm border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        disabled={disabled}
        spellCheck={false}
      />
      {parseError && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-2">
          {parseError}
        </p>
      )}
      <button
        onClick={handleSubmit}
        disabled={disabled}
        className="self-start bg-brand-blue text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {disabled ? "Procesando…" : "Factorizar QR →"}
      </button>
    </div>
  );
}
