'use client';

import Header from '@/components/layout/Header';
import { useEffect, useState } from 'react';

export default function ArtistDashboard() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);

  // Session states
  const [photoBefore, setPhotoBefore] = useState('');
  const [photoAfter, setPhotoAfter] = useState('');
  const [notes, setNotes] = useState('');
  const [markCompleted, setMarkCompleted] = useState(true);
  const [sessionSuccess, setSessionSuccess] = useState('');
  const [sessionError, setSessionError] = useState('');
  const [savingSession, setSavingSession] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      window.location.href = '/login';
      return;
    }
    const u = JSON.parse(storedUser);
    if (u.role !== 'artist') {
      window.location.href = `/${u.role}`;
      return;
    }
    setUser(u);
    fetchData(u.id);
  }, []);

  const fetchData = async (artistId) => {
    try {
      const res = await fetch(`/api/bookings?artist_id=${artistId}&role=artist`);
      const data = await res.json();
      setBookings(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate revenue from sessions the artist is responsible for (total of completed jobs)
  const completedJobs = bookings.filter(b => b.status === 'COMPLETED');
  const totalArtistRevenue = completedJobs.reduce((sum, b) => sum + parseFloat(b.total_price), 0);

  const handleOpenSessionLog = async (booking) => {
    setSelectedBooking(booking);
    setPhotoBefore('');
    setPhotoAfter('');
    setNotes('');
    setSessionSuccess('');
    setSessionError('');

    // Fetch existing session if any
    try {
      const res = await fetch(`/api/sessions?booking_id=${booking.id}`);
      const data = await res.json();
      if (data) {
        setPhotoBefore(data.photo_before_url || '');
        setPhotoAfter(data.photo_after_url || '');
        setNotes(data.session_notes || '');
      }
    } catch (e) {
      console.error('Error fetching session details:', e);
    }
    setShowSessionModal(true);
  };

  const handleOpenCustomerLookup = async (booking) => {
    try {
      const res = await fetch(`/api/bookings?customer_id=${booking.customer_id}&role=customer`);
      const data = await res.json();
      // Find customer info
      setCustomerDetails({
        name: booking.customer_name,
        phone: data[0]?.phone || 'ไม่ระบุเบอร์โทร',
        email: data[0]?.email || 'ไม่ระบุอีเมล',
        history: data.filter(b => b.status === 'COMPLETED')
      });
      setShowCustomerModal(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSession = async (e) => {
    e.preventDefault();
    setSessionSuccess('');
    setSessionError('');
    setSavingSession(true);

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: selectedBooking.id,
          photo_before_url: photoBefore,
          photo_after_url: photoAfter,
          session_notes: notes,
          mark_completed: markCompleted
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');

      setSessionSuccess('บันทึกรายละเอียดงานและรูปภาพเรียบร้อย');
      fetchData(user.id);
      setTimeout(() => {
        setShowSessionModal(false);
        setSessionSuccess('');
      }, 1500);
    } catch (err) {
      setSessionError(err.message);
    } finally {
      setSavingSession(false);
    }
  };

  if (!user) return <p style={{ padding: '20px', textAlign: 'center' }}>กำลังโหลดแดชบอร์ดช่างสัก...</p>;

  return (
    <>
      <Header />
      <div className="container">
        <div style={{ marginBottom: '30px' }}>
          <h1>แดชบอร์ดช่างสัก</h1>
          <p style={{ color: 'var(--text-secondary)' }}>ช่างสักผู้ดูแลงาน: <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{user.full_name}</span></p>
        </div>

        {/* KPIs */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-value">{bookings.length}</span>
            <span className="kpi-label">จำนวนงานทั้งหมดที่ได้รับมอบหมาย</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-value" style={{ color: 'var(--pending)' }}>
              {bookings.filter(b => b.status === 'CONFIRMED').length}
            </span>
            <span className="kpi-label">งานจองที่รอดำเนินการสัก (รอยืนยันคิว)</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-value" style={{ color: 'var(--success)' }}>{completedJobs.length}</span>
            <span className="kpi-label">งานสักที่เสร็จสิ้นสมบูรณ์</span>
          </div>
          <div className="kpi-card" style={{ borderLeft: '3px solid var(--accent)' }}>
            <span className="kpi-value">฿{totalArtistRevenue.toLocaleString()}</span>
            <span className="kpi-label">รายได้จากงานสักที่ช่างรับผิดชอบโดยตรง</span>
          </div>
        </div>

        {/* Schedule List */}
        <div className="card">
          <h2 style={{ marginBottom: '15px' }}>ตารางคิวนัดหมายของฉัน</h2>
          {bookings.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', padding: '20px 0' }}>ไม่มีคิวนัดหมายที่มอบหมายให้คุณในระบบขณะนี้</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>รหัสคิว</th>
                    <th>ลูกค้า</th>
                    <th>สไตล์รอยสัก</th>
                    <th>วันเวลานัดหมาย</th>
                    <th>ราคาค่าสัก</th>
                    <th>สถานะ</th>
                    <th>การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td>{b.id}</td>
                      <td>
                        <button 
                          onClick={() => handleOpenCustomerLookup(b)} 
                          className="btn btn-secondary" 
                          style={{ padding: '4px 8px', fontSize: '0.8rem', display: 'inline-block' }}
                        >
                          👤 {b.customer_name}
                        </button>
                      </td>
                      <td>{b.tattoo_style}</td>
                      <td>{new Date(b.booking_date).toLocaleString('th-TH')}</td>
                      <td style={{ fontWeight: 'bold' }}>฿{b.total_price.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${
                          b.status === 'CONFIRMED' 
                            ? 'badge-success' 
                            : b.status === 'PENDING_VERIFY' 
                            ? 'badge-pending' 
                            : b.status === 'COMPLETED'
                            ? 'badge-success'
                            : 'badge-danger'
                        }`}>
                          {b.status === 'PENDING_VERIFY' && 'รอตรวจสอบมัดจำ'}
                          {b.status === 'CONFIRMED' && 'รอมาสักจริง'}
                          {b.status === 'COMPLETED' && 'เสร็จสิ้น'}
                          {b.status === 'REJECTED' && 'สลิปมีปัญหา'}
                        </span>
                      </td>
                      <td>
                        {b.status === 'CONFIRMED' && (
                          <button onClick={() => handleOpenSessionLog(b)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                            ลงเข็ม/ปิดคิวงาน
                          </button>
                        )}
                        {b.status === 'COMPLETED' && (
                          <button onClick={() => handleOpenSessionLog(b)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                            ดูบันทึก
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Session Modal */}
      {showSessionModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContext: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: 'var(--accent)' }}>บันทึกและรูปภาพงานสัก</h2>
              <button onClick={() => setShowSessionModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer', marginLeft: 'auto' }}>×</button>
            </div>

            {sessionError && <div style={{ color: 'var(--error)', marginBottom: '15px' }}>{sessionError}</div>}
            {sessionSuccess && <div style={{ color: 'var(--success)', marginBottom: '15px' }}>{sessionSuccess}</div>}

            <form onSubmit={handleSaveSession}>
              <div className="form-group">
                <label className="form-label">ลิงก์รูปภาพรอยแผลก่อนสัก (ผิวหนังดิบ)</label>
                <input 
                  type="url" 
                  className="form-control" 
                  placeholder="https://example.com/before.jpg" 
                  value={photoBefore}
                  onChange={(e) => setPhotoBefore(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">ลิงก์รูปภาพรอยสักหลังทำเสร็จสิ้น</label>
                <input 
                  type="url" 
                  className="form-control" 
                  placeholder="https://example.com/after.jpg" 
                  value={photoAfter}
                  onChange={(e) => setPhotoAfter(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">บันทึกเชิงเทคนิค (ชนิดสีที่ใช้, เบอร์เข็ม, หมายเหตุ)</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="เช่น สี Dynamic Black, เข็มเบอร์ 11RL สภาพผิวซึมสีดี"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>

              {selectedBooking?.status !== 'COMPLETED' && (
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="complete" 
                    checked={markCompleted}
                    onChange={(e) => setMarkCompleted(e.target.checked)}
                  />
                  <label htmlFor="complete" style={{ fontWeight: '500', cursor: 'pointer' }}>ต้องการปิดคิวงานการสักนี้ทันที (เมื่อสักเสร็จสิ้นแล้ว)</label>
                </div>
              )}

              <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowSessionModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>ปิด</button>
                {selectedBooking?.status !== 'COMPLETED' && (
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={savingSession}>
                    {savingSession ? 'กำลังบันทึก...' : 'บันทึกประวัติการสัก'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Lookup Details Modal */}
      {showCustomerModal && customerDetails && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: 'var(--accent)' }}>ข้อมูลรายละเอียดลูกค้า</h2>
              <button onClick={() => setShowCustomerModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <p><strong>ชื่อ-นามสกุล:</strong> {customerDetails.name}</p>
              <p><strong>เบอร์โทรติดต่อ:</strong> {customerDetails.phone}</p>
              <p><strong>อีเมล:</strong> {customerDetails.email}</p>
            </div>

            <h3 style={{ marginBottom: '10px' }}>ประวัติการทำรอยสักที่เสร็จสิ้นแล้ว:</h3>
            {customerDetails.history.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>ไม่มีประวัติการสักที่เสร็จสมบูรณ์มาก่อน</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                {customerDetails.history.map(h => (
                  <div key={h.id} style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <p><strong>วันเวลา:</strong> {new Date(h.booking_date).toLocaleDateString('th-TH')}</p>
                    <p><strong>ประเภทงานสัก:</strong> {h.tattoo_style}</p>
                    <p><strong>ราคางานสัก:</strong> ฿{h.total_price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setShowCustomerModal(false)} className="btn btn-secondary" style={{ width: '100%', marginTop: '20px' }}>ปิดหน้าต่าง</button>
          </div>
        </div>
      )}
    </>
  );
}
