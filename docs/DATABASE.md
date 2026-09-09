# Base de datos

PostgreSQL en Supabase es la fuente de verdad. El frontend no persiste posiciones ni totales.

## Modelo

- `participants`: entidades que compiten.
- `donors`: identidad mínima y separada de quien aporta.
- `donations`: `impact_units`, importe, estado y referencias opcionales a participante/donante/pago.
- `campaigns`: objetivo monetario, `impact_goal` expresado en kg y, opcionalmente, `delivery_date`.
- `campaign_updates` y `campaign_evidence`: cronología y evidencia operativa.

Un `participant_id` nulo representa una donación general. `preference_id` y `payment_reference` tienen índices únicos parciales. No se almacenan datos de tarjeta. `impact_units` se mantiene como entero y actualmente representa kg completos; una futura precisión fraccionaria deberá modelarse como gramos enteros.

## Ranking

`get_ranking(period)` acepta `historical`, `month` o `today`, suma `donations.impact_units` exclusivamente cuando `status = 'approved'` y calcula posición con `dense_rank`. La diferencia para superar a la posición anterior se deriva en frontend como `previousUnits - currentUnits + 1`.

`get_recent_donations` y `get_top_donors` exponen proyecciones públicas seguras con `impact_units`; nunca revelan IDs de donantes ni referencias de pago.

## Seguridad y migraciones

RLS está activo en todas las tablas. No existe escritura pública para donantes o donaciones; el backend validado usa service role. La migración `202609030001_generic_impact_units.sql` renombra columnas sin destruir datos y recrea los RPCs. `202609030002_campaign_impact_goal_kg.sql` consolida la meta de alimento en `impact_goal` y elimina `food_kg` después de preservar su valor.

El seed contiene únicamente campañas y organizaciones ficticias de desarrollo relacionadas con alimento para refugios. No debe ejecutarse en producción.
