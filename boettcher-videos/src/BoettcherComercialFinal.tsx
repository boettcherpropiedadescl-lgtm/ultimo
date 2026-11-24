import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {GlobalBackground} from "./components/GlobalBackground";
import {SafeArea} from "./components/SafeArea";
import {StableText} from "./components/StableText";
import {Owner} from "./components/art/Owner";
import {Bokeh, Coins, House, Papers, Shield, Skyline} from "./components/art/Scenery";
import {colors, fontFamily} from "./theme";

// Comercial basado en la locución real entregada (public/voice/comercial-final.wav). Cada gráfica y cada gesto del personaje
// se disparan con cues calculados palabra a palabra desde ese audio. Datos: boettcher.cl/administracion-de-propiedades/.
// Regla anti-parpadeo: el texto aplica opacity/transform solo mientras se mueve; las ilustraciones tienen movimiento propio continuo.

export type Timeline = {duration_s: number; cues: Record<string, number>; subtitles: {text: string; start: number; end: number}[]};
export type FinalProps = {timeline: Timeline | null};
export const finalDefaults: FinalProps = {timeline: null};

const FPS = 30;
const TAIL_S = 1.2;
const OVERLAP = 8;
const ALERT = "#e0705a";
const COLD = "#6f8aa3";
const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

const rev = (f: number, at: number, d = 14) => interpolate(f, [at, at + d], [0, 1], clamp);
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
      border: `2px solid ${color}`, borderRadius: 14, padding: "8px 20px", marginRight: 12, marginBottom: 10, ...enter(p, 0, 24)}}>
      {text}
    </div>
  );
};

const MiniCard: React.FC<{title: string; sub: string; at: number; accent?: boolean; subSize?: number; children?: React.ReactNode}> = ({title, sub, at, accent, subSize = 46, children}) => {
  const f = useCurrentFrame();
  const p = rev(f, at, 16);
  return (
    <div style={{boxSizing: "border-box", borderRadius: 22, padding: "16px 28px", background: accent ? "rgba(201,130,74,0.14)" : "rgba(255,255,255,0.07)",
      border: `${accent ? 3 : 2}px solid ${colors.copper}`, ...enter(p, 0, 50)}}>
      <div style={{fontFamily, fontWeight: 800, fontSize: 28, letterSpacing: 2, color: colors.copperSoft}}>{title}</div>
      <div style={{fontFamily, fontWeight: 900, fontSize: subSize, color: colors.white, marginTop: 8, lineHeight: 1.1}}>{sub}</div>
      {children}
    </div>
  );
};

const Zone: React.FC<{top: number; height: number; children: React.ReactNode}> = ({top, height, children}) => (
  <div style={{position: "absolute", left: 0, top, width: 1080, height}}>{children}</div>
);

// Logo oficial con fondo transparente, arriba y centrado; se retira cuando aparece el logo grande del cierre.
const TopLogo: React.FC<{hideAt: number}> = ({hideAt}) => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [0, 14], [0, 1], clamp);
  const outP = interpolate(f, [hideAt - 10, hideAt + 4], [1, 0], clamp);
  const o = Math.min(inP, outP);
  if (o <= 0) return null;
  return (
    <div style={{position: "absolute", top: 96, left: 0, width: 1080, display: "flex", justifyContent: "center", ...(o >= 1 ? {} : {opacity: o})}}>
      <Img src={staticFile("brand/logo-boettcher-transparente.png")} style={{width: 430, height: "auto", display: "block"}} />
    </div>
  );
};

