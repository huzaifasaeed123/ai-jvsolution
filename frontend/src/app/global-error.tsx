'use client';

/**
 * Last-resort boundary, for a failure in the root layout itself.
 *
 * At this point neither the app's layout nor its stylesheet can be assumed to
 * have rendered, so this file replaces <html> and <body> and carries its own
 * inline styling. Nothing here may depend on the design system.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '2rem',
          background: '#f6f5f2',
          color: '#14181f',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          textAlign: 'center',
        }}
      >
        <main style={{ maxWidth: '32rem' }}>
          <p
            style={{
              margin: 0,
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#a9782c',
            }}
          >
            Application error
          </p>
          <h1
            style={{
              margin: '0.75rem 0 0',
              fontSize: '1.875rem',
              lineHeight: 1.2,
              fontWeight: 600,
            }}
          >
            The application failed to start
          </h1>
          <p style={{ margin: '1rem 0 0', color: '#5b6673', lineHeight: 1.6 }}>
            This is unusual and has been logged. Reloading normally resolves it.
          </p>
          {error.digest && (
            <p
              style={{
                margin: '1rem 0 0',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '0.75rem',
                color: '#5b6673',
              }}
            >
              Reference: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: '2rem',
              padding: '0.7rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#ffffff',
              background: '#16324f',
              border: 0,
              borderRadius: '0.6rem',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
