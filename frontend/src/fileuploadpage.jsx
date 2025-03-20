import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from './components/FileUpload';

const FileUploadPage = ({ onUploadSuccess }) => {
  const [uploadInfo, setUploadInfo] = useState(null);
  const navigate = useNavigate();

  // Handle successful upload
  const handleUploadSuccess = (stats) => {
    console.log("Upload successful:", stats);
    
    // Set upload stats for display
    setUploadInfo(stats);
    
    // Call parent callback to refresh movie list
    if (onUploadSuccess) {
      onUploadSuccess(stats);
    }
  };

  // Navigate to movie list
  const viewMovies = () => {
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Movie Data</h2>
        <p className="text-gray-600">Upload your CSV file containing movie data.</p>
      </div>
      
      {/* File Upload Component */}
      <FileUpload onUploadSuccess={handleUploadSuccess} />
      
      {/* Success Message */}
      {uploadInfo && (
        <div className="p-6 bg-green-50 border border-green-200 rounded-md shadow-sm mt-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-2 mr-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-bold text-xl text-green-800">Upload Successful!</h3>
          </div>
          <div className="mt-4 text-green-700">
            <p className="text-lg">Processed {uploadInfo.records_processed} records</p>
            <p className="mt-1">File: {uploadInfo.original_filename}</p>
          </div>
          <div className="mt-6">
            <button 
              onClick={viewMovies}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              View Movies
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadPage;