# Prueba de Motion · Riesgos de arrendar sin seguro en Chile

Prueba editorial de 10 segundos, vertical a 1080 × 1920 y 30 fps. La composición tiene su propio punto de entrada para conservar los trabajos anteriores. Los gestos, las alertas y los importes se sincronizan por fotograma. El prototipo visual utiliza texto en pantalla y queda listo para ajustar el ritmo a una locución futura.

## Estado de la integración

| Componente | Estado |
| --- | --- |
| Paquete Viral Intelligence v1.0 | El enlace de Drive entregó un archivo HTML guardado de ChatGPT. Falta el ZIP original con README, código, nueva skill y adaptador. |
| Boettcher Motion Studio y Voice Studio | Presentes en la rama de origen bajo `.claude/skills/`. |
| Boettcher Viral Script Engine | La skill no está en el árbol de la rama de origen disponible. |
| SearXNG | `GET https://search.boettcher.cl/search?q=Boettcher&format=json` respondió HTTP 404 y HTML con el título “Boettcher SEO Search”. La raíz también respondió HTTP 404. Falta confirmar la URL base o el prefijo configurado. |
| Ollama | No se encontró el ejecutable ni un servicio local en `127.0.0.1:11434/api/tags`. |
| Remotion | La prueba usa un JSON propio. La compatibilidad con los JSON generados por Viral Intelligence queda pendiente de verificar con su adaptador original. |

## Referencias públicas

Consulta de noviembre de 2026. Las cifras corresponden al resultado público consultado. Las métricas cambian con el tiempo.

| Autor y tema | Plataforma | Fecha publicada | Visualizaciones | Me gusta |
| --- | --- | --- | ---: | ---: |
| Assetplan · Cobranza por arriendo impago | YouTube | 1 de abril de 2026 | 6.546 | 4 |
| AVLA · Protección de ingresos por arriendo | YouTube | 14 de marzo de 2023 | 196.412 | 2 |

Fuentes de las cifras [Assetplan](https://www.youtube.com/watch?v=duy_dUOYLko) y [AVLA](https://www.youtube.com/watch?v=dcaIPz9rF4s). Las búsquedas públicas de Reels sobre seguro de arriendo en Chile y arrendatarios morosos no entregaron publicaciones pertinentes cuyas métricas se pudieran comprobar. Los dos videos de YouTube se registran como referencias complementarias. La distribución publicitaria y la tasa de retención de estas referencias son desconocidas.

La primera referencia abre con el problema y explica quién gestiona la cobranza. La segunda abre con la protección del ingreso. Para Boettcher, el gancho seleccionado vuelve tangible el riesgo con un ejemplo en pesos.

## Diez ganchos comerciales

1. Si tu arrendatario deja de pagar tres meses, ¿quién pone el millón y medio?
2. Te pagaron el primer mes. El segundo no llegó. ¿Qué haces ahora?
3. El dividendo vence aunque el arriendo no llegue. ¿Con qué respaldo cuentas?
4. Si hoy te devuelven las llaves, ¿quién responde por las cuentas pendientes y los daños?
5. ¿Te alcanza el mes de garantía si el atraso dura tres meses?
6. Antes de entregar las llaves, ¿qué deja claro tu contrato si hay un impago?
7. Si estás comparando seguros de arriendo, hay dos preguntas que te conviene hacer. ¿Qué cubren y bajo qué condiciones?
8. Si vives lejos y el arriendo se atrasa, ¿quién hace seguimiento en tu nombre?
9. Incluso un buen arrendatario puede perder su ingreso. ¿Qué pasa entonces con el tuyo?
10. ¿Qué cambia entre gestionar una cobranza y contar con cobertura para esa deuda?

## Guion de 45 segundos

> Si tu arrendatario deja de pagar tres meses, ¿quién pone el millón y medio? Mira este ejemplo. Si el arriendo es de quinientos mil pesos, tres meses impagos suman un millón y medio de renta que dejas de recibir.
>
> El costo puede aumentar si quedan cuentas pendientes o daños. Antes de entregar las llaves, evalúa al arrendatario, revisa el contrato y define qué respaldo quieres tener.
>
> En Boettcher Propiedades, el Plan Garantizado contempla hasta seis meses de renta impaga. Protección Total contempla hasta doce meses, además de cobertura de cuentas básicas, daños y representación judicial, según el mandato.
>
> Comenta «PROTECCIÓN» y te contamos qué plan calza con tu propiedad.

Fuente comercial [Planes de administración de Boettcher Propiedades](https://boettcher.cl/administracion-de-propiedades/). La suma de renta impaga es un ejemplo aritmético. La cobertura de hasta doce meses corresponde a la renta impaga. Las demás coberturas tienen sus propias condiciones en el mandato.

## Storyboard

| Tiempo | Elementos y movimiento |
| --- | --- |
| 0–3 s | El propietario recibe el aviso y cambia de expresión. El arrendatario y el calendario se mantienen como capas independientes. |
| 3–10 s | Los tres meses cambian de estado a medida que el contador crece. La cifra queda identificada como ejemplo de rentas no percibidas. |
| 10–17 s | Entran una cuenta y un icono de daño; las ilustraciones se abren sobre el mismo fondo. |
| 17–25 s | Una carpeta pasa por tres etapas. Evaluación, contrato y respaldo antes de la entrega. |
| 25–39 s | Dos escudos comparan Plan Garantizado y Protección Total. Cada cobertura se activa cuando se menciona. |
| 39–45 s | El escudo y el calendario se reagrupan alrededor de la marca y de «Comenta PROTECCIÓN». |

## Ejecutar la prueba

Desde `boettcher-videos`, con las dependencias del proyecto instaladas:

```bash
npx tsc --noEmit
npx eslint src/viral-test
npx remotion compositions src/viral-test/index.tsx --props=./experiments/seguro-arriendo/preview.json
npx remotion render src/viral-test/index.tsx BoettcherSeguroArriendoPrueba out/seguro-arriendo.mp4 --props=./experiments/seguro-arriendo/preview.json --codec=h264 --is-production=false
```

Para exportar el storyboard visual completo:

```bash
npx remotion render src/viral-test/index.tsx BoettcherSeguroArriendoStoryboard out/seguro-arriendo-storyboard.mp4 --props=./experiments/seguro-arriendo/preview.json --codec=h264 --is-production=false
```
