'use client';

export function YellowCircleSVG() {
  return (
    <svg
      viewBox="0 0 200 80"
      className="absolute w-48 h-20 -top-4 left-0 opacity-80"
      style={{ pointerEvents: 'none' }}
    >
      <path
        d="M 20 50 Q 40 20, 80 20 Q 120 20, 160 50"
        stroke="#FDE047"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
