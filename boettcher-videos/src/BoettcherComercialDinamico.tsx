import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {useMemo} from "react";
import {GlobalBackground} from "./components/GlobalBackground";
import {StableText} from "./components/StableText";
import {Bokeh, Embers, Shield, Skyline} from "./components/art/Scenery";
import {Burst, Card, clamp, Cross, Cursor, enter, HEADER_H, rev, Skeleton, Toggle} from "./components/ui/Kit";
import {colors, fontFamily} from "./theme";
import {useTheme} from "./theme-context";

// Comercial dinámico: cada escena es una tarjeta tipo interfaz que entra con rebote y sale mientras entra la siguiente, con cursor,
// interruptores, contadores y confeti disparados por cues del audio real (public/voice/comercial-final.wav). Subtítulos palabra por palabra.
// Datos comerciales: boettcher.cl/administracion-de-propiedades/.

export type Timeline = {
  duration_s: number;
  cues: Record<string, number>;
  subtitles: {text: string; start: number; end: number}[];
  words: {w: string; start: number; end: number}[];
};
export type DinProps = {timeline: Timeline | null};
export const dinamicoDefaults: DinProps = {timeline: null};

const FPS = 30;
const TAIL_S = 1.2;
const OVERLAP = 8;
const ALERT = "#e0705a";
const STAGE = {left: 84, top: 300, width: 912, height: 990};
const MESSAGE = "Hola Boettcher Propiedades, estoy interesado en el servicio de administración de propiedades";

export type SP = {lc: (id: string) => number};

// ───────── Marco de escena: entra con rebote (escala + desplazamiento) y sale subiendo mientras entra la siguiente.
export const SceneFrame: React.FC<{first?: boolean; last?: boolean; children: React.ReactNode}> = ({first, last, children}) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames: D} = useVideoConfig();
  const p = first ? 1 : spring({frame: f, fps, config: {damping: 12, stiffness: 150, mass: 0.7}});
  const outP = last ? 1 : interpolate(f, [D - OVERLAP, D - 3], [1, 0], clamp);
  // Empuje de cámara lento y continuo durante toda la escena (movimiento permanente sin efectos de filtro).
  const push = 1 + 0.03 * (f / D);
  const entering = !(first || (f >= 28 && p > 0.999));
  const dy = Math.round((1 - p) * 90 - (1 - outP) * 50);
  const sc = (0.9 + 0.1 * Math.min(1.04, p) - (1 - outP) * 0.05) * push;
  const style: React.CSSProperties = entering || outP < 1
    ? {opacity: Math.min(1, f / 4) * outP, transform: `translateY(${dy}px) scale(${sc})`}
    : {transform: `scale(${push})`};
  return <div style={{position: "absolute", inset: 0, transformOrigin: "50% 45%", ...style}}>{children}</div>;
};

