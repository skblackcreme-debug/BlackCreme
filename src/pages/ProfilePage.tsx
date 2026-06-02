import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Trash2, X, Check } from 'lucide-react';
import { POSTCODE_LOOKUP, STATE_CITIES, SUPPORTED_STATES, isServiceablePostcode } from '@/data/deliveryZones';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Address {
  id: string;
  label: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postcode: string;
  is_default: boolean;
}

type Tab = 'info' | 'addresses' | 'password';

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) window.location.href = '/login';
  }, [user, loading]);

  const [tab, setTab] = useState<Tab>('info');

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-primary-cream">
      {/* Header */}
      <header className="bg-white border-b border-primary-dark/10 px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-logo text-2xl text-primary-dark">Black Crème</a>
        <a href="/" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-primary-dark transition-colors">
          ← Back to Shop
        </a>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-primary-dark">My Account</h1>
          <p className="text-xs text-gray-400 mt-1">{user.email}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1.5 shadow-sm mb-8">
          {([
            { key: 'info',      label: 'Personal Info' },
            { key: 'addresses', label: 'Addresses' },
            { key: 'password',  label: 'Password' },
          ] as { key: Tab; label: string }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all ${
                tab === t.key ? 'bg-primary-dark text-white' : 'text-gray-400 hover:text-primary-dark'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'info'      && <PersonalInfoTab userId={user.id} email={user.email!} initialProfile={profile} />}
        {tab === 'addresses' && <AddressesTab userId={user.id} />}
        {tab === 'password'  && <PasswordTab />}
      </div>
    </div>
  );
}

// ─── Personal Info Tab ────────────────────────────────────────────────────────

