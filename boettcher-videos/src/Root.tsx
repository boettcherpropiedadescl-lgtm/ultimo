import {Composition} from "remotion";
import {BoettcherReel} from "./BoettcherReel";
import {defaultReelProps} from "./props";
import {calculateVoiceOverMetadata, VoiceOverReel, voiceOverDefaults} from "./VoiceOverReel";

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
    </>
  );
};
