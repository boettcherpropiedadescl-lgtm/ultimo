import {interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {colors, fontFamily} from "../theme";

// Texto por palabras SIN desenfoque ni giro 3D: solo opacidad y desplazamiento, y al terminar la animación
// la palabra queda sin transform/opacity. Evita el parpadeo de palabras que producía HookText en Chrome.
export const StableText: React.FC<{
  text: string;
  startFrame?: number;
  fontSize?: number;
  color?: string;
  highlight?: string[];
  highlightColor?: string;
  weight?: number;
  uppercase?: boolean;
}> = ({text, startFrame = 0, fontSize = 90, color = colors.white, highlight = [], highlightColor = colors.copper, weight = 900, uppercase = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{fontFamily, fontWeight: weight, fontSize, lineHeight: 1.02, letterSpacing: -fontSize * 0.02, color,
      textTransform: uppercase ? "uppercase" : "none"}}>
      {text.split(" ").map((word, i) => {
        const local = frame - startFrame - i * 3;
        const p = spring({frame: local, fps, config: {damping: 18, stiffness: 190}});
        const settled = local >= 24 && p > 0.999;
        const isHi = highlight.includes(word.replace(/[¿?,.!:]/g, ""));
        const anim = settled
          ? {}
          : {opacity: interpolate(local, [0, 6], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
             transform: `translateY(${Math.round((1 - Math.min(1, p)) * 50)}px)`};
        return (
          <span key={`${word}-${i}`} style={{display: "inline-block", marginRight: fontSize * 0.22, color: isHi ? highlightColor : color, ...anim}}>
            {word}
          </span>
        );
      })}
    </div>
  );
};
