from pymongo import MongoClient, ASCENDING, DESCENDING
from datetime import datetime
from flask import current_app
import logging
import traceback
import json
import math

logger = logging.getLogger(__name__)

class Movie:
    """Model for movie data in MongoDB."""
    
    def __init__(self, db=None):
        # If db instance is not provided, create a new connection
        if db is None:
            client = MongoClient(current_app.config['MONGO_URI'])
            self.db = client.get_database()
        else:
            self.db = db
        self.collection = self.db.movies
        
        # Create indices for efficient querying
        self.create_indices()
    
    def create_indices(self):
        """Create indices for frequently queried fields."""
        try:
            self.collection.create_index([("release_date", ASCENDING)])
            self.collection.create_index([("ratings", DESCENDING)])
            self.collection.create_index([("language", ASCENDING)])
            self.collection.create_index([("year", ASCENDING)])
        except Exception as e:
            logger.error(f"Error creating indices: {str(e)}")
    
    def insert_many(self, movies):
        """Insert multiple movie documents."""
        if not movies:
            return 0
        
        try:
            # Convert string dates to datetime objects for proper sorting
            for movie in movies:
                if 'release_date' in movie and movie['release_date']:
                    try:
                        movie['release_date'] = datetime.strptime(movie['release_date'], '%Y-%m-%d')
                    except ValueError:
                        # If date parsing fails, keep as string
                        pass
                
                # Extract year from release_date if possible
                if 'release_date' in movie and isinstance(movie['release_date'], datetime):
                    movie['year'] = movie['release_date'].year
                elif 'release_date' in movie and movie['release_date']:
                    # Try to extract year from string
                    try:
                        movie['year'] = int(movie['release_date'].split('-')[0])
                    except (ValueError, IndexError):
                        movie['year'] = None
            
            result = self.collection.insert_many(movies)
            return len(result.inserted_ids)
            
        except Exception as e:
            logger.error(f"Error inserting movies: {str(e)}")
            logger.error(traceback.format_exc())
            return 0
    
    def find(self, filters=None, sort_by=None, sort_order=None, page=1, per_page=10):
        """
        Find movies with pagination, filtering and sorting.
        
        Parameters:
        - filters: Dict of filter criteria
        - sort_by: Field to sort by
        - sort_order: 'asc' or 'desc'
        - page: Page number (1-indexed)
        - per_page: Number of items per page
        
        Returns:
        - Dictionary with movies data and pagination metadata
        """
        try:
            query = {}
            
            # Apply filters if provided
            if filters:
                if 'year' in filters and filters['year']:
                    try:
                        query['year'] = int(filters['year'])
                    except (ValueError, TypeError):
                        logger.warning(f"Invalid year filter: {filters['year']}")
                
                if 'language' in filters and filters['language']:
                    query['language'] = filters['language']
            
            logger.debug(f"Query: {query}")
            
            # Determine sort parameters
            sort_params = []
            if sort_by:
                direction = ASCENDING if sort_order == 'asc' else DESCENDING
                sort_params.append((sort_by, direction))
            
            # Default sort by release_date if no sort specified
            if not sort_params:
                sort_params.append(('release_date', DESCENDING))
            
            # Calculate pagination values
            skip = (page - 1) * per_page
            
            # Get total count (for pagination)
            total_count = self.collection.count_documents(query)
            
            # Get data for current page
            cursor = self.collection.find(query).sort(sort_params).skip(skip).limit(per_page)
            movies = list(cursor)
            
            logger.debug(f"Found {len(movies)} movies out of {total_count} total")
            
            # Convert ObjectId to string for JSON serialization and handle NaN values
            for movie in movies:
                movie['_id'] = str(movie['_id'])
                
                # Convert datetime objects to string for JSON serialization
                if 'release_date' in movie and isinstance(movie['release_date'], datetime):
                    movie['release_date'] = movie['release_date'].strftime('%Y-%m-%d')
                
                # Replace NaN values with null for JSON compatibility
                for key, value in list(movie.items()):
                    # Check for NaN or float('inf')
                    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
                        movie[key] = None
            
            # Prepare pagination metadata
            total_pages = (total_count + per_page - 1) // per_page if total_count > 0 else 1
            has_next = page < total_pages
            has_prev = page > 1
            
            return {
                'movies': movies,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total_count': total_count,
                    'total_pages': total_pages,
                    'has_next': has_next,
                    'has_prev': has_prev
                }
            }
            
        except Exception as e:
            logger.error(f"Error finding movies: {str(e)}")
            logger.error(traceback.format_exc())
            return {
                'movies': [],
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total_count': 0,
                    'total_pages': 0,
                    'has_next': False,
                    'has_prev': False
                }
            }
    
    def get_available_languages(self):
        """Get a list of all languages in the database."""
        try:
            languages = self.collection.distinct('language')
            # Filter out None, NaN, and empty values
            return [lang for lang in languages if lang and not (isinstance(lang, float) and math.isnan(lang))]
        except Exception as e:
            logger.error(f"Error getting languages: {str(e)}")
            return []
    
    def get_available_years(self):
        """Get a list of all years in the database."""
        try:
            years = self.collection.distinct('year')
            # Filter out None, NaN values and sort
            return sorted([year for year in years if year is not None and not (isinstance(year, float) and math.isnan(year))])
        except Exception as e:
            logger.error(f"Error getting years: {str(e)}")
            return []