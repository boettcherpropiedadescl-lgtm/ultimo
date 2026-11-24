import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {AnimatedBackground} from "./AnimatedBackground";
import {colors} from "../theme";

// Fondo cinematográfico: empuje de cámara lento, viñeta y grano. Tono frío (preocupación) o cálido (confianza).
export const CinematicShell: React.FC<{tone: "cold" | "warm"; children: React.ReactNode}> = ({tone, children}) => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const push = interpolate(f, [0, durationInFrames], [1, 1.07], {extrapolateRight: "clamp"});
  return (
    <AbsoluteFill style={{overflow: "hidden"}}>
      <AbsoluteFill style={{transform: `scale(${push})`}}>
        <AnimatedBackground accent={tone === "cold" ? "#6f8aa3" : colors.copper} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.78) 100%)"}} />
      {children}
    </AbsoluteFill>
  );
};
