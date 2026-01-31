
import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CouponInfo } from '../types';

interface CouponDisplayProps {
  qrValue: string;
  onComplete: () => void;
  onGoBack: () => void;
  onExpire: () => void;
  isUsed?: boolean;
  coupon: CouponInfo;
  couponCode: string;
}

const CircularCountdown: React.FC<{ onExpire: () => void, isUsed?: boolean }> = ({ onExpire, isUsed }) => {
  const TOTAL_TIME = 300; // 5 minutes
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (isUsed) {
      setTimeLeft(0);
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          onExpireRef.current();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isUsed]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // Progress calculation for SVG stroke
  const radius = 40; // Reduced from 45 to 40
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / TOTAL_TIME;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center justify-center my-3">
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Progress Circle SVG */}
        <svg className="absolute w-full h-full -rotate-90 overflow-visible">
          {/* Background Ring */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth="6"
          />
          {/* Active Progress Ring */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="transparent"
            stroke="#F8B500"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        
        {/* Timer Text Container */}
        <div className="text-center z-10 flex flex-col items-center justify-center w-full pl-3">
          <p 
            className="text-2xl font-black text-slate-800 leading-none tracking-normal"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </p>
          <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-wide">minutes</p>
        </div>
      </div>
    </div>
  );
};

const CouponDisplay: React.FC<CouponDisplayProps> = ({ qrValue, onComplete, onGoBack, onExpire, isUsed = false, coupon, couponCode }) => {
  const [isExpired, setIsExpired] = useState(false);
  const [showFinalState, setShowFinalState] = useState(false);

  const handleExpire = () => {
    if (!isUsed && !isExpired) {
      setIsExpired(true);
      onExpire();
    }
  };
  
  const isFinalState = isUsed || isExpired;
  
  useEffect(() => {
    if (isFinalState) {
      const timer = setTimeout(() => {
        setShowFinalState(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setShowFinalState(false);
    }
  }, [isFinalState]);
  
  const canInteract = !isFinalState;

  return (
    <div className="flex flex-col items-center w-full relative min-h-screen bg-gray-50 overflow-hidden">
      
      {/* 1. Header Area with Gold Background */}
      <div className="bg-[#F8B500] w-full h-40 absolute top-0 left-0 rounded-b-[40px] z-0 flex items-start justify-center pt-6">
        <span className="text-white font-bold text-[16px] tracking-wide drop-shadow-sm">แสดง QR Code นี้กับพนักงาน</span>
      </div>

      {/* 2. Main Coupon Card Container */}
      <div className="relative z-10 w-full max-w-[330px] mt-14 mb-4 flex flex-col items-center">
        
        {/* White Floating Card */}
        <div className="bg-white rounded-[28px] shadow-xl shadow-black/5 w-full p-5 flex flex-col items-center">
          
          {/* QR Code with Yellow Border */}
          <div className="border-[4px] border-[#F8B500] p-2 rounded-[20px] mb-4 bg-white shadow-sm">
            <QRCodeSVG value={qrValue} size={160} bgColor="#ffffff" fgColor="#000000" level="H" />
          </div>

          {/* Coupon Code Section */}
          <div className="bg-[#F8F9FB] rounded-xl p-3 w-full text-center mb-4 border border-gray-100/50">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] mb-0.5">Coupon Code</p>
            <p className="text-xl font-black text-gray-800 tracking-tight">
              {couponCode}
            </p>
          </div>

          {/* Dashed Line Divider */}
          <div className="w-full border-t-2 border-dashed border-gray-100 mb-4 relative">
             <div className="absolute -left-[32px] -top-3 w-6 h-6 rounded-full bg-gray-50"></div>
             <div className="absolute -right-[32px] -top-3 w-6 h-6 rounded-full bg-gray-50"></div>
          </div>

          {/* Coupon Detail Text */}
          <div className="text-center w-full px-1">
            <h3 className="font-black text-gray-900 text-[17px] mb-0.5 leading-tight">{coupon.cardTitle}</h3>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed line-clamp-1">
              {coupon.description}
            </p>
          </div>
        </div>

        {/* 3. Timer Section */}
        <CircularCountdown onExpire={handleExpire} isUsed={isUsed} />

        {/* 4. Action Buttons */}
        {canInteract && (
          <div className="w-full space-y-3 px-2">
            <button
              onClick={onComplete}
              className="w-full bg-[#1A9D4B] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center shadow-lg shadow-green-900/10 active:scale-[0.97] transition-all duration-200"
            >
              <span className="text-[16px]">ยืนยันการใช้สิทธิ์</span>
            </button>
            
            <button
              onClick={onGoBack}
              className="w-full text-gray-400 font-bold text-[13px] py-1 transition-colors hover:text-gray-600"
            >
              ยกเลิก
            </button>
          </div>
        )}
      </div>

      {/* 5. Final State Overlay (Used/Expired) */}
      {isFinalState && (
        <div className={`fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 transition-all duration-500 ease-out ${showFinalState ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`transform transition-all duration-500 delay-100 ${showFinalState ? 'scale-100 rotate-0' : 'scale-50 -rotate-12'}`}>
            {isUsed ? (
              <div className="border-[10px] border-red-500 rounded-full px-10 py-6">
                <h2 className="text-7xl font-black text-red-500 drop-shadow-md">Used</h2>
              </div>
            ) : (
              <div className="border-[10px] border-gray-400 rounded-full px-10 py-6">
                <h2 className="text-5xl font-black text-gray-400 drop-shadow-md uppercase">Expired</h2>
              </div>
            )}
          </div>

          <button
            onClick={onGoBack}
            className="mt-20 w-full max-w-xs bg-white text-gray-900 font-bold py-4 rounded-2xl shadow-2xl transition-transform active:scale-95"
          >
            ย้อนกลับ
          </button>
        </div>
      )}
    </div>
  );
};

export default CouponDisplay;
