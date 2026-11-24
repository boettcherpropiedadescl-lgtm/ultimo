import {Composition} from "remotion";
import {BoettcherReel} from "./BoettcherReel";
import {defaultReelProps} from "./props";
import {calculateVoiceOverMetadata, VoiceOverReel, voiceOverDefaults} from "./VoiceOverReel";
import {BoettcherComercial45, calculateComercialMetadata, comercialDefaults} from "./BoettcherComercial45";
import {BoettcherComercial60, calculateComercial60Metadata, comercial60Defaults} from "./BoettcherComercial60";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BoettcherReel"
        component={BoettcherReel}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultReelProps}
      />
      <Composition
        id="VoiceOverReel"
        component={VoiceOverReel}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={voiceOverDefaults}
        calculateMetadata={calculateVoiceOverMetadata}
      />
      <Composition
        id="BoettcherComercial45"
        component={BoettcherComercial45}
        durationInFrames={1350}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={comercialDefaults}
        calculateMetadata={calculateComercialMetadata}
      />
      <Composition
        id="BoettcherComercial60"
        component={BoettcherComercial60}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={comercial60Defaults}
        calculateMetadata={calculateComercial60Metadata}
      />
    </>
  );
};
