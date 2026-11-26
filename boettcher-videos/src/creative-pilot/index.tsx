import {Composition, registerRoot} from "remotion";
import {DividendoPiloto} from "./DividendoPiloto";

const PilotRoot = () =>
  <Composition
    id="BoettcherDividendoPiloto"
    component={DividendoPiloto}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={300}
    defaultProps={{
      headline: "El arriendo\nno llegó.",
      subheadline: "El dividendo vence igual.",
    }}
  />;

registerRoot(PilotRoot);
