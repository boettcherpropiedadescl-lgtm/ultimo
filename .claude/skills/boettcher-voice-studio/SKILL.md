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

## Narración por escenas (comerciales de duración fija)
`scenes/<nombre>.json` define escenas con ventana (`start`, `duration`) y texto. El generador ajusta cada escena a su ventana:
- Acelera hasta 1,2× como máximo (`MAX_SPEED`); si no cabe, falla y lista las escenas que hay que acortar.
- Recorta silencio del modelo por segmento.
- Comando: `python -m voice_studio.build_scenes scenes/comercial45.json --remotion-public ../boettcher-videos/public`

Ritmo medido de la voz de referencia: ≈0,6–0,9 s por palabra. Un guion de 45 s debe tener unas 75 palabras como máximo.

## Narración continua con cues (comerciales con gráficas sincronizadas)
`scenes/comercial60.json` define `beats` (frases) y `cues` (frases-clave que disparan gráficas). `python -m voice_studio.build_narration scenes/comercial60.json --remotion-public ../boettcher-videos/public`:
genera voz sin relleno, comprime pausas largas a ≈0,14 s, alinea el guion palabra a palabra con reconocimiento local y escribe `public/voice/<nombre>.timeline.json` (`cues`, `subtitles`). La composición `BoettcherComercial60` usa esos cues. `--reuse-wav` repite solo compresión y alineación.
Datos comerciales: solo los de boettcher.cl/administracion-de-propiedades/ (planes 6/12/15 %, seguro hasta 6 y 12 meses según plan, Ley 21.461, +15 años, +2.000 propiedades).

## Locución real entregada por el cliente (sin síntesis)
Si el cliente entrega su propia grabación (p. ej. `.mov` con video negro y solo audio), úsala tal cual: extrae el audio sin filtros (`ffmpeg -vn -c:a pcm_s16le -ar 48000`), escribe `scenes/<nombre>.json` con el guion y los cues, y alinea con `python -m voice_studio.align_audio audio.wav scenes/<nombre>.json salida.timeline.json`. La composición `BoettcherComercialFinal` lee `public/voice/comercial-final.timeline.json` y `comercial-final.wav`. No se clona ni se procesa la voz.

## Regla anti-parpadeo en Remotion
No uses `filter: blur()` ni `rotateX`/`perspective` por palabra: Chrome puede ocultar una palabra durante un fotograma. Usa `components/StableText` (solo opacidad y desplazamiento, estilo vacío al terminar) y aplica transform/opacity únicamente mientras algo se mueve.

## Estilo de montaje "dinámico" (composición BoettcherComercialDinamico)
Inspirado en reels de tutoriales: cada escena es una tarjeta tipo interfaz que entra con rebote y sale mientras entra la siguiente; cursor que hace clic, interruptores, contadores, esqueletos de carga, confeti y subtítulos palabra por palabra (usa `words` del timeline). Piezas en `src/components/ui/Kit.tsx`. Para mantener la atención hay movimiento permanente sin tocar el texto con filtros: destello en tarjetas, brasas, empuje de cámara lento por escena. Mide siempre: fotogramas sin cambio = 0, sin bandas negras, sin picos aislados en titulares/subtítulos. No copiar mascotas, logos ni material de terceros del video de referencia.

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
