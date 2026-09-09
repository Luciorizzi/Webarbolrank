# Arquitectura

KILO es el nombre público actual del producto. La marca se centraliza en `src/config/brand.ts` para metadata y superficies globales.

## Stack

- Next.js 16 con App Router y React 19
- TypeScript estricto y Tailwind CSS 4
- Supabase PostgreSQL con `@supabase/supabase-js`
- Mercado Pago Checkout Pro mediante SDK oficial, exclusivamente TEST

## Organización

- `src/app`: rutas, metadata, páginas y Route Handlers.
- `src/components`: layout, ranking, donaciones, campañas y componentes comunes.
- `src/config`: precio y etiquetas centralizadas de la unidad de impacto.
- `src/lib/data`: consultas y mapeo entre filas SQL y dominio.
- `src/lib/supabase`: clientes de navegador, servidor y service role.
- `src/lib/mercadopago`: integración server-only y reglas puras de pagos.
- `src/types`: contratos de dominio y base de datos.
- `supabase`: historial de migraciones y seed de desarrollo.

## Dominio reutilizable

La persistencia y la lógica usan `impact_units` e `impact_goal`. En este producto ambos representan kg, pero conservan nombres genéricos. `DONATION_UNIT_PRICE` y `KG_PER_DONATION_UNIT` separan precio y conversión; el servidor sigue siendo autoridad del importe. `Participant`, `Donor` y `Donation` permanecen separados.

Las páginas consultan Supabase desde Server Components y entregan datos serializables a componentes interactivos. La selección de participante y el resumen viven en estado cliente. `impact_goal` es la meta de kg de campaña; la antigua duplicación `food_kg` se elimina preservando previamente su valor. `delivery_date` continúa siendo opcional.

Los milestones se configuran en `src/config/milestones.ts` y se derivan en `src/lib/impact.ts`; no requieren tabla ni estado duplicado. La barra usa CSS y respeta `prefers-reduced-motion`. Los mapeos de datos validan métricas finitas y registran valores inválidos en servidor antes de usar un fallback seguro.

Por ahora `impact_units` continúa como entero porque `KG_PER_DONATION_UNIT = 1` y todos los aportes generan kg enteros. No se usan floats para cálculos financieros. Si la conversión necesitara fracciones, la siguiente evolución será persistir gramos enteros, no números de punto flotante.

## Pagos y seguridad

`/api/checkout` valida `impactUnits`, calcula el monto y crea la donación `pending`. `/api/mercadopago/webhook` valida firma, consulta el Payment real y actualiza la misma fila de forma idempotente. Los redirects nunca acreditan pagos. Access token, firma de Webhooks y service role son server-only.

La paleta mantiene superficies de grafito y tipografía competitiva, con ámbar y naranja cálido como acentos. La configuración `allowedDevOrigins` del túnel es exclusiva del entorno de desarrollo.
