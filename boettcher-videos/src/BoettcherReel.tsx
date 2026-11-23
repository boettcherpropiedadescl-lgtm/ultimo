import {AbsoluteFill} from "remotion";
import {linearTiming, TransitionSeries} from "@remotion/transitions";
import {slide} from "@remotion/transitions/slide";
import {wipe} from "@remotion/transitions/wipe";
import {AnimatedBackground} from "./components/AnimatedBackground";
import {CTAEndCard} from "./components/CTAEndCard";
import {HookText} from "./components/HookText";
import {PropertyScene} from "./components/PropertyScene";
import {SafeArea} from "./components/SafeArea";
import {ServiceList} from "./components/ServiceList";
import {SubText} from "./components/SubText";
import type {ReelProps} from "./props";

// 450 fotogramas a 30 fps = 15 s. Las transiciones de 15 fotogramas solapan escenas:
// 100 + 125 + 125 + 145 = 495, menos 3 × 15 = 45 → 450.
const T = 15;

export const BoettcherReel: React.FC<ReelProps> = ({headline, subheadline, cta, brand, services}) => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={100}>
          <AnimatedBackground />
          <SafeArea>
            <HookText text={headline} fontSize={150} highlight={["VACÍO"]} />
            <SubText text={subheadline} startFrame={40} />
          </SafeArea>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({direction: "from-right"})}
          timing={linearTiming({durationInFrames: T})}
        />

        <TransitionSeries.Sequence durationInFrames={125}>
          <AnimatedBackground />
          <SafeArea>
            <PropertyScene />
            <div style={{marginTop: 40}}>
              <HookText text="Una estrategia clara para arrendar." fontSize={92} startFrame={20} />
            </div>
          </SafeArea>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({direction: "from-left"})}
          timing={linearTiming({durationInFrames: T})}
        />

        <TransitionSeries.Sequence durationInFrames={125}>
          <AnimatedBackground />
          <SafeArea>
            <HookText text="Así trabajamos su arriendo" fontSize={110} startFrame={0} />
            <div style={{marginTop: 90}}>
              <ServiceList items={services} startFrame={25} />
            </div>
          </SafeArea>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({direction: "from-bottom"})}
          timing={linearTiming({durationInFrames: T})}
        />

        <TransitionSeries.Sequence durationInFrames={145}>
          <AnimatedBackground />
          <SafeArea>
            <CTAEndCard headline="¿Hablamos de su propiedad?" cta={cta} brand={brand} />
          </SafeArea>
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
