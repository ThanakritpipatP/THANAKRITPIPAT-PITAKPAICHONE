
import React, { useState, useEffect } from 'react';
import { UserData } from '../types';

interface LoginScreenProps {
  onSubmit: (data: UserData) => void | Promise<void>;
  onRegisterClick: () => void;
  autoLoginId?: string | null;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSubmit, onRegisterClick, autoLoginId }) => {
  const [identifier, setIdentifier] = useState('');
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);

  // Auto-fill and Auto-submit with a safer delay if autoLoginId is provided
  useEffect(() => {
    if (autoLoginId && autoLoginId.length === 10) {
      setIdentifier(autoLoginId);
      setIsAutoSubmitting(true);
      
      // Increased delay to 3s to handle database sync time after registration
      const timer = setTimeout(() => {
        onSubmit({ identifier: autoLoginId });
        setIsAutoSubmitting(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [autoLoginId, onSubmit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (identifier.length === 10 && !isAutoSubmitting) {
      onSubmit({ identifier });
    }
  };

  const handleClear = () => {
    if (!isAutoSubmitting) {
      setIdentifier('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-pattern">
      <div className="flex-grow flex flex-col items-center justify-center px-8 py-12 w-full">
        <div className="mb-12 text-center w-full">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="flex items-baseline space-x-3 mb-2">
              <h1 className="text-[#111827] text-7xl brand-logo-text">vista</h1>
              <h1 className="text-[#111827] text-7xl brand-logo-text">café</h1>
            </div>
            <div className="relative w-32 h-[3px] bg-gray-100 overflow-hidden rounded-full">
               <div className="absolute top-0 left-0 w-1/2 h-full bg-black animate-line-slide"></div>
            </div>
            <p className="text-[#9CA3AF] text-[10px] uppercase tracking-[0.5em] font-bold mt-4">Healthy & Tasty</p>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {isAutoSubmitting ? 'กำลังนำคุณเข้าสู่ระบบ...' : 'ยินดีต้อนรับ'}
          </h2>
          <p className="text-black text-sm font-medium">
            {isAutoSubmitting ? 'ตรวจสอบข้อมูลสมาชิกใหม่ของคุณสักครู่' : 'กรุณาระบุหมายเลขสมาชิกเพื่อรับสิทธิพิเศษ'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-[320px] space-y-6">
          <div className="relative">
            <label htmlFor="login-identifier" className="block text-xs font-bold text-black uppercase tracking-widest mb-2 ml-1">หมายเลขสมาชิก / เบอร์โทรศัพท์</label>
            <div className="relative">
              <input
                id="login-identifier"
                type="tel"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, ''))}
                placeholder="08XXXXXXXX"
                disabled={isAutoSubmitting}
                className={`w-full bg-white border-2 rounded-2xl py-4 px-5 text-lg font-bold text-gray-800 placeholder-gray-300 focus:ring-0 focus:outline-none transition-all duration-300 shadow-lg shadow-gray-100/50 ${
                  isAutoSubmitting ? 'border-[#F8B500] bg-orange-50/30' : 'border-gray-100 focus:border-[#F8B500]'
                }`}
                required
                inputMode="tel"
                pattern="[0-9]{10}"
                maxLength={10}
                autoComplete="tel"
              />
              {identifier.length > 0 && !isAutoSubmitting && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={identifier.length !== 10 || isAutoSubmitting}
            className="relative overflow-hidden w-full bg-[#111827] text-white font-bold py-4 rounded-2xl shadow-xl shadow-gray-200 transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale disabled:pointer-events-none text-lg"
          >
            {(identifier.length === 10 || isAutoSubmitting) && (
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full -translate-x-full animate-shimmer pointer-events-none"></div>
            )}
            <span className="relative z-10">
              {isAutoSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ/รับคูปอง'}
            </span>
          </button>
        </form>

        <div className="mt-12 text-center flex flex-col items-center space-y-5">
          <button
            onClick={onRegisterClick}
            disabled={isAutoSubmitting}
            className={`text-[#F8B500] font-bold text-[14px] hover:opacity-80 transition-opacity border-b-2 border-[#F8B500] pb-0.5 ${isAutoSubmitting ? 'opacity-30 pointer-events-none' : ''}`}
          >
            สมัครสมาชิก (สำหรับลูกค้าใหม่)
          </button>
        </div>
      </div>

      <footer className="w-full bg-white border-t border-gray-100 py-4 flex items-center justify-center">
        <p className="text-[#111827] text-[13px] font-medium opacity-60">
          © {new Date().getFullYear()} Vista Café. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default LoginScreen;
