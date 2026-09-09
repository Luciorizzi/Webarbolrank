# Pagos con Mercado Pago TEST

La integración pertenece al producto KILO. El texto de la preferencia describe el aporte en kg y no depende de nombres históricos de la marca.

## Alcance

Esta integración usa Checkout Pro y está preparada exclusivamente para el entorno de prueba de Mercado Pago. El backend crea una donación `pending`, calcula el total a razón de ARS 5.000 por unidad de donación y usa su UUID como `external_reference`. `KG_PER_DONATION_UNIT` define cuántos kg representa esa unidad; actualmente vale 1. El navegador nunca decide el monto ni acredita una donación.

Las páginas `/pago/exito`, `/pago/pendiente` y `/pago/error` son informativas. La única vía que actualiza el estado es el webhook firmado, después de consultar el Payment a la API de Mercado Pago y validar referencia, monto, moneda y modo TEST.

## Variables de entorno

Agregar a `.env.local`:

```dotenv
MERCADOPAGO_ACCESS_TOKEN=<access token de TEST>
MERCADOPAGO_WEBHOOK_SECRET=<firma secreta de Webhooks>
MERCADOPAGO_ENV=test
NEXT_PUBLIC_APP_URL=https://xxxxx.trycloudflare.com
```

El access token y la firma son secretos de servidor: nunca deben llevar el prefijo `NEXT_PUBLIC_`. `MERCADOPAGO_ENV=test` selecciona `sandbox_init_point` para el desarrollo local con credenciales TEST; el futuro entorno productivo usará `MERCADOPAGO_ENV=production` e `init_point`. `NEXT_PUBLIC_APP_URL` debe ser el origen HTTPS público, sin barra final, que apunte a la aplicación local mediante un túnel.

## Pruebas sin dinero real

1. Crear o abrir una aplicación en el panel de desarrolladores de Mercado Pago.
2. En Credenciales, copiar únicamente el access token de TEST. No usar credenciales de producción.
3. En Webhooks de la aplicación, configurar la URL `https://xxxxx.trycloudflare.com/api/mercadopago/webhook`, seleccionar eventos de pagos y copiar la firma secreta.
4. Completar las tres variables anteriores en `.env.local` y reiniciar `npm run dev`.
5. Levantar la aplicación local en `http://localhost:3000`.
6. Exponer ese puerto con una URL HTTPS temporal. Por ejemplo, si Cloudflare Tunnel ya está instalado: `cloudflared tunnel --url http://localhost:3000`. Con ngrok ya instalado: `ngrok http 3000`.
7. Copiar el origen público generado a `NEXT_PUBLIC_APP_URL`, actualizar también la URL del webhook en Mercado Pago y reiniciar Next.js si cambió la variable.
8. Crear dos usuarios de prueba separados en Mercado Pago: uno vendedor asociado a la aplicación y otro comprador. Abrir Checkout Pro en una sesión privada donde no esté autenticado el vendedor.
9. Elegir una donación, abrir el resumen y pulsar **IR AL PAGO**.
10. Ingresar el correo del comprador de prueba y usar exclusivamente tarjetas y datos de prueba publicados por Mercado Pago. No usar una cuenta, tarjeta ni dinero reales.
11. Para simular un pago aprobado, usar la tarjeta de prueba y el nombre de titular/documento que Mercado Pago indique para aprobación (`APRO` en la documentación vigente). Comprobar en `donations` que el webhook guardó `payment_reference` y cambió el estado a `approved`.
12. Abrir el ranking y comprobar que esas unidades de impacto se sumaron. Las lecturas públicas siguen filtrando solo `status = 'approved'`.
13. Repetir con el valor de prueba indicado por Mercado Pago para pago pendiente (`CONT`, si continúa vigente). La donación debe permanecer `pending` y no sumar al ranking.
14. Repetir con un valor de rechazo documentado, por ejemplo fondos insuficientes (`FUND`, si continúa vigente). La donación debe quedar `rejected` y no sumar.

Los valores, tarjetas y documentos de prueba pueden cambiar; confirmar siempre los datos vigentes en la sección oficial de tarjetas de prueba del país y nunca sustituirlos por medios reales.

## Flujo del checkout

`POST /api/checkout` acepta solamente:

```json
{
  "participantSlug": "opcional",
  "donorName": "opcional si anonymous es true",
  "anonymous": false,
  "impactUnits": 5
}
```

El endpoint rechaza campos adicionales, valida el rango y múltiplo permitido de kg, exige un alias de 2 a 60 caracteres cuando corresponde, confirma que el participante exista y esté activo, y crea la donación antes de solicitar la preferencia. El servidor calcula `(impactUnits / KG_PER_DONATION_UNIT) * DONATION_UNIT_PRICE`; el cliente no envía el importe. La Preference conserva las `back_urls`, pero no define `notification_url`: las notificaciones se administran exclusivamente desde Tus integraciones. El endpoint devuelve la URL de checkout en la propiedad `init_point`: `sandbox_init_point` de Mercado Pago cuando `MERCADOPAGO_ENV=test`, o `init_point` cuando vale `production`.

## Flujo del webhook

`POST /api/mercadopago/webhook`:

1. valida `x-signature` con la firma secreta y una tolerancia temporal;
2. toma el identificador de pago sin confiar en el estado del payload;
3. consulta el Payment mediante el SDK oficial;
4. rechaza pagos con `live_mode = true`;
5. resuelve la donación mediante `external_reference`;
6. compara exactamente `transaction_amount` y moneda `ARS`;
7. mapea el estado documentado y actualiza la misma fila.

Las referencias de preferencia y pago tienen índices únicos. Una notificación duplicada sobre el mismo pago no crea donantes ni donaciones, y un evento tardío `pending` o `rejected` no degrada una donación ya aprobada. `refunded` sí puede retirar una donación previamente aprobada del ranking.

## Diagnóstico

- Si falta `MERCADOPAGO_ACCESS_TOKEN`, checkout responde con un error de configuración y no genera un checkout falso.
- Si `NEXT_PUBLIC_APP_URL` es localhost, HTTP o no existe, checkout se detiene: Mercado Pago necesita callbacks públicos HTTPS.
- Si falta la firma secreta o la firma entrante es inválida, el webhook no consulta ni actualiza datos.
- Los errores del servidor registran identificadores y causas generales, nunca tokens ni claves.
