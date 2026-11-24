import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {GlobalBackground} from "./components/GlobalBackground";
import {StableText} from "./components/StableText";
import {Bokeh, Embers, Skyline} from "./components/art/Scenery";
import {Burst, Card, clamp, Cross, Cursor, enter, HEADER_H, rev} from "./components/ui/Kit";
import {Captions, Chips, KEYWORDS, SceneFrame, TopLogo, type SP, type Timeline} from "./BoettcherComercialDinamico";
import {colors, fontFamily} from "./theme";

// Comercial para propietarios que ya tienen administración y quieren cambiarse a Boettcher.
// Arco persuasivo: identificación → agitación → reencuadre → prueba → beneficios (antes → Boettcher) → pasos simples → cierre.
// Datos verificados en boettcher.cl/administracion-de-propiedades/: +15 años, +2.000 propiedades, corredor exclusivo (sin bots ni call centers),
// plataforma online, liquidación puntual, seguro de arriendo hasta 12 meses (según plan), defensa legal, desde 6 % mensual sin IVA, cotización en 1 minuto.
// Las voces/audios se sustituyen sin tocar el código: los cues salen de la alineación palabra a palabra del audio.

export type CambioProps = {timeline: Timeline | null};
export const cambioDefaults: CambioProps = {timeline: null};

const FPS = 30;
const TAIL_S = 1.2;
const OVERLAP = 8;
const ALERT = "#e0705a";
const GREEN = "#3ecf8e";
const STAGE = {left: 84, top: 300, width: 912, height: 990};
const MESSAGE = "Hola Boettcher Propiedades, quiero cambiar la administración de mi propiedad";
const KEYS = new Set([...KEYWORDS, "contesta", "respuestas", "excusas", "cambiarte", "corredor", "online", "puntual", "seguro", "cotiza", "15", "mil", "bots", "legal"]);

const Icon: React.FC<{kind: string; color?: string}> = ({kind, color = ALERT}) => (
  <svg width={64} height={64} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    {kind === "clock" ? <><circle cx="16" cy="16" r="12" /><path d="M16 9v7l5 3" /></> : null}
    {kind === "receipt" ? <><path d="M8 3h16v26l-3-2-3 2-2-2-2 2-3-2-3 2z" /><path d="M12 10h8M12 15h8M12 20h5" /></> : null}
    {kind === "person" ? <><circle cx="16" cy="11" r="5" /><path d="M6 27c1-6 5-9 10-9s9 3 10 9" /></> : null}
    {kind === "phone" ? <><path d="M7 4h6l2 6-3 2c1.5 3 3.5 5 6 6l2-3 6 2v6c0 1-1 2-2 2C13 25 5 17 5 6c0-1 1-2 2-2z" /></> : null}
  </svg>
);

