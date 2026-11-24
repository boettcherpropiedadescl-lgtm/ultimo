"""Alineación palabra a palabra del guion con el audio generado (reconocimiento local, sin servicios externos)."""
from __future__ import annotations

import difflib
import re
import unicodedata


def norm(word: str) -> str:
    t = unicodedata.normalize("NFKD", word.lower())
    t = "".join(c for c in t if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "", t)


def asr_words(wav_path, model_size: str = "small", initial_prompt: str | None = None) -> list[tuple[str, float, float]]:
    from faster_whisper import WhisperModel
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    segments, _ = model.transcribe(str(wav_path), language="es", word_timestamps=True, beam_size=5,
                                   initial_prompt=initial_prompt)
    return [(w.word.strip(), float(w.start), float(w.end)) for s in segments for w in s.words]


def align_script(script_words: list[str], asr: list[tuple[str, float, float]], duration: float):
    """Devuelve [(start, end)] por palabra del guion. Coincidencias exactas anclan; el resto se interpola."""
    S = [norm(w) for w in script_words]
    A = [norm(w[0]) for w in asr]
    times: list[tuple[float, float] | None] = [None] * len(S)
    sm = difflib.SequenceMatcher(None, S, A, autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                times[i1 + k] = (asr[j1 + k][1], asr[j1 + k][2])
    # Interpola tramos sin ancla, proporcional al largo de cada palabra.
    i = 0
    while i < len(S):
        if times[i] is not None:
            i += 1
            continue
        j = i
        while j < len(S) and times[j] is None:
            j += 1
        left = times[i - 1][1] if i > 0 else 0.0
        right = times[j][0] if j < len(S) else duration
        weights = [max(1, len(S[k]) or 1) for k in range(i, j)]
        total = sum(weights)
        cursor = left
        for k, w in zip(range(i, j), weights):
            span = (right - left) * w / total
            times[k] = (cursor, cursor + span)
            cursor += span
        i = j
    return times  # type: ignore[return-value]


def find_cues(script_words: list[str], times, cues: list[dict]) -> dict[str, float]:
    """Cada cue {id, phrase}: primera aparición de la frase, buscando siempre hacia adelante."""
    S = [norm(w) for w in script_words]
    pos, out = 0, {}
    for cue in cues:
        phrase = [norm(p) for p in cue["phrase"].split()]
        for i in range(pos, len(S) - len(phrase) + 1):
            if S[i:i + len(phrase)] == phrase:
                out[cue["id"]] = round(times[i][0], 3)
                pos = i
                break
        else:
            raise ValueError(f"Cue '{cue['id']}': no se encontró la frase '{cue['phrase']}' en el guion (después de la posición anterior)")
    return out


_WEAK_END = {"de", "un", "una", "y", "por", "la", "el", "tu", "que", "a", "en", "con", "o", "los", "las", "del", "al", "su", "sin", "más", "quinientos", "dos", "seis", "doce", "quince", "hasta"}


def subtitle_chunks(script_words: list[str], times, max_words: int = 8, max_chars: int = 46) -> list[dict]:
    """Agrupa palabras en subtítulos de 1–2 líneas. Corta en punto/interrogación; en coma solo si ya hay 4+ palabras;
    evita terminar en artículos o preposiciones. Sin huecos entre un subtítulo y el siguiente."""
    chunks, cur = [], []
    for idx, w in enumerate(script_words):
        cur.append(idx)
        text = " ".join(script_words[k] for k in cur)
        nxt = script_words[idx + 1] if idx + 1 < len(script_words) else ""
        strong = w[-1] in ".?!"
        weak = w[-1] in ",;:" and len(cur) >= 4
        overflow = len(cur) >= max_words or len(text) + 1 + len(nxt) > max_chars
        if overflow and norm(w) in _WEAK_END and len(cur) < max_words + 2:
            overflow = False
        if overflow and not (strong or weak):
            left, k = 0, idx + 1
            while k < len(script_words):
                left += 1
                if script_words[k][-1] in ".?!":
                    break
                k += 1
            if left <= 2 and len(text) + 1 + len(nxt) <= max_chars + 22:
                overflow = False  # evita un subtítulo huérfano de una sola palabra
        if strong or weak or overflow:
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    out = []
    for n, c in enumerate(chunks):
        start = times[c[0]][0]
        end = times[chunks[n + 1][0]][0] if n + 1 < len(chunks) else times[c[-1]][1] + 0.3
        out.append({"text": " ".join(script_words[k] for k in c), "start": round(start, 3), "end": round(end, 3)})
    return out
