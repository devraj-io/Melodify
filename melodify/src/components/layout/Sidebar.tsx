import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Library, Music2, LogOut, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlaylists } from '@/hooks/usePlaylists';
import { getInitials } from '@/lib/utils';
import { useState } from 'react';
import { CreatePlaylistModal } from '@/components/playlists/CreatePlaylistModal';

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const { playlists } = usePlaylists();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      <aside
        style={{
          width: 240,
          minWidth: 240,
          background: '#0a0a0a',
          borderRight: '1px solid #1e1e1e',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1DB954, #158a3e)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Music2 size={20} color="#fff" />
            </div>
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1DB954, #1ed760)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}
            >
              Melodify
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ padding: '8px 12px' }}>
          {[
            { to: '/', icon: Home, label: 'Home' },
            { to: '/search', icon: Search, label: 'Search' },
            { to: '/library', icon: Library, label: 'Your Library' },
          ].map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ height: 1, background: '#1e1e1e', margin: '8px 12px' }} />

        {/* Playlists section */}
        <div
          style={{
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: '#6a6a6a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Playlists
          </span>
          <button
            className="icon-btn"
            onClick={() => setShowCreateModal(true)}
            title="Create playlist"
            style={{ color: '#6a6a6a' }}
          >
            <Plus size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 8px' }}>
          {playlists.length === 0 ? (
            <p style={{ color: '#5a5a5a', fontSize: 13, padding: '8px 8px' }}>No playlists yet</p>
          ) : (
            playlists.map((pl) => (
              <NavLink
                key={pl.id}
                to={`/playlist/${pl.id}`}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                style={{ fontSize: 13 }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #1DB954 0%, #158a3e 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Music2 size={13} color="#fff" />
                </div>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {pl.name}
                </span>
              </NavLink>
            ))
          )}
        </div>

        <div style={{ height: 1, background: '#1e1e1e', margin: '0 12px' }} />

        {/* User section */}
        <div
          style={{
            padding: '16px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1DB954 0%, #0d7a34 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 13,
              fontWeight: 700,
              color: '#fff',
              overflow: 'hidden',
            }}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username || 'User'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              getInitials(profile?.username)
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#fff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {profile?.username || 'User'}
            </p>
            <p style={{ fontSize: 11, color: '#6a6a6a' }}>Free account</p>
          </div>

          <button
            className="icon-btn"
            onClick={handleSignOut}
            title="Sign out"
            style={{ flexShrink: 0 }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <CreatePlaylistModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}
