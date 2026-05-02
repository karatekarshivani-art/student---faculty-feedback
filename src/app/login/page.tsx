'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './login.module.css';

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const roleParam = searchParams.get('role');
  const initialRole = ['STUDENT', 'FACULTY', 'HOD', 'PRINCIPAL'].includes(roleParam || '') 
    ? (roleParam as string) 
    : 'STUDENT';

  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Redirect based on role
      switch (data.user.role) {
        case 'STUDENT': router.push('/student'); break;
        case 'FACULTY': router.push('/faculty'); break;
        case 'HOD': router.push('/hod'); break;
        case 'PRINCIPAL': router.push('/principal'); break;
        default: router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginWrapper}>
        <div className={styles.brand}>
          <h1>CampusIQ</h1>
          <p>Feedback & Analytics</p>
        </div>
        
        <div className={`card ${styles.loginCard}`}>
          <h2 className={styles.title}>{role.toLowerCase()} login</h2>
          
          {error && <div className={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Institutional Email</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="email@college.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required 
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
              />
            </div>

            <div className={styles.roleTabs}>
              {['STUDENT', 'FACULTY', 'HOD', 'PRINCIPAL'].map(r => (
                <button 
                  key={r}
                  type="button"
                  className={`${styles.roleTab} ${role === r ? styles.active : ''}`}
                  onClick={() => setRole(r)}
                >
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{marginTop: '1rem'}}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
          
          <p className={styles.footerText}>
            Protected by CampusIQ Secure Anonymity Layer
          </p>
        </div>
        
        <Link href="/" className={styles.backLink}>← Back to Home</Link>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div>Loading login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