// ───────── 1 · Arriendo del mes (hook → "pasa un mes")
const S1: React.FC<SP> = ({lc}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const amt = Math.round(interpolate(f, [lc("hook") + 10, lc("hook") + 34], [0, 500], {...clamp, easing: Easing.out(Easing.cubic)})) * 1000;
  const unpaid = f >= lc("unpaid");
  const stamp = Math.min(1.12, spring({frame: f - lc("unpaid"), fps, config: {damping: 9, stiffness: 200}}));
  const shake = unpaid && f - lc("unpaid") < 10 ? Math.round(Math.sin((f - lc("unpaid")) * 2.4) * 10) : 0;
  const barW = unpaid ? 80 : interpolate(f, [lc("hook") + 30, lc("unpaid")], [0, 80], clamp);
  const dot = 0.55 + 0.45 * Math.sin(f / 3.5);
  return (
    <div style={{position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center"}}>
      <StableText text="¿Tienes un departamento en arriendo?" fontSize={72} startFrame={lc("hook")} />
      <div style={{marginTop: 40, position: "relative", transform: shake ? `translateX(${shake}px)` : undefined}}>
        <Card title="ARRIENDO DEL MES" height={560} accent={unpaid ? ALERT : undefined}>
          <div style={{position: "absolute", left: 34, top: 26, fontFamily, fontWeight: 700, fontSize: 26, letterSpacing: 3, color: colors.muted}}>MONTO MENSUAL</div>
          <div style={{position: "absolute", left: 34, top: 60, fontFamily, fontWeight: 900, fontSize: 150, color: colors.white, lineHeight: 1, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums"}}>
            ${amt.toLocaleString("es-CL")}
          </div>
          <div style={{position: "absolute", left: 34, top: 262, width: 844, height: 22, borderRadius: 11, background: "rgba(255,255,255,0.12)"}}>
            <div style={{width: `${barW}%`, height: "100%", borderRadius: 11, background: unpaid ? ALERT : colors.copper}} />
          </div>
          <div style={{position: "absolute", left: 34, top: 322, display: "flex", alignItems: "center", gap: 16, fontFamily, fontWeight: 800, fontSize: 44,
            color: unpaid ? ALERT : colors.copperSoft}}>
            <span style={{width: 22, height: 22, borderRadius: 11, background: unpaid ? ALERT : colors.copper, opacity: unpaid ? 1 : dot, display: "inline-block"}} />
            {unpaid ? "NO RECIBIDO" : "PAGO PENDIENTE"}
          </div>
          {!unpaid ? (
            <svg width={64} height={64} viewBox="0 0 32 32" style={{position: "absolute", right: 40, top: 304, transform: `rotate(${f * 9}deg)`}}>
              <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
              <path d="M16 4 A12 12 0 0 1 28 16" fill="none" stroke={colors.copper} strokeWidth="4" strokeLinecap="round" />
            </svg>
          ) : null}
        </Card>
        {unpaid ? (
          <div style={{position: "absolute", right: 40, top: 360, fontFamily, fontWeight: 900, fontSize: 64, color: ALERT, border: `7px solid ${ALERT}`, borderRadius: 14,
            padding: "4px 22px", transform: `rotate(-12deg) scale(${stamp})`, background: "rgba(22,25,31,0.8)"}}>IMPAGO</div>
        ) : null}
      </div>
    </div>
  );
};

// ───────── 2 · Calendario de 6 meses ("pasa un mes" → "en 6 meses")
const S2: React.FC<SP> = ({lc}) => {
  const f = useCurrentFrame();
  const span = Math.max(40, lc("sixmonths") - lc("months"));
  const times = [0, 1, 2, 3, 4, 5].map((i) => lc("months") + (i * span) / 6.4);
  const count = times.filter((t) => f >= t + 8).length;
  return (
    <div style={{position: "absolute", left: 0, right: 0, top: 110}}>
      <Card title="ÚLTIMOS 6 MESES" height={760} accent={count >= 3 ? ALERT : undefined}>
        {times.map((t, i) => {
          const p = rev(f, t, 10);
          const x = 34 + (i % 3) * 287, y = 30 + Math.floor(i / 3) * 262;
          return (
            <div key={i} style={{position: "absolute", left: x, top: y, width: 270, height: 240, borderRadius: 24, boxSizing: "border-box", padding: "20px 22px",
              background: f >= t + 8 ? "rgba(224,112,90,0.14)" : "rgba(255,255,255,0.07)", border: `2px solid ${f >= t + 8 ? ALERT : "rgba(255,255,255,0.14)"}`, ...enter(p, 0, 40)}}>
              <div style={{fontFamily, fontWeight: 800, fontSize: 32, letterSpacing: 2, color: colors.muted}}>MES {i + 1}</div>
              <div style={{fontFamily, fontWeight: 900, fontSize: 72, color: colors.white, marginTop: 6}}>$0</div>
              <div style={{position: "absolute", right: 20, bottom: 18}}><Cross at={t + 8} size={62} /></div>
            </div>
          );
        })}
        <div style={{position: "absolute", left: 34, top: 572, width: 844, height: 22, borderRadius: 11, background: "rgba(255,255,255,0.12)"}}>
          <div style={{width: `${(count / 6) * 100}%`, height: "100%", borderRadius: 11, background: ALERT}} />
        </div>
        <div style={{position: "absolute", left: 34, top: 612, fontFamily, fontWeight: 800, fontSize: 46, color: count ? ALERT : colors.muted}}>
          Pagos recibidos: 0 de 6
        </div>
      </Card>
    </div>
  );
};

// ───────── 3 · Pérdida acumulada ("en 6 meses" → "el problema puede ser mayor")
const S3: React.FC<SP> = ({lc}) => {
  const f = useCurrentFrame();
  const value = Math.round(interpolate(f, [lc("sixmonths"), lc("loss") + 6], [0, 3000], {...clamp, easing: Easing.out(Easing.cubic)})) * 1000;
  const punch = 1 + 0.05 * Math.max(0, 1 - Math.max(0, f - lc("loss")) / 12) * (f >= lc("loss") ? 1 : 0);
  return (
    <div style={{position: "absolute", left: 0, right: 0, top: 90, transform: punch > 1.001 ? `scale(${punch})` : undefined}}>
      <Card title="PÉRDIDA ACUMULADA" height={780} accent={ALERT}>
        <div style={{position: "absolute", left: 34, top: 34, fontFamily, fontWeight: 800, fontSize: 32, letterSpacing: 3, color: colors.muted}}>DEJASTE DE PERCIBIR</div>
        <div style={{position: "absolute", left: 34, top: 84, fontFamily, fontWeight: 900, fontSize: 150, color: ALERT, lineHeight: 1, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums"}}>
          ${value.toLocaleString("es-CL")}
        </div>
        <div style={{position: "absolute", left: 34, top: 262, fontFamily, fontWeight: 600, fontSize: 32, color: colors.muted}}>500 mil × 6 meses · ejemplo ilustrativo</div>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const h = 230 * ((i + 1) / 6) * rev(f, lc("sixmonths") + i * 7, 16);
          return (
            <div key={i}>
              <div style={{position: "absolute", left: 40 + i * 140, top: 640 - h, width: 108, height: h, borderRadius: 14, background: `linear-gradient(180deg, ${ALERT}, #a8412f)`}} />
              <div style={{position: "absolute", left: 40 + i * 140, top: 654, width: 108, textAlign: "center", fontFamily, fontWeight: 700, fontSize: 26, color: colors.muted}}>M{i + 1}</div>
            </div>
          );
        })}
      </Card>
      <Burst at={lc("loss")} x={456} y={790} coins count={24} up />
    </div>
  );
};

// ───────── iconos simples para los gastos
const Icon: React.FC<{kind: string}> = ({kind}) => (
  <svg width={64} height={64} viewBox="0 0 32 32" fill="none" stroke={ALERT} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    {kind === "building" ? <><rect x="7" y="4" width="18" height="24" rx="2" /><path d="M12 10h2M18 10h2M12 15h2M18 15h2M12 20h2M18 20h2M14 28v-4h4v4" /></> : null}
    {kind === "receipt" ? <><path d="M8 3h16v26l-3-2-3 2-2-2-2 2-3-2-3 2z" /><path d="M12 10h8M12 15h8M12 20h5" /></> : null}
    {kind === "scale" ? <><path d="M16 5v21M9 26h14M6 9h20" /><path d="M6 9l-3 8a3.5 3.5 0 0 0 6 0zM26 9l-3 8a3.5 3.5 0 0 0 6 0z" /></> : null}
    {kind === "mail" ? <><rect x="4" y="8" width="24" height="17" rx="2" /><path d="M5 10l11 9 11-9" /></> : null}
  </svg>
);

// ───────── 4 · Gastos ("el problema puede ser mayor" → "En Boettcher")
const S4: React.FC<SP> = ({lc}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rows = [
    {kind: "building", text: "Gastos comunes", at: lc("common")},
    {kind: "receipt", text: "Cuentas impagas", at: lc("bills")},
    {kind: "scale", text: "Abogados", at: lc("lawyers")},
    {kind: "mail", text: "Notificaciones judiciales", at: lc("notices")},
  ];
  return (
    <div style={{position: "absolute", left: 0, right: 0, top: 60}}>
      <Card title="EL PROBLEMA PUEDE SER MAYOR" height={860} accent={ALERT}>
        {rows.map((r, i) => {
          const p = Math.min(1, spring({frame: f - r.at, fps, config: {damping: 13, stiffness: 160}}));
          return (
            <div key={r.kind}>
            {p < 0.999 ? <Skeleton x={34} y={30 + i * 190} w={844} h={160} radius={26} /> : null}
            <div style={{position: "absolute", left: 34, top: 30 + i * 190, width: 844, height: 160, boxSizing: "border-box", borderRadius: 26, display: "flex", alignItems: "center", gap: 28,
              padding: "0 30px", background: "rgba(224,112,90,0.12)", border: `2px solid ${ALERT}`, fontFamily, fontWeight: 800, fontSize: 52, color: colors.white, ...enter(p, 320, 0)}}>
              <div style={{width: 92, height: 92, borderRadius: 46, background: "rgba(224,112,90,0.18)", display: "flex", alignItems: "center", justifyContent: "center"}}><Icon kind={r.kind} /></div>
              {r.text}
            </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
};

// ───────── 5 · Panel Boettcher ("En Boettcher" → "desde el 6")
const S5: React.FC<SP> = ({lc}) => {
  const f = useCurrentFrame();
  const rows = [
    {text: "Evaluamos a los arrendatarios", at: lc("eval"), y: 230},
    {text: "Administramos los pagos", at: lc("pay"), y: 370},
    {text: "Corredor exclusivo a tu propiedad", at: lc("broker"), y: 510},
  ];
  const cardTop = 60;
  const bodyTop = cardTop + HEADER_H;
  const okP = rev(f, lc("broker") + 16, 14);
  return (
    <div style={{position: "absolute", inset: 0}}>
      <div style={{position: "absolute", left: 0, right: 0, top: cardTop}}>
        <Card title="ADMINISTRACIÓN BOETTCHER" height={860} accent={colors.copper}>
          <div style={{position: "absolute", left: 176, top: 26, ...enter(rev(f, lc("brand") + 4, 14), 0, 30)}}>
            <Img src={staticFile("brand/logo-boettcher-transparente.png")} style={{width: 560, height: "auto", display: "block"}} />
          </div>
          {rows.map((r) => {
            const on = f >= r.at - 2;
            return (
              <div key={r.text} style={{position: "absolute", left: 34, top: r.y, width: 844, height: 112, boxSizing: "border-box", borderRadius: 24, padding: "0 30px", display: "flex", alignItems: "center",
                background: on ? "rgba(62,207,142,0.10)" : "rgba(255,255,255,0.06)", border: `2px solid ${on ? "#3ecf8e" : "rgba(255,255,255,0.14)"}`, fontFamily, fontWeight: 800, fontSize: 40, color: colors.white}}>
                {r.text}
              </div>
            );
          })}
          {rows.map((r) => <Toggle key={r.text} at={r.at - 2} x={800} y={r.y + 56} />)}
          <div style={{position: "absolute", left: 34, top: 670, width: 844, height: 110, boxSizing: "border-box", borderRadius: 24, display: "flex", alignItems: "center", gap: 22, padding: "0 30px",
            background: "rgba(62,207,142,0.14)", border: "2px solid #3ecf8e", fontFamily, fontWeight: 900, fontSize: 42, color: "#7ee8b4", ...enter(okP, 0, 30)}}>
            <svg width={56} height={56} viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#3ecf8e33" stroke="#3ecf8e" strokeWidth="1.6" /><path d="M6.5 12.5 L10.5 16.5 L17.5 8" fill="none" stroke="#3ecf8e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Todo en orden
          </div>
        </Card>
      </div>
      <Cursor pts={[
        {at: lc("brand") + 10, x: 880, y: 960},
        {at: lc("eval") - 2, x: 800, y: bodyTop + 230 + 56, click: true},
        {at: lc("pay") - 2, x: 800, y: bodyTop + 370 + 56, click: true},
        {at: lc("broker") - 2, x: 800, y: bodyTop + 510 + 56, click: true},
        {at: lc("broker") + 50, x: 700, y: 880},
      ]} />
    </div>
  );
};

// ───────── 6 · Planes ("desde el 6" → "no esperes")
const S6: React.FC<SP> = ({lc}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const priceP = Math.min(1, spring({frame: f - lc("price"), fps, config: {damping: 14, stiffness: 150}}));
  const p12 = rev(f, lc("plan12") - 6, 14);
  const p15 = rev(f, lc("plan15") - 6, 14);
  const shieldP = rev(f, lc("plan15"), 16);
  const termsP = rev(f, lc("terms"), 14);
  const cardTop = 30;
  const bodyTop = cardTop + HEADER_H;
  const chip = (text: string, at: number, x: number) => {
    const p = rev(f, at, 12);
    return (
      <div style={{position: "absolute", left: x, top: 262, display: "flex", alignItems: "center", gap: 10, fontFamily, fontWeight: 800, fontSize: 32, color: colors.white,
        background: "rgba(62,207,142,0.12)", border: "2px solid #3ecf8e", borderRadius: 16, padding: "10px 20px 10px 14px", ...enter(p, 0, 24)}}>
        <svg width={34} height={34} viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#3ecf8e33" stroke="#3ecf8e" strokeWidth="1.6" /><path d="M6.5 12.5 L10.5 16.5 L17.5 8" fill="none" stroke="#3ecf8e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        {text}
      </div>
    );
  };
  return (
    <div style={{position: "absolute", inset: 0}}>
      <div style={{position: "absolute", left: 0, right: 0, top: cardTop}}>
        <Card title="PLANES DE ADMINISTRACIÓN" height={900} accent={colors.copper}>
          <div style={{position: "absolute", left: 34, top: 4, display: "flex", alignItems: "center", gap: 24, ...enter(priceP, 0, 30)}}>
            <div style={{fontFamily, fontWeight: 900, fontSize: 170, color: colors.copperSoft, lineHeight: 1}}>6%</div>
            <div style={{fontFamily, fontWeight: 800, fontSize: 46, color: colors.white, lineHeight: 1.1}}>mensual<br />administración</div>
          </div>
          <div style={{position: "absolute", left: 700, top: 0, ...enter(shieldP, 0, 40)}}><Shield width={160} /></div>
          {p12 < 0.999 ? <Skeleton x={34} y={200} w={844} h={200} /> : null}
          <div style={{position: "absolute", inset: 0, ...enter(p12, 0, 50)}}>
            <div style={{position: "absolute", left: 34, top: 200, width: 844, height: 200, boxSizing: "border-box", borderRadius: 24, padding: "18px 28px", background: "rgba(255,255,255,0.07)",
              border: `2px solid ${colors.copper}`}}>
              <div style={{fontFamily, fontWeight: 800, fontSize: 28, letterSpacing: 2, color: colors.copperSoft}}>PLAN GARANTIZADO · 12%</div>
              <div style={{fontFamily, fontWeight: 900, fontSize: 44, color: colors.white, marginTop: 10, lineHeight: 1.1, width: 600}}>Hasta 6 meses de renta impaga</div>
            </div>
            <Toggle at={lc("plan12") - 2} x={800} y={300} />
          </div>
          {p15 < 0.999 ? <Skeleton x={34} y={424} w={844} h={380} /> : null}
          <div style={{position: "absolute", inset: 0, ...enter(p15, 0, 50)}}>
            <div style={{position: "absolute", left: 34, top: 424, width: 844, height: 380, boxSizing: "border-box", borderRadius: 24, padding: "18px 28px", background: "rgba(201,130,74,0.14)",
              border: `3px solid ${colors.copper}`}}>
              <div style={{fontFamily, fontWeight: 800, fontSize: 28, letterSpacing: 2, color: colors.copperSoft}}>PLAN PROTECCIÓN TOTAL · 15%</div>
              <div style={{fontFamily, fontWeight: 900, fontSize: 44, color: colors.white, marginTop: 10, lineHeight: 1.1, width: 600}}>Hasta 12 meses de renta impaga</div>
            </div>
            <Toggle at={lc("plan15") - 2} x={800} y={524} />
          </div>
          <div style={{position: "absolute", left: 0, top: 424 + 0}}>
            <div style={{position: "relative"}}>
              {chip("Respaldo legal", lc("legal"), 34 + 0)}
              {chip("Cuentas básicas", lc("basic"), 34 + 290)}
              {chip("Daños", lc("damage"), 34 + 610)}
            </div>
          </div>
          <div style={{position: "absolute", left: 34, top: 826, fontFamily, fontSize: 28, color: colors.muted, ...enter(termsP, 0, 12)}}>Según las condiciones contratadas.</div>
        </Card>
      </div>
      <Cursor pts={[
        {at: lc("price"), x: 880, y: 960},
        {at: lc("plan12") - 2, x: 800, y: bodyTop + 300, click: true},
        {at: lc("plan15") - 2, x: 800, y: bodyTop + 524, click: true},
        {at: lc("terms"), x: 640, y: 940},
      ]} />
    </div>
  );
};

// ───────── 7 · WhatsApp y cierre ("no esperes" → final)
const S7: React.FC<SP> = ({lc}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const typed = Math.floor(interpolate(f, [lc("protect"), lc("invest") - 6], [0, MESSAGE.length], clamp));
  const sent = f >= lc("invest");
  const sendP = Math.min(1.08, spring({frame: f - lc("invest"), fps, config: {damping: 11, stiffness: 180}}));
  const phoneOut = rev(f, lc("cta") - 4, 10);
  const endP = (d: number) => Math.min(1, spring({frame: f - lc("cta") - d, fps, config: {damping: 12, stiffness: 150}}));
  const caret = Math.floor(f / 8) % 2 === 0;
  return (
    <div style={{position: "absolute", inset: 0}}>
      {phoneOut < 0.999 ? (
        <div style={{position: "absolute", left: 246, top: 40, width: 420, height: 880, borderRadius: 64, background: "#0b0d10", padding: 14, boxSizing: "border-box",
          border: "2px solid rgba(255,255,255,0.18)", boxShadow: "0 40px 90px rgba(0,0,0,0.6)", opacity: 1 - phoneOut, transform: phoneOut > 0 ? `translateY(${phoneOut * 90}px)` : undefined}}>
          <div style={{position: "relative", width: "100%", height: "100%", borderRadius: 50, overflow: "hidden", background: "#e9e1d6"}}>
            <div style={{height: 120, background: "#0b5c52", display: "flex", alignItems: "center", gap: 16, padding: "0 20px"}}>
              <div style={{width: 62, height: 62, borderRadius: 31, background: colors.copper, display: "flex", alignItems: "center", justifyContent: "center", fontFamily, fontWeight: 900, fontSize: 34, color: colors.graphiteDeep}}>B</div>
              <div>
                <div style={{fontFamily, fontWeight: 800, fontSize: 26, color: "#fff"}}>Boettcher Propiedades</div>
                <div style={{fontFamily, fontWeight: 500, fontSize: 20, color: "#b8e0d9"}}>en línea</div>
              </div>
            </div>
            {sent ? (
              <div style={{position: "absolute", right: 18, top: 150, width: 300, boxSizing: "border-box", padding: "14px 18px", borderRadius: "20px 20px 4px 20px", background: "#d9fdd3",
                fontFamily, fontWeight: 500, fontSize: 24, lineHeight: 1.25, color: "#111", transform: `scale(${Math.min(1, sendP)})`, transformOrigin: "100% 0%"}}>
                {MESSAGE}
                <div style={{display: "flex", justifyContent: "flex-end", marginTop: 6}}>
                  <svg width={30} height={18} viewBox="0 0 30 18"><path d="M2 10 L7 15 L16 3 M12 12 L15 15 L26 3" fill="none" stroke="#53bdeb" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>
            ) : null}
            <div style={{position: "absolute", left: 12, right: 12, bottom: 14, display: "flex", alignItems: "flex-end", gap: 10}}>
              <div style={{flex: 1, minHeight: 56, boxSizing: "border-box", borderRadius: 28, background: "#fff", padding: "12px 18px", fontFamily, fontSize: 22, lineHeight: 1.25, color: "#222"}}>
                {sent ? <span style={{color: "#9aa0a6"}}>Mensaje</span> : <>{MESSAGE.slice(0, typed)}<span style={{opacity: caret ? 1 : 0}}>|</span></>}
              </div>
              <div style={{width: 56, height: 56, borderRadius: 28, background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", transform: sent && sendP < 1 ? `scale(${1 + (1 - sendP) * 0.3})` : undefined}}>
                <svg width={28} height={28} viewBox="0 0 24 24"><path d="M3 20 L21 12 L3 4 L3 10 L15 12 L3 14 Z" fill="#fff" /></svg>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <Burst at={lc("invest")} x={456} y={300} count={30} />
      <div style={{position: "absolute", left: 0, right: 0, top: 70, display: "flex", flexDirection: "column", alignItems: "center", gap: 36}}>
        <div style={{...enter(endP(4), 0, 60)}}>
          <Img src={staticFile("brand/logo-boettcher-transparente.png")} style={{width: 720, height: "auto", display: "block"}} />
        </div>
        <div style={{fontFamily, fontWeight: 900, fontSize: 58, color: colors.copperSoft, textAlign: "center", ...enter(endP(10), 0, 50)}}>Tu inversión merece respaldo</div>
        <div style={{fontFamily, fontWeight: 800, fontSize: 54, color: colors.graphiteDeep, background: colors.copper, borderRadius: 999, padding: "26px 56px", whiteSpace: "nowrap",
          boxShadow: `0 20px 50px ${colors.copper}55`, ...enter(endP(16), 0, 60)}}>Solicita tu evaluación</div>
        <div style={{display: "flex", alignItems: "center", gap: 22, ...enter(endP(24), 0, 50)}}>
          <svg width={92} height={92} viewBox="0 0 24 24" aria-label="WhatsApp">
            <circle cx="12" cy="12" r="12" fill="#25D366" />
            <path fill="#ffffff" transform="translate(4.2 4.2) scale(0.65)"
              d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z" />
          </svg>
          <div>
            <div style={{fontFamily, fontWeight: 700, fontSize: 26, letterSpacing: 3, color: colors.muted}}>ESCRÍBENOS POR WHATSAPP</div>
            <div style={{fontFamily, fontWeight: 900, fontSize: 64, color: colors.white, lineHeight: 1.05, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums"}}>+56 9 8687 7420</div>
          </div>
        </div>
      </div>
      <Burst at={lc("cta")} x={456} y={260} count={34} />
    </div>
  );
};

// ───────── Guía de avance (como los "PASO 1/2/3" del reel de referencia): 4 etapas con barra que se llena.
export const Chips: React.FC<{marks: number[]; total: number; labels?: string[]}> = ({marks, total, labels = ["PROBLEMA", "SOLUCIÓN", "PLANES", "CONTACTO"]}) => {
  const f = useCurrentFrame();
  const T = useTheme();
  return (
    <div style={{position: "absolute", left: 84, right: 84, top: 214, display: "flex", gap: 10}}>
      {labels.map((l, i) => {
        const s = marks[i], e = i + 1 < marks.length ? marks[i + 1] : total;
        const p = Math.max(0, Math.min(1, (f - s) / Math.max(1, e - s)));
        return (
          <div key={l} style={{flex: 1, height: 46, borderRadius: 23, position: "relative", overflow: "hidden", background: T.chipBg,
            border: `2px solid ${f >= s ? T.accent : T.chipBorder}`}}>
            <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: `${p * 100}%`, background: T.accent, opacity: 0.9}} />
            <div style={{position: "relative", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily, fontWeight: 800, fontSize: 21, letterSpacing: 2,
              color: p > 0.5 ? T.onAccent : f >= s ? T.text : T.muted}}>{l}</div>
          </div>
        );
      })}
    </div>
  );
};

export const TopLogo: React.FC<{hideAt: number}> = ({hideAt}) => {
  const f = useCurrentFrame();
  const T = useTheme();
  const o = Math.min(interpolate(f, [0, 14], [0, 1], clamp), interpolate(f, [hideAt - 10, hideAt + 4], [1, 0], clamp));
  if (o <= 0) return null;
  return (
    <div style={{position: "absolute", top: 96, left: 0, width: 1080, display: "flex", justifyContent: "center", ...(o >= 1 ? {} : {opacity: o})}}>
      <Img src={staticFile(T.logo)} style={{width: T.logoTopWidth, height: "auto", display: "block"}} />
    </div>
  );
};

// ───────── Subtítulos palabra por palabra: cada palabra aparece cuando se dice; la actual va en cobre; las clave, resaltadas.
const norm = (w: string) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
export const KEYWORDS = new Set(["pagar", "millones", "abogados", "boettcher", "exclusivo", "proteccion", "respaldo", "gratuita", "problema", "6", "12", "mensual"]);

export const Captions: React.FC<{tl: Timeline | null; keywords?: Set<string>}> = ({tl, keywords = KEYWORDS}) => {
  const f = useCurrentFrame();
  const T = useTheme();
  const t = f / FPS;
  const chunks = useMemo(() => {
    let idx = 0;
    return (tl?.subtitles ?? []).map((s) => {
      const n = s.text.split(" ").length;
      const c = {...s, from: idx, n};
      idx += n;
      return c;
    });
  }, [tl]);
  const active = chunks.find((c) => t >= c.start && t < c.end);
  if (!tl || !active) return null;
  const words = tl.words.slice(active.from, active.from + active.n);
  return (
    <div style={{position: "absolute", left: 70, right: 70, bottom: 430, boxSizing: "border-box", padding: "18px 28px", borderRadius: 22, background: T.capBg, textAlign: "center",
      fontFamily, fontWeight: 800, fontSize: 54, lineHeight: 1.22}}>
      {words.map((w, i) => {
        const spoken = t >= w.start;
        const next = words[i + 1]?.start ?? active.end;
        const current = spoken && t < next;
        const key = keywords.has(norm(w.w));
        return (
          <span key={i} style={{opacity: spoken ? 1 : 0, color: current ? T.capCurrent : key ? T.capKey : T.capText}}>{w.w + " "}</span>
        );
      })}
    </div>
  );
};

export const BoettcherComercialDinamico: React.FC<DinProps> = ({timeline}) => {
  const {durationInFrames: TOTAL} = useVideoConfig();
  const c = (id: string) => Math.round((timeline?.cues[id] ?? 0) * FPS);
  const starts = [0, c("months"), c("sixmonths"), c("more"), c("brand"), c("price"), c("wait")];
  const scenes: React.FC<SP>[] = [S1, S2, S3, S4, S5, S6, S7];
  return (
    <AbsoluteFill>
      <GlobalBackground warmAtFrame={c("brand")} />
      <Bokeh warmAt={c("brand")} />
      <Skyline warmAt={c("brand")} fast />
      <Embers warmAt={c("brand")} />
      <TopLogo hideAt={c("cta")} />
      <Chips marks={[0, c("brand"), c("price"), c("wait")]} total={TOTAL} />
      <div style={{position: "absolute", left: STAGE.left, top: STAGE.top, width: STAGE.width, height: STAGE.height}}>
        {scenes.map((Scene, i) => {
          const from = starts[i];
          const end = i + 1 < starts.length ? starts[i + 1] : TOTAL;
          const dur = end - from + (i + 1 < starts.length ? OVERLAP : 0);
          return (
            <Sequence key={i} from={from} durationInFrames={dur}>
              <SceneFrame first={i === 0} last={i === scenes.length - 1}>
                <Scene lc={(id) => c(id) - from} />
              </SceneFrame>
            </Sequence>
          );
        })}
      </div>
      <Captions tl={timeline} />
      <Audio src={staticFile("voice/comercial-final.wav")} />
    </AbsoluteFill>
  );
};

export const calculateDinamicoMetadata = async () => {
  const res = await fetch(staticFile("voice/comercial-final.timeline.json"));
  const timeline = (await res.json()) as Timeline;
  return {durationInFrames: Math.round((timeline.duration_s + TAIL_S) * FPS), props: {timeline}};
};
