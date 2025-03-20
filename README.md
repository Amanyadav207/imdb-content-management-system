# IMDb Content Upload and Review System

A full-stack application for uploading and managing movie data using CSV files. Built with Flask, MongoDB, and React.

## Features

- Upload large CSV files (up to 1GB) with movie data
- View uploaded movies with pagination
- Filter movies by year and language
- Sort movies by release date and ratings
- Responsive design for all device sizes

## Technology Stack

### Backend
- Python Flask Framework
- MongoDB Database
- Pandas for CSV processing

### Frontend
- React with Vite
- Tailwind CSS for styling
- Axios for API requests

## Prerequisites

- Docker and Docker Compose (for easy setup)
- Git

Alternatively, for manual setup:
- Python 3.9+
- Node.js 16+
- MongoDB

## Getting Started

### Setup with Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/imdb-content-system.git
   cd imdb-content-system
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with the following content:
   ```
   FLASK_ENV=development
   MONGO_URI=mongodb://localhost:27017/imdb_content
   UPLOAD_FOLDER=/tmp/imdb_uploads
   ```

5. Run the Flask application:
   ```bash
   flask run
   ```

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `backend/`: Flask application files
  - `app.py`: Main application file
  - `config.py`: Configuration settings
  - `models/`: Database models
  - `routes/`: API routes
  - `services/`: Business logic
  - `utils/`: Utility functions

- `frontend/`: React application files
  - `src/`: Source code
    - `components/`: React components
    - `services/`: API services
    - `styles/`: CSS styles

## API Endpoints

### Upload API

- `POST /api/upload`: Upload and process a CSV file
- `GET /api/upload/status`: Check API status

### Movies API

- `GET /api/movies`: Get a paginated list of movies with optional filtering and sorting
- `GET /api/movies/filters`: Get available filter options (years, languages)

## CSV Data Format

The application expects the CSV file to follow the IMDb data format with the following columns:

- `title`: Movie title
- `original_title`: Original title (can be the same as title)
- `release_date`: Release date in YYYY-MM-DD format
- `language`: Movie language
- `ratings`: Rating value (e.g., 7.8)
- `vote_count`: Number of votes
- `runtime_minutes`: Runtime in minutes
- `genres`: Comma-separated list of genres
- `year`: Year of release (can be extracted from release_date)

Example CSV row:
```
Toy Story,Toy Story,1995-10-30,en,7.7,5415,81,Animation|Adventure|Comedy,1995
```

## Development

### Backend Development

- Add new API routes in the `routes/` directory
- Add new database models in the `models/` directory
- Implement business logic in the `services/` directory

### Frontend Development

- Add new React components in the `components/` directory
- Update API service in `services/api.js` for new endpoints

## Production Deployment

For production deployment, you should:

1. Set the `FLASK_ENV` environment variable to `production`
2. Use a proper MongoDB database with authentication
3. Set up proper CORS configuration
4. Build the React application using `npm run build`
5. Serve the built files using a web server (e.g., Nginx)

## License

[MIT License](LICENSE)

## Acknowledgements

- [Flask](https://flask.palletsprojects.com/)
- [MongoDB](https://www.mongodb.com/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)