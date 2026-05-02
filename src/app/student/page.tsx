'use client';

import { useState, useEffect } from 'react';
import styles from './student.module.css';

export default function StudentDashboard() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  // Feedback Form State
  const [facultyId, setFacultyId] = useState('');
  const [teachingClarity, setTeachingClarity] = useState(3);
  const [engagement, setEngagement] = useState(3);
  const [punctuality, setPunctuality] = useState(3);
  const [subjectKnowledge, setSubjectKnowledge] = useState(3);
  const [comments, setComments] = useState('');
  const [formStatus, setFormStatus] = useState({ loading: false, error: '', success: false });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/student/subjects');
      const data = await res.json();
      if (data.subjects) setSubjects(data.subjects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateToken = async (subjectId: string) => {
    try {
      setFormStatus({ loading: true, error: '', success: false });
      const res = await fetch('/api/feedback/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        const subject = subjects.find(s => s.id === subjectId);
        setSelectedSubject(subject);
        if (subject.faculty.length === 1) {
          setFacultyId(subject.faculty[0].id);
        }
      } else {
        alert(data.error || 'Failed to generate token');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFormStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyId) return alert('Please select a faculty member');

    setFormStatus({ loading: true, error: '', success: false });
    try {
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          facultyId,
          teachingClarity,
          engagement,
          punctuality,
          subjectKnowledge,
          comments
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        setFormStatus({ loading: false, error: '', success: true });
        setToken(null);
        setSelectedSubject(null);
        fetchSubjects(); // Refresh lists
      } else {
        setFormStatus({ loading: false, error: data.error, success: false });
      }
    } catch (err) {
      setFormStatus({ loading: false, error: 'Network error', success: false });
    }
  };

  if (loading) return <div className={styles.container}>Loading subjects...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Student Dashboard</h2>
        <button onClick={() => window.location.href = '/'} className="btn-primary" style={{backgroundColor: 'var(--primary-gray)'}}>Logout</button>
      </header>

      {!selectedSubject ? (
        <div className={styles.subjectsGrid}>
          {subjects.map(subject => (
            <div key={subject.id} className={`card ${styles.subjectCard}`}>
              <h3>{subject.name}</h3>
              <p>Faculty: {subject.faculty.map((f: any) => f.name).join(', ')}</p>
              
              {subject.canProvideFeedback ? (
                <button 
                  className="btn-primary"
                  onClick={() => generateToken(subject.id)}
                  style={{ marginTop: '1rem', width: '100%' }}
                >
                  Provide Anonymous Feedback
                </button>
              ) : (
                <div className={styles.claimedBadge}>
                  Feedback Submitted for this month
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={`card ${styles.feedbackFormCard}`}>
          <h3>Feedback for {selectedSubject.name}</h3>
          
          <div className={styles.anonymityAlert}>
            🔒 Your submission is completely anonymous. The system uses a one-time cryptographic token to verify your eligibility without linking to your identity.
          </div>

          {formStatus.error && <div className={styles.errorAlert}>{formStatus.error}</div>}

          <form onSubmit={submitFeedback} className={styles.form}>
            {selectedSubject.faculty.length > 1 ? (
              <div className={styles.formGroup}>
                <label>Select Faculty</label>
                <select className="input-field" value={facultyId} onChange={e => setFacultyId(e.target.value)} required>
                  <option value="">-- Select Faculty --</option>
                  {selectedSubject.faculty.map((f: any) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className={styles.formGroup}>
              <label>Teaching Clarity (1-5)</label>
              <input type="range" min="1" max="5" value={teachingClarity} onChange={e => setTeachingClarity(parseInt(e.target.value))} />
              <span>{teachingClarity}</span>
            </div>

            <div className={styles.formGroup}>
              <label>Engagement (1-5)</label>
              <input type="range" min="1" max="5" value={engagement} onChange={e => setEngagement(parseInt(e.target.value))} />
              <span>{engagement}</span>
            </div>

            <div className={styles.formGroup}>
              <label>Punctuality (1-5)</label>
              <input type="range" min="1" max="5" value={punctuality} onChange={e => setPunctuality(parseInt(e.target.value))} />
              <span>{punctuality}</span>
            </div>

            <div className={styles.formGroup}>
              <label>Subject Knowledge (1-5)</label>
              <input type="range" min="1" max="5" value={subjectKnowledge} onChange={e => setSubjectKnowledge(parseInt(e.target.value))} />
              <span>{subjectKnowledge}</span>
            </div>

            <div className={styles.formGroup}>
              <label>Comments (Optional)</label>
              <div className={styles.commentWrapper}>
                <textarea 
                  className="input-field" 
                  rows={4} 
                  value={comments} 
                  onChange={e => setComments(e.target.value)}
                  placeholder="Share your detailed feedback anonymously..."
                ></textarea>
                <button 
                  type="button" 
                  className={styles.voiceBtn}
                  onClick={() => {
                    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                    if (!SpeechRecognition) {
                      alert('Voice recognition not supported in this browser.');
                      return;
                    }
                    const recognition = new SpeechRecognition();
                    recognition.onresult = (event: any) => {
                      const transcript = event.results[0][0].transcript;
                      setComments(prev => prev ? prev + ' ' + transcript : transcript);
                    };
                    recognition.start();
                  }}
                  title="Speak your feedback"
                >
                  🎤
                </button>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="button" className="btn-primary" style={{backgroundColor: 'var(--primary-gray)'}} onClick={() => { setSelectedSubject(null); setToken(null); }}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={formStatus.loading}>
                {formStatus.loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
