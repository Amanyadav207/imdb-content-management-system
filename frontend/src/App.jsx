import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import MovieList from './components/MovieList';

function App() {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [uploadInfo, setUploadInfo] = useState(null);

  // Handle successful upload
  const handleUploadSuccess = (stats) => {
    console.log("Upload successful:", stats);
    
    // Set upload stats for display
    setUploadInfo(stats);
    
    // Increment counter to trigger MovieList refresh
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <header className="bg-blue-600 text-white p-4 mb-6 rounded shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">IMDb Content Management System</h1>
          <p className="text-sm mt-1 text-blue-100">Upload and manage movie data</p>
        </div>
      </header>
      
      <main className="container mx-auto">
        <div className="grid grid-cols-1 gap-6">
          {/* File Upload */}
          <FileUpload onUploadSuccess={handleUploadSuccess} />
          
          {/* Success Message */}
          {uploadInfo && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md shadow-sm">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="font-bold text-green-700">Upload Successful!</h3>
              </div>
              <div className="mt-2 text-green-600">
                <p>Processed {uploadInfo.records_processed} records</p>
                <p className="text-sm mt-1">File: {uploadInfo.original_filename}</p>
              </div>
            </div>
          )}
          
          {/* Movie List */}
          <MovieList refreshTrigger={refreshCounter} />
        </div>
      </main>
      
      <footer className="mt-12 pt-6 border-t border-gray-200">
        <div className="container mx-auto">
          <p className="text-center text-gray-500 text-sm">
            IMDb Content Management System &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;