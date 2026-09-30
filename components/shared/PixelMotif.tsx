// components/shared/PixelMotif.tsx
//
// The App Mockup's decorative pixel motif — one inline SVG, 9x11 cells,
// drawn with currentColor, verified against the supplied artwork. Sits
// top-right of a topbar, bleeding off the corner. Decoration only: never
// carries meaning, never sits above content, never uses coral (coral is
// the one-per-screen spotlight colour, and a solid coral motif on a
// screen whose action button is also coral would defeat that).
'use client';

export type MotifColour = 'navy' | 'burgundy' | 'blue' | 'cyan' | 'sage' | 'gold' | 'pink';

const COLOUR_VAR: Record<MotifColour, string> = {
  navy: 'var(--c4c-petrol)',
  burgundy: 'var(--c4c-burgundy)',
  blue: 'var(--c4c-cobalt)',
  cyan: 'var(--c4c-paleblue)',
  sage: 'var(--c4c-sage)',
  gold: 'var(--c4c-yellow)',
  pink: 'var(--c4c-pink)',
};

export function PixelMotif({ colour, className }: { colour: MotifColour; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 9 11"
      fill="currentColor"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 0,
        width: 164,
        height: 'auto',
        pointerEvents: 'none',
        transform: 'translate(26%,-30%)',
        shapeRendering: 'crispEdges',
        color: COLOUR_VAR[colour],
      }}
    >
      <rect x="2" y="0" width="7" height="1" /><rect x="3" y="1" width="6" height="1" /><rect x="2" y="2" width="1" height="1" /><rect x="4" y="2" width="5" height="1" /><rect x="3" y="3" width="1" height="1" /><rect x="5" y="3" width="1" height="1" /><rect x="7" y="3" width="2" height="1" /><rect x="4" y="4" width="1" height="1" /><rect x="6" y="4" width="1" height="1" /><rect x="3" y="5" width="1" height="1" /><rect x="5" y="5" width="1" height="1" /><rect x="7" y="5" width="1" height="1" /><rect x="2" y="6" width="1" height="1" /><rect x="4" y="6" width="1" height="1" /><rect x="8" y="6" width="1" height="1" /><rect x="3" y="7" width="1" height="1" /><rect x="5" y="7" width="1" height="1" /><rect x="2" y="8" width="1" height="1" /><rect x="4" y="8" width="1" height="1" /><rect x="6" y="8" width="1" height="1" /><rect x="1" y="9" width="1" height="1" /><rect x="3" y="9" width="1" height="1" /><rect x="7" y="9" width="1" height="1" /><rect x="0" y="10" width="1" height="1" />
    </svg>
  );
}
