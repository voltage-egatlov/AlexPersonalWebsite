"use client";

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page">
      <span className="stamp-tag">Incident Report</span>
      <h1 className="page-title" style={{ marginTop: 14 }}>
        Something Went Wrong
      </h1>
      <p>
        The page hit a snag loading this content. This is usually temporary
        — try again in a moment.
      </p>
      <button type="button" className="action-button" onClick={() => unstable_retry()}>
        Try again
      </button>
    </div>
  );
}
