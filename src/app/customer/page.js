'use client';

import Header from '@/components/layout/Header';
import { useEffect, useState } from 'react';

export default function CustomerDashboard() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [artists, setArtists] = useState([]);
  const [services, setServices] = useState([]);
  const [sessionDetails, setSessionDetails] = useState({}); // booking_id -> session
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [artistId, setArtistId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [tattooStyle, setTattooStyle] = useState('');
  const [description, setDescription] = useState('');
  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  const [depositAmount, setDepositAmount] = useState('500');
  const [totalPrice, setTotalPrice] = useState('');
  const [slipImageUrl, setSlipImageUrl] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      window.location.href = '/login';
      return;
    }
    const u = JSON.parse(storedUser);
    if (u.role !== 'customer') {
      window.location.href = `/${u.role}`;
      return;
    }
    setUser(u);
    fetchData(u.id);
  }, []);

  const fetchData = async (userId) => {
    try {
      // Bookings
      const bookRes = await fetch(`/api/bookings?customer_id=${userId}&role=customer`);
      const bookData = await bookRes.json();
      setBookings(bookData);

      // Fetch sessions for completed bookings
      bookData.forEach(async (b) => {
        if (b.status === 'COMPLETED') {
          const sessRes = await fetch(`/api/sessions?booking_id=${b.id}`);
          const sessData = await sessRes.json();
          if (sessData) {
            setSessionDetails(prev => ({ ...prev, [b.id]: sessData }));
          }
        }
      });

      // Artists
      const artRes = await fetch('/api/artists');
      const artData = await artRes.json();
      setArtists(artData);
      if (artData.length > 0) setArtistId(artData[0].id);

      // Services
      const srvRes = await fetch('/api/services');
      const srvData = await srvRes.json();
      setServices(srvData);
      if (srvData.length > 0) {
        setTattooStyle(srvData[0].name);
        setTotalPrice(srvData[0].base_price);
      }
    } catch (e) {
      console.error('Error fetching data:', e);
    }
  };

  const handleServiceChange = (e) => {
    const styleName = e.target.value;
    setTattooStyle(styleName);
    const selectedSrv = services.find(s => s.name === styleName);
    if (selectedSrv) {
      setTotalPrice(selectedSrv.base_price);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: user.id,
          artist_id: artistId,
          booking_date: bookingDate,
          tattoo_style: tattooStyle,
          description,
          reference_image_url: referenceImageUrl,
          total_price: totalPrice,
          deposit_amount: depositAmount,
          slip_image_url: slipImageUrl
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาดในการส่งคำขอจองคิว');

      setBookingSuccess('ส่งจองคิวรอยสักเรียบร้อยแล้ว รอแอดมินยืนยันยอดมัดจำ');
      // Reset form
      setDescription('');
      setReferenceImageUrl('');
      setSlipImageUrl('');
      setBookingDate('');
      
      // Refresh list
      fetchData(user.id);
      setTimeout(() => {
        setShowModal(false);
        setBookingSuccess('');
      }, 2000);
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <p style={{ padding: '20px', textAlign: 'center' }}>กำลังโหลดหน้าแดชบอร์ด...</p>;

  return (
    <>
      <Header />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ marginBottom: '5px' }}>แดชบอร์ดลูกค้า</h1>
            <p style={{ color: 'var(--text-secondary)' }}>ยินดีต้อนรับคุณ, <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{user.full_name}</span></p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + จองคิวสักใหม่
          </button>
        </div>

        {/* Profile Card */}
        <div className="card" style={{ marginBottom: '30px', borderLeft: '4px solid var(--accent)' }}>
          <h3 style={{ marginBottom: '15px', color: 'var(--accent)' }}>ข้อมูลโปรไฟล์ของคุณ</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <p><strong>ชื่อ-นามสกุล:</strong> {user.full_name}</p>
            <p><strong>อีเมล:</strong> {user.email}</p>
            <p><strong>เบอร์โทรศัพท์:</strong> {user.phone}</p>
            <p><strong>สิทธิ์ผู้ใช้งาน:</strong> Customer (ลูกค้า)</p>
          </div>
        </div>

        {/* Bookings List */}
        <h2 style={{ marginBottom: '20px' }}>ประวัติการจองและการสักทั้งหมด</h2>
        {bookings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
            ยังไม่มีประวัติการจองคิวในขณะนี้ กดปุ่ม "จองคิวสักใหม่" ด้านบนเพื่อเริ่มต้น
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {bookings.map((booking) => (
              <div key={booking.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>รหัสจอง: {booking.id}</span>
                    <h3 style={{ marginTop: '5px' }}>{booking.tattoo_style}</h3>
                  </div>
                  <span className={`badge ${
                    booking.status === 'CONFIRMED' 
                      ? 'badge-success' 
                      : booking.status === 'PENDING_VERIFY' 
                      ? 'badge-pending' 
                      : booking.status === 'COMPLETED'
                      ? 'badge-success'
                      : 'badge-danger'
                  }`}>
                    {booking.status === 'PENDING_VERIFY' && 'รอตรวจสอบสลิป'}
                    {booking.status === 'CONFIRMED' && 'อนุมัติแล้ว (คิวยืนยัน)'}
                    {booking.status === 'COMPLETED' && 'สักเสร็จสิ้น'}
                    {booking.status === 'REJECTED' && 'ปฏิเสธ/สลิปไม่ถูกต้อง'}
                    {booking.status === 'CANCELLED' && 'ยกเลิกแล้ว'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ช่างสักผู้รับผิดชอบ</p>
                    <p style={{ fontWeight: '500' }}>{booking.artist_name}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>วันเวลานัดหมาย</p>
                    <p style={{ fontWeight: '500' }}>{new Date(booking.booking_date).toLocaleString('th-TH')}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ราคาค่าสักทั้งหมด</p>
                    <p style={{ fontWeight: '700', color: 'var(--accent)' }}>฿{booking.total_price.toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ยอดมัดจำที่โอน</p>
                    <p style={{ fontWeight: '500' }}>฿{booking.deposit_amount.toLocaleString()}</p>
                  </div>
                </div>

                {booking.description && (
                  <div style={{ backgroundColor: 'var(--surface-hover)', padding: '10px 15px', borderRadius: '6px', fontSize: '0.9rem' }}>
                    <strong>รายละเอียดไอเดียรอยสัก:</strong> {booking.description}
                  </div>
                )}

                {/* Display Reference image & slip */}
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {booking.reference_image_url && (
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>รูปภาพอ้างอิงรอยสัก</p>
                      <img 
                        src={booking.reference_image_url} 
                        alt="Reference" 
                        style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                      />
                    </div>
                  )}
                  {booking.status === 'COMPLETED' && sessionDetails[booking.id] && (
                    <>
                      <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>รูปภาพผิวหนังก่อนสัก</p>
                        <img 
                          src={sessionDetails[booking.id].photo_before_url} 
                          alt="Before Tattoo" 
                          style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                        />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>รูปภาพหลังสักเสร็จสิ้น</p>
                        <img 
                          src={sessionDetails[booking.id].photo_after_url} 
                          alt="After Tattoo" 
                          style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                        />
                      </div>
                      <div style={{ flex: '1', minWidth: '220px' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>บันทึกเชิงเทคนิคจากช่างสัก</p>
                        <div style={{ padding: '10px', backgroundColor: 'var(--accent-light)', borderRadius: '6px', fontSize: '0.85rem' }}>
                          {sessionDetails[booking.id].session_notes || 'ไม่มีข้อมูลบันทึกพิเศษ'}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: 'var(--accent)' }}>แบบฟอร์มจองคิวและโอนมัดจำ</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            {bookingError && (
              <div style={{ backgroundColor: 'rgba(231,76,60,0.1)', color: 'var(--error)', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
                {bookingError}
              </div>
            )}
            {bookingSuccess && (
              <div style={{ backgroundColor: 'rgba(46,204,113,0.1)', color: 'var(--success)', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
                {bookingSuccess}
              </div>
            )}

            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label className="form-label">เลือกสไตล์รอยสัก (สไตล์ที่มีให้บริการ)</label>
                <select className="form-control" value={tattooStyle} onChange={handleServiceChange}>
                  {services.map(s => (
                    <option key={s.id} value={s.name}>{s.name} (ราคาเริ่มต้น ฿{s.base_price})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">เลือกช่างสักประจำร้าน</label>
                <select className="form-control" value={artistId} onChange={(e) => setArtistId(e.target.value)}>
                  {artists.map(a => (
                    <option key={a.id} value={a.id}>{a.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">เลือกวันและเวลานัดหมาย</label>
                <input 
                  type="datetime-local" 
                  className="form-control" 
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">รายละเอียด / ไอเดียแบบสักที่ต้องการ</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="เช่น ขนาด ลำตัวส่วนที่ต้องการสัก รายละเอียดเฉพาะบุคคล"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">ลิงก์รูปภาพอ้างอิง Reference (Unsplash/Imgur/URL)</label>
                <input 
                  type="url" 
                  className="form-control" 
                  placeholder="https://example.com/tattoo-ref.jpg"
                  value={referenceImageUrl}
                  onChange={(e) => setReferenceImageUrl(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">ค่าบริการประเมินเริ่มต้น (บาท)</label>
                  <input type="text" className="form-control" value={totalPrice} readOnly style={{ backgroundColor: 'var(--surface-hover)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">เงินมัดจำบังคับโอน (บาท)</label>
                  <input type="text" className="form-control" value={depositAmount} readOnly style={{ backgroundColor: 'var(--surface-hover)' }} />
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--accent-light)', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--accent)' }}>
                <h4 style={{ color: 'var(--accent)', marginBottom: '5px' }}>บัญชีโอนมัดจำ:</h4>
                <p>ธนาคารกสิกรไทย (KBANK) • บจก. 157 แทททู สตูดิโอ</p>
                <p>เลขบัญชี: <strong>157-2-88888-8</strong></p>
                <p style={{ fontSize: '0.8rem', marginTop: '5px', color: 'var(--text-secondary)' }}>* กรุณาโอนเงินมัดจำจำนวน 500 บาทถ้วนและแนบสลิปด้านล่าง</p>
              </div>

              <div className="form-group">
                <label className="form-label">ลิงก์สลิปหลักฐานการโอนเงิน (URL รูปสลิป)</label>
                <input 
                  type="url" 
                  className="form-control" 
                  placeholder="https://example.com/slip-image.jpg"
                  value={slipImageUrl}
                  onChange={(e) => setSlipImageUrl(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'กำลังส่งข้อมูล...' : 'ส่งคำขอและหลักฐาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
