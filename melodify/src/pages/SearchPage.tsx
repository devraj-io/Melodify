import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FLASK_API } from '@/lib/constants';
import type { Song } from '@/types';
import { SongCard } from '@/components/songs/SongCard';
import { TopBar } from '@/components/layout/TopBar';
import { Search, Loader2 } from 'lucide-react';

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get('q') || '');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSet = useCallback(
    debounce((val: string) => {
      setDebouncedQuery(val);
      if (val) setSearchParams({ q: val });
      else setSearchParams({});
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSet(inputValue);
  }, [inputValue, debouncedSet]);

  const { data: results = [], isLoading, isFetching } = useQuery<Song[]>({
    queryKey: ['search', debouncedQuery],
    enabled: debouncedQuery.trim().length > 0,
    queryFn: async () => {
      const res = await fetch(`${FLASK_API}/search?query=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    staleTime: 1000 * 60,
  });

  const SongCardSkeleton = () => (
    <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 16 }}>
      <div className="skeleton" style={{ width: '100%', aspectRatio: '1', borderRadius: 8, marginBottom: 14 }} />
      <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 12, width: '60%' }} />
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 88 }}>
      <TopBar
        showSearch
        searchQuery={inputValue}
        onSearchChange={setInputValue}
      />

      <div style={{ padding: '32px 28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>
            {debouncedQuery ? `Results for "${debouncedQuery}"` : 'Search'}
          </h1>
          {isFetching && <Loader2 size={20} color="#1DB954" style={{ animation: 'spin 1s linear infinite' }} />}
        </div>

        {/* Empty state */}
        {!debouncedQuery && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Search size={64} color="#2a2a2a" style={{ marginBottom: 16 }} />
            <p style={{ color: '#5a5a5a', fontSize: 18, fontWeight: 600 }}>Find your next favorite song</p>
            <p style={{ color: '#3a3a3a', fontSize: 14, marginTop: 8 }}>Search by title, artist, or mood</p>
          </div>
        )}

        {/* Results */}
        {debouncedQuery && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 16,
            }}
          >
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SongCardSkeleton key={i} />)
              : results.map((song) => (
                  <SongCard key={song.id} song={song} allSongs={results} />
                ))}
          </div>
        )}

        {debouncedQuery && !isLoading && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Search size={48} color="#3a3a3a" style={{ marginBottom: 12 }} />
            <p style={{ color: '#b3b3b3', fontSize: 16 }}>No results for "{debouncedQuery}"</p>
            <p style={{ color: '#5a5a5a', fontSize: 13, marginTop: 6 }}>Try different keywords</p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
