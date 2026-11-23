import {interpolate, useCurrentFrame} from "remotion";
import {colors, fontFamily} from "../theme";

export const SubText: React.FC<{text: string; startFrame?: number; size?: number; color?: string}> = ({
  text,
  startFrame = 0,
  size = 52,
  color = colors.muted,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - startFrame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <p
      style={{
        fontFamily,
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1.3,
        color,
        margin: 0,
        marginTop: 48,
        opacity: t,
        transform: `translateY(${(1 - t) * 30}px)`,
      }}
    >
      {text}
    </p>
  );
};
