import { readTable } from '@/lib/db';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const users = await readTable('users');
    const user = users.find(u => u.email === email && u.password_hash === password);

    if (!user) {
      return new Response(JSON.stringify({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return user profile info (in a real app, you would sign a JWT token)
    return new Response(JSON.stringify({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
