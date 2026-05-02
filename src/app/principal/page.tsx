'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function PrincipalDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

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

  if (loading) return <div className={styles.container}>Loading institutional analytics...</div>;

  const filteredFaculty = data.facultyAnalytics.filter((f: any) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || f.dept === deptFilter;
    return matchesSearch && matchesDept;
  });

  const deptChartData = {
    labels: data.deptStats.map((d: any) => d.name),
    datasets: [
      {
        label: 'Department Average',
        data: data.deptStats.map((d: any) => d.rating),
        backgroundColor: '#1E3A8A',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Principal Dashboard - Institutional Overview</h2>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button 
            onClick={() => window.open('/api/admin/export', '_blank')} 
            className="btn-primary" 
            style={{backgroundColor: 'var(--accent-green)'}}
          >
            Export CSV
          </button>
          <button onClick={() => window.location.href = '/'} className="btn-primary" style={{backgroundColor: 'var(--primary-gray)'}}>Logout</button>
        </div>
      </header>

      <div className={styles.statsRow}>
        <div className={`card ${styles.summaryCard}`}>
          <h4>Institutional Average</h4>
          <div className={styles.bigNum}>
            {(data.deptStats.reduce((acc: any, d: any) => acc + parseFloat(d.rating), 0) / data.deptStats.length || 0).toFixed(2)}
          </div>
        </div>
        <div className={`card ${styles.summaryCard}`}>
          <h4>Total Feedback</h4>
          <div className={styles.bigNum}>
            {data.deptStats.reduce((acc: any, d: any) => acc + d.count, 0)}
          </div>
        </div>
        <div className={`card ${styles.summaryCard}`}>
          <h4>Departments</h4>
          <div className={styles.bigNum}>{data.deptStats.length}</div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={`card ${styles.chartCard}`}>
          <h3>Department Performance</h3>
          <div className={styles.chartWrapper}>
            <Bar data={deptChartData} options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              scales: { y: { min: 0, max: 5 } }
            }} />
          </div>
        </div>

        <div className={`card ${styles.infoCard}`}>
          <h3>Top Departments</h3>
          {data.deptStats.sort((a:any, b:any) => b.rating - a.rating).map((d: any, i: number) => (
            <div key={i} className={styles.deptItem}>
              <span>{d.name}</span>
              <strong>{d.rating}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className={styles.tableHeader}>
          <h3>All Faculty Performance Ranking</h3>
          <div className={styles.controls}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search faculty..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: '250px' }}
            />
            <select 
              className="input-field" 
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              style={{ maxWidth: '200px' }}
            >
              <option value="ALL">All Departments</option>
              {data.deptStats.map((d: any) => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Faculty Name</th>
              <th>Department</th>
              <th>Rating</th>
              <th>Feedbacks</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredFaculty.map((f: any) => (
              <tr key={f.id}>
                <td>{f.name}</td>
                <td>{f.dept}</td>
                <td><strong>{f.rating}</strong></td>
                <td>{f.count}</td>
                <td>
                  {parseFloat(f.rating) >= 4 ? <span className={styles.tagGood}>Excellent</span> : 
                   parseFloat(f.rating) >= 3 ? <span className={styles.tagAvg}>Satisfactory</span> : 
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
