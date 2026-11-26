# Adaptador de storyboard de Remotion

La composición `BoettcherIntelligenceReel` está registrada en `boettcher-videos/src/Root.tsx`. Descarga el storyboard desde Viral Intelligence y pásalo directamente a Remotion desde `boettcher-videos`.

```bash
npx remotion still BoettcherIntelligenceReel out/boettcher-intelligence.png \
  --props=/ruta/al/storyboard.json --frame=30
npx remotion render BoettcherIntelligenceReel out/boettcher-intelligence.mp4 \
  --props=/ruta/al/storyboard.json --frames=0-299 --codec=h264 --crf=17 --is-production=false
```

Para usar el ejemplo revisado en este repositorio, pasa `--props=../boettcher-viral-intelligence/examples/seguro-arriendo-45.json`. Para renderizar la línea de tiempo completa, quita `--frames`. El adaptador lee `topic` y también acepta el campo `theme` de las exportaciones de v1.0. Calcula la duración a 30 fps a partir de `duration` y verifica que los capítulos sean consecutivos y cubran la duración completa. Cada capítulo requiere `name`, `start`, `end` y `visual`. Puedes añadir `headline`, una lista de `items` y un `example` con `months` y `monthlyRent` para mostrar el calendario y el contador. `script` conserva la narración escrita.

Para acompañarlo con una locución autorizada, coloca el WAV o MP3 en `boettcher-videos/public/voice/` y añade el nombre del archivo a `audioName`. Esa carpeta está ignorada por Git. Comprueba que el audio tenga la duración esperada y alinea las escenas con el guion grabado. Los tiempos base son editoriales y el adaptador carece de alineación fonética automática. El uso comercial requiere revisar la licencia aplicable. [Licencia de Remotion](https://www.remotion.dev/license)
