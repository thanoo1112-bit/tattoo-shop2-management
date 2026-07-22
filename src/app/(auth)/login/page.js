'use client';

import Header from '@/components/layout/Header';
import { useState } from 'react';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }

      // Store user session in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'admin') {
        window.location.href = '/admin';
      } else if (data.user.role === 'artist') {
        window.location.href = '/artist';
      } else {
        window.location.href = '/customer';
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 150px)' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '420px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--accent)' }}>เข้าสู่ระบบ</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
            ยินดีต้อนรับกลับสู่ระบบ 157 TATTOO
          </p>

          {error && (
            <div style={{
              backgroundColor: 'rgba(231, 76, 60, 0.1)',
              border: '1px solid var(--error)',
              color: 'var(--error)',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">อีเมลของคุณ</label>
              <input
                type="email"
                className="form-control"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">รหัสผ่าน</label>
              <input
                type="password"
                className="form-control"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }} disabled={loading}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            ยังไม่มีบัญชีใช่หรือไม่? <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>สมัครสมาชิกใหม่</Link>
          </p>
          
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>บัญชีจำลองสำหรับการทดสอบ:</p>
            <ul style={{ paddingLeft: '15px' }}>
              <li>แอดมิน: admin@157tattoo.com / admin123</li>
              <li>ช่างสัก: artist1@157tattoo.com / artist123</li>
              <li>ลูกค้า: customer@gmail.com / customer123</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
