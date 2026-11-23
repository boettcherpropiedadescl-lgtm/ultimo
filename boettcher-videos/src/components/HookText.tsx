import {interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {colors, fontFamily} from "../theme";

type Props = {
  text: string;
  startFrame?: number;
  fontSize?: number;
  color?: string;
  highlight?: string[];
  highlightColor?: string;
  align?: "left" | "center";
  weight?: number;
};

// Revela palabra por palabra con resorte, desplazamiento 3D sutil y desenfoque al entrar.
export const HookText: React.FC<Props> = ({
  text,
  startFrame = 0,
  fontSize = 150,
  color = colors.white,
  highlight = [],
  highlightColor = colors.copper,
  align = "left",
  weight = 900,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      style={{
        fontFamily,
        fontWeight: weight,
        fontSize,
        lineHeight: 0.98,
        letterSpacing: -fontSize * 0.02,
        color,
        textAlign: align,
        textTransform: "uppercase",
        perspective: 900,
      }}
    >
      {words.map((word, i) => {
        const local = frame - startFrame - i * 4;
        const p = spring({frame: local, fps, config: {damping: 16, stiffness: 180}});
        const opacity = interpolate(local, [0, 6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const isHighlight = highlight.includes(word.replace(/[¿?,.!]/g, ""));
        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: "inline-block",
              marginRight: fontSize * 0.22,
              opacity,
              color: isHighlight ? highlightColor : color,
              transform: `translateY(${(1 - p) * 70}px) rotateX(${(1 - p) * -35}deg)`,
              filter: `blur(${(1 - p) * 8}px)`,
              transformOrigin: "50% 100%",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
