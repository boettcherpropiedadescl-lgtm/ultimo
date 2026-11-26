import type {CSSProperties} from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const ink = "#101842";
const paper = "#f5f1e8";
const gold = "#face04";
const rust = "#f39779";
const secondary = "#bfc8eb";

const fit = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.out(Easing.cubic),
} as const;

const safe: CSSProperties = {position: "absolute", left: 96, right: 126};

const Background = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const offset = Math.sin(frame / (2.2 * fps)) * 30;
  return <AbsoluteFill style={{backgroundColor: paper}}>
    <AbsoluteFill style={{
      backgroundImage: "linear-gradient(90deg, #1025520b 1px, transparent 1px), linear-gradient(#1025520b 1px, transparent 1px)",
      backgroundSize: "60px 60px",
      backgroundPosition: `center ${offset}px`,
      maskImage: "radial-gradient(ellipse 79% 84% at 46% 63%, #000 9%, transparent 93%)",
    }}/>
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at ${60 + offset / 12}% 92%, #e6b96754, transparent 45%)`,
    }}/>
  </AbsoluteFill>;
};

const BudgetLane = ({income}: {income: boolean}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const arrive = income ? 1.30 : 2.70;
  const depart = income ? 0.18 : 1.83;
  const seconds = frame / fps;
  const status = interpolate(seconds, [arrive, arrive + 0.23], [0, 1], fit);
  const line = interpolate(seconds, [depart, arrive], [0.02, income ? 0.56 : 1], fit);
  const gap = interpolate(seconds, [4.8, 6.2], [0, 1], fit);
  const pulse = interpolate(seconds, [arrive, arrive + 0.14, arrive + 0.52], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const accent = income ? rust : gold;

  return <div style={{
    height: 178,
    marginTop: 13,
    padding: "28px 30px 18px",
    borderRadius: 26,
    background: income ? "#222d59" : "#303b65",
    border: `2px solid ${income ? "#334478" : "#495778"}`,
    position: "relative",
    boxSizing: "border-box",
  }}>
    <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
      <div>
        <div style={{
          color: secondary, fontSize: 22, fontWeight: 750, letterSpacing: 2.4, marginBottom: 5,
        }}>{income ? "INGRESO" : "GASTO"}</div>
        <div style={{color: "white", fontSize: 43, fontWeight: 800}}>
          {income ? "Arriendo" : "Dividendo"}
        </div>
      </div>
      <div style={{
        background: accent,
        color: ink,
        padding: "10px 17px",
        borderRadius: 12,
        fontSize: 27,
        fontWeight: 850,
        opacity: status,
        translate: `0 ${(1 - status) * 17}px`,
        rotate: income ? "-3deg" : "0deg",
        boxShadow: `0 0 ${pulse * 45}px ${accent}`,
      }}>{income ? "No recibido" : "Vence igual"}</div>
    </div>
    <div style={{position: "absolute", left: 34, right: 34, bottom: 26, height: 8}}>
      <div style={{height: 4, marginTop: 2, borderBottom: "4px dashed #59658c"}}/>
      {income && <div style={{
        position: "absolute", left: "56%", right: 0, top: -6, height: 20,
        background: "repeating-linear-gradient(125deg, #f397795f 0 4px, #f3977914 4px 12px)",
        borderRadius: "0 8px 8px 0", transformOrigin: "left", scale: `${gap} 1`,
      }}/>}
      <div style={{position: "absolute", inset: 0, width: `${line * 100}%`, background: accent, borderRadius: 8}}/>
      <div style={{
        position: "absolute", left: `${line * 100}%`, top: 4,
        width: 22, height: 22, translate: "-50% -50%",
        background: accent, borderRadius: "50%",
        boxShadow: `0 0 0 ${5 + pulse * 14}px ${accent}35`,
      }}/>
    </div>
  </div>;
};

const Budget = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const arrival = spring({frame, fps, config: {damping: 20, stiffness: 80}});
  const seconds = frame / fps;
  const focus = interpolate(seconds, [4.75, 7.20], [0, 1], fit);

  return <div style={{
    ...safe,
    top: 758,
    padding: "34px 36px 36px",
    background: ink,
    borderRadius: 42,
    boxShadow: "0 4px 0 #fff9 inset, 0 36px 78px #17234b37, 0 10px 0 #080e37",
    translate: `0 ${(1 - arrival) * 30 - focus * 14}px`,
    scale: 0.99 + focus * 0.012,
  }}>
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22,
    }}>
      <span style={{color: "#fff", fontSize: 35, fontWeight: 800}}>Presupuesto del mes</span>
      <div style={{display: "flex", gap: 7}}>
        {[0, 1, 2].map((index) =>
          <div key={index} style={{
            width: 11, height: 11, borderRadius: "50%",
            background: index === 1 ? gold : "#7b86ab",
          }}/>
        )}
      </div>
    </div>
    <BudgetLane income/>
    <BudgetLane income={false}/>
  </div>;
};

