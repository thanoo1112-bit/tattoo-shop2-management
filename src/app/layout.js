import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: '157 TATTOO - ระบบบริหารจัดการและดูแลลูกค้าร้านสัก',
  description: 'ระบบบริหารจัดการคิวจอง การแนบชำระมัดจำ และบันทึกประวัติการสักสำหรับร้าน 157 TATTOO',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" data-theme="dark">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
