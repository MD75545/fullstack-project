import React, { useState, useMemo, useEffect } from 'react';
import type { Partner } from '../../types';
import AddEditPartnerModal from '../../components/AddEditPartnerModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useSearch } from '../../context/SearchContext';
import { getPartners, updatePartner, deletePartner } from '../../services/api'; // ✅ Updated imports

const ManagePartners: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [fetchLoading, setFetchLoading] = useState(true);
  const { searchQuery } = useSearch();

  // Fetch partners from API on mount
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setFetchLoading(true);
        setApiError('');
        const response = await getPartners();

        if (response.success && response.data) {
          const partnersData: Partner[] = response.data.map((partner: any) => ({
            id: partner.id,
            name: partner.name,
            email: partner.email,
            mobile: partner.mobile || '',
            affiliateId: partner.affiliateId || '',
            commissionPercentage: partner.commissionPercentage || 10,
            password: 'defaultPassword123',
            partnerType: partner.partnerType || 'Individual',
            firmName: partner.firmName || '',
            city: partner.city || '',
            address: partner.address || '',
            role: 'partner',
            earnings: partner.earnings || { total: 0, daily: 0 }
          }));
          setPartners(partnersData);
        } else {
          setApiError(response.message || 'Failed to load partners');
        }
      } catch (error: any) {
        console.error('Error fetching partners:', error);
        setApiError(error.message || 'Failed to load partners. Please try again.');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const filteredPartners = useMemo(() => {
    if (!searchQuery) return partners;

    const lowercasedQuery = searchQuery.toLowerCase();
    return partners.filter(partner =>
      partner.name.toLowerCase().includes(lowercasedQuery) ||
      partner.email.toLowerCase().includes(lowercasedQuery) ||
      partner.affiliateId.toLowerCase().includes(lowercasedQuery) ||
      (partner.firmName && partner.firmName.toLowerCase().includes(lowercasedQuery)) ||
      (partner.city && partner.city.toLowerCase().includes(lowercasedQuery))
    );
  }, [partners, searchQuery]);

  const handleCommissionChange = async (partnerId: number, commission: string) => {
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
    // TODO: Add API call later if needed
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

  // ✅ Updated handleSavePartner (Add + Edit logic)
  const handleSavePartner = async (partnerData: Omit<Partner, 'id' | 'role' | 'earnings'>) => {
    if (editingPartner) {
      // EDIT PARTNER
      setLoading(true);
      setApiError('');

      try {
        const response = await updatePartner(editingPartner.id, partnerData);

        if (response.success) {
          await refreshPartnersList();
          handleCloseModal();
        } else {
          setApiError(response.message || 'Update failed. Please try again.');
        }
      } catch (error: any) {
        console.error('Error updating partner:', error);
        setApiError(error.message || 'Failed to update partner. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // ADD NEW PARTNER
      setLoading(true);
      setApiError('');

      try {
        await refreshPartnersList();
        handleCloseModal();
        alert('Partner registered successfully in the system!');
      } catch (error) {
        console.error('Error refreshing partners:', error);
        setApiError('Failed to refresh partners list');
      } finally {
        setLoading(false);
      }
    }
  };

  // Refresh partners list
  const refreshPartnersList = async () => {
    try {
      const response = await getPartners();
      if (response.success && response.data) {
        const partnersData: Partner[] = response.data.map((partner: any) => ({
          id: partner.id,
          name: partner.name,
          email: partner.email,
          mobile: partner.mobile || '',
          affiliateId: partner.affiliateId || '',
          commissionPercentage: partner.commissionPercentage || 10,
          password: 'defaultPassword123',
          partnerType: partner.partnerType || 'Individual',
          firmName: partner.firmName || '',
          city: partner.city || '',
          address: partner.address || '',
          role: 'partner',
          earnings: partner.earnings || { total: 0, daily: 0 }
        }));
        setPartners(partnersData);
      }
    } catch (error) {
      console.error('Error refreshing partners:', error);
      throw error;
    }
  };

  const handleDeleteClick = (partner: Partner) => {
    setDeletingPartner(partner);
  };

  // ✅ Updated confirmDelete with delete API
  const confirmDelete = async () => {
    if (deletingPartner) {
      try {
        console.log('Deleting partner:', deletingPartner.id);

        const response = await deletePartner(deletingPartner.id);

        if (response.success) {
          console.log('Partner deleted successfully');
          await refreshPartnersList();
          setApiError('');
        } else {
          setApiError(response.message || 'Failed to delete partner');
        }
      } catch (error: any) {
        console.error('Error deleting partner:', error);
        setApiError(error.message || 'Failed to delete partner. Please try again.');
      } finally {
        setDeletingPartner(null);
      }
    }
  };

  if (fetchLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg text-gray-600">Loading partners...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <h2 className="text-xl font-bold text-gray-800">
            Partners (Affiliates) ({filteredPartners.length})
          </h2>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-opacity-90 transition-colors w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Add Partner'}
          </button>
        </div>

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
                    {partner.partnerType === 'Institute' && partner.firmName && (
                      <div className="text-xs text-gray-500">{partner.firmName}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 border-b border-slate-200 hidden md:table-cell">
                    <div>{partner.email}</div>
                    {partner.mobile && <div className="text-xs text-gray-500">{partner.mobile}</div>}
                  </td>
                  <td className="py-3 px-4 border-b border-slate-200 hidden lg:table-cell">
                    {partner.city && <div>{partner.city}</div>}
                    {partner.address && (
                      <div className="text-xs text-gray-500 truncate" title={partner.address}>{partner.address}</div>
                    )}
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
              {filteredPartners.length === 0 && !fetchLoading && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    {partners.length === 0 ? 'No partners found.' : 'No partners matching your search.'}
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
