from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp
import logging
import os

# Logging for debugging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Allows your Vercel frontend to communicate with this Render backend
CORS(app)

# Updated options to look more like a real browser to avoid bot detection
YDL_OPTIONS = {
    'format': 'bestaudio/best',
    'noplaylist': True,
    'quiet': True,
    'no_warnings': True,
    'default_search': 'ytsearch',
    'source_address': '0.0.0.0',
    'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'referer': 'https://www.google.com/',
}

# These songs will show up if YouTube blocks the server (prevents 500 error)
FALLBACK_SONGS = [
    {
        "id": "dQw4w9WgXcQ",
        "title": "Never Gonna Give You Up",
        "artist": "Rick Astley",
        "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg",
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "duration": 212
    },
    {
        "id": "kJQP7kiw5Fk",
        "title": "Despacito",
        "artist": "Luis Fonsi",
        "thumbnail": "https://img.youtube.com/vi/kJQP7kiw5Fk/0.jpg",
        "url": "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
        "duration": 288
    },
    {
        "id": "JGwWNGJdvx8",
        "title": "Shape of You",
        "artist": "Ed Sheeran",
        "thumbnail": "https://img.youtube.com/vi/JGwWNGJdvx8/0.jpg",
        "url": "https://www.youtube.com/watch?v=JGwWNGJdvx8",
        "duration": 233
    }
]

def extract_song_data(entry):
    if not entry: return None
    duration = entry.get('duration')
    if duration and duration > 900: return None # Filter out long videos
    
    return {
        'id': entry.get('id') or entry.get('video_id'),
        'title': entry.get('title'),
        'url': entry.get('url'),
        'thumbnail': entry.get('thumbnail') or f"https://img.youtube.com/vi/{entry.get('id')}/mqdefault.jpg",
        'duration': duration,
        'artist': entry.get('uploader') or entry.get('artist') or 'Unknown Artist',
    }

@app.route('/')
def home():
    return "🎵 Melodify AI Engine is live and kicking!"

@app.route('/featured', methods=['GET'])
def get_featured():
    try:
        with yt_dlp.YoutubeDL(YDL_OPTIONS) as ydl:
            # Lower count (5) to reduce bot-like behavior
            info = ydl.extract_info("ytsearch5:trending music india", download=False)
            songs = [extract_song_data(e) for e in info['entries'] if e]
            results = [s for s in songs if s is not None]
            
            if not results:
                return jsonify(FALLBACK_SONGS)
            return jsonify(results)
    except Exception as e:
        logger.error(f"Featured Error: {str(e)}")
        # Return fallback songs instead of a 500 error
        return jsonify(FALLBACK_SONGS)

@app.route('/search', methods=['GET'])
def search_songs():
    query = request.args.get('query')
    if not query: return jsonify([])
    try:
        with yt_dlp.YoutubeDL(YDL_OPTIONS) as ydl:
            info = ydl.extract_info(f"ytsearch10:{query}", download=False)
            songs = [extract_song_data(e) for e in info['entries'] if e]
            return jsonify([s for s in songs if s is not None])
    except Exception as e:
        logger.error(f"Search Error: {str(e)}")
        return jsonify({"error": "YouTube is currently limiting requests. Try again later."}), 503

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
    try:
        with yt_dlp.YoutubeDL(YDL_OPTIONS) as ydl:
            seed_info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            artist = seed_info.get('uploader', 'Unknown Artist')
            
            # Simple, fast recommendation vector
            results = ydl.extract_info(f"ytsearch15:{artist} popular songs", download=False)
            
            seen_ids = {video_id}
            final_queue = []
            
            if 'entries' in results:
                for entry in results['entries']:
                    song = extract_song_data(entry)
                    if song and song['id'] not in seen_ids:
                        final_queue.append(song)
                        seen_ids.add(song['id'])

            return jsonify(final_queue[:20])
    except Exception as e:
        logger.error(f"Recommender Error: {str(e)}")
        return jsonify(FALLBACK_SONGS)

if __name__ == '__main__':
    # Render uses the PORT environment variable
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)