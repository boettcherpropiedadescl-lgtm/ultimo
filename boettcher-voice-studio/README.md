# Boettcher Voice Studio

Síntesis de voz **local** para Boettcher Motion Studio. Usa Chatterbox Multilingual (MIT, Resemble AI)
sin servicios externos en tiempo de generación. Sin GPU: corre en CPU (≈6× tiempo real en 4 vCPU).

## Privacidad y datos sensibles
Todo lo sensible vive **fuera del repositorio**, en `VOICE_STUDIO_HOME`:

```
$VOICE_STUDIO_HOME/
  recordings/   grabaciones originales (intactas) y versiones limpias
  profiles/     perfiles de voz autorizados (conds.pt, profile.json)
  models/       pesos de Chatterbox
  out/          narraciones generadas
```

`.gitignore` bloquea audio, perfiles y pesos. No subas nada de esas carpetas.

## Instalación
```bash
export VOICE_STUDIO_HOME=/ruta/privada/boettcher-private
python3.13 -m venv $VOICE_STUDIO_HOME/venv
. $VOICE_STUDIO_HOME/venv/bin/activate
pip install -r requirements.txt
```

Descargar los pesos oficiales (requiere acceso a huggingface.co, repo `ResembleAI/chatterbox`):
```bash
python -c "from huggingface_hub import snapshot_download as s; s('ResembleAI/chatterbox', local_dir='$VOICE_STUDIO_HOME/models/chatterbox', allow_patterns=['ve.pt','t3_mtl23ls_v2.safetensors','s3gen.pt','grapheme_mtl_merged_expanded_v1.json','conds.pt','Cangjie5_TC.json'])"
```

## Uso
**Interfaz local** (http://127.0.0.1:7861):
```bash
python -m voice_studio.ui
```
Pestañas: cargar y limpiar · perfiles (con autorización) · narración (guion, voz, velocidad, pausas, MP3/WAV, SRT).

**Línea de comandos**:
```bash
python -m voice_studio.synthesize guion.txt --name promo-ej --voice builtin-default --speed 1.0 --pause-scale 1.0
# Para Remotion, añade: --remotion-public ../boettcher-videos/public
```

## Limpieza de grabaciones
FFmpeg, sin filtros agresivos: paso alto 80 Hz, `afftdn` suave y `loudnorm` a −20 LUFS, salida WAV mono 24 kHz.
Demucs no es viable aquí: sus pesos se descargan desde un host no permitido. Solo se usaría si hay música audible.

## Perfiles y autorización
Un perfil solo se crea con: titular, documento de autorización, usos autorizados, **uso comercial explícito**
y fecha de firma. Se guarda el SHA-256 del original y el registro en `profile.json`.
La grabación del presentador de referencia **no** tiene autorización registrada: se usa solo para pruebas de
procesamiento y no genera perfil.

## Pruebas
```bash
python -m pytest -q tests
```
Las pruebas de lógica no cargan el modelo.

## Límites conocidos
- Generación ≈6× tiempo real en CPU: un guion de 100 s tarda ≈10 min.
- Cada llamada genera hasta ~40 s; el guion se divide en frases.
- La pronunciación de nombres propios (p. ej. «Boettcher») debe revisarse al escuchar.
- Chatterbox aplica una marca de agua de audio (Perth) en cada salida.
- Remotion: la licencia gratuita cubre hasta 3 empleados; por encima se requiere licencia de empresa.
