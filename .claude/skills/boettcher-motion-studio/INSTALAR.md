# Instalación para Claude Code

## Opción 1: Proyecto específico (recomendada)
1. Descomprime esta carpeta.
2. Abre Terminal en el directorio de tu proyecto de video.
3. Copia toda la carpeta `boettcher-motion-studio` dentro de `.claude/skills/` (crea el directorio si no existe).
4. En Claude Code abre una nueva sesión en ese proyecto y solicita: «Usa boettcher-motion-studio para crear un reel de captación de propietarios de 18 segundos».
5. Claude debe verificar Node.js, crear o adaptar el proyecto Remotion, instalar dependencias autorizadas y previsualizar el resultado.

## Opción 2: Disponible en cualquier proyecto
En macOS o Linux copia la carpeta a `~/.claude/skills/boettcher-motion-studio/`. En Windows usa `%USERPROFILE%\.claude\skills\boettcher-motion-studio\`.

## Skills oficiales (complemento)
En Claude Code instala el plugin oficial de Remotion según https://www.remotion.dev/docs/ai/claude-code-plugin, o en un proyecto Remotion ejecuta `npx remotion skills add`.

## Comprobación
En Claude Code solicita: «Enumera las skills disponibles y comprueba que boettcher-motion-studio esté activa. No instales nada todavía».

## Avisos
Este ZIP contiene instrucciones y guiones, no un render MP4 ni un proyecto con dependencias instaladas. Requiere Claude Code ejecutándose en tu equipo, Node.js y Remotion para crear los videos. Verificar requisitos de sistema, derechos de assets y licencias antes de producción comercial.
