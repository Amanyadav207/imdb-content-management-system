import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

const MovieList = ({ refreshTrigger }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState('release_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [yearFilter, setYearFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [filterOptions, setFilterOptions] = useState({ years: [], languages: [] });

  // Load movies
  useEffect(() => {
    const controller = new AbortController(); // Prevents duplicate API calls
    setLoading(true);
    setError(null);

    apiService.getMovies({
      page,
      per_page: perPage,
      sort_by: sortField,
      sort_order: sortOrder,
      year: yearFilter,
      language: languageFilter
    }, { signal: controller.signal })
      .then(response => {
        console.log("API Response:", response);
        
        // Direct access to the data from the response
        const responseData = response.data;
        
        // Check if movies exists in the response
        if (responseData && responseData.movies) {
          setMovies(responseData.movies);
          
          // Handle pagination if available
          if (responseData.pagination) {
            setTotalPages(responseData.pagination.total_pages || 1);
            setTotalCount(responseData.pagination.total_count || 0);
          }
        } else {
          console.error("Unexpected response format:", responseData);
          setError("Received unexpected data format from server");
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error("Error fetching movies:", err);
          setError(`Failed to load movies: ${err.message}`);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort(); // Cleanup API call on unmount or state change
  }, [page, perPage, sortField, sortOrder, yearFilter, languageFilter, refreshTrigger]);

  // Load filter options
  useEffect(() => {
    const controller = new AbortController();

    apiService.getFilterOptions({ signal: controller.signal })
      .then(response => {
        console.log("Filter options response:", response.data);
        setFilterOptions({
          years: response.data.years || [],
          languages: response.data.languages || []
        });
      })
      .catch((err) => {
        console.error("Error fetching filter options:", err);
        setFilterOptions({ years: [], languages: [] });
      });

    return () => controller.abort();
  }, [refreshTrigger]);

  // Handle sorting
  const handleSort = useCallback((field) => {
    setSortOrder(prev => field === sortField ? (prev === 'asc' ? 'desc' : 'asc') : 'asc');
    setSortField(() => field);
    setPage(1);
  }, [sortField]);

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };

  // For debugging
  const debugData = () => {
    console.log("Current state:", {
      movies,
      loading,
      error,
      totalCount,
      totalPages,
      sortField,
      sortOrder
    });
  };

  return (
    <div className="border rounded p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Movie Database ({totalCount.toLocaleString()} movies)</h2>
        <button onClick={debugData} className="px-2 py-1 text-xs bg-gray-100 rounded">Debug</button>
      </div>

      {/* Filters */}
      <div className="mb-4 p-3 bg-gray-50 rounded border grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[{ label: 'Year', value: yearFilter, setValue: setYearFilter, options: filterOptions.years },
          { label: 'Language', value: languageFilter, setValue: setLanguageFilter, options: filterOptions.languages }]
          .map(({ label, value, setValue, options }) => (
            <div key={label}>
              <label className="block text-sm font-medium mb-1">{label}:</label>
              <select
                value={value}
                onChange={(e) => { setValue(e.target.value); setPage(1); }}
                className="w-full border rounded p-1"
              >
                <option value="">All {label}s</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-500">Loading movies...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
          <p className="font-medium">Error</p>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="text-sm text-blue-500 hover:text-blue-700 mt-2">
            Refresh Page
          </button>
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded border">
          <p className="text-gray-500">No movies found.</p>
        </div>
      ) : (
        <>
          {/* Movie Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-50">
                <tr>
                  {[{ field: 'title', label: 'Title' },
                    { field: 'release_date', label: 'Release Date' },
                    { field: 'language', label: 'Language' },
                    { field: 'ratings', label: 'Rating' }]
                    .map(({ field, label }) => (
                      <th key={field} className="border p-2 text-left">
                        <button onClick={() => handleSort(field)} className="font-bold text-gray-700 hover:text-blue-500">
                          {label} {sortField === field && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                        </button>
                      </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movies.map((movie, index) => (
                  <tr key={movie._id || `movie-${index}`} className="border-b hover:bg-gray-50">
                    <td className="p-2 border-r">
                      <div className="font-medium">{movie.title}</div>
                      {movie.original_title && movie.original_title !== movie.title && (
                        <div className="text-xs text-gray-500">{movie.original_title}</div>
                      )}
                    </td>
                    <td className="p-2 border-r">{formatDate(movie.release_date)}</td>
                    <td className="p-2 border-r">{movie.language || 'Unknown'}</td>
                    <td className="p-2">
                      {movie.ratings !== undefined && movie.ratings !== null ? (
                        <span>⭐ {typeof movie.ratings === 'number' ? movie.ratings.toFixed(1) : movie.ratings}</span>
                      ) : (
                        <span className="text-gray-400">No rating</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages} • Showing {movies.length} of {totalCount.toLocaleString()} movies
            </p>
            <div>
              <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page <= 1} className="px-3 py-1 mr-2 bg-gray-100 rounded border hover:bg-gray-200">
                Previous
              </button>
              <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page >= totalPages} className="px-3 py-1 bg-gray-100 rounded border hover:bg-gray-200">
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MovieList;