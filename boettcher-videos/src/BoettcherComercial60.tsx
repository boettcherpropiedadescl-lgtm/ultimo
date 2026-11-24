import {AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {CinematicShell} from "./components/CinematicShell";
import {HookText} from "./components/HookText";
import {SafeArea} from "./components/SafeArea";
import {colors, fontFamily} from "./theme";

// Comercial de 60 s. Cada gráfica se dispara con un "cue" calculado desde el audio (palabra a palabra),
// así lo que se ve aparece cuando se nombra. Datos comerciales tomados de boettcher.cl/administracion-de-propiedades/.

export type Timeline = {
  duration_s: number;
  cues: Record<string, number>;
  subtitles: {text: string; start: number; end: number}[];
};
export type C60Props = {timeline: Timeline | null};
export const comercial60Defaults: C60Props = {timeline: null};

const FPS = 30;
const TOTAL = 1800;
const OVERLAP = 10;
const COLD = "#6f8aa3";
const ALERT = "#e0705a";

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const rev = (f: number, at: number, d = 14) => interpolate(f, [at, at + d], [0, 1], clamp);

type PhaseProps = {tl: Timeline | null; base: number};
const useCue = (tl: Timeline | null, base: number) => (id: string) => Math.round((tl?.cues[id] ?? 0) * FPS) - base;

const FadeIn: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: interpolate(f, [0, OVERLAP], [0, 1], clamp)}}>{children}</AbsoluteFill>;
};

const Pill: React.FC<{text: string; at: number; color?: string; size?: number}> = ({text, at, color = colors.copper, size = 36}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: f - at, fps, config: {damping: 14, stiffness: 170}});
  return (
    <div style={{display: "inline-block", fontFamily, fontWeight: 800, fontSize: size, color: colors.white, background: `${color}33`,
      border: `2px solid ${color}`, borderRadius: 14, padding: "10px 22px", marginRight: 14, marginBottom: 12,
      opacity: Math.min(1, p), transform: `scale(${0.85 + 0.15 * Math.min(1, p)}) translateY(${(1 - Math.min(1, p)) * 24}px)`}}>
      {text}
    </div>
  );
};

// ───────── Fase A · preocupación (frío)
const PhaseA: React.FC<PhaseProps> = ({tl, base}) => {
  const f = useCurrentFrame();
  const lc = useCue(tl, base);
  const months = [1, 2, 3, 4, 5, 6];
  const span = Math.max(30, lc("sixmonths") - lc("months"));
  const value = Math.round(interpolate(f, [lc("sixmonths"), lc("loss") + 6], [0, 3000000], clamp));
  const unpaid = rev(f, lc("unpaid"));
  const counter = rev(f, lc("sixmonths"));
  return (
    <CinematicShell tone="cold">
      <SafeArea justify="flex-start">
        <HookText text="¿Tienes un departamento en arriendo?" fontSize={84} startFrame={lc("hook")} />
        <div style={{height: 120, marginTop: 36, opacity: unpaid, transform: `translateY(${(1 - unpaid) * 40}px)`}}>
          <div style={{display: "inline-flex", alignItems: "center", gap: 22, fontFamily, fontWeight: 800, fontSize: 44, color: colors.white,
            background: `${ALERT}33`, border: `3px solid ${ALERT}`, borderRadius: 18, padding: "22px 34px"}}>
            <span style={{color: ALERT, fontSize: 56}}>●</span> PAGO PENDIENTE
          </div>
        </div>
        <div style={{height: 120, display: "flex", gap: 14, marginTop: 10}}>
          {months.map((m, i) => {
            const t = rev(f, lc("months") + (i * span) / 8, 12);
            return (
              <div key={m} style={{flex: 1, borderRadius: 14, fontFamily, fontWeight: 800, fontSize: 30, color: colors.white,
                display: "flex", alignItems: "center", justifyContent: "center", opacity: t,
                background: `rgba(111,138,163,${0.15 + t * 0.3})`, border: "2px solid rgba(255,255,255,0.25)",
                transform: `translateY(${(1 - t) * 30}px)`}}>
                MES {m}
              </div>
            );
          })}
        </div>
        <div style={{height: 250, marginTop: 30, opacity: counter}}>
          <div style={{fontFamily, fontWeight: 700, fontSize: 32, letterSpacing: 3, color: colors.muted}}>
            EJEMPLO ILUSTRATIVO · 6 MESES × $500.000
          </div>
          <div style={{fontFamily, fontWeight: 900, fontSize: 150, color: value > 0 ? ALERT : colors.white, lineHeight: 1.05, whiteSpace: "nowrap"}}>
            ${value.toLocaleString("es-CL")}
          </div>
        </div>
        <div style={{marginTop: 10}}>
          <Pill text="Demanda" at={lc("legal")} color={COLD} />
          <Pill text="Notificaciones" at={lc("legal") + 14} color={COLD} />
          <Pill text="Mucho tiempo" at={lc("legal") + 28} color={COLD} />
        </div>
      </SafeArea>
    </CinematicShell>
  );
};

