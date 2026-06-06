import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { Save, Lock, Check, Loader2 } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    company: user?.company || '',
    designation: user?.designation || '',
    interests: user?.interests || []
  });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savedProfile, setSavedProfile] = useState(false);
  const [savedPwd, setSavedPwd] = useState(false);
  const [err, setErr] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPwd, setLoadingPwd] = useState(false);

  const update = (k, v) => setForm({ ...form, [k]: v });

  const saveProfile = async (e) => {
    e.preventDefault();
    setErr('');
    setLoadingProfile(true);
    try {
      await updateProfile(form);
      setSavedProfile(true);
      setTimeout(() => setSavedProfile(false), 2000);
    } catch (e) {
      setErr(e.message || 'Save failed');
    } finally {
      setLoadingProfile(false);
    }
  };

  const changePwd = async (e) => {
    e.preventDefault();
    setErr('');
    if (pwd.newPassword !== pwd.confirm) {
      setErr('Passwords do not match');
      return;
    }
    setLoadingPwd(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword
      });
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
      setSavedPwd(true);
      setTimeout(() => setSavedPwd(false), 2000);
    } catch (e) {
      setErr(e.message || 'Password change failed');
    } finally {
      setLoadingPwd(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="eyebrow mb-2">Account Settings</div>
        <h1 className="section-title mb-1">Profile.</h1>
        <p className="text-ink-400 text-sm mb-10">Update your personal information and password.</p>

        {err && (
          <div className="mb-6 text-[13px] text-red-700 bg-red-50 ring-1 ring-red-200 rounded-md px-3 py-2">
            {err}
          </div>
        )}

        {/* Profile form */}
        <form onSubmit={saveProfile} className="card p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-full bg-navy-900 text-canvas font-display text-lg flex items-center justify-center">
              {(user?.name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-ink-700">{user?.email}</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-brass-600">
                {user?.role === 'super_admin' ? 'Super Admin' : 'Member'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full name</label>
              <input className="input" value={form.name} onChange={(e) => update('name', e.target.value)} required />
            </div>
            <div>
              <label className="label">Company</label>
              <input className="input" value={form.company} onChange={(e) => update('company', e.target.value)} />
            </div>
            <div>
              <label className="label">Designation</label>
              <input className="input" value={form.designation} onChange={(e) => update('designation', e.target.value)} />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button className="btn-primary" disabled={loadingProfile}>
              {loadingProfile ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save profile
            </button>
            {savedProfile && (
              <span className="text-emerald-600 text-sm flex items-center gap-1">
                <Check size={14} /> Saved
              </span>
            )}
          </div>
        </form>

        {/* Password form */}
        <form onSubmit={changePwd} className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Lock size={16} className="text-brass-500" />
            <h3 className="font-display text-xl text-ink-800">Password</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Current password</label>
              <input type="password" className="input" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} required />
            </div>
            <div>
              <label className="label">New password</label>
              <input type="password" minLength={6} className="input" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} required />
            </div>
            <div>
              <label className="label">Confirm</label>
              <input type="password" minLength={6} className="input" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} required />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button className="btn-primary" disabled={loadingPwd}>
              {loadingPwd ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
              Update password
            </button>
            {savedPwd && (
              <span className="text-emerald-600 text-sm flex items-center gap-1">
                <Check size={14} /> Updated
              </span>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
