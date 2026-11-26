---
name: boettcher-viral-intelligence
description: Investiga un tema inmobiliario, compara referencias públicas y produce un guion original y storyboard para Boettcher Motion Studio. Úsala antes de producir videos, comerciales, Reels, Shorts o campañas de captación.
---
# Boettcher Viral Intelligence

El motor propio está en `boettcher-viral-intelligence/`. Leer su README antes de comenzar.

## Procedimiento
1. Captar tema, audiencia, objetivo comercial, duración, restricciones y medios disponibles.
2. Ejecutar búsqueda autorizada desde la interfaz/API local (`POST /api/research`); no asumir que un sitio aparece exactamente primero en Google por estar primero en SearXNG.
3. Registrar Reels de referencia públicos que sean accesibles. Las reproducciones se ingresan solo tras verificar el número visible y registrar la URL; si no se puede verificar, mostrar `no disponible`. Nunca presentar el número como obtenido por API si fue ingresado manualmente.
4. Resumir estructura, pregunta inicial, conflicto, ritmo, estilo visual y razón para compartir sin copiar escenas, logos, personajes, material audiovisual ni guiones protegidos.
5. Generar 10 ganchos, escoger uno, escribir relato comercial y dividir en micro-momentos. No prometer viralidad ni inventar desempeño.
6. Usar `boettcher-viral-script-engine` para pulir la escritura; `boettcher-voice-studio` o una locución provista para narrar; `boettcher-motion-studio` para crear video desde el storyboard exportado.
7. Variar estilos entre campañas: UI interactiva, historia humana, tipografía cinética, collage editorial, minidocumental, isométrico, conversación ficticia, ruta judicial, contadores, antes/después, visita guiada, editorial premium. No repetir siempre transiciones de pantalla completa.
8. Contrastarlo con https://boettcher.cl/administracion-de-propiedades/ cuando se mencionen prestaciones. Mantener seguros y planes sujetos a condiciones del contrato, sin garantías absolutas.
9. Respetar derechos de autor y de voz, condiciones de Instagram y las políticas de acceso de cada fuente.
10. Antes de publicar, validar audio continuo y con volumen adecuado, subtítulos correctos, imágenes sin recortes, margen seguro para Reels y render real MP4 1080x1920. No confundir el storyboard animado web con un video renderizado.

## Proyectos
- `python3 -m app.server --port 8787` desde `boettcher-viral-intelligence/`.
- `POST /api/projects` recibe `{"topic":"...","seconds":45,"ollama":false}`.
- `GET /api/projects/<id>` devuelve guion, ganchos, referencias y storyboard.
- Integrar con herramientas existentes sin reemplazar las skills actuales ni guardar tokens en el repositorio.
