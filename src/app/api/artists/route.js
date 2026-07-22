import { readTable } from '@/lib/db';

export async function GET() {
  try {
    const users = await readTable('users');
    const artists = users.filter(u => u.role === 'artist');
    return new Response(JSON.stringify(artists), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลช่างสัก' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
