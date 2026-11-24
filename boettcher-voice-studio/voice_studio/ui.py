"""Interfaz local (Gradio). Ejecutar: VOICE_STUDIO_HOME=... python -m voice_studio.ui"""
from __future__ import annotations

import datetime as dt
import json
import re
import shutil
import threading
from pathlib import Path

import gradio as gr

from . import audio, config, profiles, synthesize

_engine = None
_lock = threading.Lock()


def get_engine():
    global _engine
    with _lock:
        if _engine is None:
            from .engine import VoiceEngine
            _engine = VoiceEngine(config.MODEL_DIR)
        return _engine


def _stamp() -> str:
    return dt.datetime.now().strftime("%Y%m%d-%H%M%S")


def _safe(name: str) -> str:
    return re.sub(r"[^A-Za-z0-9_-]+", "-", name).strip("-") or "salida"


def upload_and_clean(file_path):
    """Guarda copia privada del original (intacto) y genera WAV mono limpio para revisión."""
    if not file_path:
        return None, None, None, "Sube un archivo MP3, MP2, WAV o MP4."
    config.ensure_dirs()
    src = Path(file_path)
    if src.suffix.lower() not in {".mp3", ".mp2", ".wav", ".mp4"}:
        return None, None, None, "Formato no admitido."
    stem = f"{_stamp()}-{_safe(src.stem)}"
    original = config.RECORDINGS_DIR / f"{stem}{src.suffix.lower()}"
    shutil.copyfile(src, original)
    original.chmod(0o600)
    clean = audio.clean_to_wav(original, config.RECORDINGS_DIR / f"{stem}-clean.wav")
    clean.chmod(0o600)
    info = audio.probe(original)
    rep = audio.loudness_report(clean)
    sha = profiles.sha256(original)
    text = (f"Original (intacto, privado): {original.name}\n"
            f"SHA-256: {sha}\n"
            f"Duración: {info['duration_s']:.2f} s · Muestra original: {info['sample_rate']} Hz, {info['channels']} canal(es)\n"
            f"Limpio: WAV mono 24 kHz · LUFS {rep['lufs_integrated']} · pico real {rep['true_peak_dbfs']} dBFS")
    return str(original), str(clean), str(original), text


def profile_choices():
    items = [(f"{p['display_name']} ({p['profile_id']})", p["profile_id"]) for p in profiles.list_profiles()]
    return [("Voz integrada del modelo (no clonada)", config.BUILTIN_VOICE)] + items


def create_profile_ui(name, owner, doc_ref, uses, commercial, signed_on, original_path):
    try:
        if not original_path:
            return "Primero carga y limpia una grabación.", gr.update(choices=profile_choices())
        auth = {"owner_name": owner.strip(), "authorization_document": doc_ref.strip(),
                "authorized_uses": uses.strip(), "commercial_use": bool(commercial),
                "signed_on": signed_on.strip()}
        clean = Path(original_path).parent / (Path(original_path).stem + "-clean.wav")
        pdir = profiles.create_profile(get_engine(), name, clean, Path(original_path), auth)
        return f"Perfil guardado en carpeta privada: {pdir.name}", gr.update(choices=profile_choices())
    except (PermissionError, FileExistsError, ValueError) as e:
        return f"No se creó el perfil: {e}", gr.update(choices=profile_choices())


def generate_ui(script, voice, speed, pause_scale, exaggeration, fmt):
    if not script or not script.strip():
        return None, None, None, "Escribe o pega un guion."
    out_name = f"narracion-{_stamp()}"
    res = synthesize.run(script, out_name, voice or config.BUILTIN_VOICE, speed=float(speed),
                         pause_scale=float(pause_scale), exaggeration=float(exaggeration),
                         fmt=fmt, engine=get_engine())
    o = res["outputs"]
    main = o.get("mp3") if fmt == "mp3" else o["wav"]
    msg = f"Duración: {res['duration_s']:.2f} s · segmentos: {res['segments']}"
    return main, o["wav"], o["srt"], msg


def build():
    config.ensure_dirs()
    with gr.Blocks(title="Boettcher Voice Studio") as demo:
        gr.Markdown("## Boettcher Voice Studio\nSíntesis de voz local. Las grabaciones y perfiles quedan en una carpeta privada del equipo.")
        original_state = gr.State(None)

        with gr.Tab("1 · Cargar y limpiar"):
            up = gr.File(label="Grabación autorizada (MP3, MP2, WAV o MP4)", file_types=[".mp3", ".mp2", ".wav", ".mp4"], type="filepath")
            btn_clean = gr.Button("Limpiar y generar vista previa")
            orig_audio = gr.Audio(label="Original (escucha)", type="filepath")
            clean_audio = gr.Audio(label="Versión limpia (vista previa)", type="filepath")
            info = gr.Textbox(label="Registro del archivo", lines=5)
            btn_clean.click(upload_and_clean, [up], [orig_audio, clean_audio, original_state, info])

        with gr.Tab("2 · Perfiles de voz"):
            gr.Markdown("Un perfil solo se crea con registro de autorización y uso comercial explícito.")
            p_name = gr.Textbox(label="Nombre del perfil")
            p_owner = gr.Textbox(label="Titular de la voz (nombre completo)")
            p_doc = gr.Textbox(label="Documento de autorización (referencia o ruta privada)")
            p_uses = gr.Textbox(label="Usos autorizados", placeholder="Ej.: comerciales Boettcher Propiedades, redes sociales")
            p_commercial = gr.Checkbox(label="Autorizo uso comercial y publicitario", value=False)
            p_date = gr.Textbox(label="Fecha de firma (AAAA-MM-DD)")
            btn_prof = gr.Button("Guardar perfil")
            p_msg = gr.Textbox(label="Estado", lines=2)

        with gr.Tab("3 · Narración"):
            script = gr.Textbox(label="Guion", lines=10, placeholder="Escribe o pega el guion aquí. Separa párrafos con una línea en blanco.")
            voice = gr.Dropdown(label="Voz", choices=profile_choices(), value=config.BUILTIN_VOICE)
            with gr.Row():
                speed = gr.Slider(0.7, 1.3, value=1.0, step=0.01, label="Velocidad (tono preservado)")
                pause_scale = gr.Slider(0.5, 2.0, value=1.0, step=0.05, label="Escala de pausas")
                exagg = gr.Slider(0.25, 0.7, value=0.45, step=0.01, label="Expresividad (sin exagerar)")
            fmt = gr.Radio(["mp3", "wav"], value="mp3", label="Formato")
            btn_gen = gr.Button("Generar audio")
            out_main = gr.Audio(label="Resultado", type="filepath")
            with gr.Row():
                out_wav = gr.File(label="WAV")
                out_srt = gr.File(label="Subtítulos (SRT)")
            out_msg = gr.Textbox(label="Estado", lines=1)
            btn_gen.click(generate_ui, [script, voice, speed, pause_scale, exagg, fmt],
                          [out_main, out_wav, out_srt, out_msg])

        btn_prof.click(create_profile_ui, [p_name, p_owner, p_doc, p_uses, p_commercial, p_date, original_state],
                       [p_msg, voice])
    return demo


if __name__ == "__main__":
    build().launch(server_name="127.0.0.1", server_port=7861)
