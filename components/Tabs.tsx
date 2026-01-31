
import React from 'react';
import { CouponType } from '../types';

interface TabsProps {
  activeTab: CouponType;
  setActiveTab: (tab: CouponType) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const getTabClass = (tab: CouponType) => {
    const baseClass = "w-1/2 py-3 text-center font-semibold transition-colors duration-300";
    if (activeTab === tab) {
      return `${baseClass} bg-white text-[#F8B500]`;
    }
    return `${baseClass} bg-transparent text-white`;
  };

  return (
    <div className="flex w-full bg-white/20 rounded-t-2xl overflow-hidden">
      <button
        onClick={() => setActiveTab(CouponType.LINE_FRIEND)}
        className={getTabClass(CouponType.LINE_FRIEND)}
      >
        คูปอง LINE Friend
      </button>
      <button
        onClick={() => setActiveTab(CouponType.VISTA_MEMBER)}
        className={getTabClass(CouponType.VISTA_MEMBER)}
      >
        คูปองสมาชิก
      </button>
    </div>
  );
};

export default Tabs;
