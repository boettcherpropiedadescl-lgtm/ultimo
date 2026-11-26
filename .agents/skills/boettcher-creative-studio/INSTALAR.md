# Boettcher Creative Studio en este repositorio

Codex carga esta skill desde `.agents/skills/boettcher-creative-studio/`. Claude Code tiene acceso a la misma carpeta mediante `.claude/skills/boettcher-creative-studio`. Al abrir una nueva sesión en el repositorio, puedes pedir «Usa boettcher-creative-studio para preparar un reel sobre seguro de arriendo».

## Abrir el panel en Mac o Linux

Desde la raíz del repositorio:

```bash
cd .agents/skills/boettcher-creative-studio/runtime
python3 -m app.server --port 8787
```

Abre [el panel local](http://127.0.0.1:8787). Requiere Python 3.10 o posterior. El directorio `runtime/` enlaza a la versión de Viral Intelligence mantenida en el repositorio. Ambos puntos de entrada usan la misma biblioteca SQLite y configuración. [Configuración de SearXNG y Ollama](../../../boettcher-viral-intelligence/README.md)

## Producir un piloto

1. Genera un borrador con el panel y revisa el guion con las referencias de esta skill. Verifica las afirmaciones comerciales antes de grabar.
2. Entrega el TXT a Voice Studio o usa la locución autorizada del proyecto. Mantén los archivos privados en `VOICE_STUDIO_HOME`. [Voice Studio](../../../boettcher-voice-studio/README.md)
3. Carga el JSON en el adaptador Remotion o crea una composición dedicada con Motion Studio. [Adaptador de Remotion](../../../boettcher-viral-intelligence/remotion/REGISTER.md)
4. Revisa el guion y una muestra antes de producir un video completo. [Primer piloto](../../../boettcher-videos/experiments/dividendo-vence-igual/README.md)

Para probar el runtime compartido, ejecuta `python3 -m unittest discover -s tests -v` desde `runtime/`.
