import React, { useMemo } from 'react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
  showLogo?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 180,
  className = '',
  showLogo = true
}) => {
  // Generate deterministic binary matrix based on hash of string
  const grid = useMemo(() => {
    const matrixSize = 21;
    const result: boolean[][] = Array(matrixSize).fill(false).map(() => Array(matrixSize).fill(false));
    
    // Hash string value to seed pseudo randomness
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = ((hash << 5) - hash) + value.charCodeAt(i);
      hash |= 0;
    }

    // Helper to draw finder patterns
    const drawFinderPattern = (row: number, col: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            if (row + r < matrixSize && col + c < matrixSize) {
              result[row + r][col + c] = true;
            }
          }
        }
      }
    };

    // Draw standard finder patterns at 3 corners
    drawFinderPattern(0, 0);
    drawFinderPattern(0, matrixSize - 7);
    drawFinderPattern(matrixSize - 7, 0);

    // Fill data bits with hash distribution
    let seed = Math.abs(hash);
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        // Skip finder pattern zones
        const isTopLeft = r < 8 && c < 8;
        const isTopRight = r < 8 && c >= matrixSize - 8;
        const isBottomLeft = r >= matrixSize - 8 && c < 8;
        const isCenterLogo = showLogo && r >= 8 && r <= 12 && c >= 8 && c <= 12;

        if (!isTopLeft && !isTopRight && !isBottomLeft && !isCenterLogo) {
          seed = (seed * 9301 + 49297) % 233280;
          result[r][c] = (seed / 233280) > 0.42;
        }
      }
    }

    return result;
  }, [value, showLogo]);

  const matrixSize = grid.length;
  const cellSize = size / matrixSize;

  return (
    <div className={`relative inline-flex items-center justify-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {grid.map((row, r) =>
          row.map((cell, c) => {
            if (!cell) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize + 0.3}
                height={cellSize + 0.3}
                fill="#0F172A"
                rx={0.5}
              />
            );
          })
        )}
      </svg>
      {showLogo && (
        <div 
          className="absolute bg-white rounded-md p-1 shadow-md border border-slate-200 flex items-center justify-center text-indigo-600 font-bold text-xs"
          style={{ width: size * 0.22, height: size * 0.22 }}
        >
          <span className="leading-none text-[10px] tracking-tight text-indigo-700 font-black">TIX</span>
        </div>
      )}
    </div>
  );
};
