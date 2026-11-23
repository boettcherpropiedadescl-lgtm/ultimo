import {interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {colors, fontFamily} from "../theme";

export const ServiceList: React.FC<{items: string[]; startFrame?: number}> = ({items, startFrame = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: "flex", flexDirection: "column", gap: 44}}>
      {items.map((item, i) => {
        const local = frame - startFrame - i * 10;
        const p = spring({frame: local, fps, config: {damping: 18, stiffness: 160}});
        const bar = interpolate(local, [6, 26], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
        return (
          <div
            key={item}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 36,
              transform: `translateX(${(1 - p) * 160}px)`,
              opacity: p,
              fontFamily,
            }}
          >
            <div style={{fontSize: 46, fontWeight: 800, color: colors.copper, minWidth: 96}}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <div style={{flex: 1}}>
              <div style={{fontSize: 74, fontWeight: 800, color: colors.white, lineHeight: 1.05}}>{item}</div>
              <div style={{height: 6, marginTop: 18, borderRadius: 3, background: colors.copper, width: `${bar * 100}%`}} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
