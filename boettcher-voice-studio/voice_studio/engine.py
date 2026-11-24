"""Motor de síntesis local: Chatterbox Multilingual (MIT). Sin servicios externos en tiempo de generación."""
from __future__ import annotations

import numpy as np
import torch

from .script import Segment


class VoiceEngine:
    def __init__(self, model_dir, device: str = "cpu"):
        import warnings
        warnings.filterwarnings("ignore")
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS

        self.device = device
        self.model = ChatterboxMultilingualTTS.from_local(str(model_dir), device)
        self.sr = self.model.sr
        self._builtin_conds = self.model.conds

    def use_builtin_voice(self) -> None:
        self.model.conds = self._builtin_conds

    def use_profile_conditionals(self, conds_path) -> None:
        from chatterbox.mtl_tts import Conditionals
        self.model.conds = Conditionals.load(str(conds_path), map_location="cpu").to(self.device)

    def synthesize(self, segments: list[Segment], *, language: str = "es", exaggeration: float = 0.5,
                   cfg_weight: float = 0.5, temperature: float = 0.8, seed: int | None = 1234):
        """Devuelve (audio float32 mono a self.sr, lista de tiempos por segmento en segundos)."""
        chunks: list[np.ndarray] = []
        timings: list[dict] = []
        cursor = 0.0
        for i, seg in enumerate(segments):
            if seed is not None:
                torch.manual_seed(seed + i)  # determinista por segmento
            wav = self.model.generate(seg.text, language_id=language, exaggeration=exaggeration,
                                      cfg_weight=cfg_weight, temperature=temperature)
            audio = wav.squeeze().detach().cpu().numpy().astype(np.float32)
            dur = len(audio) / self.sr
            timings.append({"index": i, "text": seg.text, "start": round(cursor, 3),
                            "end": round(cursor + dur, 3)})
            chunks.append(audio)
            cursor += dur
            if seg.pause_after_ms > 0:
                pause = np.zeros(int(self.sr * seg.pause_after_ms / 1000), dtype=np.float32)
                chunks.append(pause)
                cursor += len(pause) / self.sr
        return np.concatenate(chunks) if chunks else np.zeros(0, np.float32), timings
