import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-please-change-in-production')
    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/imdb')
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', '/tmp/imdb_uploads')
    MAX_CONTENT_LENGTH = 1024 * 1024 * 1024  # 1GB max upload size
    ALLOWED_EXTENSIONS = {'csv'}
    
    # Ensure upload directory exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False

# Set configuration based on environment
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

# Export the active configuration
active_config = config[os.environ.get('FLASK_ENV', 'default')]