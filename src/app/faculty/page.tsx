'use client';

import { useState, useEffect } from 'react';
import styles from './faculty.module.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function FacultyDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/faculty/analytics');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.container}>Loading analytics...</div>;
  if (!data || data.totalFeedbacks === 0) return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Faculty Dashboard</h2>
        <button onClick={() => window.location.href = '/'} className="btn-primary" style={{backgroundColor: 'var(--primary-gray)'}}>Logout</button>
      </header>
      <div className="card text-center">No feedback data available yet.</div>
    </div>
  );

  const trendData = {
    labels: data.trends.map((t: any) => t.label),
    datasets: [
      {
        label: 'Performance Rating',
        data: data.trends.map((t: any) => t.rating),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const sentimentData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [
          data.comments.filter((c: any) => c.sentiment === 'POSITIVE').length,
          data.comments.filter((c: any) => c.sentiment === 'NEUTRAL').length,
          data.comments.filter((c: any) => c.sentiment === 'NEGATIVE').length,
        ],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      },
    ],
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Faculty Dashboard</h2>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button 
            onClick={() => window.print()} 
            className="btn-primary" 
            style={{backgroundColor: 'var(--primary-blue)'}}
          >
            Print PDF Report
          </button>
          <button onClick={() => window.location.href = '/'} className="btn-primary" style={{backgroundColor: 'var(--primary-gray)'}}>Logout</button>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={`card ${styles.statCard}`}>
          <h4>Overall Rating</h4>
          <div className={styles.bigNumber}>{data.averages.overall}</div>
          <p>Out of 5.0</p>
        </div>
        <div className={`card ${styles.statCard}`}>
          <h4>Total Feedback</h4>
          <div className={styles.bigNumber}>{data.totalFeedbacks}</div>
          <p>Responses received</p>
        </div>
        <div className={`card ${styles.statCard}`}>
          <h4>Clarity</h4>
          <div className={styles.bigNumber}>{data.averages.teachingClarity}</div>
          <p>Teaching clarity score</p>
        </div>
        <div className={`card ${styles.statCard}`}>
          <h4>Engagement</h4>
          <div className={styles.bigNumber}>{data.averages.engagement}</div>
          <p>Student interaction score</p>
        </div>
      </div>

      {data.badges && data.badges.length > 0 && (
        <div className={styles.badgesSection}>
          {data.badges.map((badge: any, i: number) => (
            <div key={i} className={styles.badgeItem} title={badge.desc}>
              <span className={styles.badgeIcon}>{badge.icon}</span>
              <span className={styles.badgeName}>{badge.name}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.mainGrid}>
        <div className={`card ${styles.chartCard}`}>
          <h3>Performance Trend</h3>
          <div className={styles.chartWrapper}>
            <Line data={trendData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className={`card ${styles.aiCard}`}>
          <h3>AI Smart Insights 🧠</h3>
          <div className={styles.aiSummary}>
            <p>{data.aiInsights.summary}</p>
          </div>
          <h4>Actionable Suggestions:</h4>
          <ul className={styles.suggestionList}>
            {data.aiInsights.suggestions.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={`card ${styles.sentimentCard}`}>
          <h3>Sentiment Analysis</h3>
          <div className={styles.chartWrapper} style={{ height: '250px' }}>
            <Doughnut data={sentimentData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className={`card ${styles.commentsCard}`}>
          <h3>Student Comments (Anonymous)</h3>
          <div className={styles.commentList}>
            {data.comments.filter((c: any) => c.text).map((c: any) => (
              <div key={c.id} className={styles.commentItem}>
                <div className={styles.commentSide}>
                  <div className={styles.avatar} style={{ backgroundColor: `hsl(${c.id.charCodeAt(0) * 137.5 % 360}, 70%, 80%)` }}>
                    {c.subject.charAt(0)}
                  </div>
                </div>
                <div className={styles.commentBody}>
                  <div className={styles.commentHeader}>
                    <span className={styles.subjectTag}>{c.subject}</span>
                    <span className={`${styles.sentimentTag} ${styles[c.sentiment.toLowerCase()]}`}>
                      {c.sentiment}
                    </span>
                  </div>
                  <p>"{c.text}"</p>
                  <div className={styles.commentDate}>
                    {new Date(c.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
