import {createContext, useContext} from "react";
import {colors} from "./theme";

// Paleta intercambiable. La oscura reproduce exactamente los valores usados hasta ahora (los videos aprobados no cambian).
// La clara usa los colores de marca del logo: azul marino #010a4f y dorado #face04 sobre fondo crema.
export type Theme = {
  name: "dark" | "light";
  text: string; muted: string; accent: string; accentText: string; onAccent: string;
  panel: string; panelSoft: string; track: string; faint: string;
  card: string; cardBorder: string; cardShadow: string; headerBg: string; headerBorder: string;
  toggleOff: string; okText: string; stampBg: string; phoneBorder: string; phoneShadow: string;
  shine: string; skeleton: string; skeletonBorder: string; skeletonShine: string;
  capBg: string; capText: string; capCurrent: string; capKey: string;
  chipBg: string; chipBorder: string;
  logo: string; logoTopWidth: number; confetti: string[];
};

export const darkTheme: Theme = {
  name: "dark",
  text: colors.white, muted: colors.muted, accent: colors.copper, accentText: colors.copperSoft, onAccent: colors.graphiteDeep,
  panel: "rgba(255,255,255,0.07)", panelSoft: "rgba(255,255,255,0.05)", track: "rgba(255,255,255,0.12)", faint: "rgba(255,255,255,0.25)",
  card: "rgba(22,25,31,0.97)", cardBorder: "rgba(255,255,255,0.14)", cardShadow: "0 30px 80px rgba(0,0,0,0.55)",
  headerBg: "rgba(255,255,255,0.05)", headerBorder: "rgba(255,255,255,0.08)",
  toggleOff: "#454c58", okText: "#7ee8b4", stampBg: "rgba(22,25,31,0.9)", phoneBorder: "rgba(255,255,255,0.18)", phoneShadow: "0 40px 90px rgba(0,0,0,0.6)",
  shine: "rgba(255,255,255,0.08)", skeleton: "rgba(255,255,255,0.06)", skeletonBorder: "rgba(255,255,255,0.08)", skeletonShine: "rgba(255,255,255,0.14)",
  capBg: "rgba(13,15,18,0.80)", capText: colors.white, capCurrent: colors.copper, capKey: colors.copperSoft,
  chipBg: "rgba(255,255,255,0.08)", chipBorder: "rgba(255,255,255,0.14)",
  logo: "brand/logo-boettcher-transparente.png", logoTopWidth: 400,
  confetti: [colors.copper, colors.copperSoft, "#f5c542", "#ffffff", "#3ecf8e"],
};

export const lightTheme: Theme = {
  name: "light",
  text: "#0b1240", muted: "#5c6482", accent: "#f2b705", accentText: "#a87400", onAccent: "#0b1240",
  panel: "rgba(11,18,64,0.05)", panelSoft: "rgba(11,18,64,0.035)", track: "rgba(11,18,64,0.10)", faint: "rgba(11,18,64,0.25)",
  card: "#ffffff", cardBorder: "rgba(11,18,64,0.12)", cardShadow: "0 24px 60px rgba(30,40,90,0.16)",
  headerBg: "rgba(11,18,64,0.04)", headerBorder: "rgba(11,18,64,0.08)",
  toggleOff: "#c9cdd9", okText: "#12805a", stampBg: "rgba(255,255,255,0.92)", phoneBorder: "rgba(11,18,64,0.25)", phoneShadow: "0 30px 70px rgba(30,40,90,0.35)",
  shine: "rgba(242,183,5,0.14)", skeleton: "rgba(11,18,64,0.05)", skeletonBorder: "rgba(11,18,64,0.08)", skeletonShine: "rgba(255,255,255,0.85)",
  capBg: "rgba(255,255,255,0.94)", capText: "#0b1240", capCurrent: "#d49000", capKey: "#a87400",
  chipBg: "rgba(11,18,64,0.06)", chipBorder: "rgba(11,18,64,0.16)",
  logo: "brand/logo-boettcher.png", logoTopWidth: 330,
  confetti: ["#f2b705", "#0b1240", "#face04", "#3ecf8e", "#e0705a"],
};

export const ThemeCtx = createContext<Theme>(darkTheme);
export const useTheme = () => useContext(ThemeCtx);
