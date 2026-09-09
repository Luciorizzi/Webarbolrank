import { PaymentResult } from "@/components/donation/PaymentResult";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import type { DonationStatus } from "@/types/database";

const RESULT_COPY: Record<DonationStatus, { title: string; description: string }> = {
  approved: { title: "Pago confirmado", description: "La acreditación fue confirmada y el aporte ya suma al ranking." },
  pending: { title: "Pago recibido", description: "Estamos confirmando la acreditación con Mercado Pago." },
  rejected: { title: "No pudimos confirmar el pago", description: "Mercado Pago informó que el pago fue rechazado o cancelado." },
  refunded: { title: "Pago reintegrado", description: "Mercado Pago informó que el importe fue devuelto." },
};

function readExternalReference(value: string | string[] | undefined): string | null {
  const reference = Array.isArray(value) ? value[0] : value;
  return reference && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(reference) ? reference : null;
}

export default async function PaymentSuccessPage({ searchParams }: PageProps<"/pago/exito">) {
  const externalReference = readExternalReference((await searchParams).external_reference);
  let status: DonationStatus = "pending";

  if (externalReference) {
    const { data } = await createServiceRoleSupabaseClient()
      .from("donations")
      .select("status")
      .eq("id", externalReference)
      .maybeSingle();
    if (data) status = data.status;
  }

  const result = RESULT_COPY[status];
  return <PaymentResult eyebrow="Resultado del pago" title={result.title} description={result.description} />;
}
