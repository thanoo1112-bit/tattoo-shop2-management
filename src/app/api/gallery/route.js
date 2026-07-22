import { readTable, writeTable } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
  try {
    const gallery = readTable('gallery');
    return new Response(JSON.stringify(gallery), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลแกลเลอรี' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request) {
  try {
    const { title, style, image_url, artist_id } = await request.json();
    const gallery = readTable('gallery');

    const newGalleryItem = {
      id: 'g-' + crypto.randomUUID().substring(0, 8),
      title,
      style,
      image_url,
      artist_id
    };

    gallery.push(newGalleryItem);
    writeTable('gallery', gallery);

    return new Response(JSON.stringify({ message: 'เพิ่มผลงานในแกลเลอรีเรียบร้อย', item: newGalleryItem }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการเพิ่มผลงาน' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
