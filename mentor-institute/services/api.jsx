// src/services/api.js
const API_BASE_URL = 'http://localhost:8000/api';

export const registerUser = async (userData) => {
  try {
    console.log('Making API call to:', `${API_BASE_URL}/register`);
    console.log('Request data:', userData);

    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log('Response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      // Handle validation errors or other errors
      const errorMessage = data.message || 
                          (data.errors ? Object.values(data.errors).flat().join(', ') : `HTTP error! status: ${response.status}`);
      throw new Error(errorMessage);
    }

    console.log('API response data:', data);
    return data;
    
  } catch (error) {
    console.error('Registration Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};