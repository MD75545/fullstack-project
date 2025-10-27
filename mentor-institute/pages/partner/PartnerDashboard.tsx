import React, {useState, useMemo} from 'react';
import { useAuth } from '../../context/AuthContext';
import { users, courses, demoBookings } from '../../data/mockData';
import type { Partner, Student } from '../../types';
import { SearchProvider, useSearch } from '../../context/SearchContext';

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PartnerDashboardInternal: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();

  const partnerData = user as Partner;
  const affiliateLink = `${window.location.origin}${window.location.pathname}#/courses?ref=${partnerData.affiliateId}`;
  
  const getCourseName = (courseId: number) => {
    return courses.find(c => c.id === courseId)?.title || 'Unknown';
  };

  const filteredReferredDemos = useMemo(() => {
    const allDemos = demoBookings.filter(d => d.referredByAffiliateId === partnerData.affiliateId);
    if (!searchQuery) return allDemos;
    const lowercasedQuery = searchQuery.toLowerCase();
    return allDemos.filter(d => 
        d.studentName.toLowerCase().includes(lowercasedQuery) ||
        getCourseName(d.courseId).toLowerCase().includes(lowercasedQuery)
    );
  }, [partnerData.affiliateId, searchQuery]);

  const filteredReferredStudents = useMemo(() => {
    const allStudents = users.filter(u => u.role === 'student' && 'referredBy' in u && u.referredBy === partnerData.affiliateId) as Student[];
    if (!searchQuery) return allStudents;
    const lowercasedQuery = searchQuery.toLowerCase();
    return allStudents.filter(s =>
        s.name.toLowerCase().includes(lowercasedQuery) ||
        s.email.toLowerCase().includes(lowercasedQuery) ||
        getCourseName(s.courseId).toLowerCase().includes(lowercasedQuery)
    );
  }, [partnerData.affiliateId, searchQuery]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
                <p className="text-lg text-gray-600 mt-1">This is your partner (affiliate) dashboard.</p>
              </div>
              <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <SearchIcon />
                  </span>
                  <input
                      type="text"
                      placeholder="Search referrals..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple"
                  />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4 border border-gray-200">
                    <div className="bg-green-100 p-3 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg></div>
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium">Total Earnings</h3>
                        <p className="text-3xl font-bold text-gray-800">₹{partnerData.earnings.total.toLocaleString('en-IN')}</p>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4 border border-gray-200">
                    <div className="bg-blue-100 p-3 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium">Today's Earnings</h3>
                        <p className="text-3xl font-bold text-gray-800">₹{partnerData.earnings.daily.toLocaleString('en-IN')}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Your Affiliate Link</h2>
                <p className="text-gray-600 mb-4 text-sm">Share this link to earn from course referrals.</p>
                <div className="bg-slate-100 p-2 rounded-md flex items-center justify-between border border-slate-200">
                    <input type="text" readOnly value={affiliateLink} className="bg-transparent text-sm text-gray-700 w-full outline-none px-2" />
                    <button onClick={copyToClipboard} className="ml-2 px-3 py-2 bg-brand-purple text-white text-sm font-semibold rounded-md hover:bg-opacity-90 transition-colors w-24">
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">My Demo Referrals ({filteredReferredDemos.length})</h2>
                 <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Student Name</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Course</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Commission</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Payment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReferredDemos.length > 0 ? filteredReferredDemos.map(demo => (
                                <tr key={demo.id} className="hover:bg-slate-50">
                                    <td className="py-3 px-4 border-b border-slate-200">{demo.studentName}</td>
                                    <td className="py-3 px-4 border-b border-slate-200">{getCourseName(demo.courseId)}</td>
                                    <td className="py-3 px-4 border-b border-slate-200">{demo.status}</td>
                                    <td className="py-3 px-4 border-b border-slate-200 font-semibold">
                                        {demo.commissionPaid && demo.paymentDetails?.paidAmount ? `₹${demo.paymentDetails.paidAmount.toLocaleString('en-IN')}` : (demo.commissionAmount ? `₹${demo.commissionAmount.toLocaleString('en-IN')}` : '-')}
                                    </td>
                                    <td className="py-3 px-4 border-b border-slate-200">
                                        {demo.commissionPaid && demo.paymentDetails ? (
                                            <div title={`Paid ₹${demo.paymentDetails.paidAmount.toLocaleString('en-IN')} on ${demo.paymentDetails.paidOn}. Notes: ${demo.paymentDetails.description || 'N/A'}`}>
                                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Paid</span>
                                                <div className="text-xs text-gray-500 mt-1">{demo.paymentDetails.mode}</div>
                                            </div>
                                        ) : (
                                            <span className={`px-2 py-1 text-xs rounded-full ${demo.status === 'Student Admitted' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {demo.status === 'Student Admitted' ? 'Pending' : 'N/A'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-4 px-4 text-center text-gray-500">No matching demo referrals found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">My Enrolled Students ({filteredReferredStudents.length})</h2>
                 <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-slate-100">
                            <tr>
                            <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Name</th>
                            <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Email</th>
                            <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Course Enrolled</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReferredStudents.length > 0 ? filteredReferredStudents.map(student => {
                                const course = courses.find(c => c.id === student.courseId);
                                return (
                                    <tr key={student.id} className="hover:bg-slate-50">
                                        <td className="py-3 px-4 border-b border-slate-200">{student.name}</td>
                                        <td className="py-3 px-4 border-b border-slate-200">{student.email}</td>
                                        <td className="py-3 px-4 border-b border-slate-200">{course?.title || 'N/A'}</td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan={3} className="py-4 px-4 text-center text-gray-500">No matching enrolled students found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};

const PartnerDashboard: React.FC = () => (
    <SearchProvider>
        <PartnerDashboardInternal />
    </SearchProvider>
);

export default PartnerDashboard;
