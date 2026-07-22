'use client';

import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Next.js App Router uses next/navigation
import { useEffect, useState } from 'react';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/'; // Redirect to landing page and refresh state
  };

  return (
    <header className="navbar">
      <Link href="/" className="nav-logo">
        157 <span className="logo-accent">TATTOO</span>
      </Link>

      <div className="nav-links">
        {/* Gallery */}
        <Link href="/" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
          แกลเลอรี
        </Link>

        {/* Theme Toggle Button */}
        <button onClick={toggleTheme} className="theme-toggle-btn" title="เปลี่ยนธีม">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {user ? (
          <>
            <Link 
              href={
                user.role === 'admin' 
                  ? '/admin' 
                  : user.role === 'artist' 
                  ? '/artist' 
                  : '/customer'
              } 
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.9rem' }}
            >
              แดชบอร์ด ({user.full_name.split(' ')[0]})
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              ออกจากระบบ
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              เข้าสู่ระบบ
            </Link>
            <Link href="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              สมัครสมาชิก
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
