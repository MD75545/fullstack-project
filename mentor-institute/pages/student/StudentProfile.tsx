import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentDetails, updateStudentProfile } from '../../services/api';

interface StudentProfileData {
  user_id: string;
  name: string;
  email: string;
  mobile?: string;
  city?: string;
  address?: string;
  display_name_preference: string;
  gender: string;
  photo_url?: string;
}

const StudentProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<StudentProfileData>({
    user_id: '',
    name: '',
    email: '',
    display_name_preference: 'real_name',
    gender: 'other',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get full photo URL
  const getFullPhotoUrl = (photoUrl: string | null | undefined): string | null => {
    if (!photoUrl) return null;
    
    if (photoUrl.startsWith('http')) {
      return photoUrl;
    } else if (photoUrl.startsWith('storage/')) {
      return `http://localhost:8000/${photoUrl}`;
    } else if (photoUrl.startsWith('/storage/')) {
      return `http://localhost:8000${photoUrl}`;
    } else {
      return `http://localhost:8000/storage/${photoUrl}`;
    }
  };

  // Fetch student profile data
  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        
        const response = await getStudentDetails(user.user_id);
        
        if (response.success && response.data) {
          const profileData = response.data;
          const updatedProfile = {
            user_id: profileData.user_id?.toString() || user.user_id.toString(),
            name: profileData.name || user.name,
            email: profileData.email || user.email,
            mobile: profileData.mobile,
            city: profileData.city,
            address: profileData.address,
            display_name_preference: profileData.display_name_preference || 'real_name',
            gender: profileData.gender || 'other',
            photo_url: profileData.photo_url,
          };

          setProfile(updatedProfile);

          // Set photo preview
          const photoUrl = user.photo_url || profileData.photo_url;
          if (photoUrl) {
            const fullPhotoUrl = getFullPhotoUrl(photoUrl);
            setPhotoPreview(fullPhotoUrl);
          }
        } else {
          throw new Error(response.message || 'Failed to fetch profile data');
        }
      } catch (err) {
        console.error('Error fetching student profile:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPEG, PNG, JPG, GIF)');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('Image size should be less than 2MB');
        return;
      }

      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Unified submit handler - sends both profile data and photo in one request
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!user) return;

  try {
    setSaving(true);
    setError(null);
    console.log('💾 Saving profile with all data...');

    const profileData = {
      name: profile.name,
      email: profile.email,
      mobile: profile.mobile || '',
      city: profile.city || '',
      address: profile.address || '',
      display_name_preference: profile.display_name_preference,
      gender: profile.gender,
      ...(photoFile && { photo: photoFile })
    };

    console.log('📤 Sending combined profile update:', {
      ...profileData,
      photo: photoFile ? `File: ${photoFile.name}` : 'No file'
    });
    
    const updateResponse = await updateStudentProfile(user.user_id, profileData);
    console.log('📥 Combined update response:', updateResponse);
    
    // FIXED: Check for status === 'success' instead of success === true
    if (updateResponse.status !== 'success') {
      throw new Error(updateResponse.message || 'Failed to update profile');
    }

    // Success logic - update state and context
    const newPhotoUrl = updateResponse.data?.photo_url;
    if (newPhotoUrl) {
      const fullPhotoUrl = getFullPhotoUrl(newPhotoUrl);
      setPhotoPreview(fullPhotoUrl);
      setProfile(prev => ({ ...prev, photo_url: newPhotoUrl }));
    }

    // Update user context with all new data
    if (updateUser) {
      updateUser({
        ...user,
        name: profile.name,
        email: profile.email,
        mobile: profile.mobile,
        city: profile.city,
        address: profile.address,
        photo_url: newPhotoUrl || user.photo_url
      });
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    
    // Reset photo file after successful upload
    setPhotoFile(null);
    
    console.log('✅ Profile updated successfully with all data!');
    
  } catch (err) {
    console.error('❌ Error saving profile:', err);
    setError(err instanceof Error ? err.message : 'An error occurred while saving profile');
  } finally {
    setSaving(false);
  }
};

  // Remove photo functionality - now uses the main update endpoint
  const removePhoto = async () => {
    if (!user) return;

    try {
      setSaving(true);
      console.log('🗑️ Removing photo via profile update...');
      
      // Prepare profile data with null photo (indicating removal)
      const profileData = {
        name: profile.name,
        email: profile.email,
        mobile: profile.mobile || '',
        city: profile.city || '',
        address: profile.address || '',
        display_name_preference: profile.display_name_preference,
        gender: profile.gender,
        // Send empty file to indicate photo removal
        photo: new File([], 'remove.jpg', { type: 'image/jpeg' })
      };

      const response = await updateStudentProfile(user.user_id, profileData);
      
      if (response.success) {
        setPhotoFile(null);
        setPhotoPreview(null);
        setProfile(prev => ({ ...prev, photo_url: undefined }));
        
        // Update user context
        if (updateUser) {
          updateUser({ ...user, photo_url: undefined });
        }
        
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
        console.log('✅ Photo removed successfully');
      } else {
        throw new Error(response.message || 'Failed to remove photo');
      }
    } catch (err) {
      console.error('❌ Error removing photo:', err);
      setError('Failed to remove photo');
    } finally {
      setSaving(false);
    }
  };

  // Use user's photo from context as fallback
  const displayPhoto = photoPreview || getFullPhotoUrl(user?.photo_url || null) || null;

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6">My Profile</h2>
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6">My Profile</h2>
      
      {error && (
        <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <span className="inline-block h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300">
                {displayPhoto ? (
                  <img 
                    src={displayPhoto} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', displayPhoto);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </span>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="file"
                  id="photo-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={saving}
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {displayPhoto ? 'Change Photo' : 'Upload Photo'}
                </label>
                
                {displayPhoto && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="py-2 px-4 bg-red-100 text-red-700 border border-red-300 rounded-md shadow-sm text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    disabled={saving}
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Supported formats: JPEG, PNG, JPG, GIF. Max size: 2MB
              </p>
              {photoFile && (
                <p className="text-xs text-green-600">
                  New photo selected: {photoFile.name} - Click "Save Profile" to upload
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm"
              disabled={saving}
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm"
              disabled={saving}
            />
          </div>
        </div>

        {/* Display Name Preference */}
        <div>
          <label htmlFor="display_name_preference" className="block text-sm font-medium text-gray-700">
            Display Name on Leaderboards *
          </label>
          <select
            id="display_name_preference"
            name="display_name_preference"
            value={profile.display_name_preference}
            onChange={handleChange}
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm rounded-md"
            disabled={saving}
          >
            <option value="real_name">Show my real name</option>
            <option value="anonymous">Show as Anonymous</option>
          </select>
        </div>

        {/* Gender Selection */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
            Gender *
          </label>
          <p className="text-xs text-gray-500 mb-1">
            Used for displaying a default avatar if no photo is uploaded.
          </p>
          <select
            id="gender"
            name="gender"
            value={profile.gender}
            onChange={handleChange}
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm rounded-md"
            disabled={saving}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Prefer not to say</option>
          </select>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={profile.mobile || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm"
              disabled={saving}
            />
          </div>
          
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={profile.city || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm"
              disabled={saving}
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={profile.address || ''}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm"
            disabled={saving}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end items-center gap-4 pt-4 border-t">
          {isSaved && (
            <p className="text-sm text-green-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Profile saved successfully!
            </p>
          )}
          <button 
            type="submit" 
            disabled={saving}
            className="px-6 py-2 bg-brand-navy text-white font-semibold rounded-md shadow-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Profile...
              </span>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfile;