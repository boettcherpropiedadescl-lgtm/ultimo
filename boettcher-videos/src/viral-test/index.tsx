import {
  AbsoluteFill,
  Composition,
  Easing,
  interpolate,
  registerRoot,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {Owner} from "../components/art/Owner";
import fixture from "../../experiments/seguro-arriendo/preview.json";

const FPS = 30;
const FRAMES = 300;
const cream = "#fff6e2";
const gold = "#ffd177";
const mint = "#bcebdd";
const red = "#ff9d8e";
const format = new Intl.NumberFormat("es-CL", {style: "currency", currency: "CLP"});
const ease = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.out(Easing.cubic),
} as const;

type PreviewProps = {
  rent: number;
  firstAlertFrame: number;
  unpaidMonthsFrames: number[];
  headline: string;
  openingLabel: string;
  exampleLabel: string;
};

const validateProps = ({props}: {props: PreviewProps}) => {
  if (!Number.isSafeInteger(props.rent) || props.rent < 1 || props.rent > 100000000) {
    throw new Error("rent debe ser un monto entero positivo en pesos.");
  }
  if (!Number.isInteger(props.firstAlertFrame) || props.firstAlertFrame < 1 || props.firstAlertFrame >= FRAMES) {
    throw new Error("firstAlertFrame debe estar dentro de la composición.");
  }
  if (!Array.isArray(props.unpaidMonthsFrames) || props.unpaidMonthsFrames.length !== 3) {
    throw new Error("unpaidMonthsFrames debe contener tres fotogramas.");
  }
  const cueFrames = [props.firstAlertFrame, ...props.unpaidMonthsFrames];
  if (
      cueFrames.some((frame, index) => !Number.isInteger(frame) || frame >= FRAMES - 18 ||
        (index > 0 && frame <= cueFrames[index - 1]))) {
    throw new Error("unpaidMonthsFrames debe contener tres fotogramas en orden creciente, posteriores a la alerta.");
  }
  for (const key of ["headline", "openingLabel", "exampleLabel"] as const) {
    if (typeof props[key] !== "string" || props[key].trim().length === 0 || props[key].length > 72) {
      throw new Error(`${key} debe contener entre 1 y 72 caracteres.`);
    }
  }
  return {props};
};

const useEntry = (at: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const value = spring({frame: frame - at, fps, config: {damping: 16, stiffness: 170}});
  return {
    opacity: interpolate(frame, [at, at + 11], [0, 1], ease),
    transform: `translateY(${(1 - value) * 29}px) scale(${0.94 + value * 0.06})`,
  };
};

const Month: React.FC<{number: number; at: number}> = ({number, at}) => {
  const frame = useCurrentFrame();
  const active = frame >= at;
  const entered = useEntry(at);
  return (
    <div style={{
      flex: 1, minWidth: 0, padding: "14px 7px", borderRadius: 15, textAlign: "center",
      minHeight: 74, boxSizing: "border-box", background: active ? "#7d433a" : "#355968",
      color: cream, border: active ? "2px solid #ff9b82" : "2px solid #67969b",
      transform: active ? entered.transform : undefined,
    }}>
      <div style={{fontSize: 24, fontWeight: 750}}>Mes {number}</div>
      <div style={{fontSize: 27, color: active ? red : mint, fontWeight: 900, marginTop: 4}}>
        {active ? "$0" : "—"}
      </div>
    </div>
  );
};

