import {interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {colors, fontFamily} from "../theme";

// Ilustración vectorial original de un edificio (no es una foto de ninguna propiedad).
// Se revela en 2.5D: rotación y escala con resorte, y luces de ventanas que parpadean de forma determinista.
const floors = 6;
const cols = 4;

export const PropertyScene: React.FC<{label?: string}> = ({label = "EN ARRIENDO"}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 20, stiffness: 90}});
  const rotY = interpolate(p, [0, 1], [-38, -14]);
  const rotX = interpolate(p, [0, 1], [18, 6]);
  const scale = interpolate(p, [0, 1], [0.8, 1]);

  return (
    <div style={{perspective: 1400, display: "flex", justifyContent: "center"}}>
      <div
        style={{
          transform: `rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${scale})`,
          transformStyle: "preserve-3d",
          filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.55))",
        }}
      >
        <svg width={760} height={820} viewBox="0 0 760 820">
          <defs>
            <linearGradient id="facade" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2a2f36" />
              <stop offset="100%" stopColor="#15181c" />
            </linearGradient>
            <linearGradient id="sign" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={colors.copper} />
              <stop offset="100%" stopColor={colors.copperSoft} />
            </linearGradient>
          </defs>
          {/* Cuerpo del edificio */}
          <rect x="120" y="150" width="520" height="640" rx="14" fill="url(#facade)" stroke="#3a4048" strokeWidth="3" />
          {/* Ventanas */}
          {Array.from({length: floors}).map((_, r) =>
            Array.from({length: cols}).map((__, c) => {
              const on = (r * 7 + c * 3) % 5 !== 0;
              const flicker = on && (frame + r * 11 + c * 17) % 97 < 90;
              const x = 160 + c * 118;
              const y = 190 + r * 96;
              const reveal = interpolate(frame, [10 + r * 4, 22 + r * 4], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <rect
                  key={`${r}-${c}`}
                  x={x}
                  y={y}
                  width={84}
                  height={62}
                  rx={6}
                  fill={flicker ? colors.copperSoft : "#0c0e11"}
                  opacity={reveal * (flicker ? 0.9 : 0.85)}
                />
              );
            }),
          )}
          {/* Puerta */}
          <rect x="330" y="680" width="100" height="110" rx="8" fill="#0c0e11" />
          {/* Cartel */}
          <g opacity={interpolate(frame, [30, 45], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}>
            <rect x="200" y="40" width="360" height="74" rx="16" fill="url(#sign)" />
            <text x="380" y="92" textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize="40" fill={colors.graphiteDeep} letterSpacing="4">
              {label}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