// ───────── 1 · Mensajes sin respuesta (hook → "llegan tarde")
const S1: React.FC<SP> = ({lc}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const msgs = [
    {t: lc("hook") + 14, text: "Hola, ¿ya depositaron mi arriendo?"},
    {t: lc("hook") + 62, text: "¿Alguien me puede responder?"},
  ];
  const callT = lc("hook") + 104;
  const silT = lc("silence");
  const badge = Math.min(1.1, spring({frame: f - silT, fps, config: {damping: 9, stiffness: 190}}));
  const dots = (f % 24) / 24;
  return (
    <div style={{position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center"}}>
      <StableText text="¿Tu administración no te responde?" fontSize={70} startFrame={lc("hook")} />
      <div style={{marginTop: 36, position: "relative"}}>
        <Card title="MENSAJES · MI ADMINISTRACIÓN" height={640} accent={f >= silT ? ALERT : undefined}>
          {msgs.map((m, i) => {
            const p = rev(f, m.t, 12);
            return (
              <div key={i} style={{position: "absolute", right: 34, top: 34 + i * 128, maxWidth: 620, boxSizing: "border-box", padding: "18px 26px", borderRadius: "28px 28px 6px 28px",
                background: "#1f5f52", fontFamily, fontWeight: 600, fontSize: 38, color: "#fff", ...enter(p, 120, 0)}}>
                {m.text}
                <div style={{display: "flex", justifyContent: "flex-end", marginTop: 6}}>
                  <svg width={34} height={20} viewBox="0 0 30 18"><path d="M2 10 L7 15 L16 3 M12 12 L15 15 L26 3" fill="none" stroke="#9fb3ad" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>
            );
          })}
          <div style={{position: "absolute", left: 34, top: 300, display: "flex", alignItems: "center", gap: 18, fontFamily, fontWeight: 800, fontSize: 40, color: ALERT, ...enter(rev(f, callT, 12), -80, 0)}}>
            <Icon kind="phone" /> Llamada perdida
          </div>
          <div style={{position: "absolute", left: 34, top: 400, display: "flex", gap: 14, alignItems: "center", fontFamily, fontWeight: 600, fontSize: 34, color: colors.muted, opacity: f >= silT ? 0 : 1}}>
            esperando respuesta
            {[0, 1, 2].map((i) => <span key={i} style={{width: 14, height: 14, borderRadius: 7, background: colors.muted, opacity: 0.25 + 0.75 * Math.max(0, Math.sin(((dots - i * 0.16) % 1) * Math.PI))}} />)}
          </div>
          {f >= silT ? (
            <div style={{position: "absolute", left: 34, top: 400, fontFamily, fontWeight: 900, fontSize: 56, color: ALERT, border: `6px solid ${ALERT}`, borderRadius: 18, padding: "6px 26px",
              transform: `rotate(-4deg) scale(${badge})`, background: "rgba(22,25,31,0.9)"}}>SIN RESPUESTA</div>
          ) : null}
        </Card>
      </div>
    </div>
  );
};

// ───────── 2 · Lo que te pasa hoy ("llegan tarde" → "mereces respuestas")
const S2: React.FC<SP> = ({lc}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rows = [
    {kind: "clock", text: "Pagos que llegan tarde", at: lc("late")},
    {kind: "receipt", text: "Cobros que nadie explica", at: lc("fees")},
    {kind: "person", text: "Un ejecutivo distinto cada vez", at: lc("exec")},
  ];
  return (
    <div style={{position: "absolute", left: 0, right: 0, top: 80}}>
      <Card title="LO QUE TE PASA HOY" height={780} accent={ALERT}>
        {rows.map((r, i) => {
          const p = Math.min(1, spring({frame: f - r.at, fps, config: {damping: 13, stiffness: 160}}));
          return (
            <div key={r.kind} style={{position: "absolute", left: 34, top: 34 + i * 232, width: 844, height: 200, boxSizing: "border-box", borderRadius: 28, display: "flex", alignItems: "center", gap: 28,
              padding: "0 32px", background: "rgba(224,112,90,0.12)", border: `2px solid ${ALERT}`, fontFamily, fontWeight: 800, fontSize: 50, color: colors.white, lineHeight: 1.1, ...enter(p, 320, 0)}}>
              <div style={{width: 104, height: 104, borderRadius: 52, background: "rgba(224,112,90,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none"}}><Icon kind={r.kind} /></div>
              {r.text}
              <div style={{marginLeft: "auto", flex: "none"}}><Cross at={r.at + 10} size={64} /></div>
            </div>
          );
        })}
      </Card>
    </div>
  );
};

// ───────── 3 · Respuestas, no excusas ("mereces respuestas" → "cambiarte")
const S3: React.FC<SP> = ({lc}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = Math.min(1, spring({frame: f - lc("deserve"), fps, config: {damping: 12, stiffness: 150}}));
  const exT = lc("excuses");
  const b = Math.min(1, spring({frame: f - exT, fps, config: {damping: 12, stiffness: 150}}));
  const strike = interpolate(f, [exT + 14, exT + 30], [0, 100], clamp);
  return (
    <div style={{position: "absolute", left: 0, right: 0, top: 120}}>
      <Card title="TÚ ELIGES" height={700} accent={GREEN}>
        <div style={{position: "absolute", left: 34, top: 40, width: 844, height: 270, boxSizing: "border-box", borderRadius: 30, padding: "0 40px", display: "flex", alignItems: "center", gap: 30,
          background: "rgba(62,207,142,0.14)", border: `3px solid ${GREEN}`, fontFamily, fontWeight: 900, fontSize: 84, color: "#7ee8b4", ...enter(a, 0, 60)}}>
          <svg width={96} height={96} viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#3ecf8e33" stroke={GREEN} strokeWidth="1.6" /><path d="M6.5 12.5 L10.5 16.5 L17.5 8" fill="none" stroke={GREEN} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          RESPUESTAS
        </div>
        <div style={{position: "absolute", left: 34, top: 350, width: 844, height: 270, boxSizing: "border-box", borderRadius: 30, padding: "0 40px", display: "flex", alignItems: "center", gap: 30,
          background: "rgba(224,112,90,0.10)", border: `3px solid ${ALERT}`, fontFamily, fontWeight: 900, fontSize: 84, color: colors.muted, ...enter(b, 0, 60)}}>
          <Cross at={exT + 4} size={96} />
          <span style={{position: "relative"}}>
            EXCUSAS
            <span style={{position: "absolute", left: 0, top: "52%", height: 10, width: `${strike}%`, background: ALERT, borderRadius: 5}} />
          </span>
        </div>
      </Card>
    </div>
  );
};

// ───────── 4 · Cambiarte es simple ("cambiarte" → "corredor exclusivo")
const Stat: React.FC<{at: number; target: number; prefix?: string; suffix?: string; label: string; fmt?: (n: number) => string}> = ({at, target, prefix = "+", suffix = "", label, fmt}) => {
  const f = useCurrentFrame();
  const p = rev(f, at, 12);
  const v = Math.round(target * interpolate(f, [at + 4, at + 40], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)}));
  return (
    <div style={{height: 280, boxSizing: "border-box", borderRadius: 32, padding: "26px 40px", background: "rgba(255,255,255,0.07)", border: `3px solid ${colors.copper}`, ...enter(p, 0, 60)}}>
      <div style={{fontFamily, fontWeight: 900, fontSize: 150, color: colors.copperSoft, lineHeight: 1, fontVariantNumeric: "tabular-nums"}}>{prefix}{fmt ? fmt(v) : v}{suffix}</div>
      <div style={{fontFamily, fontWeight: 800, fontSize: 52, color: colors.white, marginTop: 12}}>{label}</div>
    </div>
  );
};
const S4: React.FC<SP> = ({lc}) => (
  <div style={{position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 30}}>
    <StableText text="Cambiarte es más simple de lo que crees" fontSize={70} startFrame={lc("change")} />
    <Stat at={lc("years")} target={15} label="años de experiencia" />
    <Stat at={lc("props")} target={2000} label="propiedades administradas" fmt={(n) => n.toLocaleString("es-CL")} />
  </div>
);

