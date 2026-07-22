import { readTable, writeTable } from '@/lib/db';
import crypto from 'crypto';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id');
    const artistId = searchParams.get('artist_id');
    const role = searchParams.get('role');

    let bookings = readTable('bookings');
    const users = readTable('users');

    // Enrich bookings with customer and artist names
    bookings = bookings.map(b => {
      const customer = users.find(u => u.id === b.customer_id);
      const artist = users.find(u => u.id === b.artist_id);
      return {
        ...b,
        customer_name: customer ? customer.full_name : 'ไม่ระบุ',
        artist_name: artist ? artist.full_name : 'ไม่ระบุ'
      };
    });

    if (role === 'customer' && customerId) {
      bookings = bookings.filter(b => b.customer_id === customerId);
    } else if (role === 'artist' && artistId) {
      bookings = bookings.filter(b => b.artist_id === artistId);
    }

    // Sort by date descending
    bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return new Response(JSON.stringify(bookings), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request) {
  try {
    const {
      customer_id,
      artist_id,
      booking_date,
      tattoo_style,
      description,
      reference_image_url,
      total_price,
      deposit_amount,
      slip_image_url
    } = await request.json();

    const bookings = readTable('bookings');
    const payments = readTable('payments');

    const newBookingId = 'book-' + crypto.randomUUID().substring(0, 8);
    const newBooking = {
      id: newBookingId,
      customer_id,
      artist_id,
      booking_date,
      tattoo_style,
      description,
      reference_image_url: reference_image_url || 'https://images.unsplash.com/photo-1560707303-4e980c87f8ad?q=80&w=300&auto=format&fit=crop',
      status: 'PENDING_VERIFY',
      total_price: parseFloat(total_price),
      deposit_amount: parseFloat(deposit_amount),
      created_at: new Date().toISOString()
    };

    const newPayment = {
      id: 'pay-' + crypto.randomUUID().substring(0, 8),
      booking_id: newBookingId,
      amount: parseFloat(deposit_amount),
      slip_image_url: slip_image_url || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=300&auto=format&fit=crop',
      status: 'PENDING',
      payment_date: new Date().toISOString()
    };

    bookings.push(newBooking);
    payments.push(newPayment);

    writeTable('bookings', bookings);
    writeTable('payments', payments);

    return new Response(JSON.stringify({ message: 'จองคิวสำเร็จ รอผู้ดูแลตรวจสอบสลิปมัดจำ', booking: newBooking }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลการจอง' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