// ───────── A · preocupación (0 → "En Boettcher")
const PhaseA: React.FC<PhaseProps> = ({tl, base}) => {
  const f = useCurrentFrame();
  const lc = useCue(tl, base);
  const span = Math.max(30, lc("sixmonths") - lc("months"));
  const value = Math.round(interpolate(f, [lc("sixmonths"), lc("loss") + 6], [0, 3000], {...clamp, easing: Easing.out(Easing.cubic)})) * 1000;
  const unpaidP = rev(f, lc("unpaid"));
  const bubbleP = rev(f, lc("sixmonths"), 16);
  const houseO = 1 - rev(f, lc("sixmonths"), 12);
  const coinsO = rev(f, lc("sixmonths"), 10) * (1 - rev(f, lc("more") + 40, 14));
  const papersO = rev(f, lc("lawyers") - 10, 16);
  const tilesO = 1 - rev(f, lc("more"), 12);
  const afterUnpaid = f >= lc("unpaid");
  return (
    <>
      <SafeArea justify="flex-start">
        <StableText text="¿Tienes un departamento en arriendo?" fontSize={76} startFrame={lc("hook")} />
      </SafeArea>
      <Zone top={520} height={810}>
        {/* personaje grande a la izquierda: su expresión sigue lo que dice la voz */}
        <div style={{position: "absolute", left: 10, top: 80}}>
          <Owner width={520} moods={[
            {at: 0, mood: "neutral"}, {at: lc("unpaid"), mood: "worried"}, {at: lc("sixmonths") - 6, mood: "shock"}, {at: lc("more"), mood: "overwhelmed"},
          ]} />
        </div>
        <div style={{position: "absolute", left: 0, top: 120, width: 540, height: 400, opacity: papersO}}><Papers width={540} height={400} count={5} /></div>
        {/* columna derecha */}
        {houseO > 0.01 ? (
          <div style={{position: "absolute", left: 570, top: 20, opacity: houseO}}>
            <House width={440} sign={afterUnpaid ? "SIN PAGO" : "ARRIENDO"} lit={!afterUnpaid} signColor={afterUnpaid ? ALERT : colors.copper} />
          </div>
        ) : null}
        <div style={{position: "absolute", left: 550, top: 20, width: 490, boxSizing: "border-box", padding: "16px 26px", borderRadius: 34, background: "rgba(13,15,18,0.86)",
          border: `3px solid ${ALERT}`, ...enter(bubbleP, 0, 30)}}>
          <div style={{fontFamily, fontWeight: 700, fontSize: 24, letterSpacing: 2, color: colors.muted}}>EJEMPLO ILUSTRATIVO</div>
          <div style={{fontFamily, fontWeight: 900, fontSize: 70, color: ALERT, lineHeight: 1.05, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums"}}>${value.toLocaleString("es-CL")}</div>
        </div>
        <div style={{position: "absolute", left: 530, top: 150, width: 510, height: 640, opacity: coinsO}}><Coins width={510} height={640} count={9} /></div>
        <div style={{position: "absolute", left: 560, top: 440, ...enter(unpaidP, 0, 30)}}>
          <div style={{display: "inline-flex", alignItems: "center", gap: 14, fontFamily, fontWeight: 800, fontSize: 34, color: colors.white,
            background: `${ALERT}33`, border: `3px solid ${ALERT}`, borderRadius: 16, padding: "12px 24px"}}>
            <span style={{color: ALERT, fontSize: 40}}>●</span> PAGO PENDIENTE
          </div>
        </div>
        <div style={{position: "absolute", left: 560, top: 556, width: 480, display: "flex", flexWrap: "wrap", gap: 10, opacity: tilesO}}>
          {[1, 2, 3, 4, 5, 6].map((m, i) => {
            const t = rev(f, lc("months") + (i * span) / 8, 12);
            return (
              <div key={m} style={{width: 150, height: 72, borderRadius: 12, fontFamily, fontWeight: 800, fontSize: 26, color: colors.white, display: "flex",
                alignItems: "center", justifyContent: "center", background: "rgba(111,138,163,0.4)", border: "2px solid rgba(255,255,255,0.25)", ...enter(t, 0, 30)}}>
                MES {m}
              </div>
            );
          })}
        </div>
        <div style={{position: "absolute", left: 560, top: 548, display: "flex", flexDirection: "column", alignItems: "flex-start"}}>
          <Pill text="Gastos comunes" at={lc("common")} color={COLD} size={30} />
          <Pill text="Cuentas impagas" at={lc("bills")} color={COLD} size={30} />
          <Pill text="Abogados" at={lc("lawyers")} color={COLD} size={30} />
          <Pill text="Notificaciones judiciales" at={lc("notices")} color={COLD} size={30} />
        </div>
      </Zone>
    </>
  );
};

// ───────── B · administración ("En Boettcher" → "desde el 6")
const PhaseB: React.FC<PhaseProps> = ({tl, base}) => {
  const f = useCurrentFrame();
  const lc = useCue(tl, base);
  const coinsO = rev(f, lc("pay"), 12);
  return (
    <>
      <SafeArea justify="flex-start">
        <StableText text="Administración Boettcher" fontSize={80} highlight={["Boettcher"]} startFrame={lc("brand")} />
      </SafeArea>
      <div style={{position: "absolute", left: 84, top: 470, width: 580, display: "flex", flexDirection: "column", gap: 14}}>
        <MiniCard title="01 · EVALUACIÓN" sub="Evaluamos a los arrendatarios" at={lc("eval")} subSize={40} />
        <MiniCard title="02 · PAGOS" sub="Administramos los pagos" at={lc("pay")} subSize={40} />
        <MiniCard title="03 · ATENCIÓN DIRECTA" sub="Corredor exclusivo a tu propiedad" at={lc("broker")} accent subSize={40} />
      </div>
      <div style={{position: "absolute", left: 600, top: 400}}>
        <Owner width={470} clipboard beard={false} hair="#1c1612" jacket="#1d2a5a" tie={colors.copper} moods={[{at: 0, mood: "happy"}]} />
      </div>
      <div style={{position: "absolute", left: 80, top: 1010}}><House width={330} sign="ARRIENDO" lit signColor={colors.copper} /></div>
      <div style={{position: "absolute", left: 470, top: 1040, width: 600, height: 290, opacity: coinsO}}><Coins width={600} height={290} count={8} up /></div>
    </>
  );
};

// ───────── C · precio y planes ("desde el 6" → "no esperes")
const PhaseC: React.FC<PhaseProps> = ({tl, base}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lc = useCue(tl, base);
  const priceP = Math.min(1, spring({frame: f - lc("price"), fps, config: {damping: 14, stiffness: 150}}));
  const termsP = rev(f, lc("terms"), 14);
  const shieldP = rev(f, lc("plan15"), 18);
  return (
    <>
      <div style={{position: "absolute", left: 84, top: 260, width: 600, display: "flex", flexDirection: "column", gap: 16}}>
        <div style={{display: "flex", alignItems: "center", gap: 22, height: 160, ...enter(priceP, 0, 30)}}>
          <div style={{fontFamily, fontWeight: 900, fontSize: 140, color: colors.copperSoft, lineHeight: 1}}>6%</div>
          <div style={{fontFamily, fontWeight: 800, fontSize: 44, color: colors.white, lineHeight: 1.1}}>mensual<br />administración</div>
        </div>
        <MiniCard title="PLAN GARANTIZADO · 12%" sub="Hasta 6 meses de renta impaga" at={lc("plan12")} subSize={42} />
        <MiniCard title="PLAN PROTECCIÓN TOTAL · 15%" sub="Hasta 12 meses de renta impaga" at={lc("plan15")} accent subSize={42}>
          <div style={{marginTop: 14}}>
            <Pill text="Respaldo legal" at={lc("legal")} size={26} />
            <Pill text="Cuentas básicas" at={lc("basic")} size={26} />
            <Pill text="Daños" at={lc("damage")} size={26} />
          </div>
        </MiniCard>
        <div style={{fontFamily, fontSize: 28, color: colors.muted, ...enter(termsP, 0, 12)}}>Según las condiciones contratadas.</div>
      </div>
      <div style={{position: "absolute", left: 630, top: 380}}>
        <Owner width={440} moods={[{at: 0, mood: "relieved"}, {at: lc("plan15"), mood: "happy"}]} />
      </div>
      <div style={{position: "absolute", left: 340, top: 1020, width: 730, height: 310, opacity: 0.9}}><Coins width={730} height={310} count={10} up /></div>
      <div style={{position: "absolute", left: 60, top: 1000, ...enter(shieldP, 0, 40)}}><Shield width={270} /></div>
    </>
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
  // La casa protegida llena la columna izquierda hasta que llega el llamado a la acción.
  const houseO = rev(f, lc("wait") + 4, 14) * (1 - rev(f, lc("cta") - 14, 10));
  const shieldP = rev(f, lc("protect"), 16);
  return (
    <>
      <SafeArea justify="flex-start">
        <StableText text="No esperes a tener un problema" fontSize={76} startFrame={lc("wait")} />
        <div style={{marginTop: 24, fontFamily, fontWeight: 900, fontSize: 58, color: colors.copperSoft, lineHeight: 1.08, ...enter(inv, 0, 30)}}>
          Tu inversión merece respaldo
        </div>
      </SafeArea>
      <div style={{position: "absolute", left: 84, top: 660, width: 560}}>
        <div style={{display: "inline-block", whiteSpace: "nowrap", fontFamily, fontWeight: 800, fontSize: 42, color: colors.graphiteDeep, background: colors.copper,
          borderRadius: 999, padding: "24px 40px", boxShadow: `0 20px 50px ${colors.copper}55`, ...enter(btn, 0, 40)}}>
          Solicita tu evaluación
        </div>
        <div style={{marginTop: 36, display: "flex", alignItems: "center", gap: 20, ...enter(info, 0, 20)}}>
          <svg width={78} height={78} viewBox="0 0 24 24" aria-label="WhatsApp">
            <circle cx="12" cy="12" r="12" fill="#25D366" />
            <path fill="#ffffff" transform="translate(4.2 4.2) scale(0.65)"
              d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z" />
          </svg>
          <div>
            <div style={{fontFamily, fontWeight: 700, fontSize: 24, letterSpacing: 2, color: colors.muted}}>ESCRÍBENOS POR WHATSAPP</div>
            <div style={{fontFamily, fontWeight: 900, fontSize: 46, color: colors.white, lineHeight: 1.05, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums"}}>+56 9 8687 7420</div>
          </div>
        </div>
        <div style={{marginTop: 34, ...enter(info, 0, 20)}}>
          <Img src={staticFile("brand/logo-boettcher-transparente.png")} style={{width: 520, height: "auto", display: "block"}} />
        </div>
      </div>
      {houseO > 0.01 ? (
        <div style={{position: "absolute", left: 40, top: 640, opacity: houseO}}>
          <House width={500} sign="SEGURA" lit signColor={colors.copper} />
          <div style={{position: "absolute", left: 300, top: 250, ...enter(shieldP, 0, 40)}}><Shield width={230} /></div>
        </div>
      ) : null}
      <div style={{position: "absolute", left: 640, top: 560}}>
        <Owner width={420} moods={[{at: 0, mood: "happy"}]} />
      </div>
      <div style={{position: "absolute", left: 0, top: 1060, width: 1080, height: 270, opacity: 0.85}}><Coins width={1080} height={270} count={9} /></div>
    </>
  );
};

const Subtitles: React.FC<{tl: Timeline | null}> = ({tl}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const active = tl?.subtitles.find((s) => t >= s.start && t < s.end);
  if (!active) return null;
  return (
    <div style={{position: "absolute", left: 84, right: 84, bottom: 420, fontFamily, fontWeight: 700, fontSize: 52, lineHeight: 1.25,
      color: colors.white, background: "rgba(13,15,18,0.78)", borderRadius: 18, padding: "20px 30px", textAlign: "center"}}>
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
      <Bokeh warmAt={a} />
      <Skyline warmAt={a} />
      <TopLogo hideAt={c("cta")} />
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
