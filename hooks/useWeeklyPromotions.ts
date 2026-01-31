
import { PROMOTIONS } from '../constants';
import { WeeklyPromotion } from '../types';

export const useWeeklyPromotions = (): { currentPromotions: WeeklyPromotion[] } => {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // กำหนดจุดเริ่มต้นและจุดสิ้นสุดของเดือนปัจจุบันเพื่อใช้ในการกรอง
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

  // กรองเฉพาะโปรโมชั่นที่มีช่วงเวลาคาบเกี่ยวกับเดือนปัจจุบัน
  const currentPromotions = PROMOTIONS
    .filter(p => {
      // โปรโมชั่นจะแสดงผลถ้า:
      // วันเริ่มโปรโมชั่น อยู่ก่อนหรือภายในเดือนนี้ AND วันสิ้นสุดโปรโมชั่น อยู่หลังจากหรือภายในเดือนนี้
      return p.startDate <= endOfMonth && p.endDate >= startOfMonth;
    })
    .map(p => ({
      ...p,
      coupons: p.coupons.map(c => {
        const promoStartDate = p.startDate;
        
        // ตรวจสอบสถานะการล็อค (สำหรับคูปองที่อยู่ในเดือนนี้แต่ยังไม่ถึงวันเริ่ม)
        const isBeforePromoStart = now < promoStartDate;
        
        let isLocked = false;
        
        if (isBeforePromoStart) {
          // ถ้ายังไม่ถึงวันที่เริ่มโปรโมชั่น (แต่ตัวโปรโมชั่นอยู่ในเดือนนี้) ให้ล็อคไว้
          isLocked = true;
        } else {
          // ถ้าอยู่ในช่วงโปรโมชั่นแล้ว ให้เช็ค activeDay รายวัน (ถ้ามีกำหนดไว้)
          if (c.activeDay !== undefined && currentDay < c.activeDay) {
            isLocked = true;
          }
        }

        return {
          ...c,
          isLocked,
          // ส่ง startDate ของโปรโมชั่นไปด้วยเพื่อให้ UI แสดงผลวันที่ปลดล็อคได้ถูกต้อง
          promoStartDate: p.startDate 
        };
      })
    }))
    // เรียงลำดับให้คูปองที่ใช้ได้ขึ้นก่อน
    .sort((a, b) => {
      const aAvailable = a.coupons.some(c => !(c as any).isLocked);
      const bAvailable = b.coupons.some(c => !(c as any).isLocked);
      if (aAvailable && !bAvailable) return -1;
      if (!aAvailable && bAvailable) return 1;
      return a.startDate.getTime() - b.startDate.getTime();
    });

  return { currentPromotions };
};

export default useWeeklyPromotions;
