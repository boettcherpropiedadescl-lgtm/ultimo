---
name: boettcher-voice-studio
description: Síntesis de voz local para Boettcher Motion Studio. Limpia grabaciones autorizadas, gestiona perfiles de voz con registro de autorización, genera narraciones en español desde un guion (WAV/MP3 + subtítulos SRT) y las integra en las composiciones Remotion de boettcher-videos. Úsala al pedir narración, voz en off, locución, perfiles de voz o audio para comerciales.
---

# Boettcher Voice Studio

Módulo en `boettcher-voice-studio/` del repositorio. Motor: Chatterbox Multilingual (MIT), local, sin APIs de pago.

## Reglas que no se negocian
1. **Nunca clones ni imites una voz** sin registro de autorización completo: titular, documento, usos autorizados, **uso comercial explícito** y fecha de firma. `profiles.create_profile` lo exige y se niega si falta algo.
2. **No generes frases con la identidad vocal de una persona** a partir de grabaciones sin autorización. Una grabación sin registro sirve solo como referencia de estilo o para probar limpieza.
3. **No versiones audio, perfiles ni pesos.** Viven en `VOICE_STUDIO_HOME` (carpeta privada fuera del repo). `public/voice/` de `boettcher-videos` está ignorada.
4. **Conserva el original intacto.** La limpieza siempre escribe copias.
5. Informa que la salida lleva marca de agua de audio (Perth) y revisa la pronunciación de nombres propios al escuchar.

## Flujo
1. Limpieza: `clean_to_wav` (FFmpeg, WAV mono 24 kHz, `loudnorm -20 LUFS`). Sin Demucs: sus pesos no están disponibles en este entorno.
2. Perfil (solo con autorización): `profiles.create_profile(engine, nombre, wav_limpio, original, auth)`.
3. Guion: `script.split_script` divide por frases y párrafos con pausas (350 ms, 700 ms al cerrar párrafo).
4. Narración: `synthesize.run(...)` → `out/<nombre>.wav|.mp3`, `.timings.json`, `.srt`. Velocidad con `atempo` (tono preservado, 0,5–2,0).
5. Remotion: `--remotion-public ../boettcher-videos/public` copia a `public/voice/`. Renderiza con la composición `VoiceOverReel` (`--props` o `defaultProps.narrationName`).

## Comandos
```bash
export VOICE_STUDIO_HOME=/home/user/boettcher-private
. $VOICE_STUDIO_HOME/venv/bin/activate
cd boettcher-voice-studio
python -m voice_studio.ui                                # interfaz en 127.0.0.1:7861
python -m voice_studio.synthesize guion.txt --name nombre --voice builtin-default --remotion-public ../boettcher-videos/public
python -m pytest -q tests
cd ../boettcher-videos && npx remotion render VoiceOverReel out/nombre.mp4 --codec=h264
```

## Estado verificado
- Motor cargado en CPU con los pesos oficiales (3,0 GB). Generación ≈6× tiempo real.
- Muestra de 18,6 s en español con la voz integrada del modelo. Transcripción de verificación: similitud 0,90.
- Limpieza de la grabación del presentador: −20,3 LUFS, pico −5,6 dBFS, sin recorte; original verificado por SHA-256.
- Composición `VoiceOverReel` renderiza MP4 1080×1920 con audio y subtítulos sincronizados.
- Pendiente: revisión auditiva de la pronunciación de «Boettcher» y de la frase de cierre.
