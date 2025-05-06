'use client'
import { useState } from 'react';
import CertificationScanner from '@/app/components/Scanner';

export default function Home() {
  const [certData, setCertData] = useState({ name: '', expirationDate: '' });
  
  const handleCertResults = (results) => {
    console.log('Certificate results:', results);
    setCertData(results);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Employee Certification Verification</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Upload Certificate</h2>
          <CertificationScanner 
            onResultsChange={handleCertResults}
            showPreview={true}
            className="bg-gray-50"
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-3">Certificate Details</h2>
          
          {certData.name || certData.expirationDate ? (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Certification Name</label>
                <input
                  type="text"
                  value={certData.name}
                  onChange={(e) => setCertData({ ...certData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Expiration Date</label>
                <input
                  type="text"
                  value={certData.expirationDate}
                  onChange={(e) => setCertData({ ...certData, expirationDate: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="MM/DD/YYYY"
                />
              </div>
              
              <div className="mt-6">
                <div className="flex items-center mb-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${isExpired(certData.expirationDate) ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <div className="text-sm font-medium">
                    {isExpired(certData.expirationDate) ? 'Expired' : 'Valid'}
                  </div>
                </div>
                
                {isExpired(certData.expirationDate) && (
                  <div className="text-sm text-red-600">
                    This certification has expired. Please request renewal.
                  </div>
                )}
                
                {!isExpired(certData.expirationDate) && certData.expirationDate && (
                  <div className="text-sm text-gray-600">
                    Valid for {getDaysRemaining(certData.expirationDate)} more days
                  </div>
                )}
              </div>
              
              <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                Save to Employee Record
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 p-6 rounded-lg border border-gray-200 text-center text-gray-500">
              Upload a certificate to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function isExpired(dateStr) {
  if (!dateStr) return false;
  
  // Parse MM/DD/YYYY format
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;
  
  const expirationDate = new Date(parts[2], parts[0] - 1, parts[1]);
  const today = new Date();
  
  return expirationDate < today;
}

function getDaysRemaining(dateStr) {
  if (!dateStr) return 0;
  
  // Parse MM/DD/YYYY format
  const parts = dateStr.split('/');
  if (parts.length !== 3) return 0;
  
  const expirationDate = new Date(parts[2], parts[0] - 1, parts[1]);
  const today = new Date();
  
  const diffTime = expirationDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}