// ───────── 5 · Antes → Boettcher ("corredor exclusivo" → "escríbenos")
const S5: React.FC<SP> = ({lc}) => {
  const f = useCurrentFrame();
  const rows = [
    {pain: "Nadie contesta", gain: "Corredor exclusivo y trato directo", sub: "sin bots ni call centers", at: lc("broker"), subAt: lc("nobots")},
    {pain: "Sin información", gain: "Plataforma online", sub: "pagos, contratos y gastos comunes", at: lc("platform"), subAt: lc("mypay")},
    {pain: "Pagos atrasados", gain: "Liquidación puntual", sub: "cada mes", at: lc("payout"), subAt: lc("payout") + 10},
    {pain: "Sin respaldo", gain: "Seguro de arriendo y defensa legal", sub: "hasta 12 meses · según el plan contratado", at: lc("insurance"), subAt: lc("cover12")},
  ];
  const cardTop = 30;
  const bodyTop = cardTop + HEADER_H;
  const rowY = (i: number) => 24 + i * 214;
  const termsP = rev(f, lc("terms"), 14);
  return (
    <div style={{position: "absolute", inset: 0}}>
      <div style={{position: "absolute", left: 0, right: 0, top: cardTop}}>
        <Card title="DE ESTO → A ESTO" height={930} accent={colors.copper}>
          {rows.map((r, i) => {
            const flip = f >= r.at;
            const gp = rev(f, r.at, 12);
            const sp = rev(f, r.subAt, 12);
            const strike = interpolate(f, [r.at, r.at + 10], [0, 100], clamp);
            return (
              <div key={r.pain} style={{position: "absolute", left: 34, top: rowY(i), width: 844, height: 190}}>
                <div style={{position: "absolute", left: 0, top: 0, width: 300, height: 190, boxSizing: "border-box", borderRadius: 26, padding: "0 24px", display: "flex", alignItems: "center",
                  background: "rgba(224,112,90,0.10)", border: `2px solid ${ALERT}`, fontFamily, fontWeight: 800, fontSize: 36, lineHeight: 1.1, color: flip ? colors.muted : colors.white}}>
                  <span style={{position: "relative"}}>{r.pain}<span style={{position: "absolute", left: 0, top: "50%", height: 6, width: `${strike}%`, background: ALERT, borderRadius: 3}} /></span>
                </div>
                <svg width={40} height={40} viewBox="0 0 24 24" style={{position: "absolute", left: 312, top: 75}}><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke={flip ? GREEN : colors.muted} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <div style={{position: "absolute", left: 366, top: 0, width: 478, height: 190, boxSizing: "border-box", borderRadius: 26, padding: "16px 24px", background: flip ? "rgba(62,207,142,0.12)" : "rgba(255,255,255,0.05)",
                  border: `3px solid ${flip ? GREEN : "rgba(255,255,255,0.12)"}`, ...(flip ? enter(gp, 80, 0) : {})}}>
                  {flip ? (
                    <>
                      <div style={{fontFamily, fontWeight: 900, fontSize: 38, color: colors.white, lineHeight: 1.1}}>{r.gain}</div>
                      <div style={{fontFamily, fontWeight: 700, fontSize: 29, color: "#7ee8b4", marginTop: 8, lineHeight: 1.15, ...enter(sp, 0, 14)}}>{r.sub}</div>
                    </>
                  ) : <div style={{fontFamily, fontWeight: 800, fontSize: 32, color: "rgba(255,255,255,0.25)", paddingTop: 52}}>Con Boettcher…</div>}
                </div>
              </div>
            );
          })}
          <div style={{position: "absolute", left: 34, top: 880, fontFamily, fontSize: 26, color: colors.muted, ...enter(termsP, 0, 12)}}>Cobertura según el plan contratado.</div>
        </Card>
      </div>
      <Cursor pts={[
        {at: lc("broker") - 20, x: 860, y: 980},
        ...rows.map((r, i) => ({at: r.at - 2, x: 410, y: bodyTop + rowY(i) + 95, click: true})),
        {at: lc("terms") + 20, x: 700, y: 1000},
      ]} />
    </div>
  );
};

