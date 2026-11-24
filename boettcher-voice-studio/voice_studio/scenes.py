"""Narración por escenas con duración exacta. Cada escena se ajusta a su ventana de tiempo."""
from __future__ import annotations

import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf

from . import audio
from .script import split_script

FIT_MARGIN_S = 0.4   # margen de cola antes del corte de escena
MAX_SPEED = 1.2      # por encima de esto la voz suena apresurada


def _speed_array(arr: np.ndarray, sr: int, factor: float) -> np.ndarray:
    with tempfile.TemporaryDirectory() as tmp:
        raw = Path(tmp) / "raw.wav"
        out = Path(tmp) / "fast.wav"
        sf.write(raw, arr, sr, subtype="PCM_16")
        audio.change_speed(raw, out, factor)
        data, _ = sf.read(out, dtype="float32")
    return data


def build_timeline(engine, scenes: list[dict], *, exaggeration: float = 0.45, max_speed: float = MAX_SPEED):
    """scenes: [{"id", "start", "duration", "text"}]. Devuelve (audio total, timings absolutos, informe)."""
    sr = engine.sr
    total = scenes[-1]["start"] + scenes[-1]["duration"]
    full = np.zeros(int(round(total * sr)), dtype=np.float32)
    timings, report = [], []
    for scene in scenes:
        segs = split_script(scene["text"], pause_ms=300, paragraph_pause_ms=300)
        arr, tim = engine.synthesize(segs, exaggeration=exaggeration)
        raw_len = len(arr) / sr
        budget = scene["duration"] - FIT_MARGIN_S
        speed = 1.0
        if raw_len > budget:
            speed = min(max_speed, raw_len / budget)
            arr = _speed_array(arr, sr, speed)
        overflow = len(arr) / sr > scene["duration"] - 0.15
        off = int(round(scene["start"] * sr))
        full[off:off + min(len(arr), len(full) - off)] = arr[: len(full) - off]
        for t in tim:
            timings.append({"scene": scene["id"], "text": t["text"],
                            "start": round(scene["start"] + t["start"] / speed, 3),
                            "end": round(scene["start"] + t["end"] / speed, 3)})
        report.append({"scene": scene["id"], "raw_s": round(raw_len, 2), "speed": round(speed, 3),
                       "final_s": round(len(arr) / sr, 2), "window_s": scene["duration"],
                       "fits": not overflow})
    bad = [r for r in report if not r["fits"]]
    if bad:
        raise ValueError("Escenas que no caben: " + "; ".join(
            f"{r['scene']} {r['final_s']}s/{r['window_s']}s" for r in bad) + ". Acorta el texto.")
    return full, timings, report
