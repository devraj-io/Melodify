import { useState } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, ListMusic, Heart
} from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLikedSongs } from '@/hooks/useLikedSongs';
import { formatDuration } from '@/lib/utils';
import { QueueDrawer } from './QueueDrawer';

export function PlayerBar() {
  const {
    currentSong, isPlaying, volume, isMuted, shuffle, repeat,
    currentTime, duration,
    togglePlay, playNext, playPrevious, setVolume, toggleMute,
    toggleShuffle, toggleRepeat, seek,
  } = usePlayer();
  const { toggleLike, isLiked } = useLikedSongs();
  const [queueOpen, setQueueOpen] = useState(false);

  if (!currentSong) return null;

  const liked = isLiked(currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: '#0d0d0d',
          borderTop: '1px solid #1e1e1e',
        }}
      >
        {/* Seek bar */}
        <div
          style={{ position: 'relative', height: 3, background: '#2a2a2a', cursor: 'pointer', transition: 'height 0.15s' }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            seek(pct * duration);
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.height = '5px'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.height = '3px'; }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #1DB954, #1ed760)',
              borderRadius: 2,
              transition: 'width 0.1s linear',
            }}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            alignItems: 'center',
            padding: '10px 24px',
            gap: 16,
          }}
        >
          {/* Left: Song info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            {currentSong.thumbnail ? (
              <img
                src={currentSong.thumbnail}
                alt={currentSong.title}
                style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div
                style={{
                  width: 48, height: 48, borderRadius: 6, flexShrink: 0,
                  background: 'linear-gradient(135deg, #1DB954, #158a3e)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <ListMusic size={20} color="#fff" />
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: 13, fontWeight: 600, color: '#fff',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {currentSong.title}
              </p>
              <p style={{ fontSize: 11, color: '#b3b3b3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentSong.artist}
              </p>
            </div>
            <button
              className={`icon-btn ${liked ? 'active' : ''}`}
              onClick={() => toggleLike(currentSong)}
              title={liked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
              style={{ color: liked ? '#1DB954' : '#b3b3b3', flexShrink: 0 }}
            >
              <Heart size={17} fill={liked ? '#1DB954' : 'none'} />
            </button>
          </div>

          {/* Center: Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                className={`icon-btn ${shuffle ? 'active' : ''}`}
                onClick={toggleShuffle}
                title="Shuffle"
              >
                <Shuffle size={17} />
              </button>
              <button className="icon-btn" onClick={playPrevious} title="Previous">
                <SkipBack size={20} />
              </button>
              <button
                onClick={togglePlay}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: '#fff', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.1s, background 0.15s',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#e0e0e0'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
              >
                {isPlaying
                  ? <Pause size={18} color="#000" fill="#000" />
                  : <Play size={18} color="#000" fill="#000" style={{ marginLeft: 2 }} />
                }
              </button>
              <button className="icon-btn" onClick={playNext} title="Next">
                <SkipForward size={20} />
              </button>
              <button
                className={`icon-btn ${repeat !== 'off' ? 'active' : ''}`}
                onClick={toggleRepeat}
                title={`Repeat: ${repeat}`}
              >
                {repeat === 'one' ? <Repeat1 size={17} /> : <Repeat size={17} />}
              </button>
            </div>

            {/* Time display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#b3b3b3', minWidth: 36, textAlign: 'right' }}>
                {formatDuration(currentTime)}
              </span>
              <span style={{ fontSize: 11, color: '#5a5a5a' }}>/</span>
              <span style={{ fontSize: 11, color: '#b3b3b3', minWidth: 36 }}>
                {formatDuration(duration)}
              </span>
            </div>
          </div>

          {/* Right: Volume + Queue */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end',
            }}
          >
            <button
              className={`icon-btn ${queueOpen ? 'active' : ''}`}
              onClick={() => setQueueOpen((o) => !o)}
              title="Queue"
            >
              <ListMusic size={18} />
            </button>
            <button className="icon-btn" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{
                width: 90, accentColor: '#1DB954', cursor: 'pointer',
                height: 4, background: `linear-gradient(to right, #1DB954 ${(isMuted ? 0 : volume) * 100}%, #3a3a3a ${(isMuted ? 0 : volume) * 100}%)`,
                borderRadius: 2, appearance: 'auto',
              }}
            />
          </div>
        </div>
      </div>

      <QueueDrawer open={queueOpen} onClose={() => setQueueOpen(false)} />
    </>
  );
}
