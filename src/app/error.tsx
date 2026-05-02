'use client';

import { useEffect } from 'react';
import styles from './error.module.css';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>⚠️</div>
        <h2 className={styles.title}>Something went wrong</h2>
        <p className={styles.subtitle}>
          An unexpected error occurred. Please try again or contact your administrator if the issue persists.
        </p>
        <button onClick={reset} className={`btn-primary ${styles.retryBtn}`}>
          Try Again
        </button>
      </div>
    </div>
  );
}
