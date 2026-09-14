import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { InvalidWebhookSignatureError, MPNotFoundError, WebhookSignatureValidator } from "mercadopago";
import { createPaymentClient, getAuthenticatedMercadoPagoUser } from "@/lib/mercadopago/client";
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

function getMercadoPagoEnvironment(): "test" | "production" {
  const environment = process.env.MERCADOPAGO_ENV?.trim();
  if (environment !== "test" && environment !== "production") {
    throw new Error("MERCADOPAGO_ENV debe ser test o production.");
  }
  return environment;
}

function getAllowedTestBuyerIds(): Set<string> {
  const configuredIds = process.env.MERCADOPAGO_TEST_BUYER_IDS?.split(",").map((id) => id.trim()).filter(Boolean) ?? [];
  if (configuredIds.length === 0 || configuredIds.some((id) => !/^\d+$/.test(id))) {
    throw new Error("MERCADOPAGO_TEST_BUYER_IDS debe contener al menos un ID numérico válido.");
  }
  return new Set(configuredIds);
}

function parseSignatureHeader(xSignature: string | null) {
  let ts: string | null = null;
  let v1: string | null = null;

  for (const part of xSignature?.split(",") ?? []) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = part.slice(0, separatorIndex).trim().toLowerCase();
    const value = part.slice(separatorIndex + 1).trim();
    if (!value) continue;

    if (key === "ts") ts = value;
    if (key === "v1") v1 = value;
  }

  return { ts, v1 };
}

function buildManualSignatureDiagnostics(
  dataId: string | null,
  xSignature: string | null,
  xRequestId: string | null,
  secret: string,
) {
  const { ts, v1 } = parseSignatureHeader(xSignature);
  const manifest = ts
    ? `${dataId ? `id:${dataId};` : ""}${xRequestId ? `request-id:${xRequestId};` : ""}ts:${ts};`
    : null;
  const computedHash = manifest ? createHmac("sha256", secret).update(manifest).digest("hex") : null;
  const manualSignatureValid = Boolean(
    computedHash &&
      v1 &&
      Buffer.byteLength(computedHash) === Buffer.byteLength(v1) &&
      timingSafeEqual(Buffer.from(computedHash), Buffer.from(v1)),
  );

  return { manifest, manualSignatureValid, ts, v1Length: v1?.length ?? 0 };
}

function logSignatureDiagnostics(
  dataId: string | null,
  xSignature: string | null,
  xRequestId: string | null,
  sdkSignatureValid: boolean,
  manualDiagnostics: ReturnType<typeof buildManualSignatureDiagnostics> | null,
) {
  logDevelopmentWebhook("diagnóstico de firma", {
    notificationSource: "modern-payment",
    dataId,
    dataIdType: typeof dataId,
    dataIdLength: dataId?.length ?? 0,
    hasSignature: Boolean(xSignature),
    hasRequestId: Boolean(xRequestId),
    xSignatureLength: xSignature?.length ?? 0,
    requestId: xRequestId,
    requestIdLength: xRequestId?.length ?? 0,
    ts: manualDiagnostics?.ts ?? null,
    v1Length: manualDiagnostics?.v1Length ?? 0,
    manifest: manualDiagnostics?.manifest ?? null,
    sdkSignatureValid,
    manualSignatureValid: manualDiagnostics?.manualSignatureValid ?? null,
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

  const manualDiagnostics =
    process.env.NODE_ENV === "development"
      ? buildManualSignatureDiagnostics(dataId, xSignature, xRequestId, webhookSecret)
      : null;

  try {
    WebhookSignatureValidator.validate({
      xSignature,
      xRequestId,
      dataId,
      secret: webhookSecret,
    });
    logSignatureDiagnostics(dataId, xSignature, xRequestId, true, manualDiagnostics);
    logDevelopmentWebhook("firma validada", { signatureValid: true, dataId });
  } catch (error) {
    const reason = error instanceof InvalidWebhookSignatureError ? error.reason : "unknown";
    logSignatureDiagnostics(dataId, xSignature, xRequestId, false, manualDiagnostics);
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

    const mercadoPagoEnvironment = getMercadoPagoEnvironment();
    const authenticatedUser = await getAuthenticatedMercadoPagoUser();
    const collectorIdMatches = String(payment.collector_id ?? "") === String(authenticatedUser.id);
    const payerId = payment.payer?.id === undefined || payment.payer.id === null ? null : String(payment.payer.id);
    const payerIdAllowed = mercadoPagoEnvironment === "production" ? true : Boolean(payerId && getAllowedTestBuyerIds().has(payerId));

    logDevelopmentWebhook("contexto de ambiente validado", {
      paymentId,
      paymentStatus: payment.status,
      liveMode: payment.live_mode,
      collectorId: payment.collector_id ?? null,
      authenticatedUserId: authenticatedUser.id,
      authenticatedUserIsTest: authenticatedUser.isTestUser,
      payerId,
      payerIdAllowed,
    });

    if (!collectorIdMatches) {
      return webhookResponse({ error: "El pago pertenece a otro vendedor." }, 403, {
        paymentId,
        collectorId: payment.collector_id ?? null,
        authenticatedUserId: authenticatedUser.id,
      });
    }

    if (mercadoPagoEnvironment === "test" && (!authenticatedUser.isTestUser || !payerIdAllowed)) {
      return webhookResponse({ error: "El pago no pertenece al contexto TEST permitido." }, 403, {
        paymentId,
        authenticatedUserIsTest: authenticatedUser.isTestUser,
        payerIdAllowed,
      });
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

    const amountMatch = amountsMatch(donation.amount, payment.transaction_amount);
    const currencyMatch = payment.currency_id === "ARS";
    if (!currencyMatch || !amountMatch) {
      console.error("Pago de Mercado Pago rechazado por monto o moneda inconsistentes.", { donationId, paymentId });
      return webhookResponse({ error: "El pago no coincide con la donación." }, 400, {
        paymentId,
        externalReference: donationId,
        donationFound: true,
        externalReferenceMatch: true,
        amountMatch,
        currencyMatch,
        previousStatus: donation.status,
      });
    }

    const mappedStatus = mapMercadoPagoStatus(payment.status);
    if (!mappedStatus) {
      console.warn("Estado de Mercado Pago no reconocido; no se modificó la donación.", { donationId, paymentId, status: payment.status });
      return webhookResponse({ received: true, ignored: true }, 200, { paymentId, externalReference: donationId, donationFound: true, previousStatus: donation.status, mercadoPagoStatus: payment.status });
    }

    const nextStatus = resolveDonationStatus(donation.status, mappedStatus);
    logDevelopmentWebhook("pago y donación validados", {
      paymentId,
      paymentStatus: payment.status,
      liveMode: payment.live_mode,
      collectorId: payment.collector_id ?? null,
      authenticatedUserId: authenticatedUser.id,
      authenticatedUserIsTest: authenticatedUser.isTestUser,
      payerIdAllowed,
      externalReferenceMatch: true,
      amountMatch,
      currencyMatch,
      previousDonationStatus: donation.status,
      newDonationStatus: nextStatus,
    });
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
