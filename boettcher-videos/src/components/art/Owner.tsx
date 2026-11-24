import {spring, useCurrentFrame, useVideoConfig} from "remotion";

// Personaje en caricatura (SVG propio, sin imágenes externas). La expresión y los brazos cambian según una línea de tiempo
// de estados de ánimo disparada por los cues del audio. Siempre tiene movimiento propio: respira, se mece y parpadea.
export type Mood = "neutral" | "worried" | "shock" | "overwhelmed" | "relieved" | "happy";
type V2 = [number, number];
type Pose = {
  smile: number; open: number; browRaise: number; browTilt: number; eyeWide: number; lookX: number; lookY: number; sweat: number;
  lElbow: V2; lHand: V2; rElbow: V2; rHand: V2; headTilt: number;
};

const POSES: Record<Mood, Pose> = {
  neutral: {smile: 0.3, open: 0, browRaise: 0, browTilt: 0, eyeWide: 0, lookX: 0, lookY: 0, sweat: 0, lElbow: [100, 300], lHand: [112, 385], rElbow: [300, 300], rHand: [288, 385], headTilt: 0},
  worried: {smile: -0.8, open: 0.1, browRaise: 4, browTilt: 18, eyeWide: 0.2, lookX: -4, lookY: 3, sweat: 1, lElbow: [100, 300], lHand: [112, 385], rElbow: [292, 285], rHand: [238, 112], headTilt: -4},
  shock: {smile: -0.2, open: 1, browRaise: 15, browTilt: 8, eyeWide: 1, lookX: 0, lookY: 0, sweat: 1, lElbow: [92, 292], lHand: [146, 188], rElbow: [308, 292], rHand: [254, 188], headTilt: 0},
  overwhelmed: {smile: -1, open: 0.45, browRaise: 6, browTilt: 22, eyeWide: 0.5, lookX: 0, lookY: -3, sweat: 1, lElbow: [84, 250], lHand: [150, 96], rElbow: [316, 250], rHand: [250, 96], headTilt: 3},
  relieved: {smile: 0.85, open: 0.25, browRaise: 2, browTilt: -6, eyeWide: 0, lookX: 0, lookY: 0, sweat: 0, lElbow: [100, 300], lHand: [112, 385], rElbow: [300, 300], rHand: [288, 385], headTilt: 3},
  happy: {smile: 1, open: 0.55, browRaise: 6, browTilt: -9, eyeWide: 0.3, lookX: 0, lookY: 0, sweat: 0, lElbow: [100, 300], lHand: [112, 385], rElbow: [330, 262], rHand: [338, 178], headTilt: 4},
};

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixV = (a: V2, b: V2, t: number): V2 => [mix(a[0], b[0], t), mix(a[1], b[1], t)];
const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  smile: mix(a.smile, b.smile, t), open: mix(a.open, b.open, t), browRaise: mix(a.browRaise, b.browRaise, t), browTilt: mix(a.browTilt, b.browTilt, t),
  eyeWide: mix(a.eyeWide, b.eyeWide, t), lookX: mix(a.lookX, b.lookX, t), lookY: mix(a.lookY, b.lookY, t), sweat: mix(a.sweat, b.sweat, t),
  lElbow: mixV(a.lElbow, b.lElbow, t), lHand: mixV(a.lHand, b.lHand, t), rElbow: mixV(a.rElbow, b.rElbow, t), rHand: mixV(a.rHand, b.rHand, t),
  headTilt: mix(a.headTilt, b.headTilt, t),
});

export type OwnerProps = {
  moods: {at: number; mood: Mood}[];
  width?: number;
  skin?: string; hair?: string; shirt?: string; jacket?: string; pants?: string; tie?: string;
  beard?: boolean;
  clipboard?: boolean;
};

