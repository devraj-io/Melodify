import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type Tab = 'login' | 'signup';

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welcome back!');
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) { toast.error('Username is required'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Check your email to confirm.');
      setTab('login');
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#1a1a1a', border: '1px solid #3a3a3a',
    borderRadius: 10, padding: '13px 16px', color: '#fff', fontSize: 14,
    outline: 'none', transition: 'border-color 0.2s',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(29,185,84,0.15) 0%, #121212 60%)',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1DB954, #158a3e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 32px rgba(29,185,84,0.35)',
            }}
          >
            <Music2 size={28} color="#fff" />
          </div>
          <h1
            style={{
              fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #1DB954, #1ed760)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}
          >
            Melodify
          </h1>
          <p style={{ color: '#b3b3b3', fontSize: 14, marginTop: 4 }}>
            Music that moves you
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#1a1a1a', borderRadius: 20,
            border: '1px solid #2a2a2a',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #2a2a2a' }}>
            {(['login', 'signup'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '16px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 700,
                  color: tab === t ? '#1DB954' : '#b3b3b3',
                  borderBottom: tab === t ? '2px solid #1DB954' : '2px solid transparent',
                  marginBottom: -1, transition: 'all 0.2s',
                  textTransform: 'capitalize',
                }}
              >
                {t === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={tab === 'login' ? handleLogin : handleSignup}
            style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {tab === 'signup' && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#b3b3b3', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                  USERNAME
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="cooluser123"
                  required
                  style={inputStyle}
                  onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#1DB954'; }}
                  onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#3a3a3a'; }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#b3b3b3', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={inputStyle}
                onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#1DB954'; }}
                onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#3a3a3a'; }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#b3b3b3', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ ...inputStyle, paddingRight: 48 }}
                  onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#1DB954'; }}
                  onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#3a3a3a'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#b3b3b3',
                  }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent"
              style={{
                marginTop: 8, width: '100%',
                opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#000', animation: 'spin 0.8s linear infinite' }} />
                  {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                tab === 'login' ? 'Log In' : 'Create Account'
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#5a5a5a', fontSize: 12, marginTop: 24 }}>
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setTab(tab === 'login' ? 'signup' : 'login')}
            style={{ background: 'none', border: 'none', color: '#1DB954', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
          >
            {tab === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
