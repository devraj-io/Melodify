export interface Song {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: number;
  artist: string;
}

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface LikedSong {
  id: string;
  user_id: string;
  song_id: string;
  song_title: string;
  song_artist: string;
  song_thumbnail: string;
  song_url: string;
  song_duration: number;
  liked_at: string;
}

export interface Playlist {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  song_title: string;
  song_artist: string;
  song_thumbnail: string;
  song_url: string;
  song_duration: number;
  added_at: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  currentTime: number;
  duration: number;
}
