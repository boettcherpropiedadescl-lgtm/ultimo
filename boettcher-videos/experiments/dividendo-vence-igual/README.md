# Piloto · El dividendo vence igual

[Investigación](research.md) · [Rúbrica de ganchos](hooks.md) · [Storyboard JSON](storyboard.json) · [Recursos](assets-rights.md) · [Control de calidad](qa.md)

## Investigación y criterio editorial

- La Ley 21.461 establece un procedimiento monitorio para cobrar rentas de arrendamiento y pedir la restitución del inmueble. Su tramitación depende del caso. El guion evita prometer fechas de restitución o recuperación del dinero. [Biblioteca del Congreso Nacional](https://www.bcn.cl/leychile/navegar?idNorma=1178004)
- El atraso impacta el presupuesto cuando se depende del ingreso por arriendo para cubrir gastos. Las coberturas comerciales deben revisarse contra el mandato y sus condiciones. La tabla de administración y otra página de Boettcher publican topes distintos para el Plan Garantizado. Este piloto indica los tipos de cobertura y deja los topes para la comparación del mandato. [Tabla de administración](https://boettcher.cl/administracion-de-propiedades/) · [Detalle de coberturas](https://boettcher.cl/que-cubre-la-administracion-de-propiedades/)
- Una póliza inscrita ante la CMF muestra exclusiones y exigencias de documentación. Sirve para fundamentar la pregunta por las condiciones de activación. La póliza citada corresponde a un producto distinto de los planes de Boettcher. [Póliza inscrita ante la CMF](https://www.cmfchile.cl/sitio/seil/pagina/rgpol/muestra_documento.php?ABH89548=37G70IE7IX10663J35MN4ABCIV864A4ABCIV864ALPKA0ABPRX)
- La búsqueda pública de Reels chilenos sobre arriendo impago y seguros no aportó métricas verificables para publicaciones pertinentes.

## Diez ganchos

1. **El arriendo no llegó. El dividendo vence igual.**
2. **Tu arrendatario te pide quince días más. ¿Con qué cubres este mes?**
3. **Antes de entregar las llaves, hazte esta pregunta. ¿Quién cobra si dejan de pagarte?**
4. Tu presupuesto tenía dos fechas. El pago del arriendo y el vencimiento del dividendo. ¿Qué pasa si solo se cumple una?
5. Si mañana te devuelven las llaves con cuentas pendientes, ¿qué dice tu contrato?
6. Firmaste el contrato y entregaste las llaves. ¿Qué respaldo tienes si falta el primer pago?
7. Un mes sin arriendo significa dos cosas. Menos ingresos y las mismas obligaciones.
8. ¿Qué pasa con tus gastos mientras haces gestiones para recuperar el departamento?
9. Si comparas dos planes de arriendo, pregunta primero en qué momento se activa cada cobertura.
10. Antes de contar con el arriendo para pagar tus gastos, decide cómo enfrentarías un atraso.

El **1** abre con una consecuencia inmediata que se entiende sin cifras. El **2** funciona como alternativa dialogada para un anuncio. El **3** se presta para una versión educativa que lleva directo a una pregunta que el propietario puede resolver.

## Guion de 45 segundos y propuesta visual

[Texto para locución](guion.txt)

| Tiempo | Narración | Motion graphics |
| --- | --- | --- |
| 0–4 s | El arriendo no llegó. El dividendo vence igual. | Dos trayectos del presupuesto representan el ingreso y el gasto. El primero se corta y el segundo alcanza el vencimiento. Tipografía y pulsos de sonido marcan la diferencia. |
| 4–10 s | Si cuentas con esa plata para cubrir tus gastos, un atraso ya te cambia el presupuesto. | Los trayectos se mantienen en cuadro. Se dibuja un corchete entre sus estados y aparece «El presupuesto cambia». |
| 10–21 s | Y el problema puede ir más allá de la renta. Si quedan cuentas impagas o daños, sube el costo. Cobrar y recuperar el departamento puede requerir gestiones judiciales. | Del espacio entre los trayectos nacen tres fichas. Cuenta, reparación y documento. Se apilan con una ligera inclinación y dan paso al contrato. |
| 21–30 s | Antes de entregar las llaves, revisa qué cubre el respaldo, cuándo se activa y quién se encarga del cobro. | Una llave y sus tres dientes activan, uno por uno, «Qué cubre», «Cuándo se activa» y «Quién cobra». |
| 30–40 s | En Boettcher Propiedades administramos tu arriendo. Según el plan, puedes tener cobertura de rentas impagas, cuentas básicas y daños, además de respaldo legal. | Las fichas se ordenan en un módulo de administración. Aparece «Según el plan y el mandato» durante la explicación de las coberturas. |
| 40–45 s | ¿Quieres comparar tus opciones? Comenta «ARRIENDO» y hablemos. | La llave y los trayectos se reagrupan alrededor de la marca y del llamado a comentar. |

El MP4 de revisión incluye solo los primeros diez segundos, con diseño sonoro original y texto animado. Los tiempos del guion completo son editoriales y se ajustan a la grabación aprobada.

### Texto para la publicación

Si el pago del arriendo se atrasa y el dividendo vence, tu presupuesto cambia. Antes de firmar, pregunta qué cubre tu respaldo, cuándo se activa y quién se encarga del cobro. Comenta **ARRIENDO** para comparar las opciones de administración de tu departamento. Las coberturas dependen del plan y del mandato contratado.

## Verificación de componentes

| Componente | Resultado |
| --- | --- |
| Viral Intelligence | Pasaron las siete pruebas incluidas. El guion por plantilla y la escritura de proyectos en SQLite funcionan. El JSON generado abrió en la composición `BoettcherIntelligenceReel`. |
| SearXNG | La consulta JSON a `search.boettcher.cl` devolvió HTTP 404 con HTML. |
| Ollama | El servicio local no respondió en el puerto 11434. |
| Voice Studio | Pasaron las cuatro pruebas incluidas de segmentación, formato SRT y autorización. Los pesos del modelo y el directorio configurado de perfiles no estaban disponibles en este entorno. El piloto usa diseño sonoro y texto. |
| Motion Studio | El piloto tiene su propia entrada Remotion. Pasaron TypeScript y el análisis del código nuevo. |
| Creative Studio | Instalada como skill principal. Pasaron las cinco pruebas del ZIP y las siete del runtime compartido. El paquete trae estructura, ejemplos y rúbrica para la revisión editorial. |
| Viral Script Engine | El ZIP no trae una copia independiente de la skill. La revisión editorial del piloto usa la estructura y la rúbrica de Creative Studio. |

## Reproducir el piloto

Desde `boettcher-videos`, con las dependencias del proyecto instaladas:

```bash
mkdir -p out
npx remotion render src/creative-pilot/index.tsx BoettcherDividendoPiloto out/dividendo-video.mp4 --codec=h264 --crf=17 --is-production=false
python3 experiments/dividendo-vence-igual/audio.py out/dividendo-sonido.wav
ffmpeg -i out/dividendo-video.mp4 -i out/dividendo-sonido.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 160k -movflags +faststart out/BoettcherDividendo-Piloto.mp4
```
