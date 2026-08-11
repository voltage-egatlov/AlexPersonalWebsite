"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import "./globals.css";

// Catches failures in the root layout itself (e.g. Sidebar) that error.tsx
// can't reach, since error.tsx is rendered *inside* that layout. This file
// replaces the root layout entirely when active, so it must define its own
// <html>/<body> — kept on-brand with the rest of the case-file system
// rather than falling back to Next's default unstyled error screen.
export default function GlobalError({
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
    <html lang="en">
      <body>
        <div className="page">
          <span className="stamp-tag">Incident Report</span>
          <h1 className="page-title">Something Went Wrong</h1>
          <p>
            The site hit a snag loading this page. This is usually
            temporary — try again in a moment.
          </p>
          <button
            type="button"
            className="action-button"
            onClick={() => unstable_retry()}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
