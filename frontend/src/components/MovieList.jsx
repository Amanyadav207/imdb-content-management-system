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
    const controller = new AbortController();
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
        const responseData = response.data;
        
        if (responseData && responseData.movies) {
          setMovies(responseData.movies);
          
          if (responseData.pagination) {
            setTotalPages(responseData.pagination.total_pages || 1);
            setTotalCount(responseData.pagination.total_count || 0);
          }
        } else {
          setError("Received unexpected data format from server");
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(`Failed to load movies: ${err.message}`);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [page, perPage, sortField, sortOrder, yearFilter, languageFilter, refreshTrigger]);

  // Load filter options
  useEffect(() => {
    const controller = new AbortController();

    apiService.getFilterOptions({ signal: controller.signal })
      .then(response => {
        setFilterOptions({
          years: response.data.years || [],
          languages: response.data.languages || []
        });
      })
      .catch(() => {
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

  return (
    <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
      {/* Header with count */}
      <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">
          Movies ({!loading && totalCount.toLocaleString()})
        </h2>
        <div className="text-sm text-gray-500">
          Showing page {page} of {totalPages}
        </div>
      </div>

      {/* Filters - Updated to be more compact */}
      <div className="p-4 bg-white border-b">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Year:</label>
            <select
              value={yearFilter}
              onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
              className="w-full border rounded-md p-2 bg-white"
            >
              <option value="">All Years</option>
              {filterOptions.years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Language:</label>
            <select
              value={languageFilter}
              onChange={(e) => { setLanguageFilter(e.target.value); setPage(1); }}
              className="w-full border rounded-md p-2 bg-white"
            >
              <option value="">All Languages</option>
              {filterOptions.languages.map((language) => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Current Sorting Indicator */}
      <div className="px-6 py-3 bg-gray-50 border-b">
        <div className="flex items-center text-sm">
          <span className="font-medium text-gray-600 mr-2">Sorted by:</span>
          <span className="font-semibold text-blue-600">
            {sortField === 'title' ? 'Title' :
             sortField === 'release_date' ? 'Release Date' :
             sortField === 'language' ? 'Language' :
             sortField === 'ratings' ? 'Rating' : sortField}
          </span>
          <span className="ml-1 text-blue-600">
            {sortOrder === 'asc' ? '(A to Z)' : '(Z to A)'}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-500">Loading movies...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 m-6 rounded">
          <p className="font-medium text-lg mb-2">Error</p>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-blue-500 hover:text-blue-700">
            Refresh Page
          </button>
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center p-12">
          <div className="inline-block rounded-full bg-gray-100 p-4">
            <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="mt-4 text-gray-500 font-medium">No movies found</p>
          <p className="mt-2 text-gray-400">Try changing your filter settings</p>
        </div>
      ) : (
        <>
          {/* Movie Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { field: 'title', label: 'Title' },
                    { field: 'release_date', label: 'Release Date' },
                    { field: 'language', label: 'Language' },
                    { field: 'ratings', label: 'Rating' }
                  ].map(({ field, label }) => (
                    <th key={field} 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort(field)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{label}</span>
                        <div className="flex flex-col">
                          {sortField === field ? (
                            sortOrder === 'asc' ? (
                              <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414l-3.293 3.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 15.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )
                          ) : (
                            <div className="opacity-0 group-hover:opacity-100">
                              <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 italic ml-1">
                          (click to sort)
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movies.map((movie, index) => (
                  <tr key={movie._id || `movie-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{movie.title}</div>
                      {movie.original_title && movie.original_title !== movie.title && (
                        <div className="text-xs text-gray-500">{movie.original_title}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{formatDate(movie.release_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{movie.language || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {movie.ratings !== undefined && movie.ratings !== null ? (
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="font-medium">
                            {typeof movie.ratings === 'number' ? movie.ratings.toFixed(1) : movie.ratings}
                          </span>
                        </div>
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
          <div className="px-6 py-4 bg-gray-50 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              Showing {movies.length} of {totalCount.toLocaleString()} movies
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setPage((p) => Math.max(p - 1, 1))} 
                disabled={page <= 1} 
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm">
                <span className="text-sm text-gray-700">{page}</span>
                <span className="mx-2 text-gray-500">/</span>
                <span className="text-sm text-gray-700">{totalPages}</span>
              </div>
              <button 
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))} 
                disabled={page >= totalPages} 
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
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