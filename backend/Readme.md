# IMDb Content Upload and Review System

A Flask-based web application that allows the IMDb content team to upload movie-related data using CSV files and provides APIs to consume this data.

## Features

- CSV file upload for movie data (supports files up to 1GB)
- View uploaded movies with pagination
- Filter by year of release and language
- Sort by release date and ratings (ascending/descending)
- Responsive UI built with Bootstrap 5

## Tech Stack

- **Backend**: Python Flask Framework
- **Database**: MongoDB
- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5

## Prerequisites

- Python 3.8 or higher
- MongoDB installed and running
- pip (Python package manager)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/imdb-content-system.git
   cd imdb-content-system
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install the dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a .env file for environment variables (optional):
   ```
   SECRET_KEY=your-secret-key
   MONGO_URI=mongodb://localhost:27017/
   MONGO_DB=imdb_content
   MONGO_COLLECTION=movies
   ```

## Running the Application

1. Make sure MongoDB is running

2. Start the Flask application:
   ```
   python app.py
   ```

3. Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

## Project Structure

- `app.py`: Main Flask application
- `config.py`: Configuration settings
- `utils/`: Utility functions for database and CSV processing
- `templates/`: HTML templates
- `static/`: Static files (CSS, JavaScript)

## API Documentation

### CSV Upload API

- **URL**: `/upload`
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Parameters**:
  - `csv_file`: The CSV file to upload
- **Response**: Redirects to the view page with a success or error message

### Movie Listing API

- **URL**: `/view`
- **Method**: GET
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `year`: Filter by year of release
  - `language`: Filter by language
  - `sort`: Sort options (release_date_asc, release_date_desc, ratings_asc, ratings_desc)
- **Response**: Renders the page with movie data, filters, and pagination

## CSV Format

The expected CSV format should include the following fields:
- title (string): Movie title
- release_date (date): Release date (DD-MM-YYYY format)
- year_of_release (integer): Year of release
- language (string): Language of the movie
- ratings (float): Movie rating

## Handling Large Files

The system is designed to handle CSV files up to 1GB in size. For very large files:
- Files are processed in chunks to avoid memory issues
- Progress tracking is provided during upload
- Temporary files are cleaned up after processing

## License

[MIT License](LICENSE)

## Contact

For any questions or support, please email: your-email@example.com