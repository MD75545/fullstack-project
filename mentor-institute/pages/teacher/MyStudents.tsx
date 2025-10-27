import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { users, courses, demoBookings } from '../../data/mockData';
import type { Student, Teacher } from '../../types';
import { useSearch } from '../../context/SearchContext';

const MyStudents: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const { searchQuery } = useSearch();

  const teacherData = user as Teacher;

  const getCourseName = (courseId: number) => {
    return courses.find(c => c.id === courseId)?.title || 'Unknown';
  };

  const filteredMyStudents = useMemo(() => {
    const allMyStudents = users.filter(u => u.role === 'student' && 'teacherId' in u && u.teacherId === user?.id) as Student[];
    if (!searchQuery) return allMyStudents;
    const lowercasedQuery = searchQuery.toLowerCase();
    return allMyStudents.filter(s => 
        s.name.toLowerCase().includes(lowercasedQuery) ||
        s.email.toLowerCase().includes(lowercasedQuery) ||
        getCourseName(s.courseId).toLowerCase().includes(lowercasedQuery)
    );
  }, [user?.id, searchQuery]);

  const filteredReferredDemos = useMemo(() => {
    if (!teacherData.affiliateId) return [];
    const allDemos = demoBookings.filter(d => d.referredByAffiliateId === teacherData.affiliateId);
    if (!searchQuery) return allDemos;
    const lowercasedQuery = searchQuery.toLowerCase();
    return allDemos.filter(d => 
        d.studentName.toLowerCase().includes(lowercasedQuery) ||
        getCourseName(d.courseId).toLowerCase().includes(lowercasedQuery)
    );
  }, [teacherData.affiliateId, searchQuery]);

  const filteredReferredStudents = useMemo(() => {
    if (!teacherData.affiliateId) return [];
    const allStudents = users.filter(u => u.role === 'student' && 'referredBy' in u && u.referredBy === teacherData.affiliateId) as Student[];
    if (!searchQuery) return allStudents;
    const lowercasedQuery = searchQuery.toLowerCase();
    return allStudents.filter(s =>
        s.name.toLowerCase().includes(lowercasedQuery) ||
        s.email.toLowerCase().includes(lowercasedQuery) ||
        getCourseName(s.courseId).toLowerCase().includes(lowercasedQuery)
    );
  }, [teacherData.affiliateId, searchQuery]);

  const affiliateLink = teacherData.affiliateId 
    ? `${window.location.origin}${window.location.pathname}#/courses?ref=${teacherData.affiliateId}`
    : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">My Assigned Students ({filteredMyStudents.length})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-slate-100">
              <tr>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600 hidden sm:table-cell">Email</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Course</th>
              </tr>
            </thead>
            <tbody>
              {filteredMyStudents.length > 0 ? filteredMyStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 border-b border-slate-200">{student.name}</td>
                      <td className="py-3 px-4 border-b border-slate-200 hidden sm:table-cell">{student.email}</td>
                      <td className="py-3 px-4 border-b border-slate-200">{getCourseName(student.courseId)}</td>
                  </tr>
              )) : (
                  <tr>
                      <td colSpan={3} className="py-4 px-4 text-center text-gray-500">
                        {searchQuery ? 'No matching students found.' : 'You have no students assigned yet.'}
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {teacherData.affiliateId && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">My Affiliate Details</h2>
          
          {teacherData.earnings &&
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 p-6 rounded-lg flex items-center gap-4 border border-slate-200">
                  <div className="bg-green-100 p-3 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg></div>
                  <div>
                      <h3 className="text-gray-500 text-sm font-medium">Total Earnings</h3>
                      <p className="text-2xl font-bold text-gray-800">₹{teacherData.earnings.total.toLocaleString('en-IN')}</p>
                  </div>
              </div>
                <div className="bg-slate-50 p-6 rounded-lg flex items-center gap-4 border border-slate-200">
                  <div className="bg-blue-100 p-3 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                  <div>
                      <h3 className="text-gray-500 text-sm font-medium">Today's Earnings</h3>
                      <p className="text-2xl font-bold text-gray-800">₹{teacherData.earnings.daily.toLocaleString('en-IN')}</p>
                  </div>
              </div>
          </div>
          }

          <div className="bg-slate-50 p-4 rounded-lg shadow-inner mb-8 border border-slate-200">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Your Affiliate Link</h3>
              <p className="text-gray-600 mb-4 text-sm">Share this link to earn from course referrals.</p>
              <div className="bg-white p-2 rounded-md flex items-center justify-between border border-slate-300">
                  <input type="text" readOnly value={affiliateLink} className="bg-transparent text-sm text-gray-700 w-full outline-none px-2" />
                  <button onClick={copyToClipboard} className="ml-2 px-3 py-2 bg-brand-purple text-white text-sm font-semibold rounded-md hover:bg-opacity-90 transition-colors w-24">
                      {copied ? 'Copied!' : 'Copy'}
                  </button>
              </div>
          </div>
           
            <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">My Demo Referrals ({filteredReferredDemos.length})</h3>
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
                                    <td colSpan={5} className="py-4 px-4 text-center text-gray-500">{searchQuery ? 'No matching demo referrals found.' : 'No demo referrals yet.'}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

          <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">My Enrolled Students ({filteredReferredStudents.length})</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                      <thead className="bg-slate-100">
                          <tr>
                          <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Name</th>
                          <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600 hidden sm:table-cell">Email</th>
                          <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Course Enrolled</th>
                          </tr>
                      </thead>
                      <tbody>
                          {filteredReferredStudents.length > 0 ? filteredReferredStudents.map(student => (
                              <tr key={student.id} className="hover:bg-slate-50">
                                  <td className="py-3 px-4 border-b border-slate-200">{student.name}</td>
                                  <td className="py-3 px-4 border-b border-slate-200 hidden sm:table-cell">{student.email}</td>
                                  <td className="py-3 px-4 border-b border-slate-200">{getCourseName(student.courseId)}</td>
                              </tr>
                          )) : (
                              <tr>
                                  <td colSpan={3} className="py-4 px-4 text-center text-gray-500">{searchQuery ? 'No matching enrolled students found.' : 'No students have enrolled through your link yet.'}</td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyStudents;
