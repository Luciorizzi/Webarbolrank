# Arquitectura

## Stack

- Next.js 16 con App Router
- React 19
- TypeScript estricto
- Tailwind CSS 4
- ESLint 9 con reglas recomendadas de Next.js
- npm

## Organización

- `src/app`: rutas, layouts y composición de páginas.
- `src/components/layout`: header y footer globales.
- `src/components/ranking`: presentación reutilizable del ranking.
- `src/components/donation`: selector, resumen y widget de financiación.
- `src/components/common`: piezas compartidas pequeñas.
- `src/config`: configuración central del dominio, incluido el precio.
- `src/data`: datos mock tipados y reemplazables.
- `src/lib`: funciones puras de moneda, donación y ranking.
- `src/types`: contratos TypeScript del dominio.
- `docs`: producto, arquitectura y roadmap.
- `legacy`: prototipo original, fuera de compilación.

## Decisiones iniciales

El precio por árbol vive en `src/config/finance.ts` como única constante monetaria del flujo. No se modela ni muestra una distribución fija por conceptos. Los cálculos derivados son funciones puras y las páginas son Server Components salvo las experiencias interactivas.

Los datos mock se separan por entidad: `participants.ts` contiene las identidades que compiten, `rankings.ts` arma datasets por período sin duplicarlas, `donations.ts` contiene donaciones y `campaigns.ts` modela campañas y actualizaciones. No se simulan respuestas de servidor, pagos ni persistencia.

`Participant`, `Donor` y `Donation` son contratos separados. Una donación referencia al participante solamente mediante `participantSlug`, que puede ser `null` para una donación general; no copia nombre, categoría ni métricas del participante. La identidad pública del donante se resuelve con `anonymous` y `donorName`. Los listados de últimas donaciones y top donantes se derivan de la misma fuente mock.

La selección de participante se mantiene como estado local en la experiencia de home. El query param `participant` permite enlaces compartibles y se valida contra los mocks. Los tabs y filtros operan exclusivamente en frontend. El resumen de donación es un diálogo accesible e informativo.

Las campañas tienen estados tipados (`fundraising`, `goal_reached`, `scheduled`, `completed`) y múltiples actualizaciones. Esta forma prepara el frontend para tablas relacionales futuras sin acoplarlo todavía a Supabase.

## Integraciones futuras

Supabase podrá aportar PostgreSQL, autenticación y políticas de acceso cuando exista un modelo de datos aprobado. Mercado Pago deberá integrarse desde servidor, crear preferencias con el total exacto y confirmar resultados mediante webhooks idempotentes; nunca se acreditará una donación desde una respuesta del navegador. Vercel será el destino natural de despliegue, con secretos por entorno y observabilidad antes de producción.
