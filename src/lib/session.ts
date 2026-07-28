import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE_NAME = "alex_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const PAYLOAD = "admin";

function sign(value: string) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET!)
    .update(value)
    .digest("hex");
}

export function createSessionToken() {
  return `${PAYLOAD}.${sign(PAYLOAD)}`;
}

export function isValidSessionToken(token: string | undefined | null) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// Constant-time passcode check. Hashing both sides to a fixed-length digest
// before comparing means the check doesn't leak the passcode's length or
// leak how many leading characters matched via response timing.
export function isValidPasscode(input: string) {
  const expected = process.env.ADMIN_PASSCODE;
  if (!input || !expected) return false;
  const a = createHmac("sha256", "passcode-check").update(input).digest();
  const b = createHmac("sha256", "passcode-check").update(expected).digest();
  return timingSafeEqual(a, b);
}

// Defense-in-depth for server actions: the /admin route is already gated by
// proxy.ts, but actions can be invoked directly, so mutating actions verify
// the session themselves too instead of relying solely on route matching.
export async function requireAdminSession() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  if (!isValidSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value)) {
    throw new Error("Unauthorized");
  }
}
