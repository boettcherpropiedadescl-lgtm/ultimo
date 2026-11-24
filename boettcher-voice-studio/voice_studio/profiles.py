"""Perfiles de voz autorizados. Exige registro de autorización antes de crear un perfil."""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import re
import shutil
from pathlib import Path

from . import config

REQUIRED_AUTH_FIELDS = ("owner_name", "authorization_document", "authorized_uses", "commercial_use", "signed_on")


def _slug(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    if not s:
        raise ValueError("Nombre de perfil inválido")
    return s


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def validate_authorization(auth: dict) -> None:
    missing = [k for k in REQUIRED_AUTH_FIELDS if not auth.get(k)]
    if missing:
        raise PermissionError(f"Falta registro de autorización: {', '.join(missing)}")
    if auth["commercial_use"] is not True:
        raise PermissionError("El perfil solo puede crearse si la autorización incluye uso comercial")


def create_profile(engine, name: str, reference_wav: Path, source_file: Path, auth: dict) -> Path:
    """Crea el perfil: copia de referencia limpia, condicionales del modelo y registro de autorización."""
    validate_authorization(auth)
    config.ensure_dirs()
    pid = _slug(name)
    pdir = config.PROFILES_DIR / pid
    if pdir.exists():
        raise FileExistsError(f"Ya existe el perfil '{pid}'")
    pdir.mkdir(parents=True)
    os_chmod_private(pdir)

    shutil.copyfile(reference_wav, pdir / "reference-clean.wav")
    engine.model.prepare_conditionals(str(pdir / "reference-clean.wav"), exaggeration=0.5)
    engine.model.conds.save(pdir / "conds.pt")

    meta = {
        "profile_id": pid,
        "display_name": name,
        "created_utc": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "source_sha256": sha256(source_file),
        "source_name": source_file.name,
        "authorization": auth,
        "engine": "chatterbox-multilingual",
        "engine_license": "MIT",
    }
    (pdir / "profile.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    return pdir


def list_profiles() -> list[dict]:
    out = []
    if config.PROFILES_DIR.exists():
        for p in sorted(config.PROFILES_DIR.iterdir()):
            meta = p / "profile.json"
            if meta.exists():
                out.append(json.loads(meta.read_text(encoding="utf-8")))
    return out


def os_chmod_private(path: Path) -> None:
    import os
    os.chmod(path, 0o700)