// ───────── 6 · Cambiarte en tres pasos ("escríbenos" → "no sigas esperando")
const S6: React.FC<SP> = ({lc}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const steps = [
    {n: "1", t: "Escríbenos", at: lc("write")},
    {n: "2", t: "Revisamos tu caso", at: lc("review")},
    {n: "3", t: "Te acompañamos en todo el cambio", at: lc("accompany")},
  ];
  const priceP = Math.min(1, spring({frame: f - lc("price"), fps, config: {damping: 11, stiffness: 170}}));
  const lineH = interpolate(f, [lc("write"), lc("accompany") + 20], [0, 100], clamp);
  return (
    <div style={{position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 34}}>
      <StableText text="Tu cambio, en tres pasos" fontSize={70} startFrame={lc("write")} />
      <div style={{position: "relative"}}>
        <div style={{position: "absolute", left: 69, top: 60, width: 10, height: 560, borderRadius: 5, background: "rgba(255,255,255,0.10)"}}>
          <div style={{width: "100%", height: `${lineH}%`, borderRadius: 5, background: colors.copper}} />
        </div>
        {steps.map((s, i) => {
          const p = Math.min(1, spring({frame: f - s.at, fps, config: {damping: 13, stiffness: 160}}));
          return (
            <div key={s.n} style={{height: 190, marginBottom: i < 2 ? 22 : 0, display: "flex", alignItems: "center", gap: 28, ...enter(p, 260, 0)}}>
              <div style={{width: 140, height: 140, borderRadius: 70, background: colors.copper, display: "flex", alignItems: "center", justifyContent: "center", fontFamily, fontWeight: 900, fontSize: 84, color: colors.graphiteDeep, flex: "none"}}>{s.n}</div>
              <div style={{flex: 1, height: 170, boxSizing: "border-box", borderRadius: 26, padding: "0 30px", display: "flex", alignItems: "center", background: "rgba(255,255,255,0.07)",
                border: `2px solid ${colors.copper}`, fontFamily, fontWeight: 900, fontSize: 48, color: colors.white, lineHeight: 1.1}}>{s.t}</div>
            </div>
          );
        })}
      </div>
      <div style={{alignSelf: "flex-start", display: "flex", alignItems: "baseline", gap: 18, fontFamily, color: colors.white, ...enter(priceP, 0, 50)}}>
        <span style={{fontWeight: 700, fontSize: 38, color: colors.muted}}>DESDE</span>
        <span style={{fontWeight: 900, fontSize: 120, color: colors.copperSoft, lineHeight: 1}}>6%</span>
        <span style={{fontWeight: 800, fontSize: 42, lineHeight: 1.1}}>mensual<br />sin IVA</span>
      </div>
      <Burst at={lc("price")} x={170} y={880} count={22} />
    </div>
  );
};

