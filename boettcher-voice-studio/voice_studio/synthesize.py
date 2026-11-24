"""CLI: guion → narración (WAV/MP3) + tiempos + subtítulos SRT."""
from __future__ import annotations

import argparse
import json
import shutil
import tempfile
from pathlib import Path

from . import audio, config
from .script import split_script


def fmt_srt(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def write_srt(timings: list[dict], path: Path) -> None:
    lines = []
    for i, t in enumerate(timings, 1):
        lines += [str(i), f"{fmt_srt(t['start'])} --> {fmt_srt(t['end'])}", t["text"], ""]
    path.write_text("\n".join(lines), encoding="utf-8")


def run(script_text: str, out_name: str, profile: str, *, speed: float = 1.0, pause_scale: float = 1.0,
        exaggeration: float = 0.5, fmt: str = "mp3", remotion_public: Path | None = None,
        engine=None) -> dict:
    import soundfile as sf
    from .engine import VoiceEngine

    config.ensure_dirs()
    segments = split_script(script_text, pause_ms=int(350 * pause_scale),
                            paragraph_pause_ms=int(700 * pause_scale))
    engine = engine or VoiceEngine(config.MODEL_DIR)
    if profile == config.BUILTIN_VOICE:
        engine.use_builtin_voice()
    else:
        engine.use_profile_conditionals(config.PROFILES_DIR / profile / "conds.pt")

    audio_arr, timings = engine.synthesize(segments, exaggeration=exaggeration)
    speed_factor = speed
    with tempfile.TemporaryDirectory() as tmp:
        raw = Path(tmp) / "raw.wav"
        sf.write(raw, audio_arr, engine.sr, subtype="PCM_16")
        final_wav = config.OUT_DIR / f"{out_name}.wav"
        audio.change_speed(raw, final_wav, speed_factor)

    dur_final = audio.probe(final_wav)["duration_s"]
    scale = 1.0 / speed_factor
    for t in timings:
        t["start"] = round(t["start"] * scale, 3)
        t["end"] = round(t["end"] * scale, 3)

    outputs = {"wav": final_wav}
    if fmt == "mp3":
        outputs["mp3"] = audio.export(final_wav, config.OUT_DIR / f"{out_name}.mp3")
    tim_path = config.OUT_DIR / f"{out_name}.timings.json"
    tim_path.write_text(json.dumps({"voice": profile, "speed": speed, "duration_s": dur_final,
                                    "segments": timings}, ensure_ascii=False, indent=2), encoding="utf-8")
    srt_path = config.OUT_DIR / f"{out_name}.srt"
    write_srt(timings, srt_path)
    outputs.update({"timings": tim_path, "srt": srt_path})

    if remotion_public is not None:
        dest = Path(remotion_public) / "voice"
        dest.mkdir(parents=True, exist_ok=True)
        for p in (final_wav, tim_path, srt_path):
            shutil.copyfile(p, dest / p.name)
        outputs["remotion"] = dest

    return {"duration_s": dur_final, "segments": len(segments), "outputs": {k: str(v) for k, v in outputs.items()}}


def main() -> None:
    ap = argparse.ArgumentParser(description="Boettcher Voice Studio: generar narración local")
    ap.add_argument("script", type=Path, help="archivo .txt con el guion")
    ap.add_argument("--name", required=True, help="nombre base de salida")
    ap.add_argument("--voice", default=config.BUILTIN_VOICE, help="id de perfil o 'builtin-default'")
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--pause-scale", type=float, default=1.0)
    ap.add_argument("--exaggeration", type=float, default=0.5)
    ap.add_argument("--format", choices=["wav", "mp3"], default="mp3")
    ap.add_argument("--remotion-public", type=Path, default=None)
    a = ap.parse_args()
    res = run(a.script.read_text(encoding="utf-8"), a.name, a.voice, speed=a.speed,
              pause_scale=a.pause_scale, exaggeration=a.exaggeration, fmt=a.format,
              remotion_public=a.remotion_public)
    print(json.dumps(res, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
