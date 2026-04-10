const FLASK_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Song {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: number;
  artist: string;
}

export const musicApi = {
  search: async (query: string): Promise<Song[]> => {
    const res = await fetch(`${FLASK_BASE_URL}/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },

  getFeatured: async (): Promise<Song[]> => {
    const res = await fetch(`${FLASK_BASE_URL}/featured`);
    if (!res.ok) throw new Error('Failed to fetch trending');
    return res.json();
  },

  getFreshStream: async (videoId: string): Promise<{ url: string }> => {
    const res = await fetch(`${FLASK_BASE_URL}/stream/${videoId}`);
    return res.json();
  }
};