import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.badge}>Next-Gen Academic Analytics</div>
        <h1 className={styles.title}>Anonymous AI-Driven <span className={styles.gradientText}>Faculty Feedback</span></h1>
        <p className={styles.subtitle}>
          Elevating institutional performance through intelligent insights and complete student privacy.
        </p>
      </div>

      <div className={styles.roleGrid}>
        <Link href="/login?role=STUDENT" className={styles.card}>
          <div className={styles.cardIcon}>🎓</div>
          <h3>Student Portal</h3>
          <p>Submit anonymous feedback and help improve teaching quality.</p>
          <span className={styles.linkText}>Get Started →</span>
        </Link>
        <Link href="/login?role=FACULTY" className={styles.card}>
          <div className={styles.cardIcon}>👨‍🏫</div>
          <h3>Faculty Portal</h3>
          <p>Access your personalized analytics, trends, and AI insights.</p>
          <span className={styles.linkText}>View Dashboard →</span>
        </Link>
        <Link href="/login?role=HOD" className={styles.card}>
          <div className={styles.cardIcon}>🏢</div>
          <h3>HOD Portal</h3>
          <p>Monitor department performance and compare faculty metrics.</p>
          <span className={styles.linkText}>Enter Portal →</span>
        </Link>
        <Link href="/login?role=PRINCIPAL" className={styles.card}>
          <div className={styles.cardIcon}>🏛️</div>
          <h3>Principal Portal</h3>
          <p>Institutional-wide overview and strategic performance reports.</p>
          <span className={styles.linkText}>Executive View →</span>
        </Link>
      </div>
      
      <footer className={styles.footer}>
        Built with ❤️ for CampusIQ Excellence
      </footer>
    </div>
  );
}
