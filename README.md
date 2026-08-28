# Plantados

Base web para una plataforma de competencia social que financia árboles mediante comunidades, creadores y streamers.

## Desarrollo

Requiere Node.js 20.9 o superior.

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Verificaciones

```bash
npm run typecheck
npm run lint
npm run build
```

## Alcance actual

La aplicación contiene una home responsive, rankings mock por período, filtros, perfiles públicos, selección de participante, resumen de donación y campañas de Novedades. No procesa pagos, no persiste datos y no está conectada a Supabase.

El prototipo HTML original se conserva en `legacy/index.html` únicamente como referencia visual.

Más contexto en [`docs/PRODUCT.md`](docs/PRODUCT.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) y [`docs/ROADMAP.md`](docs/ROADMAP.md).
