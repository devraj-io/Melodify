import { useQuery } from '@tanstack/react-query';
import { FLASK_API } from '@/lib/constants';
import type { Song } from '@/types';
import { SongCard } from '@/components/songs/SongCard';
import { TopBar } from '@/components/layout/TopBar';
import { Sparkles, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function SongCardSkeleton() {
  return (
    <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 16 }}>
      <div className="skeleton" style={{ width: '100%', aspectRatio: '1', borderRadius: 8, marginBottom: 14 }} />
      <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 12, width: '60%' }} />
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  const { data: songs = [], isLoading, isError } = useQuery<Song[]>({
    queryKey: ['featured'],
    queryFn: async () => {
      const res = await fetch(`${FLASK_API}/featured`);
      if (!res.ok) throw new Error('Failed to fetch featured songs');
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 min
    retry: 2,
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 88 }}>
      <TopBar
        showSearch
        onSearchChange={(q) => { if (q) navigate(`/search?q=${encodeURIComponent(q)}`); }}
      />

      <div style={{ padding: '32px 28px' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Sparkles size={22} color="#1DB954" />
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
              Featured for You
            </h1>
          </div>
          <p style={{ fontSize: 14, color: '#b3b3b3' }}>
            Hand-picked songs to start your session
          </p>
        </div>

        {/* Error state */}
{isError && (
  <div
    style={{
      background: '#1a1a1a', borderRadius: 12, padding: 40,
      textAlign: 'center', border: '1px solid #2a2a2a',
    }}
  >
    <Music size={48} color="#3a3a3a" style={{ marginBottom: 12 }} />
    <p style={{ color: '#b3b3b3', fontSize: 16, fontWeight: 600 }}>
      Backend is waking up...
    </p>
    <p style={{ color: '#5a5a5a', fontSize: 13, marginTop: 6 }}>
      Please wait 30-60 seconds for the free server to start.
    </p>
  </div>
)}

        {/* Songs grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 16,
          }}
        >
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => <SongCardSkeleton key={i} />)
            : songs.map((song) => (
              <SongCard key={song.id} song={song} allSongs={songs} />
            ))}
        </div>

        {!isLoading && !isError && songs.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Music size={48} color="#3a3a3a" style={{ marginBottom: 12 }} />
            <p style={{ color: '#5a5a5a', fontSize: 16 }}>No songs found from Flask API</p>
          </div>
        )}
      </div>
    </div>
  );
}
