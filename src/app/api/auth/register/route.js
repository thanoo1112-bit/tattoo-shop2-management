import { readTable, writeTable } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { email, password, full_name, phone } = await request.json();
    const users = await readTable('users');
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return new Response(JSON.stringify({ error: 'อีเมลนี้ถูกใช้งานแล้วในระบบ' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const newUser = {
      id: 'cust-' + crypto.randomUUID().substring(0, 8),
      email,
      password_hash: password, // plain password for local demo/simplicity
      full_name,
      phone,
      role: 'customer',
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    await writeTable('users', users);

    return new Response(JSON.stringify({
      message: 'สมัครสมาชิกสำเร็จ',
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        phone: newUser.phone,
        role: newUser.role
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