// ───────── 7 · Cotiza hoy ("no sigas esperando" → final)
const S7: React.FC<SP> = ({lc}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const typed = Math.floor(interpolate(f, [lc("wait"), lc("quote") - 2], [0, MESSAGE.length], clamp));
  const sent = f >= lc("quote");
  const sendP = Math.min(1.08, spring({frame: f - lc("quote"), fps, config: {damping: 11, stiffness: 180}}));
  const phoneOut = rev(f, lc("invest") - 4, 10);
  const endP = (d: number) => Math.min(1, spring({frame: f - lc("invest") - d, fps, config: {damping: 12, stiffness: 150}}));
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
      <Burst at={lc("quote")} x={456} y={300} count={30} />
      <div style={{position: "absolute", left: 0, right: 0, top: 70, display: "flex", flexDirection: "column", alignItems: "center", gap: 36}}>
        <div style={{...enter(endP(4), 0, 60)}}>
          <Img src={staticFile("brand/logo-boettcher-transparente.png")} style={{width: 720, height: "auto", display: "block"}} />
        </div>
        <div style={{fontFamily, fontWeight: 900, fontSize: 58, color: colors.copperSoft, textAlign: "center", ...enter(endP(10), 0, 50)}}>Tu inversión merece respaldo</div>
        <div style={{fontFamily, fontWeight: 800, fontSize: 48, color: colors.graphiteDeep, background: colors.copper, borderRadius: 999, padding: "26px 50px", whiteSpace: "nowrap",
          boxShadow: `0 20px 50px ${colors.copper}55`, ...enter(endP(16), 0, 60)}}>Cotiza en menos de 1 minuto</div>
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
      <Burst at={lc("invest")} x={456} y={260} count={34} />
    </div>
  );
};

export const BoettcherComercialCambio: React.FC<CambioProps> = ({timeline}) => {
  const {durationInFrames: TOTAL} = useVideoConfig();
  const c = (id: string) => Math.round((timeline?.cues[id] ?? 0) * FPS);
  const starts = [0, c("late"), c("deserve"), c("change"), c("broker"), c("write"), c("wait")];
  const scenes: React.FC<SP>[] = [S1, S2, S3, S4, S5, S6, S7];
  return (
    <AbsoluteFill>
      <GlobalBackground warmAtFrame={c("change")} />
      <Bokeh warmAt={c("change")} />
      <Skyline warmAt={c("change")} fast />
      <Embers warmAt={c("change")} />
      <TopLogo hideAt={c("invest")} />
      <Chips marks={[0, c("change"), c("broker"), c("write")]} total={TOTAL} labels={["HOY", "EL CAMBIO", "BENEFICIOS", "COTIZA"]} />
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
      <Captions tl={timeline} keywords={KEYS} />
      <Audio src={staticFile("voice/cambio-admin.wav")} />
    </AbsoluteFill>
  );
};

export const calculateCambioMetadata = async () => {
  const res = await fetch(staticFile("voice/cambio-admin.timeline.json"));
  const timeline = (await res.json()) as Timeline;
  return {durationInFrames: Math.round((timeline.duration_s + TAIL_S) * FPS), props: {timeline}};
};
