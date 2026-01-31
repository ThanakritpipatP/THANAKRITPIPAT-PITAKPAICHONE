
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { UserStatus, CouponInfo, WeeklyPromotion } from '../types';
import Logo from './Logo';

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

// --- CouponCard component: Optimized for height-constrained horizontal carousel ---
interface CouponCardProps {
  coupon: CouponInfo & { isLocked?: boolean, promoStartDate?: Date };
  onSelect: (coupon: CouponInfo) => void;
  isUsed?: boolean;
  isNearExpiry?: boolean;
}

const CouponCard: React.FC<CouponCardProps> = ({ coupon, onSelect, isUsed = false, isNearExpiry = false }) => {
  const isMember = coupon.isMemberOnly;
  const isLocked = coupon.isLocked;
  
  // คำนวณวันที่และเดือนที่จะปลดล็อค
  const unlockText = useMemo(() => {
    if (!isLocked) return '';
    
    // กรณีมี activeDay (คูปองรายเดือนที่ระบุวันที่)
    if (coupon.activeDay) {
      const monthIndex = new Date().getMonth();
      return `เริ่มใช้ได้วันที่ ${coupon.activeDay} ${THAI_MONTHS[monthIndex]} 69`;
    }
    
    // กรณีเป็นคูปองตามช่วงเวลา (ใช้ startDate จากโปรโมชั่น)
    if (coupon.promoStartDate) {
      const d = coupon.promoStartDate;
      return `เริ่มใช้ได้วันที่ ${d.getDate()} ${THAI_MONTHS[d.getMonth()]} 69`;
    }
    
    return 'ยังไม่เปิดให้ใช้งาน';
  }, [isLocked, coupon.activeDay, coupon.promoStartDate]);

  const containerClasses = `inline-block align-top w-[280px] flex-shrink-0 rounded-[32px] overflow-hidden bg-white shadow-xl shadow-gray-200/50 border border-gray-100 transition-all duration-300 ${
    isLocked ? 'opacity-70 grayscale-[0.6]' : ''
  } snap-center`;

  return (
    <div className={containerClasses}>
      {/* 1. Image Section - 4:4.4 ratio */}
      <div className="relative aspect-[4/4.4] w-full overflow-hidden bg-[#1A1A1A]">
        {coupon.imageUrl ? (
          <img src={coupon.imageUrl} alt={coupon.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gradient-to-br from-slate-700 to-slate-900">
            <h1 className="text-4xl brand-logo-text">vista</h1>
            <h1 className="text-4xl brand-logo-text -mt-1">café</h1>
          </div>
        )}
        
        {isMember && (
          <div className="absolute top-4 left-0 z-30">
            <div className="bg-[#F8B500] text-white text-[10px] font-bold pl-4 pr-5 py-1.5 rounded-r-full shadow-lg">
              Member Only
            </div>
          </div>
        )}

        {/* Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-40 backdrop-blur-[2px]">
             <div className="bg-white/90 w-14 h-14 rounded-full shadow-2xl mb-4 flex items-center justify-center border border-white/20">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
             </div>
             <div className="bg-black/40 px-5 py-2 rounded-full border border-white/30 backdrop-blur-md shadow-lg">
               <p className="text-white font-bold text-[13px] whitespace-nowrap">
                 {unlockText}
               </p>
             </div>
          </div>
        )}
      </div>

      {/* 2. Divider with Cutouts */}
      <div className="relative h-6 flex items-center">
        <div className="absolute left-[-12px] w-6 h-6 rounded-full bg-white border-r border-gray-100 shadow-inner"></div>
        <div className="w-full border-t border-dashed border-gray-200 mx-6"></div>
        <div className="absolute right-[-12px] w-6 h-6 rounded-full bg-white border-l border-gray-100 shadow-inner"></div>
      </div>

      {/* 3. Content Section */}
      <div className="px-6 pb-6 flex flex-col">
        <div className="mb-3">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-[18px] text-gray-900 leading-tight truncate flex-grow pr-2">
              {coupon.cardTitle}
            </h3>
            
            {isNearExpiry && !isLocked && (
              <div className="flex-shrink-0 mt-0.5">
                <div className="bg-gradient-to-r from-[#FF5F6D] to-[#FFC371] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center space-x-1 backdrop-blur-sm border border-white/10 whitespace-nowrap animate-pulse">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  <span>ใกล้หมดเวลา</span>
                </div>
              </div>
            )}
          </div>
          
          <p className="text-gray-500 text-[13px] leading-snug line-clamp-1">
            {coupon.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="bg-gray-100 text-gray-400 text-[10px] font-bold px-3 py-1.5 rounded-xl whitespace-nowrap">
            {coupon.usageLimit}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isLocked) onSelect(coupon);
            }}
            disabled={isLocked}
            className={`relative overflow-hidden flex items-center space-x-2 border-2 px-4 py-1.5 rounded-xl font-bold text-[13px] transition-all active:scale-[0.95] ${
              isLocked
                ? 'border-gray-100 text-gray-300' 
                : 'border-[#F8B500] text-[#F8B500] hover:bg-[#F8B500] hover:text-white'
            }`}
          >
            {!isLocked && (
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full h-full -translate-x-full animate-shimmer pointer-events-none"></div>
            )}
            <span className="relative z-10">
              {isLocked ? 'ยังไม่ถึงเวลา' : 'กดรับสิทธิ์'}
            </span>
            {!isLocked && <span className="relative z-10 text-[11px] font-black">{">"}</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- New HistoryButton component replacing SignUpButton ---
interface HistoryButtonProps {
  onClick: () => void;
}

const HistoryButton: React.FC<HistoryButtonProps> = ({ onClick }) => (
  <button 
    onClick={onClick}
    className="relative flex items-center justify-between bg-white text-black p-3 px-4 rounded-[20px] shadow-lg shadow-gray-200/40 border border-gray-50 group w-full text-left transition-transform active:scale-[0.98]"
  >
    <div className="flex items-center space-x-3 overflow-hidden">
      <div className="bg-[#64748b] w-10 h-10 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="overflow-hidden">
        <p className="font-bold text-[15px] text-gray-900 leading-tight truncate whitespace-nowrap">ประวัติการใช้คูปอง</p>
        <p className="text-gray-400 text-[11px] truncate whitespace-nowrap">ตรวจสอบคูปองที่ใช้แล้วหรือหมดอายุ</p>
      </div>
    </div>
    <div className="bg-gray-50 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </button>
);

interface CouponSelectionProps {
  entitlement: UserStatus.MEMBER | UserStatus.NON_MEMBER;
  onSelect: (coupon: CouponInfo) => void;
  promotions: WeeklyPromotion[];
  onLoginClick: () => void;
  usedCouponIds: string[];
  onViewHistory: () => void;
}

const CouponSelection: React.FC<CouponSelectionProps> = ({ entitlement, onSelect, promotions, onLoginClick, usedCouponIds, onViewHistory }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const allAvailableCoupons = useMemo(() => {
    const now = Date.now();
    const NEAR_EXPIRY_THRESHOLD = 48 * 60 * 60 * 1000; // 48 hours

    // 1. Flatten all promotions and their coupons
    const coupons = promotions.flatMap(p => {
      // Check for near expiry (only for started coupons)
      const isStarted = now >= p.startDate.getTime();
      const isNearExpiry = isStarted && (p.endDate.getTime() - now) < NEAR_EXPIRY_THRESHOLD;
      
      const filteredCoupons = entitlement === UserStatus.MEMBER 
        ? p.coupons 
        : p.coupons.filter(c => !c.isMemberOnly);
        
      return filteredCoupons.map(coupon => ({
        ...coupon,
        isNearExpiry: isNearExpiry
      }));
    });

    // 2. FILTER OUT USED COUPONS: คูปองที่ถูกใช้งานแล้ว ให้หายไปเลยไม่ต้องกลับมาโชว์
    return coupons.filter(c => !usedCouponIds.includes(c.id));
  }, [promotions, entitlement, usedCouponIds]);

  const memberCouponsExist = useMemo(() => promotions.some(p => p.coupons.some(c => c.isMemberOnly)), [promotions]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const itemWidth = 300; 
      const index = Math.round(scrollLeft / itemWidth);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  };

  if (allAvailableCoupons.length === 0) {
    return (
        <div className="p-10 text-gray-800 w-full text-center flex flex-col items-center justify-center h-screen bg-pattern-gray">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vista <span className="text-[#F8B500]">e-Coupon</span></h1>
            <p className="text-gray-500 mb-10">ขณะนี้ยังไม่มีคูปองใหม่ รอติดตามกิจกรรมในครั้งต่อไปนะคะ</p>
            <div className="w-full max-w-[340px]">
              <HistoryButton onClick={onViewHistory} />
            </div>
        </div>
    );
  }
  
  return (
    <div className="bg-pattern-gray text-gray-800 w-full self-stretch flex flex-col h-screen max-h-screen overflow-hidden">
      <header className="pt-5 pb-6 px-6 flex-shrink-0 flex items-center justify-between">
        <h1 className="text-[25px] font-bold text-gray-900 leading-tight">
          Vista <span className="text-[#F8B500]">e-Coupon</span>
        </h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow flex flex-col justify-start overflow-hidden">
        <div className="px-6 mb-3">
           <HistoryButton onClick={onViewHistory} />
        </div>

        <div className="flex-grow flex flex-col overflow-hidden">
          <div className="px-6 mb-1.5 flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-gray-900">คูปองแนะนำสำหรับคุณ</h2>
          </div>
          
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="w-full overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory flex items-start h-full"
          >
            <div className="flex space-x-5 px-6 pb-4">
              {allAvailableCoupons.map((coupon, idx) => (
                <CouponCard
                  key={`${coupon.id}-${idx}`}
                  coupon={coupon as any}
                  onSelect={onSelect}
                  isNearExpiry={(coupon as any).isNearExpiry}
                />
              ))}
              <div className="w-6 flex-shrink-0"></div>
            </div>
          </div>

          {allAvailableCoupons.length > 1 && (
            <div className="flex items-center justify-center space-x-1.5 py-4">
              {allAvailableCoupons.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeIndex 
                      ? 'w-6 bg-[#F8B500]' 
                      : 'w-1.5 bg-gray-200'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      
      {entitlement === UserStatus.NON_MEMBER && memberCouponsExist && (
        <footer className="px-6 pb-5 pt-1 flex-shrink-0">
          <button
            onClick={onLoginClick}
            className="w-full bg-[#111827] text-white font-bold py-3.5 px-8 rounded-[20px] shadow-xl transition-transform active:scale-[0.98] text-[15px]"
          >
            เข้าสู่ระบบสมาชิกเพื่อรับคูปองเพิ่ม
          </button>
        </footer>
      )}
    </div>
  );
};

export default CouponSelection;
