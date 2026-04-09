import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PlayerBar } from '@/components/player/PlayerBar';
import { usePlayer } from '@/contexts/PlayerContext';

export function AppLayout() {
  const { currentSong } = usePlayer();

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: '#121212',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}
        >
          <Outlet />
        </main>
      </div>
      {currentSong && <PlayerBar />}
    </div>
  );
}
