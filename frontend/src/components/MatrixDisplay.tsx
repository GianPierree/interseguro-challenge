/**
 * @file MatrixDisplay.tsx
 * @description Renders a 2D matrix as an HTML table with monospace formatting.
 */

interface MatrixDisplayProps {
  label: string;
  matrix: number[][];
}

export default function MatrixDisplay({ label, matrix }: MatrixDisplayProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Matriz {label}
      </h3>
      <div className="overflow-x-auto">
        <table className="text-sm font-mono border-collapse">
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                {row.map((val, j) => (
                  <td
                    key={j}
                    className="px-3 py-1.5 border border-gray-200 text-right bg-gray-50 rounded"
                  >
                    {val.toFixed(6)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
