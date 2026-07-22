import { readTable, writeTable } from '@/lib/db';

export async function POST(request) {
  try {
    const { booking_id, status } = await request.json(); // status: 'CONFIRMED' or 'REJECTED'

    const bookings = await readTable('bookings');
    const payments = await readTable('payments');
 
    const bookingIndex = bookings.findIndex(b => b.id === booking_id);
    if (bookingIndex === -1) {
      return new Response(JSON.stringify({ error: 'ไม่พบคิวการจองนี้' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
 
    // Update payment status
    const paymentIndex = payments.findIndex(p => p.booking_id === booking_id);
    if (paymentIndex !== -1) {
      payments[paymentIndex].status = status === 'CONFIRMED' ? 'APPROVED' : 'REJECTED';
    }
 
    // Update booking status
    bookings[bookingIndex].status = status;
 
    await writeTable('bookings', bookings);
    await writeTable('payments', payments);

    return new Response(JSON.stringify({ message: `อัปเดตสถานะคิวจองเป็น ${status} เรียบร้อย` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการตรวจสอบและบันทึกข้อมูล' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
