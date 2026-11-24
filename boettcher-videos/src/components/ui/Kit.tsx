import {Easing, interpolate, interpolateColors, useCurrentFrame} from "remotion";
import {fontFamily} from "../../theme";
import {useTheme} from "../../theme-context";

// Piezas de interfaz animadas (tarjeta con ventana, interruptor, visto, cursor con clic, confeti). Lenguaje de movimiento inspirado en
// reels de tutoriales: tarjetas que entran con rebote, interruptores que se encienden, cursor que hace clic y subtítulos por palabra.

export const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const rev = (f: number, at: number, d = 14) => interpolate(f, [at, at + d], [0, 1], clamp);

// Estilo de entrada: vacío cuando la animación terminó (evita capas de composición permanentes en el texto).
export const enter = (p: number, dx = 0, dy = 30): React.CSSProperties =>
  p >= 0.999 ? {} : {opacity: p, transform: `translate(${Math.round((1 - p) * dx)}px, ${Math.round((1 - p) * dy)}px)`};

export const HEADER_H = 70;

// Tarjeta con barra de ventana. El cuerpo es position:relative para colocar el contenido en coordenadas conocidas.
const Shine: React.FC = () => {
  const f = useCurrentFrame();
  const T = useTheme();
  const x = ((f * 9) % 1500) - 320;
  return <div style={{position: "absolute", left: x, top: 0, bottom: 0, width: 220, transform: "skewX(-20deg)", pointerEvents: "none",
    background: `linear-gradient(90deg, transparent, ${T.shine}, transparent)`}} />;
};

export const Card: React.FC<{title?: string; height: number; accent?: string; children?: React.ReactNode; style?: React.CSSProperties}> = ({title, height, accent, children, style}) => {
  const T = useTheme();
  return (
    <div style={{position: "relative", height, boxSizing: "border-box", borderRadius: 36, background: T.card, border: `2px solid ${accent ?? T.cardBorder}`,
      boxShadow: T.cardShadow, overflow: "hidden", ...style}}>
      <div style={{height: HEADER_H, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 10, padding: "0 26px", background: T.headerBg,
        borderBottom: `1px solid ${T.headerBorder}`}}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} style={{width: 16, height: 16, borderRadius: 8, background: c, display: "inline-block"}} />)}
        {title ? <span style={{marginLeft: 16, fontFamily, fontWeight: 800, fontSize: 24, letterSpacing: 3, color: T.muted}}>{title}</span> : null}
      </div>
      <div style={{position: "relative", height: height - HEADER_H}}>{children}</div>
      <Shine />
    </div>
  );
};

export const Toggle: React.FC<{at: number; x: number; y: number}> = ({at, x, y}) => {
  const f = useCurrentFrame();
  const T = useTheme();
  const p = interpolate(f, [at, at + 8], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const w = 104, h = 56;
  return (
    <div style={{position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: h / 2, background: interpolateColors(p, [0, 1], [T.toggleOff, "#3ecf8e"])}}>
      <div style={{position: "absolute", top: 6, left: 6 + p * (w - h), width: h - 12, height: h - 12, borderRadius: "50%", background: "#fff"}} />
    </div>
  );
};

export const Check: React.FC<{at: number; x: number; y: number; size?: number; color?: string}> = ({at, x, y, size = 48, color = "#3ecf8e"}) => {
  const f = useCurrentFrame();
  const p = rev(f, at, 10);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{position: "absolute", left: x - size / 2, top: y - size / 2, opacity: p > 0 ? 1 : 0}}>
      <circle cx="12" cy="12" r="11" fill={`${color}33`} stroke={color} strokeWidth="1.6" />
      <path d="M6.5 12.5 L10.5 16.5 L17.5 8" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20" strokeDashoffset={20 * (1 - p)} />
    </svg>
  );
};

export const Cross: React.FC<{at: number; size?: number}> = ({at, size = 56}) => {
  const f = useCurrentFrame();
  const p = rev(f, at, 8);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{opacity: p > 0 ? 1 : 0, transform: p >= 1 ? undefined : `scale(${0.4 + 0.6 * p})`}}>
      <circle cx="12" cy="12" r="11" fill="#e0705a33" stroke="#e0705a" strokeWidth="1.6" />
      <path d="M8 8 L16 16 M16 8 L8 16" stroke="#e0705a" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
};

