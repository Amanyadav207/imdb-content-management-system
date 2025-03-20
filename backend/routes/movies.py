from flask import Blueprint, request, jsonify, current_app
from models.movie import Movie
import logging
import traceback

# Create a Blueprint for movie-related routes
movies_bp = Blueprint('movies', __name__, url_prefix='/api/movies')
logger = logging.getLogger(__name__)

@movies_bp.route('', methods=['GET'])
def get_movies():
    """
    Get paginated list of movies with optional filtering and sorting.
    
    Query Parameters:
    - page: Page number (default: 1)
    - per_page: Items per page (default: 10)
    - year: Filter by year of release
    - language: Filter by language
    - sort_by: Field to sort by (default: release_date)
    - sort_order: 'asc' or 'desc' (default: desc)
    
    Response:
    - JSON with movies data and pagination metadata
    """
    logger.info("Movies API called with params: %s", request.args)
    
    try:
        # Parse query parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        year = request.args.get('year')
        language = request.args.get('language')
        sort_by = request.args.get('sort_by', 'release_date')
        sort_order = request.args.get('sort_order', 'desc')
        
        # Validate sort_by to prevent injection
        allowed_sort_fields = ['release_date', 'ratings', 'title', 'year']
        if sort_by not in allowed_sort_fields:
            sort_by = 'release_date'
        
        # Validate sort_order
        if sort_order not in ['asc', 'desc']:
            sort_order = 'desc'
        
        # Build filters
        filters = {}
        if year:
            filters['year'] = year
        if language:
            filters['language'] = language
        
        # Get movies from database
        movie_model = Movie()
        result = movie_model.find(
            filters=filters,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            per_page=per_page
        )
        
        # Log the number of movies found
        logger.info("Found %d movies (total: %d)", 
                   len(result['movies']), 
                   result['pagination']['total_count'])
                   
        # If no movies found, provide a more informative response
        if len(result['movies']) == 0:
            logger.warning("No movies found with filters: %s", filters)
            
        return jsonify(result)
        
    except Exception as e:
        logger.error("Error in get_movies endpoint: %s", str(e))
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'An error occurred while fetching movies',
            'details': str(e)
        }), 500

@movies_bp.route('/filters', methods=['GET'])
def get_filter_options():
    """
    Get available filter options for the frontend.
    
    Response:
    - JSON with lists of available languages and years
    """
    logger.info("Filter options API called")
    
    try:
        movie_model = Movie()
        
        languages = movie_model.get_available_languages()
        years = movie_model.get_available_years()
        
        logger.info("Found %d languages and %d years", len(languages), len(years))
        
        return jsonify({
            'languages': languages,
            'years': years
        })
        
    except Exception as e:
        logger.error("Error in get_filter_options endpoint: %s", str(e))
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'An error occurred while fetching filter options',
            'details': str(e)
        }), 500

@movies_bp.route('/debug', methods=['GET'])
def debug_movies():
    """
    Debug endpoint to check the structure of the first few movies.
    Useful for troubleshooting.
    """
    try:
        from pymongo import MongoClient
        
        # Connect to MongoDB
        client = MongoClient(current_app.config['MONGO_URI'])
        db = client.get_database()
        
        # Get the first 5 movies
        movies = list(db.movies.find().limit(5))
        
        # Convert ObjectId to string for JSON serialization
        for movie in movies:
            movie['_id'] = str(movie['_id'])
        
        # Get collection stats
        stats = db.command('collStats', 'movies')
        
        return jsonify({
            'sample_movies': movies,
            'total_count': db.movies.count_documents({}),
            'collection_stats': {
                'count': stats['count'],
                'size': stats['size'],
                'avg_obj_size': stats['avgObjSize']
            }
        })
        
    except Exception as e:
        logger.error("Error in debug_movies endpoint: %s", str(e))
        return jsonify({
            'error': 'An error occurred while debugging movies',
            'details': str(e)
        }), 500