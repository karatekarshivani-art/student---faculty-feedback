import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.subtitle}>
          The page you're looking for doesn't exist or you may not have permission to access it.
        </p>
        <Link href="/" className={`btn-primary ${styles.homeBtn}`}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
