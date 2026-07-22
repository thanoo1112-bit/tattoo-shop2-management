'use client';

import Header from '@/components/layout/Header';
import { useState } from 'react';
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName, phone })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
      }

      setSuccess('สมัครสมาชิกสำเร็จ! กำลังนำทางไปหน้าเข้าสู่ระบบ...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
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
          <h2 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--accent)' }}>สมัครสมาชิก</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
            ร่วมเป็นครอบครัวและจองคิวสักกับ 157 TATTOO
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

          {success && (
            <div style={{
              backgroundColor: 'rgba(46, 204, 113, 0.1)',
              border: '1px solid var(--success)',
              color: 'var(--success)',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">ชื่อ-นามสกุลจริง</label>
              <input
                type="text"
                className="form-control"
                placeholder="สมมุติ รักดี"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">เบอร์โทรศัพท์ติดต่อ</label>
              <input
                type="tel"
                className="form-control"
                placeholder="08XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">อีเมล</label>
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
              {loading ? 'กำลังลงทะเบียน...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            มีบัญชีผู้ใช้งานอยู่แล้ว? <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>เข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </>
  );
}
