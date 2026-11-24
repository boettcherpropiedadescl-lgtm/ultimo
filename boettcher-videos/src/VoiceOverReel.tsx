import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {AnimatedBackground} from "./components/AnimatedBackground";
import {SafeArea} from "./components/SafeArea";
import {colors, fontFamily} from "./theme";

// Composición con narración generada por Boettcher Voice Studio.
// Lee public/voice/<nombre>.timings.json (tiempos por segmento) y reproduce public/voice/<nombre>.wav.
export type VoiceSegment = {index: number; text: string; start: number; end: number};
export type VoiceTimings = {voice: string; speed: number; duration_s: number; segments: VoiceSegment[]};

export type VoiceOverProps = {
  narrationName: string;   // nombre base sin extensión, p. ej. "muestra-20s-builtin"
  headline: string;
  timings: VoiceTimings | null;
};

const FPS = 30;
const TAIL_SECONDS = 1;

export const voiceOverDefaults: VoiceOverProps = {
  narrationName: "muestra-20s-builtin",
  headline: "Boettcher Propiedades",
  timings: null,
};

export const calculateVoiceOverMetadata = async ({props}: {props: VoiceOverProps}) => {
  const res = await fetch(staticFile(`voice/${props.narrationName}.timings.json`));
  const timings = (await res.json()) as VoiceTimings;
  return {
    durationInFrames: Math.ceil((timings.duration_s + TAIL_SECONDS) * FPS),
    props: {...props, timings},
  };
};

const Subtitle: React.FC<{text: string; visible: boolean; fromFrame: number; toFrame: number}> = ({text, visible, fromFrame, toFrame}) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [fromFrame, fromFrame + 4, toFrame - 4, toFrame], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (!visible) return null;
  return (
    <div
      style={{
        fontFamily,
        fontWeight: 700,
        fontSize: 58,
        lineHeight: 1.25,
        color: colors.white,
        background: "rgba(13,15,18,0.72)",
        borderRadius: 18,
        padding: "22px 32px",
        textAlign: "center",
        opacity: fade,
        position: "absolute",
        left: 84,
        right: 84,
        bottom: 430,
      }}
    >
      {text}
    </div>
  );
};

export const VoiceOverReel: React.FC<VoiceOverProps> = ({narrationName, headline, timings}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const segments = timings?.segments ?? [];
  const active = segments.find((s) => frame >= s.start * fps && frame < s.end * fps);
  return (
    <AbsoluteFill>
      <AnimatedBackground />
      <SafeArea justify="flex-start">
        <div style={{fontFamily, fontWeight: 900, fontSize: 96, color: colors.white, lineHeight: 1.02}}>{headline}</div>
        <div style={{height: 6, width: 220, background: colors.copper, marginTop: 28}} />
      </SafeArea>
      {segments.map((s) => (
        <Subtitle key={s.index} text={s.text} visible={active?.index === s.index}
          fromFrame={s.start * fps} toFrame={s.end * fps} />
      ))}
      <Audio src={staticFile(`voice/${narrationName}.wav`)} volume={1} />
    </AbsoluteFill>
  );
};