const Preview: React.FC<PreviewProps> = ({
  rent, firstAlertFrame, unpaidMonthsFrames, headline, openingLabel, exampleLabel,
}) => {
  const frame = useCurrentFrame();
  const total = unpaidMonthsFrames.reduce((sum, at) =>
    sum + Math.round(interpolate(frame, [at, at + 18], [0, rent], ease)), 0);
  const flash = useEntry(firstAlertFrame);
  const card = useEntry(9);
  const display = useEntry(unpaidMonthsFrames[0]);
  const tenant = useEntry(20);
  const reactionFrame = firstAlertFrame + 6;
  const pan = Math.sin(frame / 49) * 23;

  return (
    <AbsoluteFill style={{
      background: "radial-gradient(ellipse at 72% 37%, #315762, #142d41 69%)",
      color: cream, overflow: "hidden", fontFamily: 'Arial, "Helvetica Neue", sans-serif',
    }}>
      <AbsoluteFill style={{
        opacity: .34,
        backgroundImage: "radial-gradient(#88b0bd 1.5px, transparent 1.5px)",
        backgroundSize: "41px 41px", backgroundPosition: `${pan}px ${frame / 9}px`,
        maskImage: "radial-gradient(ellipse,#000 23%,transparent 78%)",
      }}/>
      <div style={{position: "absolute", left: 91, right: 147, top: 248}}>
        <div style={{fontSize: 29, fontWeight: 850, letterSpacing: 1.8, color: gold}}>{openingLabel}</div>
        <div style={{fontSize: 88, fontWeight: 850, lineHeight: .97, marginTop: 18, letterSpacing: -4}}>
          {headline}
        </div>
      </div>
      <div style={{position: "absolute", width: 527, height: 587, left: 74, top: 536, borderRadius: 274,
        background: "#47748153", border: "1px solid #a0c5cb75", transform: `translateX(${pan * .48}px)`}}/>
      <div style={{position: "absolute", top: 534, left: 63, transform: `translateX(${pan * .33}px)`}}>
        <Owner width={472} jacket="#51939a" pants="#28465e" moods={[
          {at: 0, mood: "neutral"},
          {at: reactionFrame, mood: "worried"},
          {at: unpaidMonthsFrames[1], mood: "overwhelmed"},
        ]}/>
      </div>
      <div style={{position: "absolute", top: 542, left: 589, display: "flex", flexDirection: "column", alignItems: "center",
        width: 300, ...tenant}}>
        <Owner width={227} jacket="#9d7c66" hair="#242f31" beard={false} skin="#c79373" moods={[
          {at: 0, mood: "neutral"}, {at: firstAlertFrame, mood: "worried"},
        ]}/>
        <div style={{fontSize: 26, fontWeight: 750, color: mint, marginTop: 2}}>Arrendatario</div>
      </div>
      <div style={{position: "absolute", left: 515, right: 147, top: 869, boxSizing: "border-box",
        padding: 20, borderRadius: 27, background: "#102b3bf0", border: "2px solid #94b5bb", ...card}}>
        <div style={{fontSize: 26, fontWeight: 750, color: mint}}>Arriendo mensual</div>
        <div style={{fontSize: 53, marginTop: 3, fontWeight: 900}}>{format.format(rent)}</div>
        <div style={{fontSize: 27, color: red, fontWeight: 870, marginTop: 13, ...flash}}>Pago pendiente</div>
        <div style={{display: "flex", gap: 8, marginTop: 12}}>
          {unpaidMonthsFrames.map((at, index) => <Month key={at} at={at} number={index + 1}/>)}
        </div>
      </div>
      <div style={{position: "absolute", left: 95, right: 147, top: 1222, borderTop: "2px solid #ffd28e87",
        paddingTop: 22, ...display}}>
        <div style={{fontSize: 33, fontWeight: 800, color: gold}}>{exampleLabel}</div>
        <div style={{fontSize: 106, fontVariantNumeric: "tabular-nums", fontWeight: 900, letterSpacing: -4, marginTop: 8}}>
          {format.format(total)}
        </div>
      </div>
      <div style={{position: "absolute", left: 96, right: 145, bottom: 336, color: mint, fontSize: 25,
        fontWeight: 740, paddingTop: 12, borderTop: "2px solid #95c1c455"}}>
        Boettcher Propiedades
      </div>
      <div style={{position: "absolute", left: 94, right: 146, top: 201, height: 3, background: "#d9e9e13b"}}>
        <div style={{height: 3, width: `${frame * 100 / (FRAMES - 1)}%`, background: gold}}/>
      </div>
    </AbsoluteFill>
  );
};

const storyboardPanels = [
  {at: 311, until: 490, text: "Cuentas pendientes", detail: "Revisa los gastos asociados al arriendo.", shape: "receipt"},
  {at: 393, until: 490, text: "Daños al inmueble", detail: "Registra el estado de la propiedad.", shape: "house"},
  {at: 510, until: 744, text: "Evalúa al arrendatario", detail: "Revisa sus antecedentes antes de la entrega.", shape: "receipt"},
  {at: 578, until: 744, text: "Revisa el contrato", detail: "Deja por escrito las condiciones del arriendo.", shape: "receipt"},
  {at: 646, until: 744, text: "Define el respaldo", detail: "Compara qué cubre cada plan.", shape: "shield"},
  {at: 753, until: 1161, text: "Plan Garantizado", detail: "Hasta 6 meses de renta impaga.", shape: "shield"},
  {at: 842, until: 1161, text: "Protección Total", detail: "Hasta 12 meses de renta impaga.", shape: "shield"},
  {at: 998, until: 1161, text: "Según el mandato", detail: "Cuentas básicas, daños y representación judicial.", shape: "receipt"},
] as const;

const shapes = {
  receipt: "M7 3h10v18l-3-2-2 2-2-2-3 2V3zm2 6h6m-6 4h6",
  house: "m3 10 9-7 9 7m-3-1v11h-4v-5h-4v5H6V9",
  shield: "M12 3 20 6v6c0 4-3 7-8 9-5-2-8-5-8-9V6Z M8 12l3 3 5-6",
};

