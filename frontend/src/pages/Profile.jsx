import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Layout from '../components/Layout';
import { Save, Lock, Check, Loader2, Camera, Shield, Mail, Building2, Briefcase, User, Trash2 } from 'lucide-react';

const roleLabel = (role) => {
  if (role === 'super_admin') return 'Super Admin';
  if (role === 'admin') return 'Admin';
  return 'Member';
};

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

  const avatarKey = `profile_avatar_${user?._id || 'default'}`;

  const [avatar, setAvatar] = useState(() => {
    try {
      return localStorage.getItem(avatarKey) || '';
    } catch {
      return '';
    }
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setAvatar(base64);
      localStorage.setItem(avatarKey, base64);
      window.dispatchEvent(new CustomEvent('profile_avatar_updated', { detail: { avatar: base64, userId: user?._id } }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAvatar('');
    localStorage.removeItem(avatarKey);
    window.dispatchEvent(new CustomEvent('profile_avatar_updated', { detail: { avatar: '', userId: user?._id } }));
  };

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
    <Layout>
      <div className="space-y-5 pb-10">
        <div className="rounded-lg border border-gray-100 bg-white px-4 py-4 shadow-card sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="eyebrow mb-1">Account settings</div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900">Profile Settings</h1>
              <p className="mt-1 text-sm text-gray-500">Manage your identity, workspace details, and password security.</p>
            </div>
            <span className="w-fit rounded-md bg-brand-pink/60 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-brand-crimson ring-1 ring-brand-crimson/10">
              {roleLabel(user?.role)}
            </span>
          </div>
        </div>

        {err && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-700 ring-1 ring-red-200">
            {err}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_1fr]">
          <aside className="space-y-5">
            <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-card">
              <div className="h-20 bg-gradient-to-r from-brand-crimson to-brand-hoverred" />
              <div className="-mt-10 px-5 pb-5">
                <div className="relative mb-4 h-20 w-20">
                  {avatar ? (
                    <img src={avatar} className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md" alt="Profile" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-brand-crimson text-2xl font-black text-white shadow-md">
                      {(user?.name || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <label htmlFor="avatar-file" className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-brand-crimson shadow-md ring-1 ring-gray-100 transition-all hover:bg-brand-pink">
                    <Camera size={15} />
                  </label>
                  <input type="file" id="avatar-file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>

                <div className="mb-4">
                  <div className="text-xl font-black tracking-tight text-gray-900">{user?.name || 'User'}</div>
                  <div className="truncate text-sm font-medium text-gray-400">{user?.email}</div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <InfoTile icon={Shield} label="Role" value={roleLabel(user?.role)} />
                  <InfoTile icon={Building2} label="Company" value={form.company || 'Not set'} />
                  <InfoTile icon={Briefcase} label="Designation" value={form.designation || 'Not set'} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <label htmlFor="avatar-file" className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-brand-crimson px-3 py-2 text-xs font-black text-white transition-all hover:bg-brand-hoverred">
                    <Camera size={14} />
                    Upload photo
                  </label>
                  {avatar && (
                    <button type="button" onClick={handleRemoveImage} className="inline-flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-xs font-black text-red-600 ring-1 ring-red-100 transition-all hover:bg-red-100">
                      <Trash2 size={14} />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
              <div className="mb-3 flex items-center gap-2">
                <Lock size={16} className="text-brand-crimson" />
                <h3 className="text-base font-black tracking-tight text-gray-900">Security posture</h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-500">
                Keep your password current and avoid sharing admin credentials across users.
              </p>
              <div className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-100">
                Account active
              </div>
            </div>
          </aside>

          <div className="space-y-5">
            <form onSubmit={saveProfile} className="rounded-lg border border-gray-100 bg-white p-4 shadow-card sm:p-5">
              <div className="mb-5 flex items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <div className="eyebrow mb-1">Personal information</div>
                  <h3 className="text-xl font-black tracking-tight text-gray-900">Account details</h3>
                  <p className="mt-1 text-sm text-gray-500">These details appear in the admin console and user directory.</p>
                </div>
                <User size={18} className="text-gray-400" />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Full name</label>
                  <input className="input focus:ring-brand-crimson/30" value={form.name} onChange={(e) => update('name', e.target.value)} required />
                </div>
                <div>
                  <label className="label">Email address</label>
                  <div className="flex items-center gap-2 rounded-md bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-500 ring-1 ring-gray-100">
                    <Mail size={14} className="text-gray-400" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                </div>
                <div>
                  <label className="label">Company</label>
                  <input className="input focus:ring-brand-crimson/30" value={form.company} onChange={(e) => update('company', e.target.value)} />
                </div>
                <div>
                  <label className="label">Designation</label>
                  <input className="input focus:ring-brand-crimson/30" value={form.designation} onChange={(e) => update('designation', e.target.value)} />
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-crimson px-4 py-2.5 text-sm font-black text-white transition-all hover:bg-brand-hoverred disabled:opacity-60" disabled={loadingProfile}>
                  {loadingProfile ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Save profile
                </button>
                {savedProfile && (
                  <span className="flex items-center gap-1 text-sm font-bold text-emerald-600">
                    <Check size={14} /> Saved
                  </span>
                )}
              </div>
            </form>

            <form onSubmit={changePwd} className="rounded-lg border border-gray-100 bg-white p-4 shadow-card sm:p-5">
              <div className="mb-5 flex items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <div className="eyebrow mb-1">Security</div>
                  <h3 className="text-xl font-black tracking-tight text-gray-900">Password credentials</h3>
                  <p className="mt-1 text-sm text-gray-500">Use a strong password with at least 6 characters.</p>
                </div>
                <Lock size={18} className="text-gray-400" />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="label">Current password</label>
                  <input type="password" className="input focus:ring-brand-crimson/30" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} required />
                </div>
                <div>
                  <label className="label">New password</label>
                  <input type="password" minLength={6} className="input focus:ring-brand-crimson/30" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Confirm password</label>
                  <input type="password" minLength={6} className="input focus:ring-brand-crimson/30" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} required />
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-crimson px-4 py-2.5 text-sm font-black text-white transition-all hover:bg-brand-hoverred disabled:opacity-60" disabled={loadingPwd}>
                  {loadingPwd ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                  Update password
                </button>
                {savedPwd && (
                  <span className="flex items-center gap-1 text-sm font-bold text-emerald-600">
                    <Check size={14} /> Updated
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 ring-1 ring-gray-100">
      <Icon size={14} className="shrink-0 text-gray-400" />
      <div className="min-w-0">
        <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">{label}</div>
        <div className="truncate text-sm font-bold text-gray-800">{value}</div>
      </div>
    </div>
  );
}
