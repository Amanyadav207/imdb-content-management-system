from flask import Blueprint, request, current_app, jsonify
import os
import uuid
import shutil
from werkzeug.utils import secure_filename
from datetime import datetime
import logging
import traceback

from services.csv_processor import CSVProcessor
from models.movie import Movie

# Create a Blueprint for upload-related routes
upload_bp = Blueprint('upload', __name__, url_prefix='/api/upload')
logger = logging.getLogger(__name__)

def allowed_file(filename):
    """Check if the file has an allowed extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@upload_bp.route('', methods=['POST'])
def upload_file():
    """
    Handle CSV file upload and processing.
    
    Request: 
    - Multipart form with 'file' field containing CSV
    
    Response:
    - JSON with upload status and stats
    """
    print("Upload request received")
    
    # Check if file is in request
    if 'file' not in request.files:
        logger.warning("No file part in the request")
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    
    # Check if a file was selected
    if file.filename == '':
        logger.warning("No file selected")
        return jsonify({'error': 'No file selected'}), 400
    
    # Check if file is allowed
    if not allowed_file(file.filename):
        logger.warning(f"File type not allowed: {file.filename}")
        return jsonify({'error': 'File type not allowed, please upload CSV files only'}), 400
    
    # Generate a unique filename to avoid collisions
    original_filename = secure_filename(file.filename)
    unique_filename = f"{str(uuid.uuid4())}_{original_filename}"
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
    temp_copy_path = None
    
    try:
        # Save the file temporarily
        file.save(file_path)
        logger.info(f"File saved at: {file_path}")
        
        # Make a copy of the file to avoid file access issues
        temp_copy_path = f"{file_path}_copy"
        shutil.copy2(file_path, temp_copy_path)
        
        # Process the CSV file
        movie_model = Movie()
        processor = CSVProcessor(temp_copy_path)
        
        # Track statistics for the response
        total_records = 0
        start_time = datetime.now()
        
        # Process in chunks to handle large files
        for chunk in processor.process_in_chunks():
            if chunk:
                records_inserted = movie_model.insert_many(chunk)
                total_records += records_inserted
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return jsonify({
            'success': True,
            'message': 'File processed successfully',
            'stats': {
                'records_processed': total_records,
                'processing_time_seconds': processing_time,
                'original_filename': original_filename
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error processing upload: {str(e)}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'error': 'An error occurred while processing the file',
            'details': str(e)
        }), 500
        
    finally:
        # Clean up temporary files
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
            if temp_copy_path and os.path.exists(temp_copy_path):
                os.remove(temp_copy_path)
        except Exception as e:
            logger.error(f"Error cleaning up temporary files: {str(e)}")

@upload_bp.route('/status', methods=['GET'])
def upload_status():
    """
    Simple endpoint to check if the upload API is working.
    Useful for the frontend to verify connectivity.
    """
    return jsonify({
        'status': 'online',
        'max_size': current_app.config['MAX_CONTENT_LENGTH'],
        'allowed_extensions': list(current_app.config['ALLOWED_EXTENSIONS'])
    })