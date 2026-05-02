import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className="card text-center" style={{ maxWidth: '600px', margin: '0 auto', marginTop: '10vh' }}>
        <h1 className={styles.title}>CampusIQ Feedback</h1>
        <p className={styles.subtitle}>
          Anonymous, AI-Driven Faculty Feedback & Analytics System
        </p>

        <div className={styles.roleGrid}>
          <Link href="/login?role=STUDENT" className={`btn-primary ${styles.roleBtn}`}>
            Student Portal
          </Link>
          <Link href="/login?role=FACULTY" className={`btn-primary ${styles.roleBtn}`}>
            Faculty Portal
          </Link>
          <Link href="/login?role=HOD" className={`btn-primary ${styles.roleBtn}`}>
            HOD Portal
          </Link>
          <Link href="/login?role=PRINCIPAL" className={`btn-primary ${styles.roleBtn}`}>
            Principal Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
