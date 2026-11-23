import {interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {colors, fontFamily} from "../theme";
import {HookText} from "./HookText";

export const CTAEndCard: React.FC<{headline: string; cta: string; brand: string}> = ({headline, cta, brand}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const btn = spring({frame: frame - 40, fps, config: {damping: 12, stiffness: 150}});
  const pulse = 1 + Math.sin(Math.max(0, frame - 60) / 6) * 0.025 * interpolate(frame, [60, 75], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const brandOpacity = interpolate(frame, [70, 90], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

  return (
    <div style={{display: "flex", flexDirection: "column", gap: 56}}>
      <HookText text={headline} fontSize={118} highlight={["propiedad"]} />
      <div
        style={{
          alignSelf: "flex-start",
          fontFamily,
          fontWeight: 800,
          fontSize: 64,
          color: colors.graphiteDeep,
          background: colors.copper,
          borderRadius: 999,
          padding: "34px 70px",
          transform: `scale(${btn * pulse}) translateY(${(1 - btn) * 40}px)`,
          opacity: btn,
          boxShadow: `0 20px 50px ${colors.copper}55`,
        }}
      >
        {cta}
      </div>
      <div style={{opacity: brandOpacity, marginTop: 40}}>
        <div style={{fontFamily, fontWeight: 900, fontSize: 52, letterSpacing: 10, color: colors.white}}>
          {brand.toUpperCase()}
        </div>
        <div style={{height: 3, width: 220, background: colors.copper, marginTop: 14}} />
      </div>
    </div>
  );
};
