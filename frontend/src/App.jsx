import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import FileUploadPage from './pages/fileuploadpage';
import MovieListPage from './pages/moviepagelist';

function App() {
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Handle successful upload
  const handleUploadSuccess = () => {
    // Increment counter to trigger MovieList refresh
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-600 text-white p-4 shadow-md">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">IMDb Content Management System</h1>
            <p className="text-sm mt-1 text-blue-100">Upload and manage movie data</p>
            
            <nav className="mt-4">
              <ul className="flex space-x-4">
                <li>
                  <NavLink 
                    to="/" 
                    className={({ isActive }) => 
                      `px-3 py-2 rounded transition-colors ${
                        isActive 
                          ? 'bg-blue-700 text-white' 
                          : 'text-blue-100 hover:bg-blue-500'
                      }`
                    }
                    end
                  >
                    View Movies
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/upload" 
                    className={({ isActive }) => 
                      `px-3 py-2 rounded transition-colors ${
                        isActive 
                          ? 'bg-blue-700 text-white' 
                          : 'text-blue-100 hover:bg-blue-500'
                      }`
                    }
                  >
                    Upload Data
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        
        <main className="container mx-auto p-4 md:p-6">
          <Routes>
            <Route path="/" element={<MovieListPage refreshTrigger={refreshCounter} />} />
            <Route path="/upload" element={<FileUploadPage onUploadSuccess={handleUploadSuccess} />} />
          </Routes>
        </main>
        
        <footer className="mt-12 pt-6 border-t border-gray-200">
          <div className="container mx-auto p-4">
            <p className="text-center text-gray-500 text-sm">
              IMDb Content Management System &copy; {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;