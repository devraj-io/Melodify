import { useState, useRef } from 'react';
import { Play, MoreVertical, Heart, ListPlus, PlusCircle, Radio } from 'lucide-react';
import type { Song } from '@/types';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLikedSongs } from '@/hooks/useLikedSongs';
import { formatDuration } from '@/lib/utils';
import { AddToPlaylistModal } from '@/components/playlists/AddToPlaylistModal';

interface SongCardProps {
  song: Song;
  allSongs?: Song[];
}

export function SongCard({ song, allSongs = [] }: SongCardProps) {
  // Destructure startRadioMode from your updated PlayerContext
  const { playSong, addToQueue, startRadioMode } = usePlayer();
  const { toggleLike, isLiked } = useLikedSongs();
  const [menuOpen, setMenuOpen] = useState(false);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const liked = isLiked(song.id);

  // INDUSTRY LEVEL FIX: 
  // When playing a song, we also trigger the AI to fill the queue with "similar vibes"
  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSong(song, allSongs);
    startRadioMode(song); // Automatically triggers the Content-Based Filtering
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((o) => !o);
  };

  return (
    <>
      <div
        className="group"
        onClick={handlePlay}
        style={{
          background: '#1a1a1a',
          borderRadius: 12,
          padding: 16,
          cursor: 'pointer',
          transition: 'background 0.2s, transform 0.2s',
          position: 'relative',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = '#242424';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = '#1a1a1a';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        }}
      >
        {/* Thumbnail */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          {song.thumbnail ? (
            <img
              src={song.thumbnail}
              alt={song.title}
              style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8 }}
            />
          ) : (
            <div
              style={{
                width: '100%', aspectRatio: '1', borderRadius: 8,
                background: 'linear-gradient(135deg, #1DB954 0%, #0d7a34 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Play size={32} color="#fff" fill="#fff" />
            </div>
          )}

          {/* Hover overlay play button */}
          <div
            className="song-card-overlay"
            style={{
              position: 'absolute', inset: 0, borderRadius: 8,
              background: 'rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity 0.2s'
            }}
          >
            <div
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: '#1DB954',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(29,185,84,0.4)',
                transform: 'translateY(4px)',
                transition: 'transform 0.2s',
              }}
              className="group-hover:translate-y-0"
            >
              <Play size={20} color="#000" fill="#000" style={{ marginLeft: 2 }} />
            </div>
          </div>
        </div>

        {/* Info */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontSize: 14, fontWeight: 600, color: '#fff',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                marginBottom: 4,
              }}
            >
              {song.title}
            </p>
            <p style={{ fontSize: 12, color: '#b3b3b3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {song.artist}
            </p>
            <p style={{ fontSize: 11, color: '#5a5a5a', marginTop: 4 }}>
              {formatDuration(song.duration)}
            </p>
          </div>

          {/* 3-dot menu */}
          <div style={{ position: 'relative', flexShrink: 0 }} ref={menuRef}>
            <button
              className="icon-btn"
              onClick={handleMenuToggle}
              style={{ opacity: 1, color: '#b3b3b3', background: 'transparent', border: 'none', cursor: 'pointer' }}
              id={`song-menu-${song.id}`}
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div
                style={{
                  position: 'absolute', right: 0, top: '100%',
                  background: '#282828', borderRadius: 8,
                  border: '1px solid #3a3a3a',
                  minWidth: 180, zIndex: 20,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                  overflow: 'hidden',
                }}
                className="fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                {[
                  {
                    icon: Play, label: 'Play now', action: () => { playSong(song, allSongs); startRadioMode(song); setMenuOpen(false); }
                  },
                  {
                    icon: Radio, label: 'Go to Radio (AI)', action: () => { startRadioMode(song); setMenuOpen(false); }
                  },
                  {
                    icon: ListPlus, label: 'Add to queue', action: () => { addToQueue(song); setMenuOpen(false); }
                  },
                  {
                    icon: PlusCircle, label: 'Add to playlist', action: () => { setPlaylistModalOpen(true); setMenuOpen(false); }
                  },
                  {
                    icon: Heart, label: liked ? 'Remove like' : 'Like', action: () => { toggleLike(song); setMenuOpen(false); },
                    color: liked ? '#1DB954' : undefined,
                  },
                ].map(({ icon: Icon, label, action, color }) => (
                  <button
                    key={label}
                    onClick={action}
                    style={{
                      width: '100%', padding: '11px 16px',
                      background: 'none', border: 'none',
                      color: color || '#fff', fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 10,
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#3a3a3a'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddToPlaylistModal
        open={playlistModalOpen}
        onClose={() => setPlaylistModalOpen(false)}
        song={song}
      />
    </>
  );
}