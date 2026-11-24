"""Procesamiento de audio con FFmpeg. No modifica nunca el archivo original."""
import json
import re
import shutil
import subprocess
from pathlib import Path

FFMPEG = shutil.which("ffmpeg") or "ffmpeg"
FFPROBE = shutil.which("ffprobe") or "ffprobe"

# Limpieza conservadora: paso alto suave, reducción de ruido leve y loudness moderado.
# Se evitan compresores o gates agresivos que deformen la voz.
CLEAN_FILTER = "highpass=f=80,afftdn=nr=10:nf=-40:tn=1,loudnorm=I=-20:TP=-2:LRA=7"


def _ff(args: list[str]) -> None:
    subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", *args], check=True)


def probe(path: Path) -> dict:
    out = subprocess.run(
        [FFPROBE, "-v", "error", "-show_entries", "format=duration:stream=codec_type,sample_rate,channels",
         "-of", "json", str(path)],
        check=True, capture_output=True, text=True,
    ).stdout
    data = json.loads(out)
    audio = next((s for s in data.get("streams", []) if s.get("codec_type") == "audio"), {})
    return {
        "duration_s": float(data.get("format", {}).get("duration", 0)),
        "sample_rate": int(audio.get("sample_rate", 0)) if audio else 0,
        "channels": int(audio.get("channels", 0)) if audio else 0,
    }


def clean_to_wav(src: Path, dst: Path, sample_rate: int = 24000) -> Path:
    """Convierte MP3/MP2/WAV/MP4 a WAV mono PCM16 limpio. El origen queda intacto."""
    dst.parent.mkdir(parents=True, exist_ok=True)
    _ff(["-i", str(src), "-vn", "-af", CLEAN_FILTER, "-ac", "1", "-ar", str(sample_rate),
         "-c:a", "pcm_s16le", str(dst)])
    return dst


def loudness_report(path: Path) -> dict:
    """Lee LUFS integrados, rango de loudness y pico real para comprobar la muestra."""
    res = subprocess.run([FFMPEG, "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128=peak=true",
                          "-f", "null", "-"], capture_output=True, text=True)
    tail = res.stderr.split("Summary:")[-1]
    report = {}
    for key, pat in {"lufs_integrated": r"I:\s+(-?[\d.]+) LUFS", "lra": r"LRA:\s+([\d.]+) LU",
                     "true_peak_dbfs": r"Peak:\s+(-?[\d.]+) dBFS"}.items():
        m = re.search(pat, tail)
        report[key] = float(m.group(1)) if m else None
    return report


def change_speed(src: Path, dst: Path, factor: float) -> Path:
    """Cambia la velocidad sin alterar el tono (atempo admite 0.5–2.0)."""
    if not 0.5 <= factor <= 2.0:
        raise ValueError("La velocidad debe estar entre 0.5 y 2.0")
    if abs(factor - 1.0) < 1e-3:
        shutil.copyfile(src, dst)
        return dst
    _ff(["-i", str(src), "-af", f"atempo={factor:.4f}", "-c:a", "pcm_s16le", str(dst)])
    return dst


def export(src: Path, dst: Path) -> Path:
    """Exporta WAV o MP3 según la extensión de destino."""
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.suffix.lower() == ".mp3":
        _ff(["-i", str(src), "-codec:a", "libmp3lame", "-b:a", "192k", str(dst)])
    else:
        _ff(["-i", str(src), "-c:a", "pcm_s16le", str(dst)])
    return dst
