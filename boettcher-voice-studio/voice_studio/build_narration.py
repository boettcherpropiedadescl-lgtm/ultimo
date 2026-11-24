"""Narración continua (sin relleno entre frases) + alineación palabra a palabra + cues para Remotion."""
from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

import soundfile as sf

from . import align, audio, config
from .scenes import _speed_array
from .script import Segment


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("spec", type=Path)
    ap.add_argument("--remotion-public", type=Path, required=True)
    ap.add_argument("--skip-align", action="store_true")
    ap.add_argument("--reuse-wav", type=Path, default=None, help="reutiliza un WAV ya generado (solo comprime pausas y alinea)")
    a = ap.parse_args()
    spec = json.loads(a.spec.read_text(encoding="utf-8"))
    config.ensure_dirs()
    target = spec["target_s"]
    speed, timings = 1.0, []
    if a.reuse_wav:
        audio_arr, sr = sf.read(a.reuse_wav, dtype="float32")
        raw = len(audio_arr) / sr
    else:
        from .engine import VoiceEngine
        engine = VoiceEngine(config.MODEL_DIR)
        if spec["profile"] == config.BUILTIN_VOICE:
            engine.use_builtin_voice()
        else:
            engine.use_profile_conditionals(config.PROFILES_DIR / spec["profile"] / "conds.pt")
        segs = [Segment(t, spec.get("pause_ms", 120)) for t in spec["beats"]]
        segs[-1].pause_after_ms = 0
        audio_arr, timings = engine.synthesize(segs, exaggeration=spec.get("exaggeration", 0.45))
        sr = engine.sr
        raw = len(audio_arr) / sr
        if raw > target:
            speed = min(spec.get("max_speed", 1.2), raw / target)
            audio_arr = _speed_array(audio_arr, sr, speed)
    # Pausas largas del modelo → pausa natural corta (voz continua).
    import tempfile
    with tempfile.TemporaryDirectory() as tmp:
        t_in, t_out = Path(tmp) / "in.wav", Path(tmp) / "out.wav"
        sf.write(t_in, audio_arr, sr, subtype="PCM_16")
        audio.tighten_silences(t_in, t_out)
        audio_arr, _ = sf.read(t_out, dtype="float32")
    total = len(audio_arr) / sr
    print(f"raw={raw:.2f}s speed={speed:.3f} final={total:.2f}s target={target}s", flush=True)
    if total > target + 1.5:
        raise SystemExit(f"La narración dura {total:.1f}s (objetivo {target}s). Acorta el guion.")

    name = spec["name"]
    wav = config.OUT_DIR / f"{name}.wav"
    sf.write(wav, audio_arr, sr, subtype="PCM_16")
    beats_report = [{"beat": i, "text": t["text"]} for i, t in enumerate(timings)]

    script_words = " ".join(spec["beats"]).split()
    result = {"voice": spec["profile"], "duration_s": round(total, 3), "speed": round(speed, 3), "beats": beats_report}
    if not a.skip_align:
        asr = align.asr_words(wav)
        times = align.align_script(script_words, asr, total)
        result["cues"] = align.find_cues(script_words, times, spec["cues"])
        result["subtitles"] = align.subtitle_chunks(script_words, times)
        result["words"] = [{"w": w, "start": round(t[0], 3), "end": round(t[1], 3)} for w, t in zip(script_words, times)]
    tl = config.OUT_DIR / f"{name}.timeline.json"
    tl.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    dest = a.remotion_public / "voice"
    dest.mkdir(parents=True, exist_ok=True)
    for p in (wav, tl):
        shutil.copyfile(p, dest / p.name)
    print(json.dumps({"duration_s": result["duration_s"], "cues": result.get("cues")}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
