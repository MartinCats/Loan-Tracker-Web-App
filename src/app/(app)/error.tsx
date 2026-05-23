"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="page-stack">
      <section className="panel empty-state empty-state--error">
        <h2>Something blocked loan data</h2>
        <p>{error.message || "Refresh and try again."}</p>
        <button className="form-button form-button--secondary" onClick={reset} type="button">
          Try again
        </button>
      </section>
    </main>
  );
}
