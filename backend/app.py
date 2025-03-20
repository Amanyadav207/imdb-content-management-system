from flask import Flask, jsonify
from flask_cors import CORS
import os
import logging

# Import configurations
from config import active_config

# Import routes
from routes.upload import upload_bp
from routes.movies import movies_bp

def create_app(config=None):
    """
    Create and configure the Flask application.
    
    Parameters:
    - config: Configuration object (default: active_config from config.py)
    
    Returns:
    - Configured Flask application
    """
    app = Flask(__name__)
    
    # Load configuration
    if config is None:
        app.config.from_object(active_config)
    else:
        app.config.from_object(config)
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Enable CORS for frontend
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(upload_bp)
    app.register_blueprint(movies_bp)
    
    # Create upload folder if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Root route for health check
    @app.route('/')
    def index():
        return jsonify({
            'status': 'healthy',
            'message': 'IMDb Content System API is running',
            'version': '1.0.0'
        })
    
    # Global error handler
    @app.errorhandler(Exception)
    def handle_exception(e):
        # Log the error
        app.logger.error(f"Unhandled exception: {str(e)}")
        
        # Return a generic error response
        return jsonify({
            'error': 'An unexpected error occurred',
            'message': str(e)
        }), 500
    
    return app

# Create the application instance
app = create_app()

if __name__ == '__main__':
    # Run the app if executed directly
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))