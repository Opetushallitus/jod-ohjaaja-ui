import React from 'react';

interface PatternAvatarProps {
  seed: string;
  size?: number; // in pixels
  rows?: number;
  cols?: number;
}

const PatternAvatar: React.FC<PatternAvatarProps> = ({ seed, size = 100, rows = 20, cols = 20 }) => {
  const cellSize = size / rows;

  // Create a simple hash from the seed
  const hash = Array.from(new TextEncoder().encode(seed)).reduce((a, b) => a + b, 0);

  // Use the hash to generate color hue
  const hue = hash % 360;
  const fillColor = `hsl(${hue}, 70%, 60%)`;

  // Generate grid pattern (only left half, then mirror)
  const pattern: boolean[][] = [];
  const halfCols = Math.ceil(cols / 2);
  let counter = 0;

  for (let y = 0; y < rows; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < halfCols; x++) {
      const bit = seed.charCodeAt(counter++ % seed.length) % 2 === 0;
      row.push(bit);
    }
    pattern.push(row);
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: '50%', background: '#fff' }}
    >
      <clipPath id="circleClip">
        <circle cx={size / 2} cy={size / 2} r={size / 2} />
      </clipPath>
      <g clipPath="url(#circleClip)">
        {pattern.map((row, y) =>
          row.map((on, x) => {
            if (!on) return null;
            const px = x * cellSize;
            const py = y * cellSize;
            const mirrorPx = (cols - 1 - x) * cellSize;
            return (
              <React.Fragment key={`${seed}-${x * rows + y}`}>
                <rect x={px} y={py} width={cellSize} height={cellSize} fill={fillColor} />
                {x !== cols - 1 - x && <rect x={mirrorPx} y={py} width={cellSize} height={cellSize} fill={fillColor} />}
              </React.Fragment>
            );
          }),
        )}
      </g>
    </svg>
  );
};

export default PatternAvatar;
