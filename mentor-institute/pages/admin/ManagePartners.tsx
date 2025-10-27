import React, { useState, useMemo, useEffect } from 'react';
import { users } from '../../data/mockData';
import type { Partner } from '../../types';
import AddEditPartnerModal from '../../components/AddEditPartnerModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useSearch } from '../../context/SearchContext';
import { registerUser } from '../../services/api'; // Import your API function

const ManagePartners: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>(users.filter(u => u.role === 'partner') as Partner[]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const { searchQuery } = useSearch();

  const filteredPartners = useMemo(() => {
    if (!searchQuery) {
        return partners;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return partners.filter(partner =>
        partner.name.toLowerCase().includes(lowercasedQuery) ||
        partner.email.toLowerCase().includes(lowercasedQuery) ||
        partner.affiliateId.toLowerCase().includes(lowercasedQuery) ||
        (partner.firmName && partner.firmName.toLowerCase().includes(lowercasedQuery)) ||
        (partner.city && partner.city.toLowerCase().includes(lowercasedQuery))
    );
  }, [partners, searchQuery]);

  // Fetch partners from Laravel API on component mount
  useEffect(() => {
    // You can add a function here to fetch existing partners from Laravel
    // For now, we'll keep using mock data
  }, []);

  const handleCommissionChange = (partnerId: number, commission: string) => {
    const newCommission = parseInt(commission, 10);
    const updatedPartners = partners.map(p => {
        if (p.id === partnerId) {
            let commissionValue = 0;
            if (commission !== '' && !isNaN(newCommission) && newCommission >= 0 && newCommission <= 100) {
                commissionValue = newCommission;
            }
            return { ...p, commissionPercentage: commissionValue };
        }
        return p;
    });
    setPartners(updatedPartners);

    const userIndex = users.findIndex(u => u.id === partnerId);
    if(userIndex > -1) {
        const partnerToUpdate = users[userIndex] as Partner;
        users[userIndex] = {...partnerToUpdate, commissionPercentage: updatedPartners.find(p => p.id === partnerId)?.commissionPercentage};
    }
  };

  const handleOpenAddModal = () => {
    setEditingPartner(null);
    setIsModalOpen(true);
    setApiError('');
  };

  const handleOpenEditModal = (partner: Partner) => {
    setEditingPartner(partner);
    setIsModalOpen(true);
    setApiError('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPartner(null);
    setApiError('');
  };
  
  const handleSavePartner = async (partnerData: Omit<Partner, 'id' | 'role' | 'earnings'>) => {
    if (editingPartner) {
        // Edit existing partner (for now, keep local update)
        const updatedPartners = partners.map(p => p.id === editingPartner.id ? { ...editingPartner, ...partnerData } : p);
        setPartners(updatedPartners);
        const userIndex = users.findIndex(u => u.id === editingPartner.id);
        if (userIndex > -1) {
            users[userIndex] = { ...users[userIndex], ...partnerData };
        }
        handleCloseModal();
    } else {
        // ADD NEW PARTNER - Call Laravel API
        setLoading(true);
        setApiError('');

        try {
            // Prepare data for Laravel API
            const apiData = {
                name: partnerData.name,
                email: partnerData.email,
                mobile: partnerData.mobile || '',
                password: partnerData.password || 'defaultPassword123',
                join_as: 'partner',
                affiliate_type: partnerData.partnerType,
                city: partnerData.city,
                address: partnerData.address || '',
                firm_name: partnerData.firmName || '',
                specialization: '', // Not needed for partner-only registration
            };

            console.log('Sending to Laravel API:', apiData);

            // Call Laravel API
            const response = await registerUser(apiData);
            
            console.log('Laravel API Response:', response);

            if (response.status === 'success') {
                // Create local partner with data from API response
                const newPartner: Partner = {
                    ...partnerData,
                    id: response.data?.user_id || Date.now(), // Use Laravel user_id
                    affiliateId: response.data?.partner_affiliate_id || `AFF${Date.now()}`,
                    role: 'partner',
                    earnings: { total: 0, daily: 0 },
                    commissionPercentage: 10, // Default from Laravel
                };

                // Update local state
                setPartners(prev => [...prev, newPartner]);
                users.push(newPartner);

                handleCloseModal();
                
                // Show success message
                alert('Partner registered successfully in the system!');
            } else {
                setApiError(response.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('API Error:', error);
            setApiError(error.message || 'Failed to register partner. Please try again.');
        } finally {
            setLoading(false);
        }
    }
  };

  const handleDeleteClick = (partner: Partner) => {
      setDeletingPartner(partner);
  };
  
  const confirmDelete = () => {
      if(deletingPartner) {
          setPartners(prev => prev.filter(p => p.id !== deletingPartner.id));
          const userIndex = users.findIndex(u => u.id === deletingPartner.id);
          if (userIndex > -1) {
              users.splice(userIndex, 1);
          }
          setDeletingPartner(null);
      }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <h2 className="text-xl font-bold text-gray-800">Partners (Affiliates) ({filteredPartners.length})</h2>
          <button 
            onClick={handleOpenAddModal} 
            className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-opacity-90 transition-colors w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Partner'}
          </button>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {apiError}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-slate-100">
              <tr>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600 hidden md:table-cell">Contact</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600 hidden lg:table-cell">Location</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Affiliate ID</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Commission %</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.map(partner => (
                <tr key={partner.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 border-b border-slate-200">
                    <div>{partner.name}</div>
                    {partner.partnerType === 'Firm' && partner.firmName && (
                      <div className="text-xs text-gray-500">{partner.firmName}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 border-b border-slate-200 hidden md:table-cell">
                    <div>{partner.email}</div>
                    {partner.mobile && <div className="text-xs text-gray-500">{partner.mobile}</div>}
                  </td>
                   <td className="py-3 px-4 border-b border-slate-200 hidden lg:table-cell">
                    {partner.city && <div>{partner.city}</div>}
                    {partner.address && <div className="text-xs text-gray-500 truncate" title={partner.address}>{partner.address}</div>}
                  </td>
                  <td className="py-3 px-4 border-b border-slate-200">{partner.affiliateId}</td>
                  <td className="py-3 px-4 border-b border-slate-200">
                    <input
                      type="number"
                      value={partner.commissionPercentage}
                      onChange={(e) => handleCommissionChange(partner.id, e.target.value)}
                      className="w-20 p-1 border border-slate-300 rounded-md focus:ring-brand-purple focus:border-brand-purple text-sm"
                      min="0"
                      max="100"
                      aria-label={`Commission for ${partner.name}`}
                    />
                  </td>
                  <td className="py-3 px-4 border-b border-slate-200 whitespace-nowrap space-x-4">
                    <button onClick={() => handleOpenEditModal(partner)} className="text-brand-purple font-medium hover:underline">Edit</button>
                    <button onClick={() => handleDeleteClick(partner)} className="text-red-500 font-medium hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {filteredPartners.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No partners found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <AddEditPartnerModal
            partner={editingPartner}
            onClose={handleCloseModal}
            onSave={handleSavePartner}
        />
      )}
      
      {deletingPartner && (
        <ConfirmationModal
            title="Delete Partner"
            message={`Are you sure you want to delete ${deletingPartner.name}? This action cannot be undone.`}
            onConfirm={confirmDelete}
            onCancel={() => setDeletingPartner(null)}
        />
      )}
    </>
  );
};

export default ManagePartners;