import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {AnimatedBackground} from "./components/AnimatedBackground";
import {HookText} from "./components/HookText";
import {PropertyScene} from "./components/PropertyScene";
import {SafeArea} from "./components/SafeArea";
import {colors, fontFamily} from "./theme";

// Comercial de 45 s (1350 fotogramas a 30 fps). Narración: public/voice/comercial45.wav (Boettcher Voice Studio).
// Ventanas: 0–8 s y 8–20 s preocupación (tonos fríos); 20–35 s y 35–45 s tranquilidad (tonos cálidos).
// Sin tomas de presentador ni música: aparecen marcadores explícitos donde faltan.

export type ComercialProps = {timings: {segments: {text: string; start: number; end: number}[]} | null};
export const comercialDefaults: ComercialProps = {timings: null};

const FPS = 30;
const COLD = "#6f8aa3";

const Shell: React.FC<{tone: "cold" | "warm"; children: React.ReactNode}> = ({tone, children}) => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const push = interpolate(f, [0, durationInFrames], [1, 1.07], {extrapolateRight: "clamp"});
  return (
    <AbsoluteFill style={{overflow: "hidden"}}>
      <AbsoluteFill style={{transform: `scale(${push})`}}>
        <AnimatedBackground accent={tone === "cold" ? COLD : colors.copper} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.78) 100%)"}} />
      {children}
    </AbsoluteFill>
  );
};

const Placeholder: React.FC<{label: string}> = ({label}) => (
  <div style={{position: "absolute", top: 150, left: 84, fontFamily, fontSize: 30, fontWeight: 700,
    letterSpacing: 3, color: colors.muted, border: `2px dashed ${colors.muted}`, borderRadius: 12, padding: "10px 18px"}}>
    {label}
  </div>
);

const Scene1 = () => {
  const f = useCurrentFrame();
  const months = [1, 2, 3, 4, 5, 6];
  return (
    <Shell tone="cold">
      <Placeholder label="PRESENTADOR · PENDIENTE DE GRABACIÓN" />
      <SafeArea>
        <HookText text="¿Y si deja de pagar?" fontSize={120} color={colors.white} />
        <div style={{display: "flex", flexWrap: "wrap", gap: 18, marginTop: 60, opacity: 0.9}}>
          {months.map((m, i) => {
            const t = interpolate(f, [20 + i * 18, 34 + i * 18], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
            return (
              <div key={m} style={{width: 150, height: 120, borderRadius: 16, fontFamily, fontWeight: 800, fontSize: 34,
                display: "flex", alignItems: "center", justifyContent: "center", color: colors.white,
                background: `rgba(111,138,163,${0.15 + t * 0.25})`, border: `2px solid rgba(255,255,255,${0.1 + t * 0.2})`,
                opacity: t, transform: `translateY(${(1 - t) * 30}px)`}}>
                MES {m}
              </div>
            );
          })}
        </div>
        <div style={{marginTop: 60}}><PropertyScene label="SIN ARRIENDO" /></div>
      </SafeArea>
    </Shell>
  );
};

const Scene2 = () => {
  const f = useCurrentFrame();
  const value = Math.round(interpolate(f, [12, 150], [0, 3000000], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}));
  const items = ["Deudas acumuladas", "Notificaciones judiciales", "Demanda y mucho tiempo"];
  return (
    <Shell tone="cold">
      <SafeArea>
        <div style={{fontFamily, fontWeight: 700, fontSize: 40, letterSpacing: 4, color: colors.muted}}>
          EJEMPLO ILUSTRATIVO · 6 MESES × $500.000
        </div>
        <div style={{fontFamily, fontWeight: 900, fontSize: 150, color: colors.white, marginTop: 40, lineHeight: 1, whiteSpace: "nowrap"}}>
          ${value.toLocaleString("es-CL")}
        </div>
        <div style={{marginTop: 80}}>
          {items.map((t, i) => {
            const p = interpolate(f, [70 + i * 30, 90 + i * 30], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
            return (
              <div key={t} style={{fontFamily, fontWeight: 700, fontSize: 60, color: colors.white, opacity: p,
                transform: `translateX(${(1 - p) * -80}px)`, marginBottom: 34}}>
                — {t}
              </div>
            );
          })}
        </div>
      </SafeArea>
    </Shell>
  );
};

const ScenePillars: React.FC<{items: string[]; startFrame: number}> = ({items, startFrame}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display: "flex", flexDirection: "column", gap: 26}}>
      {items.map((t, i) => {
        const p = interpolate(f, [startFrame + i * 12, startFrame + i * 12 + 18], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
        return (
          <div key={t} style={{display: "flex", alignItems: "center", gap: 28, fontFamily, fontWeight: 800, fontSize: 56,
            color: colors.white, opacity: p, transform: `translateX(${(1 - p) * 120}px)`}}>
            <span style={{color: colors.copper, minWidth: 70}}>{String(i + 1).padStart(2, "0")}</span>
            <span>{t}</span>
          </div>
        );
      })}
    </div>
  );
};

