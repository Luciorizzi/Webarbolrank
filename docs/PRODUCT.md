# Producto

## Propuesta

KILO es una plataforma de competencia social orientada a financiar alimento para perros de refugios y organizaciones. Creadores, streamers, personas, comunidades y empresas compiten públicamente por generar más impacto.

Su tagline es: **Competí. Sumá kilos. Generá impacto.**

La pregunta central es: **¿quién sumó más kilos?** Cada aporte confirmado suma kilogramos de alimento al participante elegido; una donación general financia el mismo objetivo sin alterar el ranking de participantes.

## Unidad de impacto y precio final

La interfaz presenta kilogramos de alimento aportados, mientras el dominio conserva el nombre genérico `impact_units`. En este producto, `impact_units` representa kg. La equivalencia está centralizada con `KG_PER_DONATION_UNIT`, de modo que precio y conversión puedan cambiar sin acoplar componentes, ranking o Mercado Pago.

Una unidad de donación cuesta inicialmente ARS 5.000 finales y equivale a 1 kg. No se agregan comisiones ni cargos al continuar. Aproximadamente el 10% de lo recaudado sostiene la operación, coordinación, logística, desarrollo y mantenimiento de la plataforma; este dato se integra de forma secundaria en Cómo funciona y no se desglosa durante el checkout.

Los logros se derivan de la cantidad de impacto mediante una configuración central. No se persisten badges que puedan calcularse. Cada participante muestra progreso hacia su próximo umbral y su perfil conserva el historial completo de logros obtenidos.

## Participantes, donantes y campañas

`Participant` representa a quien compite; `Donor`, a la persona que aporta; `Donation`, al aporte. Son entidades separadas. El donante puede usar un alias o aparecer como Anónimo.

Novedades concentra la transparencia operativa: campañas, refugios u organizaciones, ubicaciones, objetivos en kg, montos, alimento, fechas, cronología y evidencia. `impact_goal` es la única meta de alimento de cada campaña. Las organizaciones y campañas del seed están identificadas como datos ficticios de desarrollo y no deben presentarse como casos reales.

## Confirmación

El frontend solo envía `impactUnits`. El servidor calcula el importe, crea una donación `pending` y genera Checkout Pro TEST. Solo un webhook firmado y verificado contra la API de Mercado Pago puede cambiar su estado. El ranking suma exclusivamente donaciones `approved`.
