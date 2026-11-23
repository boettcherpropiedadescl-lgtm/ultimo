import {AbsoluteFill, useCurrentFrame} from "remotion";
import {colors} from "../theme";

// Fondo determinista: el brillo cobre se mueve con seno del frame local, sin CSS no sincronizado.
export const AnimatedBackground: React.FC<{accent?: string}> = ({
  accent = colors.copper,
}) => {
  const frame = useCurrentFrame();
  const x = 50 + Math.sin(frame / 38) * 14;
  const y = 38 + Math.cos(frame / 46) * 9;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(168deg, ${colors.graphite} 0%, ${colors.graphiteDeep} 100%)`,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${x}% ${y}%, ${accent}66 0%, transparent 48%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 110%, rgba(255,255,255,0.06) 0%, transparent 55%)",
        }}
      />
      <svg width="100%" height="100%" style={{position: "absolute", inset: 0, opacity: 0.09, mixBlendMode: "overlay"}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
