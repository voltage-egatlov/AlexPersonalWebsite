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
