import React, { useState } from 'react';
import { UserData } from '../types';

interface LineFriendFormProps {
  onSubmit: (data: UserData) => void;
}

const LineFriendForm: React.FC<LineFriendFormProps> = ({ onSubmit }) => {
  const [identifier, setIdentifier] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (identifier.length === 10) {
      onSubmit({ identifier });
    }
  };

  const handleClear = () => {
    setIdentifier('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="identifier" className="block text-sm font-medium mb-1 text-gray-700">เบอร์โทรศัพท์</label>
        <div className="relative">
          <input
            id="identifier"
            type="tel"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, ''))}
            placeholder="กรอกเบอร์โทรศัพท์"
            className="w-full bg-gray-100 placeholder-gray-400 rounded-lg py-3 px-4 pr-10 border-2 border-gray-200 focus:border-[#F8B500] focus:ring-1 focus:ring-[#F8B500] focus:outline-none transition-colors duration-200"
            required
            inputMode="tel"
            pattern="[0-9]{10}"
            maxLength={10}
            title="กรุณากรอกเบอร์โทรศัพท์ 10 หลัก"
            autoComplete="off"
          />
          {identifier.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="ล้างข้อมูล"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="pt-2">
        <button
          type="submit"
          className="w-full bg-[#F8B500] text-white font-bold py-3 rounded-full shadow-lg transition-transform duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={identifier.length !== 10}
        >
          รับคูปอง
        </button>
      </div>
    </form>
  );
};

export default LineFriendForm;