
import React from 'react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  terms: string;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, terms }) => {
  if (!isOpen) return null;

  // Function to format the terms string into a list
  const formatTerms = (termsText: string) => {
    return termsText
      .trim()
      .split('\n')
      .map(line => line.trim().replace(/^-/, '').trim())
      .filter(line => line.length > 0);
  };

  const formattedTerms = formatTerms(terms);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-end sm:items-center justify-center z-50 p-4 transition-opacity duration-300"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-sm transform transition-transform duration-300 translate-y-4 sm:translate-y-0 opacity-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">ข้อกำหนดและเงื่อนไข</h2>
          <div className="text-sm text-gray-600 space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
            {formattedTerms.map((line, index) => (
              <div key={index} className="flex items-start">
                <span className="mr-3 mt-1 text-gray-400">•</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-[#F8B500] text-white font-bold py-2.5 px-4 rounded-full shadow-md hover:scale-105 transition-transform"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
