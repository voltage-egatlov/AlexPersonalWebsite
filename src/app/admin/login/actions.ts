"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  isValidPasscode,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/session";

export type LoginState = { error: string | null };

// Best-effort in-memory throttle: not shared across instances/regions and
// resets on cold start, but it's enough to blunt a naive automated guesser
// against a single-admin passcode without needing external infra.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, number[]>();

function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  attempts.set(key, recent);
  return recent.length >= MAX_ATTEMPTS;
}

function recordFailedAttempt(key: string) {
  const recent = attempts.get(key) ?? [];
  recent.push(Date.now());
  attempts.set(key, recent);
}

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const headerList = await headers();
  const key = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(key)) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const passcode = String(formData.get("passcode") ?? "");

  if (!isValidPasscode(passcode)) {
    recordFailedAttempt(key);
    return { error: "Wrong passcode." };
  }

  attempts.delete(key);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  redirect("/admin");
}
