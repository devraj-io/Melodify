from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp
import logging

import os

# Logging for debugging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "🎵 Melodify AI Engine is live and kicking!"

YDL_OPTIONS = {
    'format': 'bestaudio/best',
    'noplaylist': True,
    'quiet': True,
    'no_warnings': True,
    'default_search': 'ytsearch',
    'source_address': '0.0.0.0',
}

def extract_song_data(entry):
    if not entry: return None
    # Filter out long videos (> 10 mins) to keep it a "music" player
    duration = entry.get('duration')
    if duration and duration > 600: return None
    
    return {
        'id': entry.get('id') or entry.get('video_id'),
        'title': entry.get('title'),
        'url': entry.get('url'),
        'thumbnail': entry.get('thumbnail'),
        'duration': duration,
        'artist': entry.get('uploader') or entry.get('artist') or 'Unknown Artist',
    }

@app.route('/featured', methods=['GET'])
def get_featured():
    try:
        with yt_dlp.YoutubeDL(YDL_OPTIONS) as ydl:
            info = ydl.extract_info("ytsearch20:latest trending music india", download=False)
            songs = [extract_song_data(e) for e in info['entries'] if e]
            return jsonify([s for s in songs if s is not None])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/search', methods=['GET'])
def search_songs():
    query = request.args.get('query')
    if not query: return jsonify([])
    try:
        with yt_dlp.YoutubeDL(YDL_OPTIONS) as ydl:
            info = ydl.extract_info(f"ytsearch15:{query}", download=False)
            songs = [extract_song_data(e) for e in info['entries'] if e]
            return jsonify([s for s in songs if s is not None])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/stream/<video_id>', methods=['GET'])
def stream_song(video_id):
    try:
        with yt_dlp.YoutubeDL(YDL_OPTIONS) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            return jsonify({"url": info.get('url')})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/recommendations/<video_id>', methods=['GET'])
def get_ai_recommendations(video_id):
    """
    Hybrid AI Recommender for 30-50 Songs
    Combines: Related Videos + Artist Context + Genre Vibe
    """
    try:
        with yt_dlp.YoutubeDL(YDL_OPTIONS) as ydl:
            # Step 1: Seed Song Analysis
            seed_info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            artist = seed_info.get('uploader', 'Unknown Artist')
            title = seed_info.get('title', '')
            
            all_raw_results = []

            # Step 2: Native Related Videos (High quality but limited)
            related = seed_info.get('related_videos', [])
            if related:
                all_raw_results.extend(related)

            # Step 3: Multi-Vector Search (Badi queue ke liye)
            # Hum 3 alag angles se search karenge taaki diversity mile
            search_vectors = [
                f"{artist} popular songs", 
                f"songs similar to {title}",
                f"best of {artist} mix"
            ]

            for vector in search_vectors:
                # Har vector se 15-20 songs nikalenge
                results = ydl.extract_info(f"ytsearch15:{vector}", download=False)
                if 'entries' in results:
                    all_raw_results.extend(results['entries'])

            # Step 4: Cleaning & Deduplication
            seen_ids = {video_id} # Current gaana repeat nahi hona chahiye
            final_queue = []
            
            for entry in all_raw_results:
                song = extract_song_data(entry)
                if song and song['id'] not in seen_ids:
                    final_queue.append(song)
                    seen_ids.add(song['id'])

            logger.info(f"Total AI Generated Queue: {len(final_queue)} songs")
            # 50 gaane return karenge
            return jsonify(final_queue[:50])
            
    except Exception as e:
        logger.error(f"Recommender Critical Error: {str(e)}")
        return jsonify({"error": "Failed to populate queue"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🎵 Melodify AI Engine: Active on http://0.0.0.0:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)