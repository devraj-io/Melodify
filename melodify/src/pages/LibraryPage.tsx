import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Music2, Plus, Trash2, Play } from 'lucide-react';
import { useLikedSongs } from '@/hooks/useLikedSongs';
import { usePlaylists } from '@/hooks/usePlaylists';
import { usePlayer } from '@/contexts/PlayerContext';
import { TopBar } from '@/components/layout/TopBar';
import { SongRow } from '@/components/songs/SongRow';
import { CreatePlaylistModal } from '@/components/playlists/CreatePlaylistModal';
import type { Song } from '@/types';
import { formatDuration } from '@/lib/utils';

type LibraryTab = 'liked' | 'playlists';

function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px' }}>
      <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 4, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 13, width: '50%', marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 11, width: '30%' }} />
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const [tab, setTab] = useState<LibraryTab>('liked');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { likedSongs, isLoading: likedLoading, toggleLike } = useLikedSongs();
  const { playlists, isLoading: playlistsLoading, deletePlaylist } = usePlaylists();
  const { playSong } = usePlayer();

  const likedSongObjects: Song[] = likedSongs.map((ls) => ({
    id: ls.song_id,
    title: ls.song_title,
    artist: ls.song_artist,
    thumbnail: ls.song_thumbnail,
    url: ls.song_url,
    duration: ls.song_duration,
  }));

  const playAllLiked = () => {
    if (likedSongObjects.length > 0) {
      playSong(likedSongObjects[0], likedSongObjects.slice(1));
    }
  };

  return (
    <>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 88 }}>
        <TopBar showSearch />

        <div style={{ padding: '32px 28px' }}>
          {/* Header */}
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 24 }}>
            Your Library
          </h1>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            {[
              { key: 'liked', label: 'Liked Songs', icon: Heart },
              { key: 'playlists', label: 'Playlists', icon: Music2 },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key as LibraryTab)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 20px', borderRadius: 50,
                  background: tab === key ? '#1DB954' : '#1a1a1a',
                  border: '1px solid',
                  borderColor: tab === key ? '#1DB954' : '#2a2a2a',
                  color: tab === key ? '#000' : '#b3b3b3',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* Liked Songs Tab */}
          {tab === 'liked' && (
            <div>
              {/* Liked Songs Header */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #1a0030 0%, #1a1a2e 50%, #121212 100%)',
                  borderRadius: 16, padding: '28px', marginBottom: 24,
                  display: 'flex', alignItems: 'center', gap: 24,
                }}
              >
                <div
                  style={{
                    width: 100, height: 100, borderRadius: 12, flexShrink: 0,
                    background: 'linear-gradient(135deg, #4b0082, #1DB954)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(75,0,130,0.4)',
                  }}
                >
                  <Heart size={44} color="#fff" fill="#fff" />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Playlist</p>
                  <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginTop: 4 }}>Liked Songs</h2>
                  <p style={{ fontSize: 14, color: '#b3b3b3', marginTop: 8 }}>
                    {likedSongs.length} song{likedSongs.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {likedSongs.length > 0 && (
                  <button
                    onClick={playAllLiked}
                    style={{
                      marginLeft: 'auto', width: 54, height: 54, borderRadius: '50%',
                      background: '#1DB954', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 8px 24px rgba(29,185,84,0.4)',
                      transition: 'transform 0.15s, background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = '#1ed760';
                      (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = '#1DB954';
                      (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                    }}
                  >
                    <Play size={24} color="#000" fill="#000" style={{ marginLeft: 3 }} />
                  </button>
                )}
              </div>

              {/* Column headers */}
              {likedSongs.length > 0 && (
                <div
                  style={{
                    display: 'grid', gridTemplateColumns: '36px 1fr auto auto',
                    gap: 12, padding: '0 16px 8px',
                    borderBottom: '1px solid #2a2a2a', marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 11, color: '#5a5a5a', fontWeight: 700 }}>#</span>
                  <span style={{ fontSize: 11, color: '#5a5a5a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Title</span>
                  <span style={{ fontSize: 11, color: '#5a5a5a', fontWeight: 700 }}>Duration</span>
                  <span />
                </div>
              )}

              {likedLoading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                : likedSongs.length === 0
                  ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                      <Heart size={48} color="#2a2a2a" style={{ marginBottom: 12 }} />
                      <p style={{ color: '#5a5a5a', fontSize: 16 }}>No liked songs yet</p>
                      <p style={{ color: '#3a3a3a', fontSize: 13, marginTop: 6 }}>Heart songs to save them here</p>
                    </div>
                  )
                  : likedSongs.map((ls, i) => {
                    const song: Song = {
                      id: ls.song_id, title: ls.song_title, artist: ls.song_artist,
                      thumbnail: ls.song_thumbnail, url: ls.song_url, duration: ls.song_duration,
                    };
                    return (
                      <SongRow
                        key={ls.id}
                        song={song}
                        index={i + 1}
                        allSongs={likedSongObjects}
                        onRemove={() => toggleLike(song)}
                      />
                    );
                  })
              }
            </div>
          )}

          {/* Playlists Tab */}
          {tab === 'playlists' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <p style={{ color: '#b3b3b3', fontSize: 14 }}>
                  {playlists.length} playlist{playlists.length !== 1 ? 's' : ''}
                </p>
                <button
                  className="btn-accent"
                  onClick={() => setShowCreateModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px' }}
                >
                  <Plus size={16} /> New Playlist
                </button>
              </div>

              {playlistsLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={{ background: '#1a1a1a', borderRadius: 12, padding: 16 }}>
                      <div className="skeleton" style={{ width: '100%', aspectRatio: '1', borderRadius: 8, marginBottom: 14 }} />
                      <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 8 }} />
                    </div>
                  ))}
                </div>
              ) : playlists.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60 }}>
                  <Music2 size={48} color="#2a2a2a" style={{ marginBottom: 12 }} />
                  <p style={{ color: '#5a5a5a', fontSize: 16 }}>No playlists yet</p>
                  <p style={{ color: '#3a3a3a', fontSize: 13, marginTop: 6 }}>Create your first playlist above</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                  {playlists.map((pl) => (
                    <Link
                      key={pl.id}
                      to={`/playlist/${pl.id}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div
                        style={{
                          background: '#1a1a1a', borderRadius: 12, padding: 16, cursor: 'pointer',
                          transition: 'background 0.2s, transform 0.2s', position: 'relative',
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
                        <div
                          style={{
                            width: '100%', aspectRatio: '1', borderRadius: 8, marginBottom: 14,
                            background: 'linear-gradient(135deg, #1DB954 0%, #0d7a34 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Music2 size={36} color="#fff" opacity={0.8} />
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {pl.name}
                        </p>
                        <p style={{ fontSize: 12, color: '#b3b3b3', marginTop: 4 }}>Playlist</p>

                        {/* Delete button */}
                        <button
                          className="icon-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (confirm(`Delete "${pl.name}"?`)) deletePlaylist.mutate(pl.id);
                          }}
                          style={{ position: 'absolute', top: 8, right: 8, color: '#e63946', opacity: 0, transition: 'opacity 0.15s' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CreatePlaylistModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}
