"""Alinea un audio ya grabado (p. ej. locución real) con su guion y calcula cues y subtítulos para Remotion.
Uso: python -m voice_studio.align_audio audio.wav guion.json salida.timeline.json
guion.json: {"script": "texto completo", "cues": [{"id","phrase"}], "prompt": "términos para el reconocedor"}"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import soundfile as sf

from . import align


def main() -> None:
    audio_path, spec_path, out_path = map(Path, sys.argv[1:4])
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    info = sf.info(str(audio_path))
    duration = info.frames / info.samplerate
    words = spec["script"].split()
    asr = align.asr_words(audio_path, initial_prompt=spec.get("prompt"))
    times = align.align_script(words, asr, duration)
    matched = sum(1 for w, a in zip(words, asr) if align.norm(w) == align.norm(a[0]))
    result = {
        "duration_s": round(duration, 3),
        "cues": align.find_cues(words, times, spec["cues"]),
        "subtitles": align.subtitle_chunks(words, times),
        "words": [{"w": w, "start": round(t[0], 3), "end": round(t[1], 3)} for w, t in zip(words, times)],
        "asr_word_count": len(asr),
        "script_word_count": len(words),
    }
    out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"duration_s": result["duration_s"], "script_words": len(words), "asr_words": len(asr),
                      "cues": result["cues"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
