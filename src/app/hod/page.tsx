'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function HODDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.container}>Loading department analytics...</div>;

  const chartData = {
    labels: data.facultyAnalytics.map((f: any) => f.name),
    datasets: [
      {
        label: 'Average Rating',
        data: data.facultyAnalytics.map((f: any) => f.rating),
        backgroundColor: '#3B82F6',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>HOD Dashboard - Dept. Analytics</h2>
        <button onClick={() => window.location.href = '/'} className="btn-primary" style={{backgroundColor: 'var(--primary-gray)'}}>Logout</button>
      </header>

      <div className={styles.mainGrid}>
        <div className={`card ${styles.chartCard}`}>
          <h3>Faculty Performance Comparison</h3>
          <div className={styles.chartWrapper}>
            <Bar data={chartData} options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              indexAxis: 'y' as const,
              scales: { x: { min: 0, max: 5 } }
            }} />
          </div>
        </div>

        <div className={styles.infoColumn}>
          <div className={`card ${styles.summaryCard}`}>
            <h4>Department Summary</h4>
            <div className={styles.summaryStat}>
              <span>Faculty Members:</span>
              <strong>{data.facultyAnalytics.length}</strong>
            </div>
            <div className={styles.summaryStat}>
              <span>Top Performer:</span>
              <strong style={{color: 'var(--accent-green)'}}>{data.facultyAnalytics[0]?.name || 'N/A'}</strong>
            </div>
            <div className={styles.summaryStat}>
              <span>Average Rating:</span>
              <strong>{(data.facultyAnalytics.reduce((acc: any, f: any) => acc + parseFloat(f.rating), 0) / data.facultyAnalytics.length || 0).toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Detailed Faculty List</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Faculty Name</th>
              <th>Rating</th>
              <th>Feedbacks</th>
              <th>Sentiment (P / N / N)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.facultyAnalytics.map((f: any) => (
              <tr key={f.id}>
                <td>{f.name}</td>
                <td><strong>{f.rating}</strong></td>
                <td>{f.count}</td>
                <td>
                  <span className={styles.sentDot} style={{backgroundColor: 'var(--accent-green)'}}></span> {f.sentiment.positive} / 
                  <span className={styles.sentDot} style={{backgroundColor: 'var(--accent-yellow)'}}></span> {f.sentiment.neutral} / 
                  <span className={styles.sentDot} style={{backgroundColor: 'var(--accent-red)'}}></span> {f.sentiment.negative}
                </td>
                <td>
                  {parseFloat(f.rating) >= 4 ? <span className={styles.tagGood}>Good</span> : 
                   parseFloat(f.rating) >= 3 ? <span className={styles.tagAvg}>Average</span> : 
                   <span className={styles.tagPoor}>Alert</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
