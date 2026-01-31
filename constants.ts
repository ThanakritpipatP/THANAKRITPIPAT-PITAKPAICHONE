
import { Branch, WeeklyPromotion } from './types';

export const API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbya2DY5QiuPkhFO9PSbcu2mgdGbXaseFJ-aOBTNC-t3ax83TyaCUeInSe1xjFlR1m1S/exec';
export const LOGGING_API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw3QAyY1ybee9dLEccbol_o987p_pGfydBiGfp5jEkPYoWTBCheh1gIxiR1jUwuIMB0/exec';

// กำหนดตัวย่อหน้ารหัสคูปอง
export const COUPON_PREFIX_MEMBER = 'MC'; // สำหรับสมาชิก
export const COUPON_PREFIX_GUEST = 'MC';  // ปรับเปลี่ยนจาก 'LC' เป็น 'MC' ตามคำขอ (ให้เป็น MC ทั้งหมด)

const TERMS_AND_CONDITIONS = `
- กดรับสิทธิ์ต่อหน้าพนักงานเมื่อต้องการใช้คูปอง และไม่ สามารถใช้คูปองที่มาจากภาพถ่ายหน้าจอหรือวิธีการอื่นใดได้
- คูปองมีอายุ 5 นาทีหลังจากกดยืนยันใช้งาน จะใช้ได้เพียงครั้งเดียวเท่านั้น และบริษัทฯ จะไม่สามารถออกคูปองใหม่ได้ทุกกรณี
- ไม่สามารถใช้คูปองร่วมกับโปรโมชั่นอื่นๆ ได้
- ส่วนลดไม่สามารถสะสมคะแนนสมาชิกได้
- คูปองไม่สามารถโอนสิทธิ์ให้ผู้อื่นได้
- ส่วนต่างหลังหักส่วนลดไม่สามารถเปลี่ยนหรือแลกคืนเป็นเงินสดได้
- ไม่สามารถใช้ได้ที่ Vista Cafe สาขาเดอะมอลล์งามวงศ์วาน ชั้น G และ Vista Kitchen ทุกสาขา
- บริษัทฯ ขอสงวนสิทธิ์ในการเปลี่ยนแปลงรายการส่งเสริมการขาย เงื่อนไข วันสิ้นสุดโดยไม่ต้องแจ้งให้ทราบล่วงหน้า และไม่เกี่ยวข้องกับอายุการใช้งานคูปอง
`;

const THAI_MONTHS_FULL = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

// Helper to get current Thai month/year string
const getCurrentPeriodText = () => {
  const now = new Date();
  return `${THAI_MONTHS_FULL[now.getMonth()]} 2569`;
};

// Helper to get the full date range for monthly coupons (active from a specific day until month end)
const getMonthlyRangeText = (startDay: number) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthYearText = `${THAI_MONTHS_FULL[month]} 69`;
  // Get last day of current month
  const lastDay = new Date(year, month + 1, 0).getDate();
  return `${startDay} ${monthYearText} - ${lastDay} ${monthYearText}`;
};

// --- คูปองราย 2 เดือน (Week 3) ---
const getCoupon3Items = (idSuffix: string, validityText: string) => [
  { 
    id: `w3-line-1-${idSuffix}`, 
    name: 'ส่วนลด 50 บาท', 
    cardTitle: 'ส่วนลด 50 บาท', 
    description: 'เมื่อซื้อสินค้า 350 บาทขึ้นไป รับส่วนลดทันที 50 บาท ', 
    isMemberOnly: false, 
    usageLimit: 'จำกัด 1 สิทธิ์/ใบเสร็จ',
    imageUrl: 'https://img2.pic.in.th/pic/MC-W3-01.jpg', 
    validityPeriod: validityText, 
    details: 'รับส่วนลดทันที 50 บาท เมื่อซื้อสินค้าที่ร่วมรายการ 350 บาทขึ้นไป ยกเว้น เมล็ดกาแฟ สินค้าพรีเมียม บัตรของขวัญ สแนคบ็อกซ์ เค้กปอนด์ น้ำผึ้งรักษ์ป่า อาหารกล่องจาก vista kitchen(จำกัด 1 สิทธิ์/ใบเสร็จ)', 
    terms: TERMS_AND_CONDITIONS 
  },
];