const Panel: React.FC<{item: typeof storyboardPanels[number]; row: number}> = ({item,row}) => {
  const frame = useCurrentFrame();
  const entry = useEntry(item.at);
  const exit = 1 - interpolate(frame,[item.until - 13,item.until],[0,1],ease);
  return (
    <div style={{position:"absolute",top:644 + row * 171,left:98,right:147,display:"flex",gap:23,alignItems:"center",
      color:cream,background:"#244c5d",border:"2px solid #a9d1ce","borderRadius":24,padding:"22px 26px",
      ...entry,opacity:entry.opacity*exit}}>
      <svg width={68} height={68} viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={shapes[item.shape]} pathLength={100} strokeDasharray={100}
          strokeDashoffset={100 * (1 - interpolate(frame,[item.at,item.at + 26],[0,1],ease))}/>
      </svg>
      <div style={{flex:1}}>
        <div style={{fontSize:42,fontWeight:850,lineHeight:1.08}}>{item.text}</div>
        <div style={{fontSize:29,color:mint,marginTop:7}}>{item.detail}</div>
      </div>
    </div>
  );
};

const Storyboard: React.FC<PreviewProps> = (props) => {
  const frame = useCurrentFrame();
  const ending = useEntry(1170);
  const group = frame < 490 ? 0 : frame < 745 ? 1 : 2;
  const headings = ["El costo puede aumentar", "Antes de entregar las llaves", "Qué puede cubrir cada plan"];
  const sectionAt = [300, 490, 745][group];
  const section = useEntry(sectionAt);
  const visible = storyboardPanels.filter(({at,until}) => frame >= at && frame < until);
  return (
    <AbsoluteFill style={{background:"radial-gradient(ellipse at 72% 37%, #315762, #142d41 69%)",
      color:cream,fontFamily:'Arial, "Helvetica Neue", sans-serif',overflow:"hidden"}}>
      <Sequence durationInFrames={FRAMES}>
        <Preview {...props}/>
      </Sequence>
      {frame >= FRAMES ? <>
        <AbsoluteFill style={{opacity:.31,backgroundImage:"radial-gradient(#88b0bd 1.5px,transparent 1.5px)",
          backgroundSize:"41px 41px",backgroundPosition:`${Math.sin(frame/54)*23}px ${frame/9}px`,
          maskImage:"radial-gradient(ellipse,#000 16%,transparent 82%)"}}/>
        <div style={{position:"absolute",left:94,right:146,top:201,height:3,background:"#d9e9e13b"}}>
          <div style={{height:3,width:`${100 * frame / (45 * FPS - 1)}%`,background:gold}}/>
        </div>
        {frame < 1170 ? <>
          <div style={{position:"absolute",left:96,right:150,top:256,...section}}>
            <div style={{fontSize:29,color:gold,fontWeight:820}}>RIESGOS DEL ARRIENDO</div>
            <div style={{fontSize:78,fontWeight:880,lineHeight:1.02,marginTop:16,letterSpacing:-4}}>{headings[group]}</div>
          </div>
          {visible.map((item,row)=><Panel key={item.at} item={item} row={row}/>)}
          <div style={{position:"absolute",left:98,right:151,top:1262,fontSize:30,color:mint,
            opacity:interpolate(frame,[921,959,1150,1161],[0,1,1,0],ease)}}>
            Coberturas sujetas a las condiciones del mandato.
          </div>
        </> : <>
          <div style={{position:"absolute",left:98,right:150,top:408,...ending}}>
            <div style={{fontSize:31,fontWeight:800,color:mint}}>BOETTCHER PROPIEDADES</div>
            <div style={{fontSize:83,fontWeight:900,lineHeight:1.04,letterSpacing:-4,marginTop:15}}>
              Revisa el respaldo para tu arriendo
            </div>
            <div style={{padding:"28px 30px",borderRadius:29,background:gold,color:"#142d41",fontSize:46,
              textAlign:"center",fontWeight:900,marginTop:99}}>Comenta «PROTECCIÓN»</div>
          </div>
        </>}
        <div style={{position:"absolute",left:96,right:145,bottom:336,color:mint,fontSize:25,fontWeight:740,
          paddingTop:12,borderTop:"2px solid #95c1c455"}}>Boettcher Propiedades</div>
      </> : null}
    </AbsoluteFill>
  );
};

const Root: React.FC = () => (
  <>
  <Composition
    id="BoettcherSeguroArriendoPrueba"
    component={Preview}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={FRAMES}
    defaultProps={fixture}
    calculateMetadata={validateProps}
  />
  <Composition
    id="BoettcherSeguroArriendoStoryboard"
    component={Storyboard}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={45 * FPS}
    defaultProps={fixture}
    calculateMetadata={validateProps}
  />
  </>
);

registerRoot(Root);
