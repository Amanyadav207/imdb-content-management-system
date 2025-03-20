import React from 'react';
import MovieList from '../components/MovieList';

const MovieListPage = ({ refreshTrigger }) => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Movie Database</h2>
        <p className="text-gray-600">Browse, filter and sort your movie collection.</p>
      </div>
      
      <MovieList refreshTrigger={refreshTrigger} />
    </div>
  );
};

export default MovieListPage;