import "server-only";
import { MercadoPagoConfig, Payment, Preference, User } from "mercadopago";

type AuthenticatedMercadoPagoUser = {
  id: number;
  isTestUser: boolean;
};

let authenticatedUserRequest: Promise<AuthenticatedMercadoPagoUser> | null = null;

function getAccessToken(): string {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    throw new Error("Falta configurar MERCADOPAGO_ACCESS_TOKEN con una credencial de TEST.");
  }
  return accessToken;
}

function createConfig(): MercadoPagoConfig {
  return new MercadoPagoConfig({
    accessToken: getAccessToken(),
    options: { timeout: 10_000, maxRetries: 2 },
  });
}

export function createPreferenceClient(): Preference {
  return new Preference(createConfig());
}

export function createPaymentClient(): Payment {
  return new Payment(createConfig());
}

export async function getAuthenticatedMercadoPagoUser(): Promise<AuthenticatedMercadoPagoUser> {
  if (!authenticatedUserRequest) {
    authenticatedUserRequest = new User(createConfig()).get().then((user) => {
      if (typeof user.id !== "number") throw new Error("Mercado Pago no devolvió el usuario autenticado.");
      return { id: user.id, isTestUser: user.tags?.includes("test_user") ?? false };
    });
    authenticatedUserRequest.catch(() => {
      authenticatedUserRequest = null;
    });
  }

  return authenticatedUserRequest;
}

export function getPublicAppUrl(): string {
  const value = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!value) throw new Error("Falta configurar NEXT_PUBLIC_APP_URL con una URL pública HTTPS.");

  const url = new URL(value);
  if (url.protocol !== "https:" || ["localhost", "127.0.0.1", "::1"].includes(url.hostname)) {
    throw new Error("NEXT_PUBLIC_APP_URL debe ser una URL pública HTTPS accesible por Mercado Pago.");
  }
  return url.origin;
}
