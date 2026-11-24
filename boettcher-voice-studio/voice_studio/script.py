"""División del guion en segmentos con pausas. Lógica pura, sin modelo."""
import re
from dataclasses import dataclass

SENTENCE_END = re.compile(r"(?<=[.!?…])\s+")
CLAUSE_SPLIT = re.compile(r"(?<=[,;:])\s+")
MAX_CHARS = 220  # el modelo genera hasta ~40 s por llamada; frases cortas evitan cortes


@dataclass
class Segment:
    text: str
    pause_after_ms: int


def split_script(text: str, pause_ms: int = 350, paragraph_pause_ms: int = 700) -> list[Segment]:
    segments: list[Segment] = []
    for paragraph in (t for t in re.split(r"\n\s*\n", text.strip()) if t.strip()):
        flat = " ".join(paragraph.split())
        sentences = [s for s in SENTENCE_END.split(flat) if s.strip()]
        for s_idx, sentence in enumerate(sentences):
            pieces = [sentence]
            if len(sentence) > MAX_CHARS:
                pieces = [c for c in CLAUSE_SPLIT.split(sentence) if c.strip()]
            for k, piece in enumerate(pieces):
                last_piece = k == len(pieces) - 1
                last_sentence = s_idx == len(sentences) - 1
                if not last_piece:
                    gap = 180
                elif last_sentence:
                    gap = paragraph_pause_ms
                else:
                    gap = pause_ms
                segments.append(Segment(piece.strip(), gap))
    if segments:
        segments[-1].pause_after_ms = 0
    return segments
