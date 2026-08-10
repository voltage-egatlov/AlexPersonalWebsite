"use client";

import { useActionState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { updateAboutContent, type AboutFormState } from "./actions";

const initialState: AboutFormState = { error: null, success: false };

export default function AboutForm({ content }: { content: SiteContent }) {
  const [state, formAction, pending] = useActionState(
    updateAboutContent,
    initialState
  );

  return (
    <form action={formAction} className="admin-about-form">
      <label className="admin-field">
        <span className="admin-field-label">About body</span>
        <textarea
          name="aboutBody"
          defaultValue={content.aboutBody}
          rows={10}
          placeholder="Separate paragraphs with a blank line."
        />
      </label>

      <label className="admin-field">
        <span className="admin-field-label">Contact — phone</span>
        <input type="text" name="contactPhone" defaultValue={content.contactPhone} />
      </label>

      <label className="admin-field">
        <span className="admin-field-label">Contact — email</span>
        <input type="text" name="contactEmail" defaultValue={content.contactEmail} />
      </label>

      <label className="admin-field">
        <span className="admin-field-label">Contact — Instagram label</span>
        <input
          type="text"
          name="contactInstagramLabel"
          defaultValue={content.contactInstagramLabel}
        />
      </label>

      <label className="admin-field">
        <span className="admin-field-label">Contact — Instagram URL</span>
        <input
          type="text"
          name="contactInstagramUrl"
          defaultValue={content.contactInstagramUrl}
          placeholder="https://instagram.com/…"
        />
      </label>

      <div className="admin-about-form-footer">
        <button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </button>
        {state.error && <p className="admin-error">{state.error}</p>}
        {state.success && !pending && (
          <p className="admin-about-saved">Saved.</p>
        )}
      </div>
    </form>
  );
}
