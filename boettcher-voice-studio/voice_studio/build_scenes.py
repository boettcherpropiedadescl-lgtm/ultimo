"""CLI: genera la narración por escenas desde scenes/*.json y la copia a Remotion."""
from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

import soundfile as sf

from . import config
from .scenes import build_timeline


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("spec", type=Path)
    ap.add_argument("--remotion-public", type=Path, required=True)
    a = ap.parse_args()
    spec = json.loads(a.spec.read_text(encoding="utf-8"))
    config.ensure_dirs()
    from .engine import VoiceEngine
    engine = VoiceEngine(config.MODEL_DIR)
    if spec["profile"] == config.BUILTIN_VOICE:
        engine.use_builtin_voice()
    else:
        engine.use_profile_conditionals(config.PROFILES_DIR / spec["profile"] / "conds.pt")
    audio_arr, timings, report = build_timeline(engine, spec["scenes"])
    name = spec["name"]
    wav = config.OUT_DIR / f"{name}.wav"
    sf.write(wav, audio_arr, engine.sr, subtype="PCM_16")
    total = len(audio_arr) / engine.sr
    tim = config.OUT_DIR / f"{name}.timings.json"
    tim.write_text(json.dumps({"voice": spec["profile"], "duration_s": total, "segments": [
        {"index": i, **t} for i, t in enumerate(timings)]}, ensure_ascii=False, indent=2), encoding="utf-8")
    dest = a.remotion_public / "voice"
    dest.mkdir(parents=True, exist_ok=True)
    for p in (wav, tim):
        shutil.copyfile(p, dest / p.name)
    print(json.dumps({"duration_s": round(total, 3), "report": report, "wav": str(wav)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
