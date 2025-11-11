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
  
export const updateUser = async (userId, userData) => {
  try {
    console.log('Updating user:', `${API_BASE_URL}/users/${userId}`);
    console.log('Update data:', userData);

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log('Update user response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || 
                          (data.errors ? Object.values(data.errors).flat().join(', ') : `HTTP error! status: ${response.status}`);
      throw new Error(errorMessage);
    }

    console.log('Update user response data:', data);
    return data;
    
  } catch (error) {
    console.error('Update User Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};
// NEW: Get Teachers function
export const getTeachers = async () => {
  try {
    console.log('Fetching teachers from:', `${API_BASE_URL}/teachers`);

    const response = await fetch(`${API_BASE_URL}/teachers`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Teachers response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log('Teachers API response data:', data);
    return data;
    
  } catch (error) {
    console.error('Get Teachers Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

// Update Teacher function
export const updateTeacher = async (teacherId, teacherData) => {
  try {
    console.log('Updating teacher:', `${API_BASE_URL}/teachers/${teacherId}`);
    console.log('Update data:', teacherData);

    const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(teacherData),
    });

    console.log('Update response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || 
                          (data.errors ? Object.values(data.errors).flat().join(', ') : `HTTP error! status: ${response.status}`);
      throw new Error(errorMessage);
    }

    console.log('Update teacher response data:', data);
    return data;
    
  } catch (error) {
    console.error('Update Teacher Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

//  Delete Teacher function
export const deleteTeacher = async (teacherId) => {
  try {
    console.log('Deleting teacher:', `${API_BASE_URL}/teachers/${teacherId}`);

    const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Delete response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log('Delete teacher response data:', data);
    return data;
    
  } catch (error) {
    console.error('Delete Teacher Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

// NEW: Get Partners function
export const getPartners = async () => {
  try {
    console.log('Fetching partners from:', `${API_BASE_URL}/partners`);

    const response = await fetch(`${API_BASE_URL}/partners`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Partners response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log('Partners API response data:', data);
    return data;
    
  } catch (error) {
    console.error('Get Partners Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

// NEW: Update Partner function
export const updatePartner = async (userId, partnerData) => {
  try {
    console.log('Updating partner with user_id:', userId);
    
    const response = await fetch(`${API_BASE_URL}/partners/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(partnerData),
    });


    console.log('Update partner response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || 
                          (data.errors ? Object.values(data.errors).flat().join(', ') : `HTTP error! status: ${response.status}`);
      throw new Error(errorMessage);
    }

    console.log('Update partner response data:', data);
    return data;
    
  } catch (error) {
    console.error('Update Partner Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

// NEW: Delete Partner function
export const deletePartner = async (partnerId) => {
  try {
    console.log('Deleting partner:', `${API_BASE_URL}/partners/${partnerId}`);

    const response = await fetch(`${API_BASE_URL}/partners/${partnerId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Delete partner response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log('Delete partner response data:', data);
    return data;
    
  } catch (error) {
    console.error('Delete Partner Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

// Student API functions
export const getStudents = async () => {
  try {
    console.log('Fetching students from:', `${API_BASE_URL}/students`);

    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Students response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log('Students API response data:', data);
    
    // Ensure consistent response structure
    return {
      success: data.status === 'success' || data.success === true,
      message: data.message || 'Students retrieved successfully',
      data: data.data || data // Handle both structures
    };
    
  } catch (error) {
    console.error('Get Students Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

export const registerStudent = async (studentData) => {
  try {
    console.log('Making student API call to:', `${API_BASE_URL}/students`);
    console.log('Request data:', studentData);

    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(studentData),
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
      const errorMessage = data.message || 
                          (data.errors ? Object.values(data.errors).flat().join(', ') : `HTTP error! status: ${response.status}`);
      throw new Error(errorMessage);
    }

    console.log('Student API response data:', data);
    return data;
    
  } catch (error) {
    console.error('Student Registration Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

export const updateStudent = async (userId, studentData) => {
  try {
    console.log('Updating student:', `${API_BASE_URL}/students/${userId}`);
    console.log('Update data:', studentData);

    const response = await fetch(`${API_BASE_URL}/students/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(studentData),
    });

    console.log('Update student response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || 
                          (data.errors ? Object.values(data.errors).flat().join(', ') : `HTTP error! status: ${response.status}`);
      throw new Error(errorMessage);
    }

    console.log('Update student response data:', data);
    return data;
    
  } catch (error) {
    console.error('Update Student Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

export const deleteStudent = async (studentId) => {
  try {
    console.log('Deleting student:', `${API_BASE_URL}/students/${studentId}`);

    const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Delete student response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log('Delete student response data:', data);
    return data;
    
  } catch (error) {
    console.error('Delete Student Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

export const getStudentOptions = async () => {
  try {
    console.log('Fetching student options from:', `${API_BASE_URL}/students-options/options`);

    const response = await fetch(`${API_BASE_URL}/students-options/options`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Student options response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log('Student options API response data:', data);
    return data;
    
  } catch (error) {
    console.error('Get Student Options Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

// Course API functions
export const getCourses = async () => {
  try {
    console.log('Fetching courses from:', `${API_BASE_URL}/courses`);

    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Courses response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log('Courses API response data:', data);
    return data;
    
  } catch (error) {
    console.error('Get Courses Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

export const createCourse = async (courseData) => {
  try {
    console.log('Creating course:', `${API_BASE_URL}/courses`);
    
    const formData = new FormData();
    formData.append('title', courseData.title);
    formData.append('description', courseData.description);
    formData.append('price', courseData.price);
    formData.append('duration', courseData.duration);
    formData.append('level', courseData.level);
    
    // Only append image if it exists
    if (courseData.image) {
        formData.append('image', courseData.image);
    }

    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        // REMOVE: 'Content-Type': 'application/json' - Let browser set it automatically for FormData
      },
      body: formData, // Use FormData instead of JSON
    });

    console.log('Create course response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || 
                          (data.errors ? Object.values(data.errors).flat().join(', ') : `HTTP error! status: ${response.status}`);
      throw new Error(errorMessage);
    }

    console.log('Create course response data:', data);
    return data;
    
  } catch (error) {
    console.error('Create Course Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

export const updateCourse = async (courseId, courseData) => {
  try {
    console.log('Updating course:', `${API_BASE_URL}/courses/${courseId}`);
    
    const formData = new FormData();
    formData.append('title', courseData.title);
    formData.append('description', courseData.description);
    formData.append('price', courseData.price);
    formData.append('duration', courseData.duration);
    formData.append('level', courseData.level);
    formData.append('_method', 'PUT'); // For Laravel to recognize as PUT
    
    if (courseData.image) {
      formData.append('image', courseData.image);
    }

    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: 'POST', // Using POST with _method for file uploads
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });

    console.log('Update course response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || 
                          (data.errors ? Object.values(data.errors).flat().join(', ') : `HTTP error! status: ${response.status}`);
      throw new Error(errorMessage);
    }

    console.log('Update course response data:', data);
    return data;
    
  } catch (error) {
    console.error('Update Course Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

export const deleteCourse = async (courseId) => {
  try {
    console.log('Deleting course:', `${API_BASE_URL}/courses/${courseId}`);

    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Delete course response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log('Delete course response data:', data);
    return data;
    
  } catch (error) {
    console.error('Delete Course Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

// Demo Booking API functions
export const getDemoBookings = async () => {
  try {
    console.log('Fetching demo bookings from:', `${API_BASE_URL}/demo-bookings`);

    const response = await fetch(`${API_BASE_URL}/demo-bookings`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Demo bookings response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log('Demo bookings API response data:', data);
    return data;
    
  } catch (error) {
    console.error('Get Demo Bookings Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

export const createDemoBooking = async (bookingData) => {
  try {
    console.log('Creating demo booking:', `${API_BASE_URL}/demo-bookings`);
    console.log('Request data:', bookingData);

    const response = await fetch(`${API_BASE_URL}/demo-bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(bookingData),
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
      const errorMessage = data.message || 
                          (data.errors ? Object.values(data.errors).flat().join(', ') : `HTTP error! status: ${response.status}`);
      throw new Error(errorMessage);
    }

    console.log('Demo booking API response data:', data);
    return data;
    
  } catch (error) {
    console.error('Demo Booking Creation Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

export const updateDemoBooking = async (demoId, bookingData) => {
  try {
    console.log('Updating demo booking:', `${API_BASE_URL}/demo-bookings/${demoId}`);
    console.log('Update data:', bookingData);

    const response = await fetch(`${API_BASE_URL}/demo-bookings/${demoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    console.log('Update demo booking response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || 
                          (data.errors ? Object.values(data.errors).flat().join(', ') : `HTTP error! status: ${response.status}`);
      throw new Error(errorMessage);
    }

    console.log('Update demo booking response data:', data);
    return data;
    
  } catch (error) {
    console.error('Update Demo Booking Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
}

// In your api.js - Fix the scheduleDemo function
export const scheduleDemo = async (demoId, scheduleData) => {
  try {
    console.log('Scheduling demo:', `${API_BASE_URL}/demo-bookings/${demoId}/schedule`);
    console.log('Schedule data:', scheduleData);

    const requestBody = {
      date: scheduleData.date,
      time: scheduleData.time
    };

    // Only add teacher_id if it exists and is a valid number
    if (scheduleData.teacherId && scheduleData.teacherId !== '') {
      requestBody.teacher_id = parseInt(scheduleData.teacherId);
      console.log('Adding teacher_id:', requestBody.teacher_id);
    }

    console.log('Final request body:', requestBody);

    const response = await fetch(`${API_BASE_URL}/demo-bookings/${demoId}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Schedule demo response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || 
                          (data.errors ? Object.values(data.errors).flat().join(', ') : `HTTP error! status: ${response.status}`);
      throw new Error(errorMessage);
    }

    console.log('Schedule demo response data:', data);
    return data;
    
  } catch (error) {
    console.error('Schedule Demo Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

export const calculateCommission = async (demoId) => {
  try {
    console.log('Calculating commission for:', `${API_BASE_URL}/demo-bookings/${demoId}/calculate-commission`);

    const response = await fetch(`${API_BASE_URL}/demo-bookings/${demoId}/calculate-commission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('Calculate commission response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log('Calculate commission response data:', data);
    return data;
    
  } catch (error) {
    console.error('Calculate Commission Error Details:', error);
    throw error;
  }
};

export const processPayment = async (demoId, paymentData) => {
  try {
    console.log('Processing payment for:', `${API_BASE_URL}/demo-bookings/${demoId}/process-payment`);
    console.log('Payment data:', paymentData);

    const response = await fetch(`${API_BASE_URL}/demo-bookings/${demoId}/process-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    console.log('Process payment response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log('Process payment response data:', data);
    return data;
    
  } catch (error) {
    console.error('Process Payment Error Details:', error);
    throw error;
  }
};

// Task API functions
export const getTasks = async () => {
  try {
    console.log('Fetching tasks from:', `${API_BASE_URL}/tasks`);

    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Tasks response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log('Tasks API response data:', data);
    
    // Handle different response structures
    if (data.status === 'success') {
      return {
        success: true,
        message: data.message,
        data: data.data
      };
    } else if (data.success !== undefined) {
      return {
        success: data.success,
        message: data.message,
        data: data.data
      };
    } else {
      // If it's already in the expected format
      return data;
    }
    
  } catch (error) {
    console.error('Get Tasks Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    console.log('Creating task:', `${API_BASE_URL}/tasks`);
    console.log('Request data:', taskData);

    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(taskData),
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
      const errorMessage = data.message || 
                          (data.errors ? Object.values(data.errors).flat().join(', ') : `HTTP error! status: ${response.status}`);
      throw new Error(errorMessage);
    }

    console.log('Task API response data:', data);
    return data;
    
  } catch (error) {
    console.error('Task Creation Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

export const updateTask = async (taskId, taskData) => {
  try {
    console.log('Updating task:', `${API_BASE_URL}/tasks/${taskId}`);
    console.log('Update data:', taskData);

    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    console.log('Update task response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || 
                          (data.errors ? Object.values(data.errors).flat().join(', ') : `HTTP error! status: ${response.status}`);
      throw new Error(errorMessage);
    }

    console.log('Update task response data:', data);
    return data;
    
  } catch (error) {
    console.error('Update Task Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    console.log('Deleting task:', `${API_BASE_URL}/tasks/${taskId}`);

    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Delete task response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log('Delete task response data:', data);
    return data;
    
  } catch (error) {
    console.error('Delete Task Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

export const getTaskTeachers = async () => {
  try {
    console.log('Fetching task teachers from:', `${API_BASE_URL}/tasks-teachers/teachers`);

    const response = await fetch(`${API_BASE_URL}/tasks-teachers/teachers`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Task teachers response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log('Task teachers API response data:', data);
    
    // Handle different response structures
    if (data.status === 'success') {
      return {
        success: true,
        message: data.message,
        data: data.data
      };
    } else {
      return {
        success: data.success || false,
        message: data.message || 'Unknown error',
        data: data.data || null
      };
    }
    
  } catch (error) {
    console.error('Get Task Teachers Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

// Test Category API functions
export const getTestCategories = async () => {
  try {
    console.log('Fetching test categories from:', `${API_BASE_URL}/test-categories`);

    const response = await fetch(`${API_BASE_URL}/test-categories`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Test categories response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log('Test categories API response data:', data);
    
    // Handle different response structures
    if (data.status === 'success') {
      return {
        success: true,
        message: data.message,
        data: data.data
      };
    } else {
      return {
        success: data.success || false,
        message: data.message || 'Unknown error',
        data: data.data || null
      };
    }
    
  } catch (error) {
    console.error('Get Test Categories Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

export const createTestCategory = async (categoryData) => {
  try {
    console.log('Creating test category:', `${API_BASE_URL}/test-categories`);
    console.log('Request data:', categoryData);

    const response = await fetch(`${API_BASE_URL}/test-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(categoryData),
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
      const errorMessage = data.message || 
                          (data.errors ? Object.values(data.errors).flat().join(', ') : `HTTP error! status: ${response.status}`);
      throw new Error(errorMessage);
    }

    console.log('Test category API response data:', data);
    return data;
    
  } catch (error) {
    console.error('Test Category Creation Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

export const updateTestCategory = async (categoryId, categoryData) => {
  try {
    console.log('Updating test category:', `${API_BASE_URL}/test-categories/${categoryId}`);
    console.log('Update data:', categoryData);

    const response = await fetch(`${API_BASE_URL}/test-categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    console.log('Update test category response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || 
                          (data.errors ? Object.values(data.errors).flat().join(', ') : `HTTP error! status: ${response.status}`);
      throw new Error(errorMessage);
    }

    console.log('Update test category response data:', data);
    return data;
    
  } catch (error) {
    console.error('Update Test Category Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};

export const deleteTestCategory = async (categoryId) => {
  try {
    console.log('Deleting test category:', `${API_BASE_URL}/test-categories/${categoryId}`);

    const response = await fetch(`${API_BASE_URL}/test-categories/${categoryId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Delete test category response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log('Delete test category response data:', data);
    return data;
    
  } catch (error) {
    console.error('Delete Test Category Error Details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to the server. Make sure Laravel is running on port 8000.');
    }
    
    throw error;
  }
};