export const Owner: React.FC<OwnerProps> = ({moods, width = 400, skin = "#efc29b", hair = "#33261f", shirt = "#e9eef5", jacket = "#34425f", pants = "#262e3d", tie, beard = true, clipboard = false}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  let idx = 0;
  moods.forEach((m, i) => { if (f >= m.at) idx = i; });
  const cur = moods[idx];
  const prev = moods[Math.max(0, idx - 1)];
  const t = Math.min(1, spring({frame: f - cur.at, fps, config: {damping: 14, stiffness: 120}}));
  const p = mixPose(POSES[prev.mood], POSES[cur.mood], idx === 0 ? 1 : t);

  const bob = Math.sin(f / 15) * 5;
  const breathe = 1 + Math.sin(f / 11) * 0.01;
  const sway = Math.sin(f / 38) * 1.6 + p.headTilt;
  const blink = f % 96 < 4 ? 0.08 : 1;
  const drop = (f % 34) / 34;

  const browY = (cy: number) => cy - p.browRaise;
  const cU = 184 + p.smile * 22 - p.open * 8;
  const cL = cU + 6 + p.open * 56;
  const eyeRy = 15 + p.eyeWide * 6;
  const arm = (s: V2, e: V2, h: V2) => `M${s[0]} ${s[1]} L${e[0]} ${e[1]} L${h[0]} ${h[1]}`;
  const eye = (cx: number) => (
    <g transform={`translate(${cx} 138) scale(1 ${blink}) translate(${-cx} -138)`}>
      <ellipse cx={cx} cy={138} rx={14} ry={eyeRy} fill="#fff" />
      <circle cx={cx + p.lookX} cy={138 + p.lookY} r={6.5} fill="#2a1b14" />
      <circle cx={cx + p.lookX + 2} cy={138 + p.lookY - 2} r={2} fill="#fff" />
    </g>
  );

  return (
    <svg viewBox="0 0 400 520" width={width} height={(width * 520) / 400} style={{overflow: "visible"}}>
      <ellipse cx={200} cy={508} rx={120} ry={11} fill="rgba(0,0,0,0.35)" />
      <g transform={`translate(0 ${bob})`}>
        {/* piernas y zapatos */}
        <path d="M150 368 h40 v124 h-40z M210 368 h40 v124 h-40z" fill={pants} />
        <ellipse cx={168} cy={494} rx={30} ry={10} fill="#14181f" />
        <ellipse cx={232} cy={494} rx={30} ry={10} fill="#14181f" />
        {/* torso */}
        <g transform={`translate(200 300) scale(1 ${breathe}) translate(-200 -300)`}>
          <path d="M132 236 Q200 222 268 236 L278 374 L122 374 Z" fill={shirt} />
          <path d="M128 238 L176 236 L186 374 L120 374 Z" fill={jacket} />
          <path d="M272 238 L224 236 L214 374 L280 374 Z" fill={jacket} />
          {tie ? <path d="M192 240 L208 240 L212 330 L200 346 L188 330 Z" fill={tie} /> : null}
          <path d="M176 236 L200 262 L224 236 Z" fill="#ffffff" opacity={0.9} />
        </g>
        {/* cuello y cabeza */}
        <rect x={185} y={192} width={30} height={40} rx={8} fill={skin} />
        <g transform={`rotate(${sway} 200 200)`}>
          <ellipse cx={138} cy={142} rx={10} ry={16} fill={skin} />
          <ellipse cx={262} cy={142} rx={10} ry={16} fill={skin} />
          <ellipse cx={200} cy={140} rx={62} ry={74} fill={skin} />
          {beard ? <path d="M140 150 C140 222 260 222 260 150 C248 190 152 190 140 150 Z" fill={hair} opacity={0.4} /> : null}
          <path d="M136 132 C124 56 276 56 264 132 C254 98 226 90 200 90 C174 90 146 98 136 132 Z" fill={hair} />
          {eye(172)}
          {eye(228)}
          <g transform={`translate(172 ${browY(112)}) rotate(${-p.browTilt})`}><path d="M-22 0 L22 0" stroke={hair} strokeWidth={8} strokeLinecap="round" /></g>
          <g transform={`translate(228 ${browY(112)}) rotate(${p.browTilt})`}><path d="M-22 0 L22 0" stroke={hair} strokeWidth={8} strokeLinecap="round" /></g>
          <path d="M200 142 q9 24 -3 30 q-9 3 -15 -2" fill="none" stroke="#c99a76" strokeWidth={4} strokeLinecap="round" />
          <path d={`M174 184 Q200 ${cU} 226 184 Q200 ${cL} 174 184 Z`} fill={p.open > 0.12 ? "#7a2b2b" : "#5a2e22"} stroke="#5a2e22" strokeWidth={5} strokeLinejoin="round" />
          {p.sweat > 0.05 ? (
            <g opacity={p.sweat}>
              <path transform={`translate(268 ${96 + drop * 70})`} d="M0 0 C7 13 11 20 0 27 C-11 20 -7 13 0 0 Z" fill="#8fd3ff" opacity={1 - drop * 0.7} />
              <path transform={`translate(132 ${112 + ((drop + 0.5) % 1) * 60})`} d="M0 0 C6 11 9 17 0 23 C-9 17 -6 11 0 0 Z" fill="#8fd3ff" opacity={1 - ((drop + 0.5) % 1) * 0.7} />
            </g>
          ) : null}
        </g>
        {/* brazos y manos (delante de la cabeza para tocar mejillas y frente) */}
        <path d={arm([138, 240], p.lElbow, p.lHand)} stroke={jacket} strokeWidth={36} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={arm([262, 240], p.rElbow, p.rHand)} stroke={jacket} strokeWidth={36} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx={p.lHand[0]} cy={p.lHand[1]} r={20} fill={skin} />
        <circle cx={p.rHand[0]} cy={p.rHand[1]} r={20} fill={skin} />
        {clipboard ? (
          <g transform={`translate(${p.rHand[0] - 26} ${p.rHand[1] - 78}) rotate(-8)`}>
            <rect width={78} height={98} rx={9} fill="#f6f1e6" stroke="#8b6b3d" strokeWidth={4} />
            <rect x={22} y={-8} width={34} height={14} rx={5} fill="#8b6b3d" />
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <path d={`M12 ${30 + i * 22} l6 6 l10 -12`} stroke="#2e9e5b" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={Math.min(1, Math.max(0, (f / 12 - i) % 4))} />
                <path d={`M36 ${34 + i * 22} h30`} stroke="#9aa3b2" strokeWidth={4} strokeLinecap="round" />
              </g>
            ))}
          </g>
        ) : null}
      </g>
    </svg>
  );
};
