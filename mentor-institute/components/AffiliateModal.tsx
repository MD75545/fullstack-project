import React, { useState } from 'react';
import type { Course } from '../types';

interface AffiliateModalProps {
  course: Course;
  onClose: () => void;
}

const AffiliateModal: React.FC<AffiliateModalProps> = ({ course, onClose }) => {
  const affiliateId = `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const affiliateLink = `${window.location.href}?courseId=${course.id}&ref=${affiliateId}`;
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const downloadCsv = () => {
    console.log(`SIMULATION: User data for affiliate ${affiliateId} saved to CSV.`);
    console.log(`SIMULATION: Confirmation email sent for successful affiliation.`);
    const csvContent = "data:text/csv;charset=utf-8," 
      + "affiliateId,courseId,courseTitle,linkGeneratedDate\n"
      + `${affiliateId},${course.id},"${course.title}",${new Date().toISOString()}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `affiliate_data_${affiliateId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setEmailSent(true);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-2xl font-bold text-brand-navy mb-2">Become an Affiliate!</h2>
        <p className="text-gray-600 mb-4">Share this link to earn from the "{course.title}" course.</p>

        <div className="bg-gray-100 p-3 rounded-md flex items-center justify-between mb-4">
          <input type="text" readOnly value={affiliateLink} className="bg-transparent text-sm text-gray-700 w-full outline-none" />
          <button onClick={copyToClipboard} className="ml-2 px-3 py-1 bg-brand-purple text-white text-sm rounded-md hover:bg-opacity-90">
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-4 text-sm">
          <p><strong className="font-bold">Note:</strong> This is a demonstration. In a real application, user data would be stored securely, and an email would be automatically sent to you upon a successful referral.</p>
        </div>

        <button onClick={downloadCsv} className="w-full bg-brand-navy text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition duration-300">
          Simulate Referral & Download CSV
        </button>

        {emailSent && (
            <div className="mt-4 text-center text-green-600 font-semibold">
                CSV downloaded. A confirmation email has been simulated!
            </div>
        )}
      </div>
    </div>
  );
};

export default AffiliateModal;