// --- คูปองราย 3 เดือน (Week 4) ---
const getCoupon4Items = (idSuffix: string, validityText: string) => [
  { 
    id: `special-1-${idSuffix}`, 
    name: 'เครื่องดื่ม 1 แถม 1', 
    cardTitle: 'เครื่องดื่ม 1 แถม 1', 
    description: 'เมื่อซื้อเครื่องดื่มประเภทใดขนาดใดก็ได้ 1 แก้ว รับฟรี เครื่องดื่มในราคาที่น้อยกว่าหรือเท่ากันจำนวน 1 แก้ว', 
    isMemberOnly: false, 
    usageLimit: '2 สิทธิ์/ใบเสร็จ',
    imageUrl: 'https://img2.pic.in.th/pic/MC-W1-01.jpg', 
    validityPeriod: validityText, 
    details: 'ซื้อเครื่องดื่มประเภทใดขนาดใดก็ได้ 1 แก้ว รับฟรี เครื่องดื่มในราคาที่น้อยกว่าหรือเท่ากันจำนวน 1 แก้ว (จำกัด 2 สิทธิ์/ใบเสร็จ)', 
    terms: TERMS_AND_CONDITIONS 
  },
];

export const PROMOTIONS: WeeklyPromotion[] = [
  {
    week: 1, 
    period: 'ตลอดปี 2569',
    startDate: new Date(2026, 0, 1),
    endDate: new Date(2026, 11, 31, 23, 59, 59),
    coupons: [
      { id: 'w1-line-1', name: 'ส่วนลด 5%', cardTitle: 'ส่วนลด 5%', description: 'เมื่อซื้อสินค้าที่ร่วมรายการ รับส่วนลดทันที 5%', isMemberOnly: false, usageLimit: 'จำกัด 1 สิทธิ์/ใบเสร็จ', imageUrl: 'https://img5.pic.in.th/file/secure-sv1/Logo-VistacafeBlack-022655677700ce86a8.jpg', validityPeriod: getCurrentPeriodText(), details: 'รับส่วนลด 5% เมื่อซื้อสินค้าที่ร่วมรายการ ยกเว้น เมล็ดกาแฟ / สินค้าพรีเมียม / Gift Voucher/ Snack Box/ เค้กวง/ น้ำผึ้ง รักษ์ป่า/ อาหารกล่องจาก Vista Kitchen (จำกัด 1 สิทธิ์/ใบเสร็จ)', terms: TERMS_AND_CONDITIONS },
    ]
  },
  {
    week: 2, 
    period: 'ตลอดปี 2569',
    startDate: new Date(2026, 0, 1),
    endDate: new Date(2026, 11, 31, 23, 59, 59),
    coupons: [
      { id: 'w2-line-1', name: 'ส่วนลด 10%', cardTitle: 'ส่วนลด 10%', description: 'เมื่อซื้อสินค้าที่ร่วมรายการ รับส่วนลดทันที 10% ', isMemberOnly: false, usageLimit: 'จำกัด 1 สิทธิ์/ใบเสร็จ', imageUrl: 'https://img5.pic.in.th/file/secure-sv1/Logo-VistacafeBlack-022655677700ce86a8.jpg', validityPeriod: getCurrentPeriodText(), details: 'รับส่วนลด 10% เมื่อซื้อสินค้าที่ร่วมรายการ ยกเว้น เมล็ดกาแฟ / สินค้าพรีเมียม / Gift Voucher/ Snack Box/ เค้กวง/ น้ำผึ้ง รักษ์ป่า/ อาหารกล่องจาก Vista Kitchen (จำกัด 1 สิทธิ์/ใบเสร็จ)', terms: TERMS_AND_CONDITIONS },
    ]
  },
  {
    week: 6, // คูปองเฉพาะวันที่ 10 และ 20 (ใช้ได้จนสิ้นเดือน)
    period: 'ตลอดปี 2569',
    startDate: new Date(2026, 0, 1),
    endDate: new Date(2026, 11, 31, 23, 59, 59),
    coupons: [
      { 
        id: 'day-10-coupon', 
        name: 'ส่วนลด 10 บาท', 
        cardTitle: 'ส่วนลด 10 บาท', 
        description: 'เมื่อซื้อสินค้าที่ร่วมรายการ รับส่วนลดทันที 10 บาท', 
        isMemberOnly: false, 
        usageLimit: 'จำกัด 1 สิทธิ์/ใบเสร็จ',
        imageUrl: 'https://img5.pic.in.th/file/secure-sv1/Logo-VistacafeBlack-022655677700ce86a8.jpg', 
        validityPeriod: getMonthlyRangeText(10), 
        details: 'รับส่วนลดทันที 10 บาท เมื่อซื้อสินค้าทุกประเภทที่ร่วมรายการ ยกเว้น เมล็ดกาแฟ / สินค้าพรีเมียม / Gift Voucher/ Snack Box/ เค้กวง/ น้ำผึ้ง รักษ์ป่า/ อาหารกล่องจาก Vista Kitchen', 
        terms: TERMS_AND_CONDITIONS,
        activeDay: 10 
      },
      { 
        id: 'day-20-coupon', 
        name: 'ส่วนลด 20 บาท', 
        cardTitle: 'ส่วนลด 20 บาท', 
        description: 'เมื่อซื้อสินค้าที่ร่วมรายการ รับส่วนลดทันที 20 บาท', 
        isMemberOnly: false, 
        usageLimit: 'จำกัด 1 สิทธิ์/ใบเสร็จ',
        imageUrl: 'https://img5.pic.in.th/file/secure-sv1/Logo-VistacafeBlack-022655677700ce86a8.jpg', 
        validityPeriod: getMonthlyRangeText(20), 
        details: 'รับส่วนลดทันที 20 บาท เมื่อซื้อสินค้าทุกประเภทที่ร่วมรายการ ยกเว้น เมล็ดกาแฟ / สินค้าพรีเมียม / Gift Voucher/ Snack Box/ เค้กวง/ น้ำผึ้ง รักษ์ป่า/ อาหารกล่องจาก Vista Kitchen', 
        terms: TERMS_AND_CONDITIONS,
        activeDay: 20 
      }
    ]
  },

  // --- กำหนดราย 2 เดือน (Week 3) ---
  {
    week: 3,
    period: 'กุมภาพันธ์ 2569',
    startDate: new Date(2026, 1, 1), 
    endDate: new Date(2026, 1, 28, 23, 59, 59), 
    coupons: getCoupon3Items('Feb26', '1 ก.พ. 2569 - 28 ก.พ. 2569')
  },
  {
    week: 3,
    period: 'เมษายน 2569',
    startDate: new Date(2026, 3, 1), 
    endDate: new Date(2026, 3, 30, 23, 59, 59), 
    coupons: getCoupon3Items('Apr26', '1 เม.ย. 2569 - 30 เม.ย. 2569')
  },
  {
    week: 3,
    period: 'มิถุนายน 2569',
    startDate: new Date(2026, 5, 1),
    endDate: new Date(2026, 5, 30, 23, 59, 59),
    coupons: getCoupon3Items('Jun26', '1 มิ.ย. 2569 - 30 มิ.ย. 2569')
  },
  {
    week: 3,
    period: 'สิงหาคม 2569',
    startDate: new Date(2026, 7, 1),
    endDate: new Date(2026, 7, 31, 23, 59, 59),
    coupons: getCoupon3Items('Aug26', '1 ส.ค. 2569 - 31 ส.ค. 2569')
  },
  {
    week: 3,
    period: 'ตุลาคม 2569',
    startDate: new Date(2026, 9, 1),
    endDate: new Date(2026, 9, 31, 23, 59, 59),
    coupons: getCoupon3Items('Oct26', '1 ต.ค. 2569 - 31 ต.ค. 2569')
  },
  {
    week: 3,
    period: 'ธันวาคม 2569',
    startDate: new Date(2026, 11, 1),
    endDate: new Date(2026, 11, 31, 23, 59, 59),
    coupons: getCoupon3Items('Dec26', '1 ธ.ค. 2569 - 31 ธ.ค. 2569')
  },

  // --- กำหนดราย 3 เดือน (Week 4) ---
  {
    week: 4,
    period: 'มีนาคม 2569',
    startDate: new Date(2026, 2, 1),
    endDate: new Date(2026, 2, 31, 23, 59, 59),
    coupons: getCoupon4Items('Mar26', '1 มี.ค. 2569 - 31 มี.ค. 2569')
  },
  {
    week: 4,
    period: 'มิถุนายน 2569',
    startDate: new Date(2026, 5, 1),
    endDate: new Date(2026, 5, 30, 23, 59, 59),
    coupons: getCoupon4Items('Jun26_Spec', '1 มิ.ย. 2569 - 30 มิ.ย. 2569')
  },
  {
    week: 4,
    period: 'กันยายน 2569',
    startDate: new Date(2026, 8, 1),
    endDate: new Date(2026, 8, 30, 23, 59, 59),
    coupons: getCoupon4Items('Sep26', '1 ก.ย. 2569 - 30 ก.ย. 2569')
  },
  {
    week: 4,
    period: 'ธันวาคม 2569',
    startDate: new Date(2026, 11, 1),
    endDate: new Date(2026, 11, 31, 23, 59, 59),
    coupons: getCoupon4Items('Dec26_Spec', '1 ธ.ค. 2569 - 31 ธ.ค. 2569')
  },
];

