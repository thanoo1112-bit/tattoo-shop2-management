import fs from 'fs';
import path from 'path';
import { supabase } from './supabase';

const DATA_DIR = path.join(process.cwd(), 'data');

// Initialize memory fallback for Serverless environments like Vercel
if (!global.memoryDb) {
  global.memoryDb = {};
}

// Helper to check if filesystem is writeable
let isWritable = true;
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  isWritable = false;
}

function getFilePath(table) {
  return path.join(DATA_DIR, `${table}.json`);
}

// ASYNC DB Reads
export async function readTable(table) {
  // 1. If Supabase is connected, fetch from Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error(`Supabase read error for table ${table}:`, e);
      // fallback to memory/json if Supabase fails
    }
  }

  // 2. Fallback to Local/Memory DB
  if (global.memoryDb[table]) {
    return global.memoryDb[table];
  }

  const filePath = getFilePath(table);
  
  if (!isWritable || !fs.existsSync(filePath)) {
    const seedData = getSeedData(table);
    global.memoryDb[table] = seedData;
    return seedData;
  }

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(data);
    global.memoryDb[table] = parsed;
    return parsed;
  } catch (e) {
    const seedData = getSeedData(table);
    global.memoryDb[table] = seedData;
    return seedData;
  }
}

// ASYNC DB Writes
export async function writeTable(table, data) {
  // 1. If Supabase is connected, write to Supabase
  if (supabase) {
    try {
      // In Supabase, we upsert the whole array or individual items.
      // To keep it simple and match our existing array structure, we upsert all items.
      const { error } = await supabase.from(table).upsert(data);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error(`Supabase write error for table ${table}:`, e);
      // fallback to memory/json
    }
  }

  // 2. Fallback to Local/Memory DB
  global.memoryDb[table] = data;

  if (!isWritable) {
    return true;
  }

  const filePath = getFilePath(table);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    return true; 
  }
}

function getSeedData(table) {
  switch (table) {
    case 'users':
      return [
        {
          id: 'admin-1',
          email: 'admin@157tattoo.com',
          password_hash: 'admin123',
          full_name: 'สมชาย ผู้ดูแลร้าน (Admin)',
          phone: '0812345678',
          role: 'admin',
          created_at: new Date().toISOString()
        },
        {
          id: 'artist-1',
          email: 'artist1@157tattoo.com',
          password_hash: 'artist123',
          full_name: 'ช่างเอก ลายไทย (Artist)',
          phone: '0823456789',
          role: 'artist',
          created_at: new Date().toISOString()
        },
        {
          id: 'artist-2',
          email: 'artist2@157tattoo.com',
          password_hash: 'artist123',
          full_name: 'ช่างบี มินิมอล (Artist)',
          phone: '0834567890',
          role: 'artist',
          created_at: new Date().toISOString()
        },
        {
          id: 'customer-1',
          email: 'customer@gmail.com',
          password_hash: 'customer123',
          full_name: 'คุณวิชัย รักดี (Customer)',
          phone: '0845678901',
          role: 'customer',
          created_at: new Date().toISOString()
        }
      ];
    case 'services':
      return [
        {
          id: 'service-1',
          name: 'Minimal Style (มินิมอล)',
          description: 'ลายเส้นขนาดเล็ก ลายสักเก๋ไก๋ น่ารัก เรียบง่าย',
          base_price: 1500
        },
        {
          id: 'service-2',
          name: 'Realism (เหมือนจริง)',
          description: 'งานสักภาพพอร์ตเทรต สัตว์ สิ่งของ ที่ต้องการความเสมือนจริงสูง',
          base_price: 8000
        },
        {
          id: 'service-3',
          name: 'Japanese Traditional (ญี่ปุ่นโบราณ)',
          description: 'ลายสักญี่ปุ่นลงสีเข้มข้น ดุดัน สวยงามประณีต',
          base_price: 6000
        },
        {
          id: 'service-4',
          name: 'Tribal / Maori (ชนเผ่า/เมารี)',
          description: 'ลายเรขาคณิตถมดำ ลายชนเผ่าเสริมบารมีและมิติร่างกาย',
          base_price: 4500
        }
      ];
    case 'bookings':
      return [
        {
          id: 'booking-1',
          customer_id: 'customer-1',
          artist_id: 'artist-1',
          booking_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0] + 'T13:00:00',
          tattoo_style: 'Minimal Style (มินิมอล)',
          description: 'อยากได้ลายดอกไม้เล็กๆ ที่ข้อมือ ขนาดประมาณ 3 ซม. ครับ',
          reference_image_url: 'https://images.unsplash.com/photo-1560707303-4e980c87f8ad?q=80&w=300&auto=format&fit=crop',
          status: 'CONFIRMED',
          total_price: 1500,
          deposit_amount: 500,
          created_at: new Date().toISOString()
        }
      ];
    case 'payments':
      return [
        {
          id: 'payment-1',
          booking_id: 'booking-1',
          amount: 500,
          slip_image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=300&auto=format&fit=crop',
          status: 'APPROVED',
          payment_date: new Date().toISOString()
        }
      ];
    case 'tattoo_sessions':
      return [];
    case 'gallery':
      return [
        {
          id: 'g-1',
          title: 'มินิมอลดอกทิวลิป',
          style: 'Minimal Style (มินิมอล)',
          image_url: 'https://images.unsplash.com/photo-1560707303-4e980c87f8ad?q=80&w=600&auto=format&fit=crop',
          artist_id: 'artist-2'
        },
        {
          id: 'g-2',
          title: 'ภาพมังกรญี่ปุ่นเต็มหลัง',
          style: 'Japanese Traditional (ญี่ปุ่นโบราณ)',
          image_url: 'https://images.unsplash.com/photo-1590246814883-57c511e76757?q=80&w=600&auto=format&fit=crop',
          artist_id: 'artist-1'
        }
      ];
    default:
      return [];
  }
}
