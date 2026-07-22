import { readTable, writeTable } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
  try {
    const services = readTable('services');
    return new Response(JSON.stringify(services), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลบริการ' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request) {
  try {
    const { name, description, base_price } = await request.json();
    const services = readTable('services');

    const newService = {
      id: 'srv-' + crypto.randomUUID().substring(0, 8),
      name,
      description,
      base_price: parseFloat(base_price)
    };

    services.push(newService);
    writeTable('services', services);

    return new Response(JSON.stringify({ message: 'เพิ่มบริการใหม่เรียบร้อย', service: newService }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการเพิ่มบริการ' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
