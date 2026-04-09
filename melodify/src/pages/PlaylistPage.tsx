import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { usePlaylistSongs, usePlaylists } from '@/hooks/usePlaylists';
import { usePlayer } from '@/contexts/PlayerContext';
import { TopBar } from '@/components/layout/TopBar';
import { SongRow } from '@/components/songs/SongRow';
import type { Song, Playlist } from '@/types';
import { Play, Shuffle, ArrowLeft, Music2, Trash2 } from 'lucide-react';

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

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playSong, toggleShuffle } = usePlayer();
  const { removeSongFromPlaylist } = usePlaylists();
  const { data: songs = [], isLoading } = usePlaylistSongs(id);

  const { data: playlist } = useQuery<Playlist>({
    queryKey: ['playlist', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as Playlist;
    },
  });

  const songObjects: Song[] = songs.map((ps) => ({
    id: ps.song_id,
    title: ps.song_title,
    artist: ps.song_artist,
    thumbnail: ps.song_thumbnail,
    url: ps.song_url,
    duration: ps.song_duration,
  }));

  const playAll = () => {
    if (songObjects.length > 0) playSong(songObjects[0], songObjects.slice(1));
  };

  const playShuffled = () => {
    if (songObjects.length === 0) return;
    const shuffled = [...songObjects].sort(() => Math.random() - 0.5);
    playSong(shuffled[0], shuffled.slice(1));
  };

  const totalDuration = songs.reduce((acc, s) => acc + (s.song_duration || 0), 0);
  const formatTotalDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h} hr ${m} min`;
    return `${m} min`;
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 88 }}>
      <TopBar showSearch />

      <div style={{ padding: '28px' }}>
        {/* Back button */}
        <button
          className="icon-btn"
          onClick={() => navigate(-1)}
          style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6, color: '#b3b3b3', padding: '6px 12px', borderRadius: 8 }}
        >
          <ArrowLeft size={18} />
          <span style={{ fontSize: 14 }}>Back</span>
        </button>

        {/* Playlist Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0d3a2e 0%, #121212 100%)',
            borderRadius: 16, padding: '32px', marginBottom: 28,
            display: 'flex', alignItems: 'flex-end', gap: 28,
          }}
        >
          <div
            style={{
              width: 180, height: 180, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg, #1DB954 0%, #0a5c2a 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 16px 48px rgba(29,185,84,0.3)',
            }}
          >
            <Music2 size={72} color="#fff" opacity={0.8} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Playlist
            </p>
            <h1
              style={{
                fontSize: 42, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px',
                marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              {playlist?.name || 'Loading...'}
            </h1>
            <p style={{ fontSize: 14, color: '#b3b3b3', marginTop: 12 }}>
              {songs.length} song{songs.length !== 1 ? 's' : ''}
              {songs.length > 0 && ` · ${formatTotalDuration(totalDuration)}`}
            </p>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button
                onClick={playAll}
                disabled={songs.length === 0}
                style={{
                  width: 54, height: 54, borderRadius: '50%',
                  background: '#1DB954', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(29,185,84,0.4)',
                  transition: 'transform 0.15s, background 0.15s',
                  opacity: songs.length === 0 ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (songs.length > 0) {
                    (e.currentTarget as HTMLElement).style.background = '#1ed760';
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#1DB954';
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                }}
              >
                <Play size={24} color="#000" fill="#000" style={{ marginLeft: 2 }} />
              </button>
              <button
                onClick={playShuffled}
                disabled={songs.length === 0}
                className="icon-btn"
                style={{
                  width: 54, height: 54, borderRadius: '50%',
                  border: '1px solid #3a3a3a',
                  opacity: songs.length === 0 ? 0.5 : 1,
                }}
              >
                <Shuffle size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Column headers */}
        {songs.length > 0 && (
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

        {/* Songs */}
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          : songs.length === 0
            ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <Music2 size={48} color="#2a2a2a" style={{ marginBottom: 12 }} />
                <p style={{ color: '#5a5a5a', fontSize: 16 }}>This playlist is empty</p>
                <p style={{ color: '#3a3a3a', fontSize: 13, marginTop: 6 }}>
                  Use the 3-dot menu on a song to add it here
                </p>
              </div>
            )
            : songs.map((ps, i) => {
              const song: Song = {
                id: ps.song_id, title: ps.song_title, artist: ps.song_artist,
                thumbnail: ps.song_thumbnail, url: ps.song_url, duration: ps.song_duration,
              };
              return (
                <SongRow
                  key={ps.id}
                  song={song}
                  index={i + 1}
                  allSongs={songObjects}
                  onRemove={() => removeSongFromPlaylist.mutate(ps.id)}
                />
              );
            })
        }
      </div>
    </div>
  );
}
