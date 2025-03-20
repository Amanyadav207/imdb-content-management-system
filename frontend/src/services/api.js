import axios from 'axios';

// Create a configured axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request logging
api.interceptors.request.use(request => {
  console.log('Starting API Request:', request.method.toUpperCase(), request.url);
  return request;
});

// Add response logging and error handling
api.interceptors.response.use(
  response => {
    console.log('API Response Success:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('API Response Error:', error.message);
    return Promise.reject(error);
  }
);

// API service for all backend interactions
const apiService = {
  // Upload CSV file
  uploadCSV: async (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log("Uploading file:", file.name, "size:", file.size);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...options
    });
  },
  
  // Check upload status
  checkUploadStatus: async (options = {}) => {
    return api.get('/upload/status', options);
  },
  
  // Get movies with filters, sorting, and pagination
  getMovies: async (params = {}, options = {}) => {
    console.log("Getting movies with params:", params);
    
    const defaultParams = {
      page: 1,
      per_page: 10,
      sort_by: 'release_date',
      sort_order: 'desc'
    };
    
    const queryParams = { ...defaultParams, ...params };
    
    try {
      return await api.get('/movies', { 
        params: queryParams,
        ...options
      });
    } catch (error) {
      console.error("Error fetching movies:", error);
      throw error;
    }
  },
  
  // Get available filter options
  getFilterOptions: async (options = {}) => {
    try {
      return await api.get('/movies/filters', options);
    } catch (error) {
      console.error("Error fetching filter options:", error);
      throw error;
    }
  },
  
  // Debug endpoint
  getDebugInfo: async () => {
    return api.get('/movies/debug');
  }
};

export default apiService;