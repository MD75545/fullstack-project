import React, { useState, useEffect } from 'react';
import type { Course } from '../types';

interface GetAffiliateLinkModalProps {
  course: Course;
  affiliateId: string;
  onClose: () => void;
}

const GetAffiliateLinkModal: React.FC<GetAffiliateLinkModalProps> = ({ course, affiliateId, onClose }) => {
  const affiliateLink = `${window.location.origin}${window.location.pathname}#/courses?courseId=${course.id}&ref=${affiliateId}`;
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (navigator.share) {
      setCanShare(true);
    }
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out: ${course.title}`,
          text: `I thought you might be interested in the "${course.title}" course from Mentor Institute!`,
          url: affiliateLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-2xl font-bold text-brand-navy mb-2">Your Affiliate Link</h2>
        <p className="text-gray-600 mb-4">Share this link for the "{course.title}" course.</p>

        <div className="bg-gray-100 p-3 rounded-md flex items-center justify-between mb-4">
          <input type="text" readOnly value={affiliateLink} className="bg-transparent text-sm text-gray-700 w-full outline-none" />
          <div className="flex items-center ml-2 space-x-2 flex-shrink-0">
            <button onClick={copyToClipboard} className="px-3 py-1 bg-brand-purple text-white text-sm rounded-md hover:bg-opacity-90 w-20">
              {copied ? 'Copied!' : 'Copy'}
            </button>
            {canShare && (
              <button
                onClick={handleShare}
                title="Share link"
                className="p-2 bg-brand-navy text-white rounded-md hover:bg-opacity-90 transition-colors"
                aria-label="Share"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md text-sm">
          <p><strong className="font-bold">How it works:</strong> When a new student clicks this link and enrolls, you'll be credited for the referral.</p>
        </div>
      </div>
    </div>
  );
};

export default GetAffiliateLinkModal;