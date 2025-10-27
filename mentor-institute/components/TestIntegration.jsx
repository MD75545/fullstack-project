// src/components/TestIntegration.js
import React, { useState } from 'react';
import { testCors, registerUser } from '../services/api';

const TestIntegration = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTestCors = async () => {
    setLoading(true);
    try {
      const data = await testCors();
      setResult(`✅ SUCCESS: ${JSON.stringify(data)}`);
      console.log('CORS Working:', data);
    } catch (error) {
      setResult(`❌ ERROR: ${error.message}`);
      console.error('CORS Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestRegistration = async () => {
    setLoading(true);
    try {
      const testData = {
        name: "Test User",
        email: "test@example.com",
        mobile: "1234567890",
        password: "password123",
        join_as: "partner",
        affiliate_type: "Individual",
        city: "Test City",
        address: "Test Address"
      };
      
      const data = await registerUser(testData);
      setResult(`✅ REGISTRATION SUCCESS: ${JSON.stringify(data)}`);
      console.log('Registration Working:', data);
    } catch (error) {
      setResult(`❌ REGISTRATION ERROR: ${error.message}`);
      console.error('Registration Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Laravel + React Integration Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleTestCors} 
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px' }}
        >
          Test CORS Connection
        </button>
        
        <button 
          onClick={handleTestRegistration} 
          disabled={loading}
          style={{ padding: '10px' }}
        >
          Test Registration
        </button>
      </div>

      {loading && <p>Testing... Please wait</p>}
      
      {result && (
        <div style={{
          padding: '10px',
          backgroundColor: result.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px'
        }}>
          <strong>Result:</strong> {result}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>Check browser console (F12) for detailed errors</strong></p>
      </div>
    </div>
  );
};

export default TestIntegration;