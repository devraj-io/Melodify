import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import type { Song, RepeatMode } from '@/types';

// Ensure this matches your Flask server address
const FLASK_API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface PlayerContextType {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  currentTime: number;
  duration: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  seek: (time: number) => void;
  startRadioMode: (song: Song) => Promise<void>; // Added AI Logic
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // AI Content-Based Filtering Logic
  const startRadioMode = useCallback(async (song: Song) => {
    try {
      const response = await fetch(`${FLASK_API}/recommendations/${song.id}`);
      const aiRecommendations = await response.json();

      // Update the queue with AI results
      setQueue(aiRecommendations);
      console.log("AI Radio Mode: Content-Based Filtering applied to queue.");
    } catch (error) {
      console.error("AI Recommendation failed", error);
    }
  }, []);

  // Professional Playback Logic with JIT URL Fetching
  const playSong = useCallback(async (song: Song, newQueue?: Song[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      // Industry standard: Fetch a fresh stream URL before playback
      const res = await fetch(`${FLASK_API}/stream/${song.id}`);
      const data = await res.json();

      setCurrentSong(song);
      if (newQueue) {
        setQueue(newQueue.filter((s) => s.id !== song.id));
      }

      audio.src = data.url; // Use the fresh URL from Flask
      audio.load();
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Playback failed:", error);
    }
  }, []);

  const playNext = useCallback(async () => {
    if (queue.length === 0) {
      // Auto-Discovery: If queue is empty, trigger AI Radio automatically
      if (currentSong) {
        await startRadioMode(currentSong);
      }
      return;
    }

    let nextIndex = 0;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    }

    const nextSong = queue[nextIndex];
    const newQueue = queue.filter((_, i) => i !== nextIndex);
    setQueue(newQueue);
    playSong(nextSong);
  }, [queue, shuffle, currentSong, playSong, startRadioMode]);

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (repeat === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [repeat, playNext]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
  }, [isPlaying, currentSong]);

  const playPrevious = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    audio.currentTime = 0;
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setQueue((prev) => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => setQueue([]), []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => setIsMuted((m) => !m), []);
  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);
  const toggleRepeat = useCallback(() => {
    setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'));
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        isPlaying,
        volume,
        isMuted,
        shuffle,
        repeat,
        currentTime,
        duration,
        audioRef,
        playSong,
        togglePlay,
        playNext,
        playPrevious,
        addToQueue,
        removeFromQueue,
        clearQueue,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        seek,
        startRadioMode,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}