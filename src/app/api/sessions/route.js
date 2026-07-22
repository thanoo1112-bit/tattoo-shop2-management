import { readTable, writeTable } from '@/lib/db';
import crypto from 'crypto';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');

    const sessions = readTable('tattoo_sessions');

    if (bookingId) {
      const session = sessions.find(s => s.booking_id === bookingId);
      return new Response(JSON.stringify(session || null), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(sessions), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการดึงประวัติการสัก' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request) {
  try {
    const { booking_id, photo_before_url, photo_after_url, session_notes, mark_completed } = await request.json();

    const sessions = readTable('tattoo_sessions');
    const bookings = readTable('bookings');

    let sessionIndex = sessions.findIndex(s => s.booking_id === booking_id);

    const sessionData = {
      id: sessionIndex !== -1 ? sessions[sessionIndex].id : 'sess-' + crypto.randomUUID().substring(0, 8),
      booking_id,
      photo_before_url: photo_before_url || 'https://images.unsplash.com/photo-1590246814883-57c511e76757?q=80&w=300&auto=format&fit=crop',
      photo_after_url: photo_after_url || 'https://images.unsplash.com/photo-1598136490941-30d885368a72?q=80&w=300&auto=format&fit=crop',
      session_notes: session_notes || '',
      updated_at: new Date().toISOString()
    };

    if (sessionIndex !== -1) {
      sessions[sessionIndex] = sessionData;
    } else {
      sessions.push(sessionData);
    }

    // If marked completed, update booking status
    if (mark_completed) {
      const bookingIndex = bookings.findIndex(b => b.id === booking_id);
      if (bookingIndex !== -1) {
        bookings[bookingIndex].status = 'COMPLETED';
      }
    }

    writeTable('tattoo_sessions', sessions);
    writeTable('bookings', bookings);

    return new Response(JSON.stringify({ message: 'บันทึกประวัติการสักเรียบร้อย', session: sessionData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการบันทึกประวัติการสัก' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