// ───────── Fase B · administración (cálido)
const Stat: React.FC<{target: number; label: string; prefix?: string; at: number; fmt?: (n: number) => string}> = ({target, label, prefix = "+", at, fmt}) => {
  const f = useCurrentFrame();
  const p = rev(f, at, 36);
  const v = Math.round(target * p);
  return (
    <div style={{flex: 1, opacity: Math.min(1, p * 2), background: "rgba(255,255,255,0.06)", border: `2px solid ${colors.copper}`, borderRadius: 20, padding: "24px 26px"}}>
      <div style={{fontFamily, fontWeight: 900, fontSize: 84, color: colors.copperSoft, lineHeight: 1}}>{prefix}{fmt ? fmt(v) : v}</div>
      <div style={{fontFamily, fontWeight: 600, fontSize: 32, color: colors.white, marginTop: 8}}>{label}</div>
    </div>
  );
};

const PhaseB: React.FC<PhaseProps> = ({tl, base}) => {
  const f = useCurrentFrame();
  const lc = useCue(tl, base);
  const items: {t: string; cue: string}[] = [
    {t: "Corredor exclusivo", cue: "broker"},
    {t: "Evaluación Dicom / Equifax", cue: "eval"},
    {t: "Cobranza mensual", cue: "billing"},
    {t: "Reajustes IPC / UF", cue: "ipc"},
    {t: "Liquidación puntual", cue: "payout"},
  ];
  return (
    <CinematicShell tone="warm">
      <SafeArea justify="flex-start">
        <HookText text="Administración Boettcher" fontSize={90} highlight={["Boettcher"]} startFrame={lc("brand")} />
        <div style={{display: "flex", gap: 20, marginTop: 40, height: 190}}>
          <Stat target={15} label="años de experiencia" at={lc("years")} />
          <Stat target={2000} label="propiedades en cartera" at={lc("years") + 8} fmt={(n) => n.toLocaleString("es-CL")} />
        </div>
        <div style={{marginTop: 50}}>
          {items.map((it, i) => {
            const p = rev(f, lc(it.cue), 14);
            return (
              <div key={it.t} style={{display: "flex", alignItems: "center", gap: 26, height: 88, fontFamily, fontWeight: 800, fontSize: 54, color: colors.white,
                opacity: p, transform: `translateX(${(1 - p) * 120}px)`}}>
                <span style={{color: colors.copper, minWidth: 66}}>{String(i + 1).padStart(2, "0")}</span>
                <span>{it.t}</span>
              </div>
            );
          })}
        </div>
      </SafeArea>
    </CinematicShell>
  );
};

// ───────── Fase C · seguros (cálido)
const Shield: React.FC<{p: number}> = ({p}) => (
  <svg width={120} height={140} viewBox="0 0 120 140" style={{opacity: p, transform: `scale(${0.7 + 0.3 * p})`}}>
    <path d="M60 6 L110 26 V70 C110 104 86 126 60 136 C34 126 10 104 10 70 V26 Z" fill={`${colors.copper}33`} stroke={colors.copper} strokeWidth="6" />
    <path d="M36 70 L54 88 L86 50" fill="none" stroke={colors.copperSoft} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PhaseC: React.FC<PhaseProps> = ({tl, base}) => {
  const f = useCurrentFrame();
  const lc = useCue(tl, base);
  const head = rev(f, lc("insurance"), 16);
  const c1 = rev(f, lc("plan12"), 16);
  const c2 = rev(f, lc("plan15"), 16);
  const six = rev(f, lc("cover6"), 12);
  const twelve = rev(f, lc("cover12"), 12);
  return (
    <CinematicShell tone="warm">
      <SafeArea justify="flex-start">
        <div style={{display: "flex", alignItems: "center", gap: 26, height: 150}}>
          <Shield p={head} />
          <div style={{fontFamily, fontWeight: 900, fontSize: 80, color: colors.white, opacity: head}}>Seguro de arriendo</div>
        </div>
        <div style={{marginTop: 34, height: 250, borderRadius: 22, padding: "26px 32px", background: "rgba(255,255,255,0.06)",
          border: `2px solid ${colors.copper}`, opacity: c1, transform: `translateY(${(1 - c1) * 50}px)`}}>
          <div style={{fontFamily, fontWeight: 800, fontSize: 36, letterSpacing: 2, color: colors.copperSoft}}>PLAN GARANTIZADO · 12%</div>
          <div style={{fontFamily, fontWeight: 900, fontSize: 64, color: colors.white, marginTop: 18, lineHeight: 1.1, opacity: 0.4 + 0.6 * six}}>
            Hasta 6 meses de renta impaga
          </div>
        </div>
        <div style={{marginTop: 28, height: 470, borderRadius: 22, padding: "26px 32px", background: "rgba(201,130,74,0.12)",
          border: `3px solid ${colors.copper}`, opacity: c2, transform: `translateY(${(1 - c2) * 50}px)`}}>
          <div style={{fontFamily, fontWeight: 800, fontSize: 36, letterSpacing: 2, color: colors.copperSoft}}>PLAN PROTECCIÓN TOTAL · 15%</div>
          <div style={{fontFamily, fontWeight: 900, fontSize: 64, color: colors.white, marginTop: 18, lineHeight: 1.1, opacity: 0.4 + 0.6 * twelve}}>
            Hasta 12 meses de renta impaga
          </div>
          <div style={{marginTop: 26}}>
            <Pill text="Cuentas básicas" at={lc("basic")} />
            <Pill text="Daños a la propiedad" at={lc("damage")} />
            <Pill text="Defensa legal · Ley 21.461" at={lc("defense")} />
          </div>
        </div>
        <div style={{marginTop: 20, fontFamily, fontSize: 28, color: colors.muted, opacity: c1}}>
          Cobertura según plan y condiciones de cada mandato.
        </div>
      </SafeArea>
    </CinematicShell>
  );
};

// ───────── Fase D · precio y llamado a la acción (cálido)
const PhaseD: React.FC<PhaseProps> = ({tl, base}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lc = useCue(tl, base);
  const price = spring({frame: f - lc("price"), fps, config: {damping: 13, stiffness: 140}});
  const noiva = rev(f, lc("noiva"), 12);
  const btn = spring({frame: f - lc("cta"), fps, config: {damping: 12, stiffness: 150}});
  const pulse = 1 + 0.025 * Math.sin(Math.max(0, f - lc("cta")) / 6) * rev(f, lc("cta") + 20, 10);
  return (
    <CinematicShell tone="warm">
      <SafeArea justify="flex-start">
        <div style={{fontFamily, fontWeight: 700, fontSize: 48, letterSpacing: 4, color: colors.muted, opacity: Math.min(1, price)}}>ADMINISTRACIÓN DESDE</div>
        <div style={{fontFamily, fontWeight: 900, fontSize: 260, color: colors.copperSoft, lineHeight: 1, opacity: Math.min(1, price), transform: `scale(${0.7 + 0.3 * Math.min(1, price)})`, transformOrigin: "left center"}}>
          6%
        </div>
        <div style={{fontFamily, fontWeight: 800, fontSize: 56, color: colors.white, opacity: noiva}}>mensual · sin IVA</div>
        <div style={{alignSelf: "flex-start", marginTop: 70, fontFamily, fontWeight: 800, fontSize: 64, color: colors.graphiteDeep, background: colors.copper,
          borderRadius: 999, padding: "32px 70px", opacity: Math.min(1, btn), transform: `scale(${btn * pulse})`, boxShadow: `0 20px 50px ${colors.copper}55`}}>
          Escríbenos hoy
        </div>
        <div style={{marginTop: 56, opacity: rev(f, lc("cta") + 12, 14)}}>
          <div style={{fontFamily, fontWeight: 900, fontSize: 48, letterSpacing: 8, color: colors.white}}>BOETTCHER PROPIEDADES</div>
          <div style={{height: 4, width: 240, background: colors.copper, marginTop: 14}} />
          <div style={{marginTop: 22, fontFamily, fontSize: 36, color: colors.muted}}>WhatsApp: [número por confirmar]</div>
          <div style={{marginTop: 20, width: 460, height: 120, border: `3px dashed ${colors.muted}`, borderRadius: 16, display: "flex", alignItems: "center",
            justifyContent: "center", fontFamily, fontSize: 28, color: colors.muted}}>
            [LOGOTIPO OFICIAL POR CONFIRMAR]
          </div>
        </div>
      </SafeArea>
    </CinematicShell>
  );
};

const Subtitles: React.FC<{tl: Timeline | null}> = ({tl}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const active = tl?.subtitles.find((s) => t >= s.start && t < s.end);
  if (!active) return null;
  return (
    <div style={{position: "absolute", left: 84, right: 84, bottom: 420, fontFamily, fontWeight: 700, fontSize: 52, lineHeight: 1.25,
      color: colors.white, background: "rgba(13,15,18,0.74)", borderRadius: 18, padding: "20px 30px", textAlign: "center"}}>
      {active.text}
    </div>
  );
};

export const BoettcherComercial60: React.FC<C60Props> = ({timeline}) => {
  const c = (id: string) => Math.round((timeline?.cues[id] ?? 0) * FPS);
  const a = c("brand");
  const b = c("insurance");
  const d = c("price");
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={a + OVERLAP}><PhaseA tl={timeline} base={0} /></Sequence>
      <Sequence from={a - OVERLAP} durationInFrames={b - a + 2 * OVERLAP}><FadeIn><PhaseB tl={timeline} base={a - OVERLAP} /></FadeIn></Sequence>
      <Sequence from={b - OVERLAP} durationInFrames={d - b + 2 * OVERLAP}><FadeIn><PhaseC tl={timeline} base={b - OVERLAP} /></FadeIn></Sequence>
      <Sequence from={d - OVERLAP} durationInFrames={TOTAL - d + OVERLAP}><FadeIn><PhaseD tl={timeline} base={d - OVERLAP} /></FadeIn></Sequence>
      <Subtitles tl={timeline} />
      <Audio src={staticFile("voice/comercial60.wav")} />
    </AbsoluteFill>
  );
};

export const calculateComercial60Metadata = async () => {
  const res = await fetch(staticFile("voice/comercial60.timeline.json"));
  const timeline = (await res.json()) as Timeline;
  return {durationInFrames: TOTAL, props: {timeline}};
};
