'use client';

import Header from '@/components/layout/Header';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [gallery, setGallery] = useState([]);
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    // Fetch gallery
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => setGallery(data))
      .catch(e => console.error(e));

    // Fetch artists
    fetch('/api/artists')
      .then(res => res.json())
      .then(data => setArtists(data))
      .catch(e => console.error(e));
  }, []);

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section style={{
          position: 'relative',
          padding: '100px 20px',
          textAlign: 'center',
          background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url("https://images.unsplash.com/photo-1598136490941-30d885368a72?q=80&w=1200&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#ffffff',
          minHeight: '450px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '10px', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            157 <span style={{ color: 'var(--accent)' }}>TATTOO</span>
          </h1>
          <p style={{ fontSize: '1.25rem', maxWidth: '600px', marginBottom: '30px', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            สตูดิโอรอยสักระดับพรีเมียม สไตล์หรูหรา เรียบง่าย ผสานฝีมือระดับมืออาชีพของช่างสักยอดฝีมือที่รังสรรค์รอยสักในแบบที่เป็นคุณ
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link href="/register" className="btn btn-primary" style={{ padding: '12px 30px' }}>
              สมัครเพื่อจองคิวออนไลน์
            </Link>
            <Link href="/login" className="btn btn-secondary" style={{ padding: '12px 30px', border: '1px solid #ffffff', color: '#ffffff' }}>
              เข้าสู่ระบบ
            </Link>
          </div>
        </section>

        {/* Gallery Showcase */}
        <section className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>ผลงานแนะนำ (Featured Tattoos)</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '40px' }}>
            รอยสักลายเส้นพรีเมียมคัดสรรพิเศษเพื่อคุณ
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '25px'
          }}>
            {gallery.map(item => (
              <div key={item.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <img 
                  src={item.image_url} 
                  alt={item.title} 
                  style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: '20px' }}>
                  <span className="badge badge-success" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)', marginBottom: '10px' }}>
                    {item.style}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', marginTop: '5px' }}>{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Artists Section */}
        <section style={{ backgroundColor: 'var(--surface)', padding: '60px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>ช่างสักประจำสตูดิโอ (Our Artists)</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '40px' }}>
              พบกับช่างสักผู้เชี่ยวชาญเฉพาะทางที่พร้อมบริการสร้างสรรค์งานศิลปะบนผิวหนัง
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              {artists.map(artist => (
                <div key={artist.id} className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.5rem'
                  }}>
                    {artist.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem' }}>{artist.full_name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>เบอร์โทร: {artist.phone}</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 'bold' }}>ช่างสักประจำร้าน 157 TATTOO</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <footer style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-secondary)', fontSize: '0.9rem', borderTop: '1px solid var(--border)' }}>
        © {new Date().getFullYear()} 157 TATTOO. All Rights Reserved. สตูดิโอออกแบบลายสักระดับพรีเมียม
      </footer>
    </>
  );
}
