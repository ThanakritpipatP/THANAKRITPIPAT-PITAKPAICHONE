
import React, { useState } from 'react';
import { CouponInfo } from '../types';
import TermsModal from './TermsModal';

interface CouponDetailProps {
  coupon: CouponInfo;
  onUse: () => void;
  onBack: () => void;
}

const CouponDetail: React.FC<CouponDetailProps> = ({ coupon, onUse, onBack }) => {
  const [isTermsModalOpen, setTermsModalOpen] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: `คูปอง Vista Café: ${coupon.cardTitle}`,
      text: coupon.description,
      url: 'https://vista-caf-coupon-line-friend-662889500453.us-west1.run.app',
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      alert('ฟังก์ชันแชร์ไม่รองรับในเบราว์เซอร์นี้');
    }
  };
  
  const endDate = coupon.validityPeriod.split(' - ')[1] || coupon.validityPeriod;

  return (
    <div className="w-full bg-[#F3F4F6] flex flex-col min-h-screen relative overflow-x-hidden">
      {/* 1. Header Area with Coupon Image */}
      <div className="relative w-full h-[300px] flex flex-col items-center justify-center bg-[#1A1A1A] overflow-hidden">
        {/* Coupon Image Background */}
        {coupon.imageUrl ? (
          <>
            <img 
              src={coupon.imageUrl} 
              alt={coupon.name} 
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
            {/* Dark Gradient Overlay for better button visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20 z-10"></div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-8">
             <div className="text-center">
                <div className="flex items-baseline space-x-2">
                   <h1 className="text-white text-5xl brand-logo-text">vista</h1>
                   <h1 className="text-white text-5xl brand-logo-text">café</h1>
                </div>
                <div className="relative h-[2px] w-24 bg-white/20 my-2 mx-auto overflow-hidden rounded-full">
                   <div className="absolute top-0 left-0 h-full w-1/2 bg-white animate-line-slide"></div>
                </div>
                <p className="text-white/80 text-[10px] uppercase tracking-[0.3em] font-medium">Healthy & Tasty</p>
             </div>
          </div>
        )}

        {/* Navigation Buttons Overlay */}
        <div className="absolute top-6 left-0 right-0 px-4 flex justify-between items-center z-30">
          <button 
            onClick={onBack} 
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-lg flex items-center justify-center text-white transition-transform active:scale-90 border border-white/20"
            aria-label="Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={handleShare} 
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-lg flex items-center justify-center text-white transition-transform active:scale-90 border border-white/20"
            aria-label="Share"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. Main Content Card */}
      <div className="bg-white flex-grow rounded-t-[40px] -mt-12 relative z-20 px-6 pt-10 pb-28 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)]">
        {/* Label: COUPON */}
        <p className="text-[#9CA3AF] text-[11px] font-bold tracking-[0.2em] mb-3 uppercase">COUPON</p>

        {/* Title and Short Description */}
        <h2 className="text-[28px] font-bold text-[#111827] leading-tight mb-3">
          {coupon.cardTitle}
        </h2>
        <p className="text-[#6B7280] text-base font-medium leading-relaxed mb-8">
          {coupon.description}
        </p>

        {/* Validity Period Box */}
        <div className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-[24px] p-5 flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-white border border-[#F1F5F9] shadow-sm flex items-center justify-center flex-shrink-0">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#F8B500]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[#9CA3AF] text-[11px] font-bold uppercase tracking-wider mb-0.5">ระยะเวลาใช้งาน</span>
            <span className="text-[#111827] font-bold text-[15px]">{coupon.validityPeriod}</span>
          </div>
        </div>

        {/* Terms of Use Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#111827]">เงื่อนไขการใช้งาน</h3>
          <div className="bg-[#F9FAFB] rounded-2xl p-5 border border-[#F3F4F6] shadow-sm">
            <p className="text-[#374151] text-sm leading-relaxed mb-5">
              {coupon.details}
            </p>
            <div className="pt-4 border-t border-[#E5E7EB] flex items-center">
              <span className="text-[#9CA3AF] text-xs font-medium">หมดเขต: {endDate}</span>
            </div>
          </div>
        </div>

        {/* More Terms Link */}
        <button 
          onClick={() => setTermsModalOpen(true)}
          className="w-full mt-6 py-4 flex items-center justify-between group border-b border-gray-100"
        >
          <span className="text-[#4B5563] text-sm font-semibold group-hover:text-[#111827] transition-colors">ข้อกำหนดและเงื่อนไขเพิ่มเติม</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D1D5DB] group-hover:text-[#F8B500] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 3. Sticky Bottom Footer with Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/80 backdrop-blur-md border-t border-gray-100 z-40 max-w-sm mx-auto w-full">
        <button 
          onClick={onUse} 
          className="relative overflow-hidden w-full bg-[#1A9D4B] text-white text-[17px] font-bold py-4 rounded-2xl shadow-xl shadow-green-900/10 transition-all duration-200 active:scale-[0.97] animate-pulse-subtle hover:bg-[#15803d]"
        >
          {/* Shimmer Effect Layer */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/25 to-transparent w-full h-full -translate-x-full animate-shimmer pointer-events-none"></div>
          <span className="relative z-10">กดรับสิทธิ์</span>
        </button>
      </div>

      {/* Terms Modal Overlay */}
      <TermsModal 
        isOpen={isTermsModalOpen} 
        onClose={() => setTermsModalOpen(false)} 
        terms={coupon.terms} 
      />
    </div>
  );
};

export default CouponDetail;