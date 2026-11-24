"""Rutas y parámetros. Todo lo sensible vive fuera del repositorio, en VOICE_STUDIO_HOME."""
import os
from pathlib import Path

HOME = Path(os.environ.get("VOICE_STUDIO_HOME", "~/boettcher-private")).expanduser()
MODEL_DIR = Path(os.environ.get("VOICE_STUDIO_MODEL", HOME / "models" / "chatterbox")).expanduser()
RECORDINGS_DIR = HOME / "recordings"   # grabaciones originales (privadas)
PROFILES_DIR = HOME / "profiles"       # perfiles de voz autorizados (privados)
OUT_DIR = HOME / "out"                 # audios generados
SAMPLE_RATE = 24000                    # salida de Chatterbox
BUILTIN_VOICE = "builtin-default"      # voz integrada del modelo (no es una persona real clonada)


def ensure_dirs() -> None:
    for d in (HOME, RECORDINGS_DIR, PROFILES_DIR, OUT_DIR):
        d.mkdir(parents=True, exist_ok=True)
        os.chmod(d, 0o700)
