import { NextResponse } from "next/server";
import { formatImpactKg, KG_PER_DONATION_UNIT, MAX_IMPACT_KG } from "@/config/finance";
import { calculateDonationTotal } from "@/lib/donation";
import { createPreferenceClient, getPublicAppUrl } from "@/lib/mercadopago/client";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type CheckoutInput = {
  participantSlug?: string;
  donorName?: string;
  anonymous: boolean;
  impactUnits: number;
};

type PreferenceDiagnostics = {
  client_id?: string;
  collector_id?: number;
  live_mode?: boolean;
};

type MercadoPagoEnvironment = "test" | "production";

function getMercadoPagoEnvironment(): MercadoPagoEnvironment {
  const environment = process.env.MERCADOPAGO_ENV?.trim();
  if (environment !== "test" && environment !== "production") {
    throw new Error("MERCADOPAGO_ENV debe ser test o production.");
  }
  return environment;
}

function logPreferenceResult(preference: PreferenceDiagnostics & {
  id?: string;
}, externalReference: string, mercadoPagoEnvironment: MercadoPagoEnvironment, checkoutUrlType: "init_point") {
  if (process.env.NODE_ENV !== "development") return;

  console.info("Mercado Pago preference created:", {
    status: "created",
    preference_id: preference.id ?? null,
    external_reference: externalReference,
    mercadoPagoEnvironment,
    checkoutUrlType,
    collector_id: preference.collector_id ?? null,
    client_id: preference.client_id ?? null,
    live_mode: preference.live_mode ?? null,
  });
}

function parseCheckoutInput(value: unknown): CheckoutInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("El cuerpo de la solicitud no es válido.");
  const body = value as Record<string, unknown>;
  const allowed = new Set(["participantSlug", "donorName", "anonymous", "impactUnits"]);
  if (Object.keys(body).some((key) => !allowed.has(key))) throw new Error("La solicitud contiene campos no permitidos.");
  if (typeof body.anonymous !== "boolean") throw new Error("anonymous debe ser booleano.");
  if (!Number.isInteger(body.impactUnits) || (body.impactUnits as number) < KG_PER_DONATION_UNIT || (body.impactUnits as number) > MAX_IMPACT_KG || (body.impactUnits as number) % KG_PER_DONATION_UNIT !== 0) {
    throw new Error(`impactUnits debe representar entre ${KG_PER_DONATION_UNIT} y ${MAX_IMPACT_KG} kg en unidades de aporte válidas.`);
  }
  if (body.participantSlug !== undefined && typeof body.participantSlug !== "string") throw new Error("participantSlug no es válido.");
  if (body.donorName !== undefined && typeof body.donorName !== "string") throw new Error("donorName no es válido.");
  const donorName = body.donorName?.trim() as string | undefined;
  if (!body.anonymous && (!donorName || donorName.length < 2 || donorName.length > 60)) {
    throw new Error("El nombre o alias debe tener entre 2 y 60 caracteres.");
  }
  const participantSlug = (body.participantSlug as string | undefined)?.trim();
  return { participantSlug: participantSlug || undefined, donorName, anonymous: body.anonymous, impactUnits: body.impactUnits as number };
}

export async function POST(request: Request) {
  let input: CheckoutInput;
  try {
    input = parseCheckoutInput(await request.json());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Solicitud inválida." }, { status: 400 });
  }

  try {
    // Validate every external dependency before creating donor or donation rows.
    const appUrl = getPublicAppUrl();
    const mercadoPagoEnvironment = getMercadoPagoEnvironment();
    const preferenceClient = createPreferenceClient();
    const supabase = createServiceRoleSupabaseClient();
    let participantId: string | null = null;
    if (input.participantSlug) {
      const { data, error } = await supabase.from("participants").select("id").eq("slug", input.participantSlug).eq("active", true).maybeSingle();
      if (error) throw error;
      if (!data) return NextResponse.json({ error: "El participante no existe o no está activo." }, { status: 400 });
      participantId = data.id;
    }

    let donorId: string | null = null;
    if (!input.anonymous) {
      const { data, error } = await supabase.from("donors").insert({ display_name: input.donorName }).select("id").single();
      if (error) throw error;
      donorId = data.id;
    }

    const amount = calculateDonationTotal(input.impactUnits);
    const { data: donation, error: donationError } = await supabase.from("donations").insert({
      donor_id: donorId,
      participant_id: participantId,
      anonymous: input.anonymous,
      impact_units: input.impactUnits,
      amount,
      status: "pending",
      payment_provider: "mercadopago",
    }).select("id").single();
    if (donationError) throw donationError;

    const preference = await preferenceClient.create({
      body: {
        items: [{ id: donation.id, title: `Donación de ${formatImpactKg(input.impactUnits)} de alimento`, quantity: 1, currency_id: "ARS", unit_price: amount }],
        external_reference: donation.id,
        back_urls: { success: `${appUrl}/pago/exito`, pending: `${appUrl}/pago/pendiente`, failure: `${appUrl}/pago/error` },
        auto_return: "approved",
      },
      requestOptions: { idempotencyKey: donation.id },
    });
    if (!preference.id) throw new Error("Mercado Pago no devolvió un identificador de preferencia.");
    const checkoutUrlType = "init_point";
    const checkoutUrl = preference.init_point;
    if (!checkoutUrl) throw new Error(`Mercado Pago no devolvió ${checkoutUrlType} para el ambiente ${mercadoPagoEnvironment}.`);
    logPreferenceResult(preference, donation.id, mercadoPagoEnvironment, checkoutUrlType);

    const { error: referenceError } = await supabase.from("donations").update({ preference_id: preference.id }).eq("id", donation.id);
    if (referenceError) throw referenceError;
    return NextResponse.json({ init_point: checkoutUrl });
  } catch (error) {
    console.error("No se pudo crear el checkout de Mercado Pago:", error instanceof Error ? error.message : "error desconocido");
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo iniciar el pago." }, { status: 500 });
  }
}
