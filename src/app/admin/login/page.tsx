"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="page">
      <div className="page-eyebrow">Private</div>
      <h1 className="page-title">Admin</h1>
      <form action={formAction} className="admin-login-form">
        <input
          type="password"
          name="passcode"
          placeholder="Passcode"
          aria-label="Passcode"
          autoFocus
          required
        />
        <button type="submit" disabled={pending}>
          {pending ? "Checking…" : "Enter"}
        </button>
        {state.error && <p className="admin-error">{state.error}</p>}
      </form>
    </div>
  );
}
