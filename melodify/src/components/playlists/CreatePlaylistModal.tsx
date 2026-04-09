import { useState } from 'react';
import { X } from 'lucide-react';
import { usePlaylists } from '@/hooks/usePlaylists';

interface CreatePlaylistModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreatePlaylistModal({ open, onClose }: CreatePlaylistModalProps) {
  const { createPlaylist } = usePlaylists();
  const [name, setName] = useState('');

  if (!open) return null;

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createPlaylist.mutateAsync(name.trim());
      setName('');
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
          background: '#242424', borderRadius: 16, width: 360,
          border: '1px solid #3a3a3a',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          padding: '28px',
        }}
        onClick={(e) => e.stopPropagation()}
        className="fade-in"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Create Playlist</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') onClose(); }}
          placeholder="My Playlist #1"
          style={{
            width: '100%', background: '#1a1a1a', border: '1px solid #3a3a3a',
            borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 15,
            outline: 'none', marginBottom: 20, transition: 'border-color 0.2s',
          }}
          onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#1DB954'; }}
          onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#3a3a3a'; }}
        />

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-accent"
            onClick={handleCreate}
            disabled={!name.trim() || createPlaylist.isPending}
            style={{ opacity: !name.trim() ? 0.5 : 1 }}
          >
            {createPlaylist.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