const Hook = ({headline, subheadline}: {headline: string; subheadline: string}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;
  const emphasis = interpolate(seconds, [0.08, 1.35], [0.12, 1], fit);
  const secondLine = interpolate(seconds, [1.63, 2.30], [0, 1], fit);

  return <div style={{...safe, top: 263}}>
    <div style={{
      color: ink, fontSize: 25, fontWeight: 850, letterSpacing: 4,
      marginBottom: 29, textTransform: "uppercase",
    }}>Si arriendas en Chile</div>
    <h1 style={{
      margin: 0, fontSize: 135, fontWeight: 900, lineHeight: 0.94,
      letterSpacing: -7.5, whiteSpace: "pre-line",
    }}>{headline}</h1>
    <div style={{
      width: 503, height: 13, background: gold, marginTop: 19, marginBottom: 38,
      scale: `${emphasis} 1`, transformOrigin: "left",
    }}/>
    <div style={{
      fontSize: 52, fontWeight: 750, lineHeight: 1.04, letterSpacing: -1.3,
      opacity: secondLine, translate: `0 ${(1 - secondLine) * 16}px`,
    }}>{subheadline}</div>
  </div>;
};

const Consequence = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;
  const progress = interpolate(seconds, [4.68, 5.24], [0, 1], fit);
  const question = interpolate(seconds, [7.15, 7.65], [0, 1], fit);

  return <div style={{
    ...safe,
    top: 1318,
    paddingLeft: 32,
    opacity: progress,
    translate: `0 ${(1 - progress) * 26}px`,
  }}>
    <div style={{
      position: "absolute", top: 7, left: 0, width: 14, height: 94,
      border: "4px solid #8d3229", borderRight: 0, borderRadius: "8px 0 0 8px",
      scale: `1 ${progress}`, transformOrigin: "top",
    }}/>
    <div style={{fontSize: 49, fontWeight: 850, letterSpacing: -2}}>El presupuesto cambia.</div>
    <div style={{
      fontSize: 38, fontWeight: 560, marginTop: 7, opacity: question,
      translate: `0 ${(1 - question) * 14}px`,
    }}>¿Con qué cubres la diferencia?</div>
  </div>;
};

export type DividendoProps = {headline: string; subheadline: string};

export const DividendoPiloto = ({headline, subheadline}: DividendoProps) =>
  <AbsoluteFill style={{overflow: "hidden", color: ink, fontFamily: "Arial, Helvetica, sans-serif"}}>
    <Background/>
    <Hook headline={headline} subheadline={subheadline}/>
    <Budget/>
    <Consequence/>
    <div style={{
      ...safe, top: 1511, paddingTop: 13, borderTop: "2px solid #18204b3c",
      fontSize: 22, fontWeight: 850, letterSpacing: 2.3,
    }}>BOETTCHER PROPIEDADES</div>
  </AbsoluteFill>;
