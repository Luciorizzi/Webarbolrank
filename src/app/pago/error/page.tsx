import { PaymentResult } from "@/components/donation/PaymentResult";

export default function PaymentErrorPage() {
  return <PaymentResult eyebrow="Resultado del pago" title="No pudimos completar el pago" description="El pago no se completó. Podés volver al formulario e intentarlo nuevamente." retry />;
}
