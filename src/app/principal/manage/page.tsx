'use client';

import { useState, useEffect } from 'react';
import styles from './manage.module.css';
import Link from 'next/link';

export default function ManageEntities() {
  const [activeTab, setActiveTab] = useState<'USERS' | 'DEPTS' | 'SUBJECTS'>('USERS');
  const [data, setData] = useState<any>({ users: [], depts: [], subjects: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/manage');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.container}>Loading management data...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/principal" className={styles.backBtn}>← Back to Dashboard</Link>
          <h2>Institutional Management</h2>
        </div>
      </header>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'USERS' ? styles.active : ''}`}
          onClick={() => setActiveTab('USERS')}
        >
          Users
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'DEPTS' ? styles.active : ''}`}
          onClick={() => setActiveTab('DEPTS')}
        >
          Departments
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'SUBJECTS' ? styles.active : ''}`}
          onClick={() => setActiveTab('SUBJECTS')}
        >
          Subjects
        </button>
      </div>

      <div className="card">
        {activeTab === 'USERS' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Manage Users</h3>
              <button className="btn-primary">Add New User</button>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u: any) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`${styles.roleTag} ${styles[u.role]}`}>{u.role}</span></td>
                    <td>{u.department?.name || 'N/A'}</td>
                    <td>
                      <button className={styles.editBtn}>Edit</button>
                      <button className={styles.deleteBtn}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'DEPTS' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Manage Departments</h3>
              <button className="btn-primary">Add Department</button>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Faculty Count</th>
                  <th>Student Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.depts.map((d: any) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{d._count.users}</td>
                    <td>{d._count.users}</td> {/* This is a simplified count for demo */}
                    <td>
                      <button className={styles.editBtn}>Edit</button>
                      <button className={styles.deleteBtn}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'SUBJECTS' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Manage Subjects</h3>
              <button className="btn-primary">Add Subject</button>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.subjects.map((s: any) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.department.name}</td>
                    <td>
                      <button className={styles.editBtn}>Edit</button>
                      <button className={styles.deleteBtn}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
