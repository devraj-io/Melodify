import { useState } from 'react';
import { X, Plus, Music2 } from 'lucide-react';
import { usePlaylists } from '@/hooks/usePlaylists';
import type { Song } from '@/types';
import { toast } from 'sonner';

interface AddToPlaylistModalProps {
  open: boolean;
  onClose: () => void;
  song: Song;
}

export function AddToPlaylistModal({ open, onClose, song }: AddToPlaylistModalProps) {
  const { playlists, createPlaylist, addSongToPlaylist } = usePlaylists();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  if (!open) return null;

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createPlaylist.mutateAsync(newName.trim());
      setNewName('');
      setCreating(false);
    } catch {}
  };

  const handleAdd = async (playlistId: string) => {
    try {
      await addSongToPlaylist.mutateAsync({ playlistId, song });
      onClose();
    } catch {}
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#242424', borderRadius: 16,
          width: 400, maxHeight: '80vh',
          border: '1px solid #3a3a3a',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
        className="fade-in"
      >
        {/* Header */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: '1px solid #3a3a3a',
          }}
        >
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Add to Playlist</h3>
            <p style={{ fontSize: 12, color: '#b3b3b3', marginTop: 2 }}>
              {song.title} · {song.artist}
            </p>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Create new */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2a2a' }}>
          {creating ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
                placeholder="Playlist name..."
                style={{
                  flex: 1, background: '#1a1a1a', border: '1px solid #1DB954',
                  borderRadius: 8, padding: '9px 14px', color: '#fff', fontSize: 14, outline: 'none',
                }}
              />
              <button className="btn-accent" onClick={handleCreate} style={{ padding: '9px 18px', fontSize: 13 }}>
                Create
              </button>
              <button className="btn-ghost" onClick={() => setCreating(false)} style={{ padding: '9px 14px', fontSize: 13 }}>
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'none', border: '1px dashed #3a3a3a', borderRadius: 8,
                width: '100%', padding: '10px 14px', cursor: 'pointer',
                color: '#b3b3b3', fontSize: 14, transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#1DB954';
                (e.currentTarget as HTMLElement).style.color = '#1DB954';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#3a3a3a';
                (e.currentTarget as HTMLElement).style.color = '#b3b3b3';
              }}
            >
              <Plus size={16} /> Create new playlist
            </button>
          )}
        </div>

        {/* Playlist list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px 20px' }}>
          {playlists.length === 0 ? (
            <p style={{ color: '#5a5a5a', fontSize: 14, textAlign: 'center', marginTop: 20 }}>
              No playlists yet. Create one above!
            </p>
          ) : (
            playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => handleAdd(pl.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 8,
                  background: 'none', border: 'none', cursor: 'pointer',
                  transition: 'background 0.15s', marginBottom: 2,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#2a2a2a'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
              >
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 6,
                    background: 'linear-gradient(135deg, #1DB954 0%, #158a3e 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <Music2 size={18} color="#fff" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#fff', textAlign: 'left' }}>{pl.name}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
