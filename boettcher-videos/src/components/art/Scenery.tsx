import {interpolate, interpolateColors, useCurrentFrame} from "remotion";
import {colors, fontFamily} from "../../theme";

// Ilustraciones vectoriales animadas (casa, monedas, documentos, escudo, skyline). Todas tienen movimiento propio.

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const House: React.FC<{width?: number; sign: string; lit: boolean; signColor?: string}> = ({width = 340, sign, lit, signColor = colors.copper}) => {
  const f = useCurrentFrame();
  const swing = Math.sin(f / 14) * 7;
  const smoke = [0, 1, 2].map((i) => ((f / 90 + i / 3) % 1));
  const windows = [[78, 168], [218, 168]];
  return (
    <svg viewBox="0 0 360 330" width={width} height={(width * 330) / 360} style={{overflow: "visible"}}>
      {smoke.map((s, i) => (
        <circle key={i} cx={262 + s * 16} cy={70 - s * 70} r={8 + s * 14} fill="rgba(255,255,255,0.18)" opacity={1 - s} />
      ))}
      <rect x={236} y={64} width={30} height={64} fill="#4b3b34" />
      <path d="M20 140 L180 34 L340 140 Z" fill="#6b3f35" />
      <rect x={44} y={138} width={272} height={176} fill="#d9d3c7" />
      <rect x={44} y={296} width={272} height={18} fill="#a79f90" />
      {windows.map(([x, y], i) => {
        const flicker = lit ? 0.85 + Math.sin(f / (9 + i * 4)) * 0.08 : 0.18;
        return (
          <g key={i}>
            <rect x={x} y={y} width={64} height={70} rx={4} fill="#243247" />
            <rect x={x + 3} y={y + 3} width={58} height={64} rx={3} fill={lit ? "#ffd36a" : "#1a2230"} opacity={flicker} />
            <path d={`M${x + 32} ${y + 3} V${y + 67} M${x + 3} ${y + 35} H${x + 61}`} stroke="#243247" strokeWidth={4} />
          </g>
        );
      })}
      <rect x={152} y={206} width={58} height={108} rx={4} fill="#5a3a2e" />
      <circle cx={198} cy={262} r={4} fill="#ffd36a" />
      <g transform={`translate(300 150) rotate(${swing} 0 0)`}>
        <path d="M0 0 V28" stroke="#4b3b34" strokeWidth={4} />
        <rect x={-46} y={26} width={104} height={46} rx={8} fill={signColor} />
        <text x={6} y={57} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={22} fill={colors.graphiteDeep}>{sign}</text>
      </g>
    </svg>
  );
};