// Confeti o monedas que salen de un punto y caen con gravedad.
export const Burst: React.FC<{at: number; x: number; y: number; count?: number; coins?: boolean; up?: boolean}> = ({at, x, y, count = 26, coins = false, up = false}) => {
  const f = useCurrentFrame();
  const T = useTheme();
  const t = f - at;
  if (t < 0 || t > 70) return null;
  const palette = T.confetti;
  return (
    <svg width={1080} height={1920} style={{position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none"}}>
      {Array.from({length: count}).map((_, i) => {
        const ang = up ? -hash(i + 1) * Math.PI : hash(i + 1) * Math.PI * 2;
        const sp = 6 + hash(i + 40) * 13;
        const px = x + Math.cos(ang) * sp * t;
        const py = y + Math.sin(ang) * sp * t * 0.9 + 0.42 * t * t - 40;
        const op = 1 - interpolate(t, [40, 70], [0, 1], clamp);
        const rot = t * (6 + hash(i + 80) * 14) * (i % 2 ? 1 : -1);
        return coins ? (
          <g key={i} transform={`translate(${px} ${py}) rotate(${rot})`} opacity={op}>
            <circle r={16} fill="#f5c542" stroke="#b8860b" strokeWidth={3} />
            <text y={7} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={20} fill="#8a6508">$</text>
          </g>
        ) : (
          <rect key={i} x={-8} y={-4} width={16} height={8} rx={2} fill={palette[i % palette.length]} opacity={op} transform={`translate(${px} ${py}) rotate(${rot})`} />
        );
      })}
    </svg>
  );
};

export type CursorPt = {at: number; x: number; y: number; click?: boolean};
// Cursor que recorre puntos en coordenadas de pantalla y hace clic (anillo) en los marcados.
export const Cursor: React.FC<{pts: CursorPt[]}> = ({pts}) => {
  const f = useCurrentFrame();
  const T = useTheme();
  let i = 0;
  pts.forEach((p, k) => { if (f >= p.at) i = k; });
  const a = pts[i];
  const b = pts[Math.min(i + 1, pts.length - 1)];
  const prog = a === b ? 0 : interpolate(f, [b.at - 16, b.at], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const move = f >= a.at && a !== b ? prog : 0;
  const x = a.x + (b.x - a.x) * move + Math.sin(f / 9) * 4;
  const y = a.y + (b.y - a.y) * move + Math.cos(f / 11) * 4;
  const ripple = pts.map((p) => ({p, t: f - p.at})).filter(({p, t}) => p.click && t >= 0 && t < 18);
  return (
    <div style={{position: "absolute", left: 0, top: 0, pointerEvents: "none"}}>
      {ripple.map(({p, t}, k) => (
        <div key={k} style={{position: "absolute", left: p.x - 30 * (t / 18) - 8, top: p.y - 30 * (t / 18) - 8, width: 60 * (t / 18) + 16, height: 60 * (t / 18) + 16, borderRadius: "50%",
          border: `4px solid ${T.accentText}`, opacity: 1 - t / 18}} />
      ))}
      <svg width={54} height={64} viewBox="0 0 27 32" style={{position: "absolute", left: x - 4, top: y - 4, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))"}}>
        <path d="M3 2 L3 24 L9 18 L14 29 L18 27 L13 17 L22 17 Z" fill="#ffffff" stroke="#111" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

// Marcador de carga con brillo que recorre (como las interfaces mientras llega el contenido): evita cuerpos de tarjeta vacíos.
export const Skeleton: React.FC<{x: number; y: number; w: number; h: number; radius?: number}> = ({x, y, w, h, radius = 24}) => {
  const f = useCurrentFrame();
  const T = useTheme();
  const sh = ((f * 16) % (w + 320)) - 160;
  return (
    <div style={{position: "absolute", left: x, top: y, width: w, height: h, borderRadius: radius, background: T.skeleton, overflow: "hidden", border: `2px solid ${T.skeletonBorder}`, boxSizing: "border-box"}}>
      <div style={{position: "absolute", left: sh, top: 0, width: 160, height: "100%", background: `linear-gradient(90deg, transparent, ${T.skeletonShine}, transparent)`}} />
    </div>
  );
};
