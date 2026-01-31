
import React, { useState, useCallback, useEffect } from 'react';
import { UserData, UserStatus, CouponInfo, CouponHistoryEntry } from './types';
import { VISTA_BRANCHES, MEMBER_MODAL_SCHEDULE, COUPON_PREFIX_MEMBER, COUPON_PREFIX_GUEST } from './constants';
import { validateUser, logUsage } from './services/api';
import MemberLoginModal from './components/MemberLoginModal';
import CouponDisplay from './components/CouponDisplay';
import CouponSelection from './components/CouponSelection';
import CouponDetail from './components/CouponDetail';
import CouponHistory from './components/CouponHistory';
import LoginScreen from './components/LoginScreen';
import useGeolocation from './hooks/useGeolocation';
import useWeeklyPromotions from './hooks/useWeeklyPromotions';

type ViewState = 'LOGIN' | 'VALIDATING' | 'MEMBER_CONFIRMATION' | 'PROMPT_REGISTER' | 'COUPON_SELECTION' | 'COUPON_DETAIL' | 'COUPON' | 'USED' | 'ERROR' | 'HISTORY' | 'REGISTER';

export default function App() {
  const [view, setView] = useState<ViewState>('LOGIN');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [memberName, setMemberName] = useState<string | null>(null);
  const [qrValue, setQrValue] = useState<string>('');
  const [couponCode, setCouponCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [couponEntitlement, setCouponEntitlement] = useState<UserStatus.MEMBER | UserStatus.NON_MEMBER | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponInfo | null>(null);
  const [isMemberLoginModalOpen, setMemberLoginModalOpen] = useState(false);
  const [autoLoginId, setAutoLoginId] = useState<string | null>(null);

  const [usedCouponIds, setUsedCouponIds] = useState<string[]>(() => {
    try {
      const item = window.localStorage.getItem('usedCouponIds');
      const parsedItem = item ? JSON.parse(item) : [];
      return Array.isArray(parsedItem) ? parsedItem : [];
    } catch (error) {
      console.error('Error reading usedCouponIds from localStorage:', error);
      return [];
    }
  });
  const [couponHistory, setCouponHistory] = useState<CouponHistoryEntry[]>(() => {
    try {
      const item = window.localStorage.getItem('couponHistory');
      const parsedItem = item ? JSON.parse(item) : [];
      return Array.isArray(parsedItem) ? parsedItem : [];
    } catch (error) {
      console.error('Error reading couponHistory from localStorage:', error);
      return [];
    }
  });
  const [branchForLogging, setBranchForLogging] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const { triggerGeolocation, resetLocation } = useGeolocation(VISTA_BRANCHES);
  const { currentPromotions } = useWeeklyPromotions();

  useEffect(() => {
    try {
      window.localStorage.setItem('usedCouponIds', JSON.stringify(usedCouponIds));
    } catch (error)      {
        console.error('Error saving usedCouponIds to localStorage:', error);
    }
  }, [usedCouponIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem('couponHistory', JSON.stringify(couponHistory));
    } catch (error) {
      console.error('Error saving couponHistory to localStorage:', error);
    }
  }, [couponHistory]);

  // Listen for registration success message from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'VISTA_REGISTER_SUCCESS') {
        const phone = event.data.phoneNumber;
        if (phone && phone.length === 10) {
          setAutoLoginId(phone);
          setView('LOGIN');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleCouponSelection = useCallback((coupon: CouponInfo) => {
    setSelectedCoupon(coupon);
    setView('COUPON_DETAIL');
  }, []);

  const handleUseCoupon = useCallback(async () => {
    if (!selectedCoupon) return;

    setView('VALIDATING');
    
    try {
      const { branch } = await triggerGeolocation();
      setBranchForLogging(branch?.name ?? null);
    } catch (e) {
        console.warn("Geolocation failed, proceeding without branch info.", e);
        setBranchForLogging(null);
    }

    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    
    const prefix = selectedCoupon.isMemberOnly ? COUPON_PREFIX_MEMBER : COUPON_PREFIX_GUEST;
    const generatedCode = `${prefix}${day}${month}-${randomDigits}`;
    
    setQrValue(generatedCode);
    setCouponCode(generatedCode);
    setView('COUPON');
  }, [selectedCoupon, triggerGeolocation]);


  const handleValidation = useCallback(async (data: UserData) => {
    setMemberLoginModalOpen(false);
    setAutoLoginId(null); 
    setView('VALIDATING');
    setErrorMessage('');
    setUserData(data);
    setMemberName(null);

    try {
      const result = await validateUser(data);

      if (result.status === UserStatus.MEMBER) {
        setMemberName(result.name ?? null);
        setView('MEMBER_CONFIRMATION');
      } else if (result.status === UserStatus.NON_MEMBER) {
        setView('PROMPT_REGISTER');
      } else {
        setErrorMessage('ข้อมูลไม่ถูกต้อง หรือคุณใช้สิทธิ์ครบแล้ว');
        setView('ERROR');
      }
    } catch (error) {
      console.error('Validation Error Details:', error);
      let message = 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์ กรุณาลองใหม่อีกครั้ง';
      
      if (error instanceof Error) {
        // จัดการกรณี Error Message จากเบราว์เซอร์ที่พบบ่อย
        if (error.message === 'Script error.') {
          message = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ในขณะนี้ กรุณาเว้นระยะสักครู่แล้วลองใหม่ค่ะ';
        } else {
          message = error.message;
        }
      }
      
      setErrorMessage(message);
      setView('ERROR');
    }
  }, []);
  
  const handleProceedAsNonMember = useCallback(() => {
    setUserData({ identifier: 'Guest' });
    setCouponEntitlement(UserStatus.NON_MEMBER);
    setView('COUPON_SELECTION');
  }, []);
  
  const handleMemberConfirm = useCallback(() => {
    setCouponEntitlement(UserStatus.MEMBER);
    setView('COUPON_SELECTION');
  }, []);

  const handleMemberClear = useCallback(() => {
    setUserData(null);
    setMemberName(null);
    setCouponEntitlement(UserStatus.NON_MEMBER);
    setView('LOGIN');
  }, []);

  const handleCouponUsed = useCallback(() => {
    if (selectedCoupon && !isFinalizing) {
      setIsFinalizing(true);
      setView('USED');
      setUsedCouponIds(prev => [...new Set([...prev, selectedCoupon.id])]);

      const newHistoryEntry: CouponHistoryEntry = {
        coupon: selectedCoupon,
        status: 'Used',
        date: new Date().toISOString(),
        couponCode: couponCode,
      };
      setCouponHistory(prev => [newHistoryEntry, ...prev]);

      const currentUserData = userData || { identifier: 'Guest' };
      logUsage({
        ...currentUserData,
        branchName: branchForLogging,
        couponName: selectedCoupon.name,
        couponDescription: selectedCoupon.description,
        couponCode: couponCode,
        memberName: memberName,
        status: 'Used',
      }).catch(error => {
        console.error("Failed to log coupon usage in the background:", error);
      });
    }
  }, [selectedCoupon, userData, memberName, couponCode, branchForLogging, isFinalizing]);

  const handleCouponExpired = useCallback(() => {
    if (selectedCoupon && !isFinalizing) {
      setIsFinalizing(true);
      setUsedCouponIds(prev => [...new Set([...prev, selectedCoupon.id])]);
      
      const newHistoryEntry: CouponHistoryEntry = {
        coupon: selectedCoupon,
        status: 'Expired',
        date: new Date().toISOString(),
        couponCode: couponCode,
      };
      setCouponHistory(prev => [newHistoryEntry, ...prev]);

      const currentUserData = userData || { identifier: 'Guest' };
      logUsage({
          ...currentUserData,
          branchName: branchForLogging,
          couponName: selectedCoupon.name,
          couponDescription: `Expired: ${selectedCoupon.description}`,
          couponCode: couponCode,
          memberName: memberName,
          status: 'Expired',
      }).catch(error => {
          console.error("Failed to log expired coupon in the background:", error);
      });
    }
  }, [selectedCoupon, userData, memberName, couponCode, branchForLogging, isFinalizing]);
  
  const handleGoBackToSelection = useCallback(() => {
    setView('COUPON_SELECTION');
    setSelectedCoupon(null);
    setQrValue('');
    setCouponCode('');
    resetLocation();
    setIsFinalizing(false);
  }, [resetLocation]);
  
  const handleViewHistory = useCallback(() => {
    setView('HISTORY');
  }, []);

  const handleRegisterClick = useCallback(() => {
    setView('REGISTER');
  }, []);

  const resetState = () => {
    setView('LOGIN');
    setErrorMessage('');
    setUserData(null);
    setMemberName(null);
    setCouponEntitlement(null);
    setSelectedCoupon(null);
    setCouponCode('');
    setAutoLoginId(null);
    resetLocation();
    setIsFinalizing(false);
  };

  const renderContent = () => {
    switch (view) {
      case 'LOGIN':
        return <LoginScreen onSubmit={handleValidation} onRegisterClick={handleRegisterClick} autoLoginId={autoLoginId} />;
      case 'REGISTER':
        return (
          <div className="flex flex-col w-full h-screen bg-white overflow-hidden">
            <header className="flex items-center justify-between p-4 bg-white border-b border-gray-100 flex-shrink-0 z-20">
              <button 
                onClick={resetState} 
                className="flex items-center space-x-2 text-gray-500 font-bold active:scale-95 transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span>กลับหน้าหลัก</span>
              </button>
              <h1 className="text-sm font-bold text-gray-900">สมัครสมาชิก</h1>
              <div className="w-20"></div>
            </header>
            <div className="flex-grow w-full relative">
              <iframe 
                src="https://vista-caf-member-sign-up-186896723259.us-west1.run.app/" 
                className="w-full h-full border-none"
                title="สมัครสมาชิก Vista Café"
              />
            </div>
          </div>
        );
      case 'VALIDATING':
        return (
          <div className="flex flex-col items-center justify-center text-gray-600 p-8 h-screen w-full bg-pattern">
            <svg className="animate-spin h-12 w-12 text-[#F8B500] mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xl font-bold text-gray-900">กำลังตรวจสอบข้อมูล...</p>
            <p className="text-gray-400 mt-2">กรุณารอสักครู่</p>
          </div>
        );
      case 'MEMBER_CONFIRMATION':
        return (
          <div className="flex flex-col items-center justify-center text-gray-800 p-8 text-center w-full min-h-screen bg-pattern overflow-hidden">
            <div className="mb-12 relative flex items-center justify-center">
               <div className="w-32 h-32 bg-green-50 rounded-full animate-pulse-subtle"></div>
               <div className="absolute inset-0 w-32 h-32 bg-green-100 rounded-full animate-ripple-center opacity-0 pointer-events-none"></div>
               <div className="absolute w-24 h-24 bg-white rounded-full flex items-center justify-center border border-green-50 shadow-2xl shadow-green-900/5 animate-success-pop overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={4.5} 
                      d="M5 13l4 4L19 7" 
                      className="animate-check-draw"
                    />
                  </svg>
               </div>
            </div>
            
            <div className="mb-10 animate-fade-up">
               <h2 className="text-[30px] font-black text-[#111827] tracking-tight">ยืนยันข้อมูลสมาชิก</h2>
            </div>
            
            <div className="bg-white rounded-[32px] p-8 w-full max-w-[360px] text-left mb-10 space-y-6 border border-gray-100 shadow-xl shadow-gray-200/40 animate-fade-up delay-100 overflow-hidden">
                <div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 opacity-70">หมายเลขสมาชิก</p>
                    <p className="text-[20px] font-black text-gray-800 tracking-tight truncate">{userData?.identifier}</p>
                </div>
                <div className="pt-5 border-t border-gray-50">
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 opacity-70">ชื่อ-นามสกุล</p>
                    <p 
                      className="font-black text-gray-800 tracking-tight whitespace-nowrap transition-all duration-300"
                      style={{ 
                        fontSize: memberName && memberName.length > 18 
                          ? `${Math.max(12, 20 - (memberName.length - 18) * 0.45)}px` 
                          : '20px'
                      }}
                    >
                      {memberName || '...'}
                    </p>
                </div>
            </div>

            <div className="w-full max-w-[360px] space-y-5">
              <div className="animate-fade-up delay-200">
                <button
                  onClick={handleMemberConfirm}
                  className="relative overflow-hidden w-full bg-[#111827] text-white font-bold py-6 px-6 rounded-2xl shadow-xl shadow-gray-200 transition-all duration-300 active:scale-95 hover:bg-black"
                >
                  <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full h-full -translate-x-full animate-shimmer pointer-events-none"></div>
                  <span className="relative z-10">ยืนยันข้อมูลสมาชิก</span>
                </button>
              </div>
              
              <div className="animate-fade-up delay-300">
                <button
                  onClick={handleMemberClear}
                  className="w-full bg-transparent text-gray-400 font-bold py-2 px-6 rounded-2xl transition-colors hover:text-gray-600 text-sm"
                >
                  ข้อมูลไม่ถูกต้อง? <span className="underline decoration-gray-200 underline-offset-4">กรอกใหม่</span>
                </button>
              </div>
            </div>
          </div>
        );
      case 'PROMPT_REGISTER':
        return (
          <div className="flex flex-col items-center justify-center text-gray-800 p-8 text-center w-full min-h-screen bg-pattern">
            <div className="mb-10">
               <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
               </div>
               <h2 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบข้อมูลสมาชิก</h2>
               <p className="text-gray-500 text-sm">สมัครสมาชิกฟรีเพื่อรับสิทธิประโยชน์</p>
            </div>

            <div className="w-full max-w-[320px] space-y-4">
              <button
                onClick={handleRegisterClick}
                className="block w-full text-center bg-[#F8B500] text-white font-bold py-4 px-6 rounded-2xl shadow-xl transition-transform duration-200 active:scale-95"
              >
                สมัครสมาชิกใหม่
              </button>
              <button
                onClick={resetState}
                className="w-full bg-white text-gray-600 font-bold py-4 px-6 rounded-2xl border border-gray-100 shadow-sm transition-colors active:bg-gray-50"
              >
                กลับไปหน้าหลัก
              </button>
            </div>
          </div>
        );
      case 'COUPON_SELECTION':
      default:
        if (couponEntitlement) {
          return (
            <CouponSelection
              entitlement={couponEntitlement}
              onSelect={handleCouponSelection}
              promotions={currentPromotions}
              onLoginClick={() => setMemberLoginModalOpen(true)}
              usedCouponIds={usedCouponIds}
              onViewHistory={handleViewHistory}
            />
          );
        }
        return null;
      case 'COUPON_DETAIL':
        if (selectedCoupon) {
            return (
                <CouponDetail 
                    coupon={selectedCoupon}
                    onUse={handleUseCoupon}
                    onBack={handleGoBackToSelection}
                />
            );
        }
        setView('COUPON_SELECTION');
        return null;
      case 'COUPON':
        return <CouponDisplay qrValue={qrValue} onComplete={handleCouponUsed} onGoBack={handleGoBackToSelection} coupon={selectedCoupon!} couponCode={couponCode} onExpire={handleCouponExpired} />;
      case 'USED':
        return <CouponDisplay qrValue={qrValue} onComplete={() => {}} onGoBack={handleGoBackToSelection} isUsed={true} coupon={selectedCoupon!} couponCode={couponCode} onExpire={() => {}} />;
      case 'HISTORY':
        return <CouponHistory history={couponHistory} onBack={handleGoBackToSelection} />;
      case 'ERROR':
        return (
          <div className="flex flex-col items-center justify-center text-gray-800 p-8 h-screen text-center w-full bg-pattern">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
            </div>
            <p className="text-xl font-bold text-red-600 mb-2">เกิดข้อผิดพลาด!</p>
            <p className="mb-10 text-gray-500 max-w-xs mx-auto">{errorMessage}</p>
            <button
              onClick={resetState}
              className="bg-[#111827] text-white font-bold py-4 px-10 rounded-2xl shadow-xl transition-all active:scale-95"
            >
              ย้อนกลับหน้าแรก
            </button>
          </div>
        );
    }
  };
  
  const containerBG = ['COUPON_SELECTION', 'COUPON_DETAIL', 'HISTORY'].includes(view) ? 'bg-pattern-gray' : 'bg-pattern';


  return (
    <div className="bg-gray-100">
      <div className={`w-full max-w-sm mx-auto text-gray-800 relative flex flex-col min-h-screen ${containerBG}`}>
        <div className="relative z-10 flex flex-col items-center flex-grow w-full">
            {renderContent()}
        </div>
        <MemberLoginModal
          isOpen={isMemberLoginModalOpen}
          onClose={() => setMemberLoginModalOpen(false)}
          onSubmit={handleValidation}
        />
      </div>
    </div>
  );
}
