/**
 * A rectangle drawn at the given ratio inside a 16px box, so ratio options can be
 * compared at a glance.
 * @param {{ ratio: [number, number], className?: string }} props
 */
export function AspectRatioIcon({ ratio: [width, height], className }) {
  const scale = 12 / Math.max(width, height);
  const w = width * scale;
  const h = height * scale;
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" className={className}>
      <rect
        x={(16 - w) / 2}
        y={(16 - h) / 2}
        width={w}
        height={h}
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
