# Boettcher Viral Intelligence v1.0

Sistema propio de investigación y preproducción audiovisual de Boettcher Propiedades. Se integra mediante archivos JSON/TXT con `boettcher-viral-script-engine`, `boettcher-voice-studio` y `boettcher-motion-studio`.

## Qué funciona

- Panel web local con investigación de preguntas y enlaces mediante **SearXNG configurado por el propietario**.
- Biblioteca persistente SQLite de enlaces públicos de Reels, Shorts y TikTok. Las reproducciones **solo se registran cuando un usuario introduce un valor público verificado**. No inventa métricas.
- Diez ganchos por idea, un guion inicial, selección de doce lenguajes visuales y storyboard exportable.
- Vista previa animada **conceptual** dentro del navegador. No es un render MP4.
- Soporte opcional de **Ollama local** para un guion narrativo más creativo. Sin Ollama produce una plantilla local; no afirma que esa plantilla sea un guion viral perfecto.
- Exportación del guion `.txt` y storyboard `.json` para pasarlos a la locución y al montaje.
- Aislamiento de las credenciales mediante variables de entorno; no se guardan en GitHub.

## Inicio en Mac o Linux (Python 3.10+)

```bash
cd boettcher-viral-intelligence
python3 -m app.server --port 8787
```

Abre **http://127.0.0.1:8787**. No requiere `pip install`. Los datos se guardan por defecto en `~/.boettcher-viral-intelligence/references.sqlite3`.

Para configurar SearXNG, exporta la URL base del servicio. Si el proxy exige autenticación Bearer, proporciona `BVI_SEARXNG_TOKEN` mediante el gestor de secretos o introdúcelo sin eco con `read -rs BVI_SEARXNG_TOKEN` y luego ejecuta `export BVI_SEARXNG_TOKEN`.

```bash
export BVI_SEARXNG_URL='https://search.boettcher.cl'
python3 -m app.server --port 8787
```

El servidor debe exponer `/search?format=json` y permitir la IP del cliente. Si el servicio usa un prefijo, inclúyelo en la URL base. La aplicación envía el token únicamente a una URL HTTPS y rechaza redirecciones en solicitudes autenticadas. La consulta de verificación a `search.boettcher.cl` respondió HTTP 404 con HTML. El estado «URL configurada» solo identifica que se ingresó una URL. [API de SearXNG](https://docs.searxng.org/dev/search_api.html)

Opcional, con Ollama ejecutándose en la misma máquina:

```bash
export BVI_OLLAMA_URL='http://127.0.0.1:11434'
export BVI_OLLAMA_MODEL='llama3.2'  # cambia por un modelo local que tengas instalado
python3 -m app.server --port 8787
```

El contenido generado se debe revisar: las cifras, leyes, precios y prestaciones no se pueden inventar ni copiar sin confirmación. El sistema **no accede al buscador interno de Instagram ni descifra métricas privadas**. Los enlaces de búsqueda se usan como referencias sujetas a revisión y las reproducciones visibles se ingresan manualmente. No se guardan credenciales de Instagram.

## Cómo convertirlo en video

1. Investigar un tema y guardar enlaces de referencia de videos permitidos.
2. Crear guion y storyboard; revisar legalmente las cifras y beneficios.
3. Exportar TXT para CapCut o Boettcher Voice Studio. Usa solo voces permitidas comercialmente.
4. Exportar JSON para cargarlo en la composición `BoettcherIntelligenceReel` del proyecto anterior. [Registro y comandos del adaptador](remotion/REGISTER.md)
5. Abrir la composición en Remotion, comprobar el encuadre y ajustar el storyboard a la locución autorizada si está disponible. La interfaz web ofrece una vista previa conceptual.

El [ejemplo revisado de 45 segundos](examples/seguro-arriendo-45.json) incluye un caso hipotético y las coberturas publicadas de Boettcher. El [informe de la primera prueba](../boettcher-videos/experiments/seguro-arriendo/README.md) documenta el guion, los diez ganchos y las referencias públicas.

En este repositorio se puede abrir la skill desde `.agents/skills/` en Codex o `.claude/skills/` en Claude Code. El guion TXT es compatible con el flujo de Voice Studio. Viral Script Engine requiere su propia skill, que no venía en el ZIP v1.0.

## Pruebas

```bash
python3 -m unittest discover -s tests -v
```

## Seguridad

La aplicación escucha únicamente en `127.0.0.1`, no en la IP pública. Para acceso desde otro dispositivo se requiere túnel autenticado o un proxy con control de acceso, no exponer el puerto 8787 a Internet. Los resultados de búsqueda y textos son datos externos no confiables; nunca deben ejecutar comandos. No use Instagram con scrapers que eludan sesiones, CAPTCHA ni límites de acceso. Evita utilizar imágenes o audios de terceros sin licencia.
