import { useState } from 'react';
import { Play, MoreVertical, Heart, ListPlus, PlusCircle, Music, Trash2 } from 'lucide-react';
import type { Song } from '@/types';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLikedSongs } from '@/hooks/useLikedSongs';
import { formatDuration } from '@/lib/utils';
import { AddToPlaylistModal } from '@/components/playlists/AddToPlaylistModal';

interface SongRowProps {
  song: Song;
  index?: number;
  allSongs?: Song[];
  onRemove?: () => void;
}

export function SongRow({ song, index, allSongs = [], onRemove }: SongRowProps) {
  const { playSong, addToQueue } = usePlayer();
  const { toggleLike, isLiked } = useLikedSongs();
  const [menuOpen, setMenuOpen] = useState(false);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const liked = isLiked(song.id);

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
        style={{
          display: 'grid',
          gridTemplateColumns: '36px 1fr auto auto',
          alignItems: 'center',
          gap: 12,
          padding: '8px 16px',
          borderRadius: 8,
          background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
          transition: 'background 0.15s',
          cursor: 'pointer',
        }}
      >
        {/* Index / Play icon */}
        <div
          style={{ width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => playSong(song, allSongs)}
        >
          {hovered ? (
            <Play size={16} color="#fff" fill="#fff" />
          ) : (
            <span style={{ fontSize: 13, color: '#b3b3b3' }}>{index ?? ''}</span>
          )}
        </div>

        {/* Thumbnail + info */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}
          onClick={() => playSong(song, allSongs)}
        >
          {song.thumbnail ? (
            <img
              src={song.thumbnail}
              alt={song.title}
              style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: 40, height: 40, borderRadius: 6,
                background: '#2a2a2a', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Music size={16} color="#b3b3b3" />
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: 14, fontWeight: 500, color: '#fff',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              {song.title}
            </p>
            <p style={{ fontSize: 12, color: '#b3b3b3' }}>{song.artist}</p>
          </div>
        </div>

        {/* Duration */}
        <span style={{ fontSize: 13, color: '#b3b3b3', minWidth: 40, textAlign: 'right' }}>
          {formatDuration(song.duration)}
        </span>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 80, justifyContent: 'flex-end' }}>
          {hovered && (
            <>
              <button
                className={`icon-btn ${liked ? 'active' : ''}`}
                onClick={() => toggleLike(song)}
                title={liked ? 'Remove from liked' : 'Like'}
                style={{ color: liked ? '#1DB954' : '#b3b3b3' }}
              >
                <Heart size={16} fill={liked ? '#1DB954' : 'none'} />
              </button>
              <button
                className="icon-btn"
                onClick={() => addToQueue(song)}
                title="Add to queue"
              >
                <ListPlus size={16} />
              </button>
              {onRemove && (
                <button
                  className="icon-btn"
                  onClick={onRemove}
                  title="Remove"
                  style={{ color: '#e63946' }}
                >
                  <Trash2 size={15} />
                </button>
              )}
              <div style={{ position: 'relative' }}>
                <button
                  className="icon-btn"
                  onClick={() => setMenuOpen((o) => !o)}
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
                  >
                    <button
                      onClick={() => { setPlaylistModalOpen(true); setMenuOpen(false); }}
                      style={{
                        width: '100%', padding: '11px 16px',
                        background: 'none', border: 'none', color: '#fff',
                        fontSize: 13, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#3a3a3a'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                    >
                      <PlusCircle size={15} /> Add to playlist
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
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
