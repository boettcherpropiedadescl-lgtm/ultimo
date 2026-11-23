import {AbsoluteFill} from "remotion";
import {safe} from "../theme";

export const SafeArea: React.FC<{
  children: React.ReactNode;
  justify?: "center" | "flex-start" | "flex-end";
}> = ({children, justify = "center"}) => {
  return (
    <AbsoluteFill
      style={{
        paddingTop: safe.top,
        paddingBottom: safe.bottom,
        paddingLeft: safe.side,
        paddingRight: safe.side,
        display: "flex",
        flexDirection: "column",
        justifyContent: justify,
        alignItems: "stretch",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
