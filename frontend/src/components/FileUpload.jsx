import React, { useState, useRef } from 'react';
import apiService from '../services/api';

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      console.log("File selected:", selectedFile.name, "size:", selectedFile.size);
      setFile(selectedFile);
      setError(null);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      console.log("Starting file upload...");
      // Use the apiService for upload
      const response = await apiService.uploadCSV(file);
      console.log("Upload response:", response.data);

      // Display success message
      alert('Upload successful!');
      
      // Reset form
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Call success callback if provided
      if (onUploadSuccess && typeof onUploadSuccess === 'function') {
        onUploadSuccess(response.data.stats || {
          records_processed: response.data.success ? 'unknown' : 0,
          original_filename: file.name
        });
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = 'Upload failed: ';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage += error.response.data?.message || error.response.statusText || error.message;
        console.error("Error response:", error.response);
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage += 'No response from server. Check if the backend is running.';
        console.error("Error request:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded mb-6 bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Upload Movie Data CSV</h2>
      
      <div className="mb-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        
        {file && (
          <div className="text-sm text-gray-600 mt-2">
            Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </div>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
          {error}
        </div>
      )}
      
      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 transition-colors"
      >
        {isUploading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
          </span>
        ) : 'Upload CSV'}
      </button>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Note: CSV should contain movie data with columns like title, release_date, language, ratings, etc.</p>
      </div>
    </div>
  );
};

export default FileUpload;