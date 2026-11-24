import {AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {GlobalBackground} from "./components/GlobalBackground";
import {SafeArea} from "./components/SafeArea";
import {StableText} from "./components/StableText";
import {colors, fontFamily} from "./theme";

// Comercial basado en la locución real entregada (public/voice/comercial-final.wav). Cada gráfica se dispara con un
// cue calculado palabra a palabra desde ese audio. Datos comerciales: boettcher.cl/administracion-de-propiedades/.
// Regla anti-parpadeo: las animaciones aplican opacity/transform solo mientras se mueven; al terminar el estilo queda vacío.

export type Timeline = {
  duration_s: number;
  cues: Record<string, number>;
  subtitles: {text: string; start: number; end: number}[];
};
export type FinalProps = {timeline: Timeline | null};
export const finalDefaults: FinalProps = {timeline: null};

const FPS = 30;
const TAIL_S = 1.2;
const OVERLAP = 8;
const ALERT = "#e0705a";
const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

const rev = (f: number, at: number, d = 14) => interpolate(f, [at, at + d], [0, 1], clamp);
// Estilo de entrada: vacío cuando la animación terminó.
const enter = (p: number, dx = 0, dy = 30): React.CSSProperties =>
  p >= 0.999 ? {} : {opacity: p, transform: `translate(${Math.round((1 - p) * dx)}px, ${Math.round((1 - p) * dy)}px)`};

type PhaseProps = {tl: Timeline | null; base: number};
const useCue = (tl: Timeline | null, base: number) => (id: string) => Math.round((tl?.cues[id] ?? 0) * FPS) - base;

const PhaseFrame: React.FC<{enterIn: boolean; exit: boolean; children: React.ReactNode}> = ({enterIn, exit, children}) => {
  const f = useCurrentFrame();
  const {durationInFrames: D} = useVideoConfig();
  const inP = enterIn ? interpolate(f, [0, OVERLAP], [0, 1], clamp) : 1;
  const outP = exit ? interpolate(f, [D - OVERLAP, D], [1, 0], clamp) : 1;
  const style: React.CSSProperties = inP >= 1 && outP >= 1 ? {} :
    {opacity: Math.min(inP, outP), transform: `translateY(${Math.round((1 - inP) * 36 - (1 - outP) * 36)}px)`};
  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

const Pill: React.FC<{text: string; at: number; color?: string; size?: number}> = ({text, at, color = colors.copper, size = 34}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = Math.min(1, spring({frame: f - at, fps, config: {damping: 16, stiffness: 180}}));
  return (
    <div style={{display: "inline-block", fontFamily, fontWeight: 800, fontSize: size, color: colors.white, background: `${color}33`,
      border: `2px solid ${color}`, borderRadius: 14, padding: "10px 22px", marginRight: 14, marginBottom: 12, ...enter(p, 0, 24)}}>
      {text}
    </div>
  );
};

const Card: React.FC<{title: string; sub?: string; at: number; accent?: boolean; height: number; children?: React.ReactNode}> = ({title, sub, at, accent, height, children}) => {
  const f = useCurrentFrame();
  const p = rev(f, at, 16);
  return (
    <div style={{height, boxSizing: "border-box", borderRadius: 22, padding: "24px 32px", background: accent ? "rgba(201,130,74,0.12)" : "rgba(255,255,255,0.06)",
      border: `${accent ? 3 : 2}px solid ${colors.copper}`, ...enter(p, 0, 50)}}>
      <div style={{fontFamily, fontWeight: 800, fontSize: 34, letterSpacing: 2, color: colors.copperSoft}}>{title}</div>
      {sub ? <div style={{fontFamily, fontWeight: 900, fontSize: 60, color: colors.white, marginTop: 14, lineHeight: 1.1}}>{sub}</div> : null}
      {children}
    </div>
  );
};

// ───────── A · preocupación (0 → "En Boettcher")
const PhaseA: React.FC<PhaseProps> = ({tl, base}) => {
  const f = useCurrentFrame();
  const lc = useCue(tl, base);
  const span = Math.max(30, lc("sixmonths") - lc("months"));
  // Conteo de a mil con desaceleración: menos dígitos cambiando por fotograma, sin efecto de parpadeo.
  const value = Math.round(interpolate(f, [lc("sixmonths"), lc("loss") + 6], [0, 3000], {...clamp, easing: Easing.out(Easing.cubic)})) * 1000;
  const counterP = rev(f, lc("sixmonths"));
  const unpaidP = rev(f, lc("unpaid"));
  return (
    <SafeArea justify="flex-start">
      <StableText text="¿Tienes un departamento en arriendo?" fontSize={84} startFrame={lc("hook")} />
      <div style={{height: 110, marginTop: 30}}>
        <div style={{display: "inline-flex", alignItems: "center", gap: 20, fontFamily, fontWeight: 800, fontSize: 44, color: colors.white,
          background: `${ALERT}33`, border: `3px solid ${ALERT}`, borderRadius: 18, padding: "20px 32px", ...enter(unpaidP, 0, 36)}}>
          <span style={{color: ALERT, fontSize: 52}}>●</span> PAGO PENDIENTE
        </div>
      </div>
      <div style={{height: 116, display: "flex", gap: 14}}>
        {[1, 2, 3, 4, 5, 6].map((m, i) => {
          const t = rev(f, lc("months") + (i * span) / 8, 12);
          return (
            <div key={m} style={{flex: 1, borderRadius: 14, fontFamily, fontWeight: 800, fontSize: 30, color: colors.white, display: "flex",
              alignItems: "center", justifyContent: "center", background: "rgba(111,138,163,0.4)", border: "2px solid rgba(255,255,255,0.25)", ...enter(t, 0, 30)}}>
              MES {m}
            </div>
          );
        })}
      </div>
      <div style={{height: 230, marginTop: 26, ...enter(counterP, 0, 24)}}>
        <div style={{fontFamily, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: colors.muted}}>EJEMPLO ILUSTRATIVO · 6 MESES × $500.000</div>
        <div style={{fontFamily, fontWeight: 900, fontSize: 150, color: ALERT, lineHeight: 1.05, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums"}}>${value.toLocaleString("es-CL")}</div>
      </div>
      <div style={{marginTop: 6}}>
        <Pill text="Gastos comunes" at={lc("common")} color="#6f8aa3" />
        <Pill text="Cuentas impagas" at={lc("bills")} color="#6f8aa3" />
        <Pill text="Abogados" at={lc("lawyers")} color="#6f8aa3" />
        <Pill text="Notificaciones judiciales" at={lc("notices")} color="#6f8aa3" />
      </div>
    </SafeArea>
  );
};

// ───────── B · administración ("En Boettcher" → "desde el 6")
const PhaseB: React.FC<PhaseProps> = ({tl, base}) => {
  const lc = useCue(tl, base);
  return (
    <SafeArea justify="flex-start">
      <StableText text="Administración Boettcher" fontSize={90} highlight={["Boettcher"]} startFrame={lc("brand")} />
      <div style={{marginTop: 50, display: "flex", flexDirection: "column", gap: 26}}>
        <Card title="01 · EVALUACIÓN" sub="Evaluamos a los arrendatarios" at={lc("eval")} height={190} />
        <Card title="02 · PAGOS" sub="Administramos los pagos" at={lc("pay")} height={190} />
        <Card title="03 · ATENCIÓN DIRECTA" sub="Corredor exclusivo a tu propiedad" at={lc("broker")} height={190} accent />
      </div>
    </SafeArea>
  );
};

// ───────── C · precio y planes ("desde el 6" → "no esperes")
const PhaseC: React.FC<PhaseProps> = ({tl, base}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lc = useCue(tl, base);
  const priceP = Math.min(1, spring({frame: f - lc("price"), fps, config: {damping: 14, stiffness: 150}}));
  const termsP = rev(f, lc("terms"), 14);
  return (
    <SafeArea justify="flex-start">
      <div style={{display: "flex", alignItems: "baseline", gap: 26, height: 190, ...enter(priceP, 0, 30)}}>
        <div style={{fontFamily, fontWeight: 900, fontSize: 190, color: colors.copperSoft, lineHeight: 1}}>6%</div>
        <div style={{fontFamily, fontWeight: 800, fontSize: 50, color: colors.white, lineHeight: 1.1}}>mensual<br />administración</div>
      </div>
      <div style={{marginTop: 30}}><Card title="PLAN GARANTIZADO · 12%" sub="Hasta 6 meses de renta impaga" at={lc("plan12")} height={210} /></div>
      <div style={{marginTop: 24}}>
        <Card title="PLAN PROTECCIÓN TOTAL · 15%" sub="Hasta 12 meses de renta impaga" at={lc("plan15")} height={380} accent>
          <div style={{marginTop: 26}}>
            <Pill text="Respaldo legal" at={lc("legal")} />
            <Pill text="Cuentas básicas" at={lc("basic")} />
            <Pill text="Daños" at={lc("damage")} />
          </div>
        </Card>
      </div>
      <div style={{marginTop: 20, fontFamily, fontSize: 30, color: colors.muted, ...enter(termsP, 0, 12)}}>Según las condiciones contratadas.</div>
    </SafeArea>
  );
};

// ───────── D · cierre ("no esperes" → final)
const PhaseD: React.FC<PhaseProps> = ({tl, base}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lc = useCue(tl, base);
  const inv = rev(f, lc("invest"), 16);
  const btn = Math.min(1, spring({frame: f - lc("cta"), fps, config: {damping: 13, stiffness: 150}}));
  const info = rev(f, lc("cta") + 10, 14);
  return (
    <SafeArea justify="flex-start">
      <StableText text="No esperes a tener un problema" fontSize={84} startFrame={lc("wait")} />
      <div style={{marginTop: 34, fontFamily, fontWeight: 900, fontSize: 62, color: colors.copperSoft, lineHeight: 1.08, ...enter(inv, 0, 30)}}>
        Tu inversión merece respaldo
      </div>
      <div style={{alignSelf: "flex-start", marginTop: 56, fontFamily, fontWeight: 800, fontSize: 56, color: colors.graphiteDeep, background: colors.copper,
        borderRadius: 999, padding: "30px 60px", boxShadow: `0 20px 50px ${colors.copper}55`, ...enter(btn, 0, 40)}}>
        Solicita tu evaluación
      </div>
      <div style={{marginTop: 50, ...enter(info, 0, 20)}}>
        <div style={{fontFamily, fontWeight: 900, fontSize: 46, letterSpacing: 8, color: colors.white}}>BOETTCHER PROPIEDADES</div>
        <div style={{height: 4, width: 240, background: colors.copper, marginTop: 14}} />
        <div style={{marginTop: 22, fontFamily, fontSize: 36, color: colors.muted}}>WhatsApp: [número por confirmar]</div>
        <div style={{marginTop: 20, width: 460, height: 110, border: `3px dashed ${colors.muted}`, borderRadius: 16, display: "flex", alignItems: "center",
          justifyContent: "center", fontFamily, fontSize: 28, color: colors.muted}}>[LOGOTIPO OFICIAL POR CONFIRMAR]</div>
      </div>
    </SafeArea>
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

export const BoettcherComercialFinal: React.FC<FinalProps> = ({timeline}) => {
  const {durationInFrames: TOTAL} = useVideoConfig();
  const c = (id: string) => Math.round((timeline?.cues[id] ?? 0) * FPS);
  const a = c("brand");
  const b = c("price");
  const d = c("wait");
  return (
    <AbsoluteFill>
      <GlobalBackground warmAtFrame={a} />
      <Sequence from={0} durationInFrames={a}><PhaseFrame enterIn={false} exit><PhaseA tl={timeline} base={0} /></PhaseFrame></Sequence>
      <Sequence from={a} durationInFrames={b - a}><PhaseFrame enterIn exit><PhaseB tl={timeline} base={a} /></PhaseFrame></Sequence>
      <Sequence from={b} durationInFrames={d - b}><PhaseFrame enterIn exit><PhaseC tl={timeline} base={b} /></PhaseFrame></Sequence>
      <Sequence from={d} durationInFrames={TOTAL - d}><PhaseFrame enterIn exit={false}><PhaseD tl={timeline} base={d} /></PhaseFrame></Sequence>
      <Subtitles tl={timeline} />
      <Audio src={staticFile("voice/comercial-final.wav")} />
    </AbsoluteFill>
  );
};

export const calculateFinalMetadata = async () => {
  const res = await fetch(staticFile("voice/comercial-final.timeline.json"));
  const timeline = (await res.json()) as Timeline;
  return {durationInFrames: Math.round((timeline.duration_s + TAIL_S) * FPS), props: {timeline}};
};
