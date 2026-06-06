import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-5">
      {/* Left brand pane */}
      <div className="relative hidden lg:flex lg:col-span-3 bg-navy-900 text-canvas overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute inset-0 noise opacity-50" />
        <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full bg-brass-400/10 blur-3xl" />
        <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-navy-700 blur-3xl" />

        <div className="relative z-10 p-14 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-md bg-canvas flex items-center justify-center">
              <span className="font-display text-navy-900 text-2xl font-bold leading-none">A</span>
            </div>
            <div>
              <div className="font-display text-2xl tracking-tightest">Ascentium</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-brass-300">Intelligence Desk</div>
            </div>
          </div>

          <div className="max-w-md">
            <div className="eyebrow text-brass-300 mb-4">Singapore Market · Daily Brief</div>
            <h1 className="font-display text-5xl text-canvas leading-[1.05] tracking-tightest mb-6">
              Every signal that <span className="italic text-brass-400">moves</span> corporate services — in one place.
            </h1>
            <p className="text-navy-100/80 text-[15px] leading-relaxed">
              News, regulator updates, competitor moves, and evergreen guidance — automatically aggregated, deduplicated, and curated for Ascentium's service lines.
            </p>
          </div>

          <div className="flex items-center gap-6 text-[11px] uppercase tracking-[0.18em] text-navy-200">
            <span>ACRA · IRAS · MOM · MAS</span>
            <span className="w-px h-3 bg-navy-200/40" />
            <span>BT · CNA · ST · ASEAN Briefing</span>
          </div>
        </div>
      </div>

      {/* Right form pane */}
      <div className="lg:col-span-2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-md bg-navy-900 flex items-center justify-center">
              <span className="font-display text-brass-400 text-xl font-semibold leading-none">A</span>
            </div>
            <div className="font-display text-lg text-ink-800">Ascentium Intelligence</div>
          </div>

          <div className="eyebrow mb-3">Member Sign-in</div>
          <h2 className="font-display text-4xl text-ink-800 tracking-tightest mb-2">Welcome back.</h2>
          <p className="text-ink-400 text-sm mb-8">Use your email and password to continue.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                autoFocus
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-[13px] text-red-700 bg-red-50 ring-1 ring-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-between">
              <span>Sign in</span>
              {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-ink-100 text-sm text-ink-500 text-center">
            New here?{' '}
            <Link to="/register" className="font-medium text-navy-900 hover:text-brass-600">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
