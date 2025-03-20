import pandas as pd
import os
import csv
from flask import current_app
import logging

logger = logging.getLogger(__name__)

class CSVProcessor:
    """Handles processing of large CSV files."""
    
    def __init__(self, file_path):
        self.file_path = file_path
    
    def process_in_chunks(self, chunk_size=1000):
        """
        Process a large CSV file in chunks to avoid memory issues.
        
        Returns:
        - Generator yielding chunks of processed data
        """
        try:
            # First, check the file and read a small sample to understand structure
            sample_df = pd.read_csv(self.file_path, nrows=5)
            logger.info(f"CSV columns found: {list(sample_df.columns)}")
            
            # Use pandas to read and process the CSV in chunks
            chunks = pd.read_csv(
                self.file_path, 
                chunksize=chunk_size,
                dtype=str,  # Read all as strings initially to avoid type issues
                na_values=['\\N', 'NULL', 'nan', 'NaN', ''],
                keep_default_na=True,
                on_bad_lines='skip'  # Skip bad lines instead of failing
            )
            
            for chunk in chunks:
                # Clean and transform the data
                processed_chunk = self._transform_chunk(chunk)
                yield processed_chunk
                
        except Exception as e:
            logger.error(f"Error processing CSV: {str(e)}")
            raise
    
    def _transform_chunk(self, chunk):
        """
        Transform a chunk of CSV data into the required format.
        
        Parameters:
        - chunk: Pandas DataFrame chunk
        
        Returns:
        - List of dictionaries ready for MongoDB insertion
        """
        # Map the CSV columns to our database fields
        # This makes the processor more flexible with different CSV formats
        column_mapping = {
            # Standard IMDb format
            'tconst': 'imdb_id',
            'primaryTitle': 'title',
            'originalTitle': 'original_title',
            'titleType': 'type',
            'startYear': 'year',
            'runtimeMinutes': 'runtime_minutes',
            'genres': 'genres',
            'isAdult': 'is_adult',
            
            # From the sample CSV we saw in your screenshot
            'title': 'title',
            'original_title': 'original_title',
            'release_date': 'release_date',
            'overview': 'overview',
            'runtime': 'runtime_minutes',
            'language': 'language',
            'vote_average': 'ratings',
            'vote_count': 'vote_count',
            'budget': 'budget',
            'production_companies': 'production_companies',
            'production_company_id': 'production_company_id',
            'homepage': 'homepage',
            'genre_id': 'genre_id',
            'languages': 'languages',
            'original_language': 'original_language'
        }
        
        # Log the actual columns in the chunk
        logger.info(f"Processing chunk with columns: {list(chunk.columns)}")
        
        # Drop rows with missing title (essential field)
        for title_field in ['title', 'primaryTitle']:
            if title_field in chunk.columns:
                chunk = chunk.dropna(subset=[title_field])
                break
        
        # Convert DataFrame to list of dictionaries
        records = chunk.to_dict('records')
        
        # Transform records to match our schema
        transformed_records = []
        for record in records:
            transformed = {}
            
            # Map fields according to our mapping, if they exist
            for source_field, target_field in column_mapping.items():
                if source_field in record:
                    transformed[target_field] = record[source_field]
            
            # Ensure title field exists (use original_title as fallback)
            if 'title' not in transformed and 'original_title' in transformed:
                transformed['title'] = transformed['original_title']
            
            # Process release_date field
            if 'release_date' in transformed and transformed['release_date']:
                # Ensure release_date is a string before trying to split it
                release_date_str = str(transformed['release_date'])
                transformed['release_date'] = release_date_str
                
                # Try to extract year
                try:
                    if '-' in release_date_str:
                        date_parts = release_date_str.split('-')
                        if len(date_parts) >= 1:
                            transformed['year'] = int(date_parts[0])
                    else:
                        # If it's just a year
                        transformed['year'] = int(float(release_date_str))
                except (ValueError, IndexError):
                    # If we can't extract year, use current year as fallback
                    from datetime import datetime
                    transformed['year'] = datetime.now().year
            
            # Process ratings (vote_average)
            if 'ratings' in transformed and transformed['ratings']:
                try:
                    transformed['ratings'] = float(transformed['ratings'])
                except (ValueError, TypeError):
                    transformed['ratings'] = 0
                    
            # Also handle vote_average if ratings not set
            elif 'vote_average' in record and record['vote_average']:
                try:
                    transformed['ratings'] = float(record['vote_average'])
                except (ValueError, TypeError):
                    transformed['ratings'] = 0
            
            # Parse runtime_minutes
            if 'runtime_minutes' in transformed and transformed['runtime_minutes']:
                try:
                    transformed['runtime_minutes'] = int(float(transformed['runtime_minutes']))
                except (ValueError, TypeError):
                    transformed['runtime_minutes'] = None
            
            # Process genres
            if 'genres' in transformed and transformed['genres']:
                transformed['genres'] = self._split_genres(transformed['genres'])
            
            # Process language
            if 'original_language' in record and record['original_language'] and 'language' not in transformed:
                transformed['language'] = record['original_language']
            
            # Only add records that have at least a title
            if 'title' in transformed and transformed['title']:
                transformed_records.append(transformed)
        
        return transformed_records
    
    def _split_genres(self, genres_str):
        """Split comma-separated genres string into a list."""
        if not genres_str or pd.isna(genres_str):
            return []
        return [g.strip() for g in str(genres_str).split(',')]