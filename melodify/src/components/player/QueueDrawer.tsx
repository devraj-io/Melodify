import { X, ListMusic, Music, Loader2, Sparkles } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { formatDuration } from '@/lib/utils';

interface QueueDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function QueueDrawer({ open, onClose }: QueueDrawerProps) {
  // added 'isPlaying' to show better state
  const { queue, currentSong, removeFromQueue, clearQueue, playSong, isPlaying } = usePlayer();

  if (!open) return null;

  return (
    <>
      {/* Backdrop with blur for professional look */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 49,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50,
          width: 380, background: '#121212', // Slightly darker for contrast
          borderLeft: '1px solid #282828',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.8)',
        }}
        className="animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '24px 20px',
            borderBottom: '1px solid #282828',
          }}
        >
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Queue</h3>
            <p style={{ fontSize: 13, color: '#b3b3b3', marginTop: 4 }}>
              {queue.length} song{queue.length !== 1 ? 's' : ''} up next
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {queue.length > 0 && (
              <button
                onClick={clearQueue}
                style={{ 
                  background: 'none', border: 'none', 
                  color: '#b3b3b3', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#b3b3b3'}
              >
                Clear all
              </button>
            )}
            <button 
              onClick={onClose}
              style={{ background: '#282828', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Now Playing Section */}
        {currentSong && (
          <div style={{ padding: '20px', background: 'rgba(29, 185, 84, 0.05)' }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#1DB954', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Now Playing
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  style={{ width: 56, height: 56, borderRadius: 4, objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                />
                {isPlaying && (
                  <div style={{ position: 'absolute', bottom: -2, right: -2, background: '#1DB954', borderRadius: '50%', padding: 4 }}>
                    <div className="flex gap-0.5 items-end h-2 w-2">
                       <div className="bg-black w-0.5 animate-bounce h-full"></div>
                       <div className="bg-black w-0.5 animate-bounce h-2/3"></div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentSong.title}
                </p>
                <p style={{ fontSize: 13, color: '#b3b3b3', marginTop: 2 }}>{currentSong.artist}</p>
              </div>
            </div>
          </div>
        )}

        {/* Up Next / Recommendations Section */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 100px' }}>
          {queue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', marginBottom: 20 }}>
                <ListMusic size={64} color="#282828" />
                <Sparkles size={24} color="#1DB954" style={{ position: 'absolute', top: 0, right: -10 }} />
              </div>
              <h4 style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>Discovery Mode Active</h4>
              <p style={{ color: '#b3b3b3', fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
                AI is searching for similar melodic vibes to keep the music playing...
              </p>
              <Loader2 className="animate-spin" size={20} color="#1DB954" style={{ marginTop: 20 }} />
            </div>
          ) : (
            <>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#b3b3b3', padding: '10px 10px', textTransform: 'uppercase' }}>
                Up Next
              </p>
              {queue.map((song, i) => (
                <div
                  key={`${song.id}-${i}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '8px', borderRadius: 6,
                    cursor: 'pointer', transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  className="hover:bg-[#282828] group"
                >
                  <span style={{ fontSize: 12, color: '#5a5a5a', width: 24, textAlign: 'center' }}>
                    {i + 1}
                  </span>
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }}
                  />
                  <div
                    style={{ flex: 1, minWidth: 0 }}
                    onClick={() => playSong(song, queue)}
                  >
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {song.title}
                    </p>
                    <p style={{ fontSize: 11, color: '#b3b3b3' }}>{song.artist}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#5a5a5a' }} className="group-hover:hidden">
                      {formatDuration(song.duration)}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFromQueue(i); }}
                      style={{ 
                        background: 'none', border: 'none', color: '#b3b3b3', 
                        cursor: 'pointer', display: 'none' 
                      }}
                      className="group-hover:block"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}