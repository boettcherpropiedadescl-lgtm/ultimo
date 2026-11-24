"""Pruebas sin modelo: segmentación, SRT, autorización y limpieza de audio."""
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from voice_studio.script import split_script  # noqa: E402
from voice_studio.profiles import validate_authorization  # noqa: E402
from voice_studio.synthesize import fmt_srt  # noqa: E402


def test_split_keeps_sentences_and_paragraph_pauses():
    text = "¿Tienes un departamento? Imagínate que mañana deja de pagar.\n\nEn Boettcher Propiedades sabemos."
    segs = split_script(text, pause_ms=350, paragraph_pause_ms=700)
    assert [s.text for s in segs] == [
        "¿Tienes un departamento?",
        "Imagínate que mañana deja de pagar.",
        "En Boettcher Propiedades sabemos.",
    ]
    assert segs[0].pause_after_ms == 350
    assert segs[1].pause_after_ms == 700  # cierre de párrafo
    assert segs[-1].pause_after_ms == 0


def test_long_sentence_is_split_on_clauses():
    long = ", ".join(["palabra de relleno número %d" % i for i in range(12)]) + "."
    segs = split_script(long)
    assert len(segs) > 1
    assert all(len(s.text) <= 220 for s in segs)


def test_srt_format():
    assert fmt_srt(0) == "00:00:00,000"
    assert fmt_srt(65.4321) == "00:01:05,432"


def test_authorization_is_required():
    with pytest.raises(PermissionError):
        validate_authorization({"owner_name": "X"})
    with pytest.raises(PermissionError):
        validate_authorization({"owner_name": "X", "authorization_document": "doc", "authorized_uses": "ads",
                                "commercial_use": False, "signed_on": "2026-11-24"})
    validate_authorization({"owner_name": "X", "authorization_document": "doc", "authorized_uses": "ads",
                            "commercial_use": True, "signed_on": "2026-11-24"})
