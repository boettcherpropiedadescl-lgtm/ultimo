import {Composition} from "remotion";
import {BoettcherReel} from "./BoettcherReel";
import {defaultReelProps} from "./props";
import {calculateVoiceOverMetadata, VoiceOverReel, voiceOverDefaults} from "./VoiceOverReel";
import {BoettcherComercial45, calculateComercialMetadata, comercialDefaults} from "./BoettcherComercial45";
import {BoettcherComercial60, calculateComercial60Metadata, comercial60Defaults} from "./BoettcherComercial60";
import {BoettcherComercialFinal, calculateFinalMetadata, finalDefaults} from "./BoettcherComercialFinal";
import {BoettcherComercialDinamico, calculateDinamicoMetadata, dinamicoDefaults} from "./BoettcherComercialDinamico";
import {BoettcherComercialCambio, calculateCambioMetadata, cambioDefaults} from "./BoettcherComercialCambio";
import {BoettcherIntelligenceReel, calculateIntelligenceMetadata, defaultIntelligenceProps, intelligenceFps} from "./BoettcherIntelligenceReel";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BoettcherIntelligenceReel"
        component={BoettcherIntelligenceReel}
        durationInFrames={1350}
        fps={intelligenceFps}
        width={1080}
        height={1920}
        defaultProps={defaultIntelligenceProps}
        calculateMetadata={calculateIntelligenceMetadata}
      />
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
      <Composition
        id="BoettcherComercialFinal"
        component={BoettcherComercialFinal}
        durationInFrames={1710}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={finalDefaults}
        calculateMetadata={calculateFinalMetadata}
      />
      <Composition
        id="BoettcherComercialDinamico"
        component={BoettcherComercialDinamico}
        durationInFrames={1710}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={dinamicoDefaults}
        calculateMetadata={calculateDinamicoMetadata}
      />
      <Composition
        id="BoettcherComercialCambio"
        component={BoettcherComercialCambio}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={cambioDefaults}
        calculateMetadata={calculateCambioMetadata}
      />
      <Composition
        id="BoettcherCambioClaro"
        component={BoettcherComercialCambio}
        durationInFrames={1600}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{...cambioDefaults, audioName: "cambio-final", theme: "light" as const}}
        calculateMetadata={calculateCambioMetadata}
      />
      <Composition
        id="BoettcherCambioOscuro"
        component={BoettcherComercialCambio}
        durationInFrames={1600}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{...cambioDefaults, audioName: "cambio-final", theme: "dark" as const}}
        calculateMetadata={calculateCambioMetadata}
      />
    </>
  );
};