export const Coins: React.FC<{width: number; height: number; count?: number; up?: boolean; opacity?: number}> = ({width, height, count = 9, up = false, opacity = 1}) => {
  const f = useCurrentFrame();
  return (
    <svg width={width} height={height} style={{position: "absolute", left: 0, top: 0, overflow: "visible", opacity}}>
      {Array.from({length: count}).map((_, i) => {
        const x = hash(i + 1) * (width - 50) + 25;
        const speed = 0.9 + hash(i + 40) * 1.2;
        const phase = hash(i + 80) * height;
        const prog = (((f * speed * 2.4 + phase) % (height + 80)) + (height + 80)) % (height + 80);
        const y = up ? height - prog : prog - 40;
        const spin = Math.cos((f + i * 9) / 7);
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${Math.max(0.15, Math.abs(spin))} 1)`}>
            <circle r={22} fill="#f5c542" stroke="#b8860b" strokeWidth={4} />
            <text y={9} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={26} fill="#8a6508">$</text>
          </g>
        );
      })}
    </svg>
  );
};

export const Papers: React.FC<{width: number; height: number; count?: number; opacity?: number}> = ({width, height, count = 5, opacity = 1}) => {
  const f = useCurrentFrame();
  return (
    <svg width={width} height={height} style={{position: "absolute", left: 0, top: 0, overflow: "visible", opacity}}>
      {Array.from({length: count}).map((_, i) => {
        const bx = (i + 0.5) * (width / count);
        const x = bx + Math.sin(f / (22 + i * 5) + i) * 26;
        const y = height * 0.35 + Math.cos(f / (26 + i * 4) + i * 2) * 40 + (i % 2) * 70;
        const rot = Math.sin(f / (30 + i * 6) + i) * 18;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
            <rect x={-34} y={-44} width={68} height={88} rx={6} fill="#f4efe4" stroke="#b9b09c" strokeWidth={3} />
            <path d="M-20 -22 h40 M-20 -8 h40 M-20 6 h28" stroke="#9aa3b2" strokeWidth={4} strokeLinecap="round" />
            <circle cx={16} cy={26} r={12} fill="none" stroke="#d9503f" strokeWidth={4} />
            <path d="M10 26 h12" stroke="#d9503f" strokeWidth={4} strokeLinecap="round" />
          </g>
        );
      })}
    </svg>
  );
};

export const Shield: React.FC<{width?: number}> = ({width = 300}) => {
  const f = useCurrentFrame();
  const pulse = 1 + Math.sin(f / 10) * 0.03;
  const glow = 0.35 + (Math.sin(f / 12) + 1) * 0.15;
  return (
    <svg viewBox="0 0 200 240" width={width} height={(width * 240) / 200} style={{overflow: "visible"}}>
      <circle cx={100} cy={120} r={110} fill={colors.copper} opacity={glow * 0.5} />
      <g transform={`translate(100 120) scale(${pulse}) translate(-100 -120)`}>
        <path d="M100 10 L180 42 V112 C180 168 144 206 100 226 C56 206 20 168 20 112 V42 Z" fill="#2b3550" stroke={colors.copperSoft} strokeWidth={8} />
        <path d="M100 30 L162 54 V112 C162 158 134 190 100 207 C66 190 38 158 38 112 V54 Z" fill={`${colors.copper}33`} />
        <path d="M66 118 L92 144 L138 88" fill="none" stroke={colors.copperSoft} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
};

// Skyline inferior con ventanas que se encienden y apagan. warmAt: fotograma desde el que se vuelve cálido.
export const Skyline: React.FC<{warmAt: number; fast?: boolean; bodyColor?: string; tintColor?: string}> = ({warmAt, fast = false, bodyColor, tintColor}) => {
  const f = useCurrentFrame();
  const tint = tintColor ?? interpolateColors(f, [warmAt - 14, warmAt + 14], ["#7fa0c0", "#ffcf6e"]);
  const body = bodyColor ?? interpolateColors(f, [warmAt - 14, warmAt + 14], ["#161c26", "#1d1b1a"]);
  const buildings: {x: number; w: number; h: number}[] = [];
  let x = -20;
  for (let i = 0; x < 1100; i++) {
    const w = 80 + Math.floor(hash(i + 3) * 90);
    const h = 120 + Math.floor(hash(i + 11) * 230);
    buildings.push({x, w, h});
    x += w + 6;
  }
  const drift = interpolate(f, [0, 1800], [0, -40], {extrapolateRight: "clamp"});
  return (
    <svg width={1080} height={380} style={{position: "absolute", left: 0, bottom: 0}}>
      <g transform={`translate(${drift} 0)`}>
        {buildings.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={380 - b.h} width={b.w} height={b.h} fill={body} />
            {Array.from({length: Math.floor(b.h / 34)}).map((_, r) =>
              Array.from({length: Math.floor(b.w / 28)}).map((__, c) => {
                const on = hash(i * 97 + r * 13 + c * 7 + Math.floor((f + i * 11) / (fast ? 18 : 55))) > 0.62;
                return <rect key={`${r}-${c}`} x={b.x + 10 + c * 28} y={380 - b.h + 14 + r * 34} width={14} height={18} rx={2} fill={tint} opacity={on ? 0.85 : 0.08} />;
              }),
            )}
          </g>
        ))}
      </g>
    </svg>
  );
};

// Brillos suaves que flotan por todo el cuadro para que ninguna zona quede estática o vacía.
export const Bokeh: React.FC<{warmAt: number}> = ({warmAt}) => {
  const f = useCurrentFrame();
  const c = interpolateColors(f, [warmAt - 14, warmAt + 14], ["#8fb0d0", "#ffc978"]);
  return (
    <div style={{position: "absolute", inset: 0, pointerEvents: "none"}}>
      {Array.from({length: 14}).map((_, i) => {
        const size = 120 + hash(i + 5) * 220;
        const x = hash(i + 20) * 1080 + Math.sin(f / (60 + i * 7) + i) * 70;
        const y = hash(i + 50) * 1920 + Math.cos(f / (70 + i * 5) + i * 2) * 90;
        return <div key={i} style={{position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: "50%",
          background: `radial-gradient(circle, ${c}33 0%, transparent 65%)`, opacity: 0.45 + 0.25 * Math.sin(f / 40 + i)}} />;
      })}
    </div>
  );
};

// Brasas que suben lentamente por todo el cuadro: movimiento continuo sin tocar el texto.
export const Embers: React.FC<{warmAt: number; count?: number; color?: string; strength?: number}> = ({warmAt, count = 34, color, strength = 1}) => {
  const f = useCurrentFrame();
  const c = color ?? interpolateColors(f, [warmAt - 14, warmAt + 14], ["#9fc0e0", "#ffc978"]);
  return (
    <div style={{position: "absolute", inset: 0, pointerEvents: "none"}}>
      {Array.from({length: count}).map((_, i) => {
        const size = 5 + hash(i + 3) * 11;
        const speed = 1.2 + hash(i + 17) * 2.4;
        const y = 1960 - (((f * speed + hash(i + 31) * 2200) % 2200));
        const x = hash(i + 7) * 1080 + Math.sin(f / (40 + i * 3) + i) * 34;
        return <div key={i} style={{position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%", background: c,
          opacity: strength * (0.22 + 0.3 * (0.5 + 0.5 * Math.sin(f / 18 + i)))}} />;
      })}
    </div>
  );
};

// Fondo claro (crema) con luces suaves en movimiento, partículas y skyline pálido: el modelo "claro" del comercial.
export const LightBackground: React.FC = () => {
  const f = useCurrentFrame();
  const x1 = 28 + Math.sin(f / 70) * 18, y1 = 24 + Math.cos(f / 90) * 10;
  const x2 = 74 + Math.cos(f / 80) * 16, y2 = 60 + Math.sin(f / 60) * 12;
  const push = 1 + 0.06 * Math.min(1, f / 1700);
  return (
    <div style={{position: "absolute", inset: 0, overflow: "hidden", background: "linear-gradient(170deg, #fdf8ee 0%, #f3e9d7 100%)"}}>
      <div style={{position: "absolute", inset: 0, transform: `scale(${push})`,
        background: `radial-gradient(circle at ${x1}% ${y1}%, rgba(242,183,5,0.30) 0%, transparent 46%), radial-gradient(circle at ${x2}% ${y2}%, rgba(60,80,200,0.14) 0%, transparent 52%)`}} />
      <Embers warmAt={0} color="#0b1240" strength={0.55} count={26} />
      <Skyline warmAt={0} fast bodyColor="#e1e5f3" tintColor="#f2b705" />
    </div>
  );
};
