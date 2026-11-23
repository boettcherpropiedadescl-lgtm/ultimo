import {Composition} from "remotion";
import {BoettcherReel} from "./BoettcherReel";
import {defaultReelProps} from "./props";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="BoettcherReel"
      component={BoettcherReel}
      durationInFrames={450}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={defaultReelProps}
    />
  );
};
