import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app
from datetime import datetime

def generate_unique_filename(original_filename):
    """
    Generate a unique filename to avoid collisions.
    
    Parameters:
    - original_filename: Original filename from the uploaded file
    
    Returns:
    - Unique filename
    """
    secure_name = secure_filename(original_filename)
    unique_id = str(uuid.uuid4())
    return f"{unique_id}_{secure_name}"

def get_upload_path(filename):
    """
    Get the full path for an uploaded file.
    
    Parameters:
    - filename: Filename to use
    
    Returns:
    - Full path in the upload directory
    """
    return os.path.join(current_app.config['UPLOAD_FOLDER'], filename)

def format_timestamp(timestamp=None):
    """
    Format a timestamp for logging or display.
    
    Parameters:
    - timestamp: Datetime object (default: current time)
    
    Returns:
    - Formatted timestamp string
    """
    if timestamp is None:
        timestamp = datetime.now()
    
    return timestamp.strftime('%Y-%m-%d %H:%M:%S')

def is_allowed_file(filename):
    """
    Check if a file has an allowed extension.
    
    Parameters:
    - filename: Filename to check
    
    Returns:
    - Boolean indicating if the file is allowed
    """
    if '.' not in filename:
        return False
    
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in current_app.config['ALLOWED_EXTENSIONS']

def format_file_size(size_bytes):
    """
    Format a file size in bytes to a human-readable format.
    
    Parameters:
    - size_bytes: Size in bytes
    
    Returns:
    - Formatted file size string
    """
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024 or unit == 'GB':
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024