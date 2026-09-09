import { NextRequest, NextResponse } from "next/server";
import { InvalidWebhookSignatureError, MPNotFoundError, WebhookSignatureValidator } from "mercadopago";
import { createPaymentClient } from "@/lib/mercadopago/client";
import { amountsMatch, mapMercadoPagoStatus, resolveDonationStatus } from "@/lib/mercadopago/payment";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function logDevelopmentWebhook(message: string, details: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.info(`[Mercado Pago webhook] ${message}`, details);
  }
}

function webhookResponse(body: Record<string, unknown>, status = 200, details: Record<string, unknown> = {}) {
  logDevelopmentWebhook("respuesta enviada", { ...details, httpStatus: status });
  return NextResponse.json(body, { status });
}

function readSignatureInputs(request: NextRequest) {
  return {
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    dataId: request.nextUrl.searchParams.get("data.id"),
    secret: process.env.MERCADOPAGO_WEBHOOK_SECRET,
  };
}

function logSignatureDiagnostics(dataId: string | null, xSignature: string | null, xRequestId: string | null, signatureValid: boolean) {
  logDevelopmentWebhook("diagnóstico de firma", {
    notificationSource: "modern-payment",
    dataId,
    dataIdType: typeof dataId,
    dataIdLength: dataId?.length ?? 0,
    hasSignature: Boolean(xSignature),
    hasRequestId: Boolean(xRequestId),
    xSignatureLength: xSignature?.length ?? 0,
    xRequestIdLength: xRequestId?.length ?? 0,
    signatureValid,
  });
}

export async function POST(request: NextRequest) {
  const eventType = request.nextUrl.searchParams.get("type");
  const legacyTopic = request.nextUrl.searchParams.get("topic");
  const { dataId, secret: webhookSecret, xRequestId, xSignature } = readSignatureInputs(request);

  logDevelopmentWebhook("notificación recibida", {
    type: eventType ?? legacyTopic ?? "unknown",
    hasSignature: Boolean(xSignature),
    hasRequestId: Boolean(xRequestId),
    dataId,
  });

  if (legacyTopic) {
    logDevelopmentWebhook("notificación legacy ignorada", { topic: legacyTopic });
    return webhookResponse({ received: true, ignored: true, reason: "legacy notification ignored" }, 200, { topic: legacyTopic });
  }

  if (eventType !== "payment") {
    logDevelopmentWebhook("tipo de notificación ignorado", { type: eventType ?? "unknown" });
    return webhookResponse({ received: true, ignored: true }, 200, { type: eventType ?? "unknown" });
  }

  if (!dataId) return webhookResponse({ error: "Falta el identificador del pago." }, 400, { type: eventType });

  if (!webhookSecret?.trim()) {
    console.error("Webhook de Mercado Pago sin MERCADOPAGO_WEBHOOK_SECRET configurado.");
    return webhookResponse({ error: "Webhook no configurado." }, 503, { type: eventType, dataId });
  }

  try {
    WebhookSignatureValidator.validate({
      xSignature,
      xRequestId,
      dataId,
      secret: webhookSecret,
    });
    logSignatureDiagnostics(dataId, xSignature, xRequestId, true);
    logDevelopmentWebhook("firma validada", { signatureValid: true, dataId });
  } catch (error) {
    const reason = error instanceof InvalidWebhookSignatureError ? error.reason : "unknown";
    logSignatureDiagnostics(dataId, xSignature, xRequestId, false);
    logDevelopmentWebhook("firma rechazada", { signatureValid: false, reason, dataId });
    return webhookResponse({ error: "Firma inválida." }, 401, { type: eventType, dataId, signatureValid: false });
  }

  try {
    const paymentId = dataId;
    logDevelopmentWebhook("pago en procesamiento", { paymentId });
    let payment;
    try {
      payment = await createPaymentClient().get({ id: paymentId });
    } catch (error) {
      if (error instanceof MPNotFoundError) {
        logDevelopmentWebhook("payment not found / simulated notification ignored", { paymentId });
        return webhookResponse({ ok: true, ignored: true, reason: "payment_not_found" }, 200, { paymentId, ignored: true });
      }
      throw error;
    }

    if (payment.live_mode === true) {
      console.error("Se rechazó un pago productivo en una integración configurada exclusivamente para TEST.");
      return webhookResponse({ error: "Solo se aceptan pagos de TEST." }, 400, { paymentId, mercadoPagoStatus: payment.status });
    }

    const donationId = payment.external_reference;
    if (!donationId) return webhookResponse({ error: "El pago no tiene external_reference." }, 400, { paymentId, mercadoPagoStatus: payment.status });

    const supabase = createServiceRoleSupabaseClient();
    const { data: donation, error: findError } = await supabase.from("donations").select("id, amount, status, payment_reference").eq("id", donationId).maybeSingle();
    if (findError) throw findError;
    logDevelopmentWebhook("donación consultada", {
      paymentId,
      mercadoPagoStatus: payment.status,
      externalReference: donationId,
      donationFound: Boolean(donation),
      previousStatus: donation?.status ?? null,
    });
    if (!donation) return webhookResponse({ error: "No existe la donación asociada." }, 404, { paymentId, externalReference: donationId, donationFound: false });

    if (payment.currency_id !== "ARS" || !amountsMatch(donation.amount, payment.transaction_amount)) {
      console.error("Pago de Mercado Pago rechazado por monto o moneda inconsistentes.", { donationId, paymentId });
      return webhookResponse({ error: "El pago no coincide con la donación." }, 400, { paymentId, externalReference: donationId, donationFound: true, previousStatus: donation.status });
    }

    const mappedStatus = mapMercadoPagoStatus(payment.status);
    if (!mappedStatus) {
      console.warn("Estado de Mercado Pago no reconocido; no se modificó la donación.", { donationId, paymentId, status: payment.status });
      return webhookResponse({ received: true, ignored: true }, 200, { paymentId, externalReference: donationId, donationFound: true, previousStatus: donation.status, mercadoPagoStatus: payment.status });
    }

    const nextStatus = resolveDonationStatus(donation.status, mappedStatus);
    if (donation.status === nextStatus && donation.payment_reference === paymentId) {
      logDevelopmentWebhook("donación ya procesada", {
        paymentId,
        externalReference: donationId,
        mercadoPagoStatus: payment.status,
        donationStatus: nextStatus,
      });
      return webhookResponse({ received: true, idempotent: true }, 200, {
        paymentId,
        externalReference: donationId,
        donationFound: true,
        previousStatus: donation.status,
        nextStatus,
        mercadoPagoStatus: payment.status,
      });
    }

    const { error: updateError } = await supabase.from("donations").update({ status: nextStatus, payment_reference: paymentId }).eq("id", donation.id);
    if (updateError) throw updateError;
    logDevelopmentWebhook("donación actualizada", {
      paymentId,
      externalReference: donationId,
      mercadoPagoStatus: payment.status,
      donationStatus: nextStatus,
    });
    return webhookResponse({ received: true }, 200, {
      paymentId,
      externalReference: donationId,
      donationFound: true,
      previousStatus: donation.status,
      nextStatus,
      mercadoPagoStatus: payment.status,
    });
  } catch (error) {
    console.error("No se pudo procesar el webhook de Mercado Pago:", error instanceof Error ? error.message : "error desconocido");
    return webhookResponse({ error: "No se pudo procesar la notificación." }, 500, { type: eventType, dataId });
  }
}
