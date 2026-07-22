'use client';

import Header from '@/components/layout/Header';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [gallery, setGallery] = useState([]);

  // Form inputs
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  
  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [newGalleryStyle, setNewGalleryStyle] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryArtist, setNewGalleryArtist] = useState('');

  // Slip verification modal
  const [selectedBookingForVerify, setSelectedBookingForVerify] = useState(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      window.location.href = '/login';
      return;
    }
    const u = JSON.parse(storedUser);
    if (u.role !== 'admin') {
      window.location.href = `/${u.role}`;
      return;
    }
    setUser(u);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Bookings
      const bookRes = await fetch('/api/bookings');
      const bookData = await bookRes.json();
      setBookings(bookData);

      // Fetch users
      const usersRes = await fetch('/api/artists'); // we can also retrieve all users, let's load users list
      const usersData = await usersRes.json();
      // Combine artists with seed users for rendering
      setUsers(usersData);

      // Services
      const srvRes = await fetch('/api/services');
      const srvData = await srvRes.json();
      setServices(srvData);

      // Gallery
      const galRes = await fetch('/api/gallery');
      const galData = await galRes.json();
      setGallery(galData);
    } catch (e) {
      console.error(e);
    }
  };

  // Financial calculations
  const totalShopRevenue = bookings
    .filter(b => b.status === 'COMPLETED' || b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + parseFloat(b.total_price), 0);

  const pendingVerificationList = bookings.filter(b => b.status === 'PENDING_VERIFY');

  const handleVerifyPayment = async (bookingId, confirmStatus) => {
    try {
      const res = await fetch('/api/admin/bookings/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, status: confirmStatus })
      });
      if (res.ok) {
        setVerifyModalOpen(false);
        fetchData();
      } else {
        alert('เกิดข้อผิดพลาดในการตรวจสอบ');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newServiceName,
          description: newServiceDesc,
          base_price: newServicePrice
        })
      });
      if (res.ok) {
        setNewServiceName('');
        setNewServiceDesc('');
        setNewServicePrice('');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddGallery = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newGalleryTitle,
          style: newGalleryStyle,
          image_url: newGalleryUrl,
          artist_id: newGalleryArtist
        })
      });
      if (res.ok) {
        setNewGalleryTitle('');
        setNewGalleryStyle('');
        setNewGalleryUrl('');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return <p style={{ padding: '20px', textAlign: 'center' }}>กำลังโหลดแผงผู้ดูแลระบบ...</p>;

  return (
    <>
      <Header />
      <div className="dashboard-grid">
        {/* Sidebar Nav */}
        <aside className="sidebar">
          <div>
            <h3 style={{ marginBottom: '20px', color: 'var(--accent)' }}>แผงแอดมิน</h3>
            <ul className="sidebar-menu">
              <li>
                <button 
                  onClick={() => setActiveTab('dashboard')} 
                  className={`sidebar-link btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                  style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
                >
                  📊 สรุปผล & แดชบอร์ด
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('verification')} 
                  className={`sidebar-link btn ${activeTab === 'verification' ? 'active' : ''}`}
                  style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
                >
                  💵 ตรวจสลิปมัดจำ ({pendingVerificationList.length})
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('bookings')} 
                  className={`sidebar-link btn ${activeTab === 'bookings' ? 'active' : ''}`}
                  style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
                >
                  📅 รายการจองคิวทั้งหมด
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('services')} 
                  className={`sidebar-link btn ${activeTab === 'services' ? 'active' : ''}`}
                  style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
                >
                  🎨 จัดการบริการสัก
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('gallery')} 
                  className={`sidebar-link btn ${activeTab === 'gallery' ? 'active' : ''}`}
                  style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
                >
                  🖼️ จัดการแกลเลอรีร้าน
                </button>
              </li>
            </ul>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            ล็อกอินเป็น: {user.full_name}
          </div>
        </aside>

        {/* Content Area */}
        <main className="dashboard-content">
          {activeTab === 'dashboard' && (
            <div>
              <h2 style={{ marginBottom: '25px' }}>แผงภาพรวมและรายรับของร้าน 157 TATTOO</h2>
              
              <div className="kpi-grid">
                <div className="kpi-card" style={{ borderLeft: '4px solid var(--accent)' }}>
                  <span className="kpi-value">฿{totalShopRevenue.toLocaleString()}</span>
                  <span className="kpi-label">รายรับประเมินของร้านค้ารวม (คิวจอง + สำเร็จ)</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-value">{bookings.length}</span>
                  <span className="kpi-label">จำนวนการจองคิวทั้งหมดในระบบ</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-value" style={{ color: 'var(--pending)' }}>{pendingVerificationList.length}</span>
                  <span className="kpi-label">ยอดโอนมัดจำที่รอตรวจสอบสลิป</span>
                </div>
              </div>

              <div className="card" style={{ marginTop: '30px' }}>
                <h3 style={{ marginBottom: '15px' }}>รายได้แยกตามช่างสักเฉพาะกลุ่มงานที่ช่างสักรับผิดชอบ</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ชื่อช่างสัก</th>
                        <th>อีเมล</th>
                        <th>เบอร์โทร</th>
                        <th>จำนวนคิวงาน</th>
                        <th>รายได้ที่สร้าง (งานที่เสร็จสิ้น/คิวจอง)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(artist => {
                        const artistJobs = bookings.filter(b => b.artist_id === artist.id && (b.status === 'COMPLETED' || b.status === 'CONFIRMED'));
                        const artistRevenue = artistJobs.reduce((sum, b) => sum + parseFloat(b.total_price), 0);
                        return (
                          <tr key={artist.id}>
                            <td><strong>{artist.full_name}</strong></td>
                            <td>{artist.email}</td>
                            <td>{artist.phone}</td>
                            <td>{artistJobs.length} งาน</td>
                            <td style={{ fontWeight: 'bold', color: 'var(--accent)' }}>฿{artistRevenue.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div>
              <h2 style={{ marginBottom: '20px' }}>คิวงานตรวจสอบและตรวจสอบความถูกต้องสลิปมัดจำ</h2>
              {pendingVerificationList.length === 0 ? (
                <div className="card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  ไม่มีคิวจองรอตรวจสอบการชำระเงินมัดจำในขณะนี้
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>รหัสจอง</th>
                        <th>ลูกค้า</th>
                        <th>ช่างสัก</th>
                        <th>สไตล์การสัก</th>
                        <th>ยอดมัดจำ</th>
                        <th>วันนัดหมาย</th>
                        <th>การตรวจสอบ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingVerificationList.map(b => (
                        <tr key={b.id}>
                          <td>{b.id}</td>
                          <td>{b.customer_name}</td>
                          <td>{b.artist_name}</td>
                          <td>{b.tattoo_style}</td>
                          <td style={{ fontWeight: 'bold' }}>฿{b.deposit_amount}</td>
                          <td>{new Date(b.booking_date).toLocaleDateString('th-TH')}</td>
                          <td>
                            <button 
                              onClick={() => {
                                setSelectedBookingForVerify(b);
                                setVerifyModalOpen(true);
                              }} 
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            >
                              🔍 ตรวจสลิปหลักฐาน
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <h2 style={{ marginBottom: '20px' }}>ประวัติการจองคิวสักทั้งหมดในสตูดิโอ</h2>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>รหัสจอง</th>
                      <th>ลูกค้า</th>
                      <th>ช่างสัก</th>
                      <th>สไตล์</th>
                      <th>ยอดเต็ม</th>
                      <th>วันนัดหมาย</th>
                      <th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id}>
                        <td>{b.id}</td>
                        <td>{b.customer_name}</td>
                        <td>{b.artist_name}</td>
                        <td>{b.tattoo_style}</td>
                        <td>฿{b.total_price.toLocaleString()}</td>
                        <td>{new Date(b.booking_date).toLocaleString('th-TH')}</td>
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
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div>
              <h2 style={{ marginBottom: '20px' }}>จัดการแคตตาล็อกการให้บริการรอยสัก</h2>
              
              <div className="card" style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px' }}>+ เพิ่มหมวดหมู่บริการสักใหม่</h3>
                <form onSubmit={handleAddService} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">ชื่อประเภทลายสัก</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="เช่น Realistic Portrait" 
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">คำแนะนำ/รายละเอียด</label>
                    <textarea 
                      className="form-control" 
                      rows="2" 
                      placeholder="รายละเอียดเพิ่มเติมของสไตล์งาน" 
                      value={newServiceDesc}
                      onChange={(e) => setNewServiceDesc(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label className="form-label">ราคาค่าบริการเริ่มต้น (บาท)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="3500" 
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                      required 
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '150px' }}>เพิ่มบริการ</button>
                </form>
              </div>

              <div className="card">
                <h3 style={{ marginBottom: '15px' }}>รายการสไตล์รอยสักที่เปิดให้บริการ</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ชื่อบริการ</th>
                        <th>คำอธิบาย</th>
                        <th>ราคาเริ่มต้น</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map(s => (
                        <tr key={s.id}>
                          <td><strong>{s.name}</strong></td>
                          <td>{s.description}</td>
                          <td style={{ fontWeight: 'bold' }}>฿{s.base_price.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div>
              <h2 style={{ marginBottom: '20px' }}>จัดการแกลเลอรีผลงานโชว์หน้าเว็บบนสุด</h2>
              
              <div className="card" style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px' }}>+ อัปโหลดผลงานเข้าระบบแกลเลอรี</h3>
                <form onSubmit={handleAddGallery} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">ชื่อผลงานสัก</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="เช่น สักท่อนแขนเสือสมิง" 
                      value={newGalleryTitle}
                      onChange={(e) => setNewGalleryTitle(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">สไตล์รอยสัก</label>
                    <select className="form-control" value={newGalleryStyle} onChange={(e) => setNewGalleryStyle(e.target.value)} required>
                      <option value="">-- เลือกสไตล์ --</option>
                      {services.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">ลิงก์รูปภาพผลงาน (Unsplash/Imgur/URL)</label>
                    <input 
                      type="url" 
                      className="form-control" 
                      placeholder="https://images.unsplash.com/photo-..." 
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">เลือกช่างสักผู้ลงมือทำ</label>
                    <select className="form-control" value={newGalleryArtist} onChange={(e) => setNewGalleryArtist(e.target.value)} required>
                      <option value="">-- เลือกช่างสัก --</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '180px' }}>บันทึกเข้าแกลเลอรี</button>
                </form>
              </div>

              <div className="card">
                <h3 style={{ marginBottom: '15px' }}>รายการรูปภาพทั้งหมดในแกลเลอรี</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
                  {gallery.map(g => (
                    <div key={g.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={g.image_url} alt={g.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                      <div style={{ padding: '10px' }}>
                        <p style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{g.title}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{g.style}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Verify Slip Modal */}
      {verifyModalOpen && selectedBookingForVerify && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: 'var(--accent)' }}>ตรวจยอดและสลิปเงินมัดจำ</h2>
              <button onClick={() => setVerifyModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <p style={{ marginBottom: '15px' }}><strong>ยอดที่ต้องชำระ:</strong> ฿{selectedBookingForVerify.deposit_amount}</p>
            
            <div style={{ marginBottom: '20px', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
              {/* Displaying Slip Image URL */}
              <img 
                src={selectedBookingForVerify.slip_image_url || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=300&auto=format&fit=crop'} 
                alt="Payment Slip" 
                style={{ maxHeight: '350px', maxWidth: '100%', objectFit: 'contain', display: 'block', margin: '0 auto' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => handleVerifyPayment(selectedBookingForVerify.id, 'REJECTED')} 
                className="btn btn-danger" 
                style={{ flex: 1 }}
              >
                ❌ สลิปไม่ถูกต้อง/ปฏิเสธ
              </button>
              <button 
                onClick={() => handleVerifyPayment(selectedBookingForVerify.id, 'CONFIRMED')} 
                className="btn btn-primary" 
                style={{ flex: 1 }}
              >
                ✅ อนุมัติสลิปและคิวจอง
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
