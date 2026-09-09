# KILO

KILO es una plataforma web de competencia social que financia alimento para perros de refugios y organizaciones mediante personas, comunidades, empresas y creadores.

**Competí. Sumá kilos. Generá impacto.**

## Desarrollo

Requiere Node.js 20.9 o superior, Supabase CLI y credenciales TEST de Mercado Pago.

```powershell
npm install
npx supabase start
npx supabase db reset
Copy-Item .env.example .env.local
npm run dev
```

Abrir `http://localhost:3000`. Las campañas, organizaciones y evidencias del seed son datos ficticios de desarrollo; no deben utilizarse como información pública real.

## Verificaciones

```powershell
npm run typecheck
npm run lint
npm run build
```

La aplicación incluye ranking calculado desde donaciones aprobadas, perfiles públicos, donantes separados de participantes, donación general o por participante, Checkout Pro TEST con webhook idempotente y campañas de transparencia operativa.

El dominio usa `impact_units` como unidad genérica y centraliza su precio y etiqueta pública. Más contexto en [`docs/PRODUCT.md`](docs/PRODUCT.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/DATABASE.md`](docs/DATABASE.md), [`docs/PAYMENTS.md`](docs/PAYMENTS.md) y [`docs/ROADMAP.md`](docs/ROADMAP.md).
