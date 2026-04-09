import { useNavigate } from 'react-router-dom';
import { Search, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

interface TopBarProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  showSearch?: boolean;
}

export function TopBar({ searchQuery, onSearchChange, showSearch = true }: TopBarProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header
      style={{
        height: 64,
        background: 'rgba(18,18,18,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #1e1e1e',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      {/* Search bar */}
      {showSearch && (
        <div
          style={{
            flex: 1,
            maxWidth: 480,
            margin: '0 auto',
            position: 'relative',
          }}
        >
          <Search
            size={17}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6a6a6a',
            }}
          />
          <input
            type="text"
            placeholder="Search songs, artists..."
            value={searchQuery ?? ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onClick={() => { if (!location.pathname.startsWith('/search')) navigate('/search'); }}
            style={{
              width: '100%',
              background: '#2a2a2a',
              border: '1px solid #3a3a3a',
              borderRadius: 50,
              padding: '9px 16px 9px 42px',
              color: '#fff',
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#1DB954')}
            onBlur={(e) => (e.target.style.borderColor = '#3a3a3a')}
          />
        </div>
      )}

      <div style={{ marginLeft: 'auto', position: 'relative' }} ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: 50,
            padding: '5px 12px 5px 5px',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#2a2a2a')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#1a1a1a')}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1DB954 0%, #0d7a34 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: '#fff',
              overflow: 'hidden',
            }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              getInitials(profile?.username)
            )}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
            {profile?.username || 'User'}
          </span>
          <ChevronDown size={14} color="#b3b3b3" />
        </button>

        {dropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              background: '#282828',
              borderRadius: 8,
              border: '1px solid #3a3a3a',
              minWidth: 180,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              zIndex: 100,
              overflow: 'hidden',
            }}
            className="fade-in"
          >
            <button
              onClick={() => { setDropdownOpen(false); navigate('/library'); }}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                textAlign: 'left',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#3a3a3a')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'none')}
            >
              <User size={15} />
              Profile & Library
            </button>
            <div style={{ height: 1, background: '#3a3a3a' }} />
            <button
              onClick={handleSignOut}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                color: '#e63946',
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                textAlign: 'left',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#3a3a3a')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'none')}
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
