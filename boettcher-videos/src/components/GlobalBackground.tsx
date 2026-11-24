import {AbsoluteFill, interpolate, interpolateColors, useCurrentFrame, useVideoConfig} from "remotion";
import {AnimatedBackground} from "./AnimatedBackground";
import {colors} from "../theme";

// Fondo único para todo el comercial: zoom lento y continuo, viñeta y tono que pasa de frío a cálido
// alrededor de un fotograma dado, sin reinicios ni saltos entre escenas.
export const GlobalBackground: React.FC<{warmAtFrame: number}> = ({warmAtFrame}) => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const push = interpolate(f, [0, durationInFrames], [1, 1.1], {extrapolateRight: "clamp"});
  const accent = interpolateColors(f, [warmAtFrame - 14, warmAtFrame + 14], ["#6f8aa3", colors.copper]);
  return (
    <AbsoluteFill style={{overflow: "hidden"}}>
      <AbsoluteFill style={{transform: `scale(${push})`}}>
        <AnimatedBackground accent={accent} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.78) 100%)"}} />
    </AbsoluteFill>
  );
};