const Scene3 = () => {
  return (
    <Shell tone="warm">
      <SafeArea justify="flex-start">
        <HookText text="Administración profesional" fontSize={96} highlight={["profesional"]} />
        <div style={{marginTop: 50}}>
          <ScenePillars items={["Evaluación de arrendatarios", "Administración de pagos", "Seguro de arriendo*"]} startFrame={20} />
        </div>
        <div style={{marginTop: 50, fontFamily, fontSize: 30, color: colors.muted, lineHeight: 1.35}}>
          *Según condiciones contratadas. Revisar cobertura, plazos y exclusiones antes de contratar.
        </div>
      </SafeArea>
    </Shell>
  );
};

const Scene4 = () => {
  return (
    <Shell tone="warm">
      <Placeholder label="PRESENTADOR · PENDIENTE DE GRABACIÓN" />
      <SafeArea justify="flex-start">
        <HookText text="Tu inversión merece respaldo" fontSize={96} />
        <div style={{alignSelf: "flex-start", marginTop: 56, fontFamily, fontWeight: 800, fontSize: 56, color: colors.graphiteDeep,
          background: colors.copper, borderRadius: 999, padding: "28px 60px"}}>
          Escríbenos hoy
        </div>
        <div style={{marginTop: 46, fontFamily, fontWeight: 900, fontSize: 40, letterSpacing: 8, color: colors.white}}>
          BOETTCHER PROPIEDADES
        </div>
        <div style={{marginTop: 20, fontFamily, fontSize: 34, color: colors.muted}}>
          WhatsApp: [número por confirmar]
        </div>
        <div style={{marginTop: 30, width: 440, height: 130, border: `3px dashed ${colors.muted}`, borderRadius: 16,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily, fontSize: 28, color: colors.muted}}>
          [LOGOTIPO OFICIAL POR CONFIRMAR]
        </div>
      </SafeArea>
    </Shell>
  );
};

const Subtitles: React.FC<{timings: ComercialProps["timings"]}> = ({timings}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const active = timings?.segments.find((s) => t >= s.start && t < s.end);
  if (!active) return null;
  return (
    <div style={{position: "absolute", left: 84, right: 84, bottom: 420, fontFamily, fontWeight: 700, fontSize: active.text.length > 120 ? 44 : 52,
      lineHeight: 1.25, color: colors.white, background: "rgba(13,15,18,0.74)", borderRadius: 18, padding: "22px 32px",
      textAlign: "center"}}>
      {active.text}
    </div>
  );
};

export const BoettcherComercial45: React.FC<ComercialProps> = ({timings}) => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={240}><Scene1 /></Sequence>
      <Sequence from={240} durationInFrames={360}><Scene2 /></Sequence>
      <Sequence from={600} durationInFrames={450}><Scene3 /></Sequence>
      <Sequence from={1050} durationInFrames={300}><Scene4 /></Sequence>
      <Subtitles timings={timings} />
      <Audio src={staticFile("voice/comercial45.wav")} />
    </AbsoluteFill>
  );
};

export const calculateComercialMetadata = async () => {
  const res = await fetch(staticFile("voice/comercial45.timings.json"));
  const data = (await res.json()) as {segments: {text: string; start: number; end: number}[]};
  return {durationInFrames: 1350, props: {timings: data}};
};
