import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowRight } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', company: '', designation: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-5">
      {/* Left brand pane */}
      <div className="relative hidden lg:flex lg:col-span-2 bg-navy-900 text-canvas overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute inset-0 noise opacity-50" />
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-brass-400/10 blur-3xl" />

        <div className="relative z-10 p-12 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-md bg-canvas flex items-center justify-center">
              <span className="font-display text-navy-900 text-2xl font-bold leading-none">A</span>
            </div>
            <div>
              <div className="font-display text-xl tracking-tightest">Ascentium</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-brass-300">Intelligence Desk</div>
            </div>
          </div>

          <div>
            <div className="eyebrow text-brass-300 mb-4">Join the desk</div>
            <h1 className="font-display text-4xl text-canvas leading-[1.05] tracking-tightest mb-5">
              One subscription. <span className="italic text-brass-400">Nine</span> service lines. Every update.
            </h1>
            <p className="text-navy-100/80 text-sm leading-relaxed">
              Filter by Corporate, Tax, HR, Fund, Fiduciary, Risk, Cross-Border, Private Client, or Advisory — receive curated intelligence the moment it lands.
            </p>
          </div>

          <div className="text-[11px] uppercase tracking-[0.18em] text-navy-200">
            38 sub-categories · 8 competitors · 5 regulators
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="lg:col-span-3 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-md bg-navy-900 flex items-center justify-center">
              <span className="font-display text-brass-400 text-xl font-semibold leading-none">A</span>
            </div>
            <div className="font-display text-lg text-ink-800">Ascentium Intelligence</div>
          </div>

          <div className="eyebrow mb-3">Create Account</div>
          <h2 className="font-display text-4xl text-ink-800 tracking-tightest mb-2">Get access.</h2>
          <p className="text-ink-400 text-sm mb-8">Takes 30 seconds. No credit card required.</p>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full name</label>
                <input required className="input" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Jane Doe" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" required className="input" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="jane@company.com" />
              </div>
              <div>
                <label className="label">Company</label>
                <input className="input" value={form.company} onChange={(e) => update('company', e.target.value)} placeholder="Optional" />
              </div>
              <div>
                <label className="label">Designation</label>
                <input className="input" value={form.designation} onChange={(e) => update('designation', e.target.value)} placeholder="Optional" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" required minLength={6} className="input" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="At least 6 characters" />
            </div>

            {error && (
              <div className="text-[13px] text-red-700 bg-red-50 ring-1 ring-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-between">
              <span>Create account</span>
              {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-ink-100 text-sm text-ink-500 text-center">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-navy-900 hover:text-brass-600">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