function PersonalInfoTab({ userId, email, initialProfile }: {
  userId: string;
  email: string;
  initialProfile: { full_name: string; phone: string } | null;
}) {
  const [fullName, setFullName] = useState(initialProfile?.full_name ?? '');
  const [phone, setPhone] = useState(initialProfile?.phone ?? '');
  const [dob, setDob] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('profiles').select('full_name, phone, date_of_birth').eq('id', userId).single()
      .then(({ data }) => {
        if (!data) return;
        setFullName(data.full_name ?? '');
        setPhone(data.phone ?? '');
        setDob(data.date_of_birth ?? '');
      });
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const { error } = await supabase.from('profiles').update({
      full_name: fullName,
      phone,
      date_of_birth: dob || null,
    }).eq('id', userId);

    if (error) { setError(error.message); }
    else { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Full Name *</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required
            className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
            placeholder="Full name" />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Email Address</label>
          <input value={email} disabled
            className="w-full border border-primary-dark/10 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
          <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed.</p>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Phone Number *</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
            className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
            placeholder="012-3456789" />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">
            Date of Birth <span className="normal-case font-normal opacity-60">(optional — for birthday offers)</span>
          </label>
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
            className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel" />
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <button type="submit" disabled={saving}
          className="w-full py-3 bg-primary-dark text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-accent-caramel transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

// ─── Addresses Tab ────────────────────────────────────────────────────────────

function AddressesTab({ userId }: { userId: string }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const fetchAddresses = async () => {
    const { data } = await supabase.from('addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false });
    setAddresses(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAddresses(); }, [userId]);

  const setDefault = async (id: string) => {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    fetchAddresses();
  };

  const deleteAddress = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    await supabase.from('addresses').delete().eq('id', id);
    fetchAddresses();
  };

  const closeForm = () => { setShowForm(false); setEditing(null); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Saved delivery addresses</p>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-dark text-white text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-accent-caramel transition-all"
        >
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-sm text-gray-400 italic">No saved addresses yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map(a => (
            <div key={a.id} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {a.label && <span className="text-[10px] uppercase tracking-widest font-bold bg-primary-cream px-2 py-0.5 rounded">{a.label}</span>}
                    {a.is_default && <span className="text-[10px] uppercase tracking-widest font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Default</span>}
                  </div>
                  <p className="text-sm font-medium">{a.address_line_1}</p>
                  {a.address_line_2 && <p className="text-sm text-gray-500">{a.address_line_2}</p>}
                  <p className="text-sm text-gray-500">{a.postcode} {a.city}, {a.state}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!a.is_default && (
                    <button onClick={() => setDefault(a.id)} className="text-[10px] uppercase tracking-widest text-accent-caramel hover:underline">
                      Set Default
                    </button>
                  )}
                  <button onClick={() => { setEditing(a); setShowForm(true); }} className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-primary-dark">
                    Edit
                  </button>
                  <button onClick={() => deleteAddress(a.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="font-serif text-xl">{editing ? 'Edit Address' : 'New Address'}</h3>
              <button onClick={closeForm}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              <AddressForm
                userId={userId}
                initial={editing}
                onDone={() => { closeForm(); fetchAddresses(); }}
                onCancel={closeForm}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Address Form ─────────────────────────────────────────────────────────────

function AddressForm({ userId, initial, onDone, onCancel }: {
  userId: string;
  initial: Address | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    label: initial?.label ?? '',
    address_line_1: initial?.address_line_1 ?? '',
    address_line_2: initial?.address_line_2 ?? '',
    state: initial?.state ?? '',
    city: initial?.city ?? '',
    postcode: initial?.postcode ?? '',
    is_default: initial?.is_default ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handlePostcode = (postcode: string) => {
    const digits = postcode.replace(/\D/g, '').slice(0, 5);
    if (digits && isServiceablePostcode(digits)) {
      const entry = POSTCODE_LOOKUP[digits];
      setForm(f => ({ ...f, postcode: digits, city: entry.city, state: entry.state }));
    } else {
      setForm(f => ({ ...f, postcode: digits }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (form.is_default) {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
    }

    const payload = { ...form, user_id: userId };

    const { error } = initial
      ? await supabase.from('addresses').update(payload).eq('id', initial.id)
      : await supabase.from('addresses').insert(payload);

    if (error) { setError(error.message); setSaving(false); return; }
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">
          Label <span className="normal-case font-normal opacity-60">(optional)</span>
        </label>
        <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
          className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
          placeholder="e.g. Home, Office" />
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Address Line 1 *</label>
        <input value={form.address_line_1} onChange={(e) => setForm({ ...form, address_line_1: e.target.value })} required
          className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
          placeholder="e.g. No. 5, Jalan SS2/24" />
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">
          Address Line 2 <span className="normal-case font-normal opacity-60">(optional)</span>
        </label>
        <input value={form.address_line_2} onChange={(e) => setForm({ ...form, address_line_2: e.target.value })}
          className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
          placeholder="e.g. Unit 3A, Residensi Vista" />
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">State *</label>
        <select value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value, city: '', postcode: '' }))}
          className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel bg-white">
          <option value="">— Select state —</option>
          {SUPPORTED_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">City *</label>
        <select value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value, postcode: '' }))}
          disabled={!form.state}
          className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel bg-white disabled:opacity-40 disabled:cursor-not-allowed">
          <option value="">— Select city —</option>
          {(STATE_CITIES[form.state as keyof typeof STATE_CITIES] ?? []).map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Postcode *</label>
        <input
          type="text"
          inputMode="numeric"
          value={form.postcode}
          onChange={(e) => handlePostcode(e.target.value)}
          required
          maxLength={5}
          className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
          placeholder="e.g. 47500"
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => setForm(f => ({ ...f, is_default: !f.is_default }))}
          className={`w-10 h-5 rounded-full transition-all relative ${form.is_default ? 'bg-green-400' : 'bg-gray-200'}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_default ? 'left-5' : 'left-0.5'}`} />
        </div>
        <span className="text-sm text-gray-600">Set as default address</span>
      </label>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 border border-primary-dark/20 text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-primary-cream transition-all">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="flex-[2] py-2.5 bg-primary-dark text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-accent-caramel transition-all disabled:opacity-40">
          {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Address'}
        </button>
      </div>
    </form>
  );
}

// ─── Password Tab ─────────────────────────────────────────────────────────────

function PasswordTab() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); }
    else {
      setSaved(true);
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">New Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            placeholder="Min. 8 characters"
            className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel" />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Confirm New Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
            placeholder="Re-enter new password"
            className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel" />
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <button type="submit" disabled={saving}
          className="w-full py-3 bg-primary-dark text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-accent-caramel transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {saved ? <><Check className="w-4 h-4" /> Password Updated!</> : saving ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