export const VISTA_BRANCHES: Branch[] = [
  { id: 1, name: 'สาขาแจ้งวัฒนะ', lat: 13.8913, lng: 100.5518 },
  { id: 2, name: 'สาขาเดอะเซอเคิล ราชพฤกษ์', lat: 13.7661, lng: 100.4468 },
  { id: 3, name: 'สาขาเดอะมอลล์งามวงศ์วาน', lat: 13.8542, lng: 100.5476 },
  { id: 4, name: 'สาขาเพียวเพลส สัมมากร', lat: 13.7744, lng: 100.6860 },
  { id: 5, name: 'สาขาฟิวเจอร์พาร์ค รังสิต', lat: 13.9877, lng: 100.6155 },
  { id: 6, name: 'สาขาแฟชั่น ไอส์แลนด์', lat: 13.8248, lng: 100.6728 },
  { id: 7, name: 'สาขาโรงพยาบาลจุฬาลงกรณ์', lat: 13.7323, lng: 100.5312 },
  { id: 8, name: 'สาขาโรงพยาบาลศิริราช', lat: 13.7578, lng: 100.4452 },
  { id: 9, name: 'สาขาลาดพร้าว 134', lat: 13.7937, lng: 100.6300 },
  { id: 10, name: 'สาขาศูนย์ราชการ แจ้งวัฒนะ', lat: 13.8837, lng: 100.5647 },
  { id: 11, name: 'สาขาอาคารวีรสุ (ถ.วิทยุ)', lat: 13.7408, lng: 100.5484 },
  { id: 12, name: 'สาขาโรงพยาบาลกรุงเทพคริสเตียน', lat: 13.7279, lng: 100.5304 },
];

export const MEMBER_MODAL_SCHEDULE = {
  start: new Date(2026, 2, 1), 
  end: new Date(2026, 11, 31, 23, 59, 59), 
};
