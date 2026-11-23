// Genera audio con Azure AI Speech (SDK oficial de Microsoft, MIT) usando la voz es-CL-LorenzoNeural.
// Uso: AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=... node scripts/tts-azure.mjs [guion.ssml] [salida.mp3]
import fs from "node:fs";
import path from "node:path";
import sdk from "microsoft-cognitiveservices-speech-sdk";

const key = process.env.AZURE_SPEECH_KEY;
const region = process.env.AZURE_SPEECH_REGION;
if (!key || !region) {
  console.error("Faltan las variables AZURE_SPEECH_KEY y AZURE_SPEECH_REGION. No se generó audio.");
  process.exit(1);
}

const ssmlPath = process.argv[2] ?? "scripts/guion-lorenzo.ssml";
const outPath = process.argv[3] ?? "out/audio/lorenzo-muestra.mp3";
const ssml = fs.readFileSync(ssmlPath, "utf8");

const config = sdk.SpeechConfig.fromSubscription(key, region);
config.speechSynthesisVoiceName = "es-CL-LorenzoNeural";
config.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3;

// Sin AudioConfig: no reproduce en este equipo, solo devuelve los datos de audio.
const synth = new sdk.SpeechSynthesizer(config, null);

// Marcas de palabra (tiempos), para subtítulos sincronizados en una fase posterior.
const words = [];
synth.wordBoundary = (_s, e) => {
  words.push({ text: e.text, offsetMs: e.audioOffset / 10000, durationMs: e.duration / 10000 });
};

synth.speakSsmlAsync(
  ssml,
  (result) => {
    if (result.reason !== sdk.ResultReason.SynthesizingAudioCompleted) {
      console.error("Síntesis no completada:", result.errorDetails ?? result.reason);
      synth.close();
      process.exit(2);
    }
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, Buffer.from(result.audioData));
    fs.writeFileSync(outPath.replace(/\.mp3$/, ".words.json"), JSON.stringify(words, null, 2));
    console.log(`Audio: ${outPath} (${result.audioData.byteLength} bytes, caracteres: ${ssml.length})`);
    synth.close();
  },
  (err) => {
    console.error("Error de Azure Speech:", err);
    synth.close();
    process.exit(3);
  },
);
