import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, Plus, LogOut, Upload, X, GripVertical } from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toYouTubeEmbed(url: string): string {
  try {
    const u = new URL(url);
    if (u.pathname.startsWith('/embed/')) return url;
    if (u.hostname === 'youtu.be') return `https://www.youtube.com/embed${u.pathname}`;
    const v = u.searchParams.get('v');
    if (v) return `https://www.youtube.com/embed/${v}`;
  } catch {}
  return url;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Banner {
  id: string;
  title: string;
  media_url: string;
  media_type: 'image' | 'video';
  display_order: number;
  is_active: boolean;
}

interface HeroSlide {
  id: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image_url: string;
  is_available: boolean;
  stock_qty: number;
  display_order: number;
}

interface Category {
  id: string;
  name: string;
  display_order: number;
}

type Tab = 'hero' | 'banners' | 'products' | 'categories' | 'orders' | 'settings';

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        {children}
      </div>
    </div>
  );
}

// ─── Shared Sortable Row ──────────────────────────────────────────────────────

function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : undefined }}
      className={`bg-white rounded-xl shadow-sm flex items-center ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="px-3 py-4 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none shrink-0"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 flex items-center gap-4 pr-4 py-3 min-w-0">
        {children}
      </div>
    </div>
  );
}

// ─── Save Order Bar ───────────────────────────────────────────────────────────

function SaveOrderBar({ changed, saving, onSave }: { changed: boolean; saving: boolean; onSave: () => void }) {
  if (!changed) return null;
  return (
    <div className="sticky top-0 z-20 bg-accent-caramel/10 border border-accent-caramel/30 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
      <p className="text-xs text-primary-dark font-medium">You have unsaved order changes.</p>
      <button
        onClick={onSave}
        disabled={saving}
        className="px-4 py-1.5 bg-accent-caramel text-white text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-accent-caramel-dark transition-all disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save Order'}
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>('hero');

  const TAB_LABELS: Record<Tab, string> = {
    hero: 'Hero',
    banners: 'Banners',
    products: 'Products',
    categories: 'Categories',
    orders: 'Orders',
    settings: 'Settings',
  };

  return (
    <div className="min-h-screen bg-primary-cream">
      <header className="bg-white border-b border-primary-dark/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-logo text-2xl text-primary-dark">Black Crème</h1>
          <p className="text-[9px] uppercase tracking-[3px] text-gray-400">Admin Panel</p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      <div className="flex border-b border-primary-dark/10 bg-white px-6 overflow-x-auto">
        {(['hero', 'banners', 'products', 'categories', 'orders', 'settings'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-3 px-5 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 whitespace-nowrap ${
              tab === t ? 'border-accent-caramel text-primary-dark' : 'border-transparent text-gray-400 hover:text-primary-dark'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {tab === 'hero'       && <HeroSlidesTab />}
        {tab === 'banners'    && <BannersTab />}
        {tab === 'products'   && <ProductsTab />}
        {tab === 'categories' && <CategoriesTab />}
        {tab === 'orders'     && <OrdersTab />}
        {tab === 'settings'   && <SettingsTab />}
      </div>
    </div>
  );
}

// ─── Hero Slides Tab ──────────────────────────────────────────────────────────

function HeroSlidesTab() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const fetchSlides = async () => {
    const { data } = await supabase.from('hero_slides').select('*').order('display_order');
    setSlides(data ?? []);
    setLoading(false);
    setOrderChanged(false);
  };

  useEffect(() => { fetchSlides(); }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSlides(prev => {
      const oldIndex = prev.findIndex(s => s.id === active.id);
      const newIndex = prev.findIndex(s => s.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
    setOrderChanged(true);
  };

  const saveOrder = async () => {
    setSaving(true);
    await Promise.all(slides.map((s, i) =>
      supabase.from('hero_slides').update({ display_order: i }).eq('id', s.id)
    ));
    setSaving(false);
    setOrderChanged(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('hero_slides').update({ is_active: !current }).eq('id', id);
    fetchSlides();
  };

  const deleteSlide = async (id: string, imageUrl: string) => {
    if (!confirm('Delete this slide?')) return;
    const path = imageUrl.split('/hero/')[1];
    if (path) await supabase.storage.from('hero').remove([path]);
    await supabase.from('hero_slides').delete().eq('id', id);
    fetchSlides();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-serif">Hero Slides</h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Product images shown in the homepage hero section</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-dark text-white text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-accent-caramel transition-all"
        >
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      </div>

      <p className="text-[11px] text-gray-400 mb-4">
        Recommended: <strong>3:4 portrait</strong> images (e.g. 900 × 1200 px). Auto-advances every 4 seconds.
      </p>

      <SaveOrderBar changed={orderChanged} saving={saving} onSave={saveOrder} />

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : slides.length === 0 ? (
        <div className="bg-white rounded-xl p-6 text-center text-sm text-gray-400 italic shadow-sm">
          No slides yet — the default hero image will be shown.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={slides.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {slides.map((s) => (
                <SortableRow key={s.id} id={s.id}>
                  <img src={s.image_url} alt="Hero slide" className="w-12 h-16 object-cover rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-primary-dark font-medium">Product Slide</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest">Image</p>
                  </div>
                  <div
                    onClick={() => toggleActive(s.id, s.is_active)}
                    className={`w-10 h-5 rounded-full transition-all relative cursor-pointer shrink-0 ${s.is_active ? 'bg-green-400' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${s.is_active ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 shrink-0 hidden sm:block">
                    {s.is_active ? 'Active' : 'Hidden'}
                  </span>
                  <button onClick={() => deleteSlide(s.id, s.image_url)} className="text-red-400 hover:text-red-600 transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </SortableRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <HeroSlideForm
            nextOrder={slides.length}
            onDone={() => { setShowForm(false); fetchSlides(); }}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}
    </div>
  );
}

// ─── Hero Slide Form ──────────────────────────────────────────────────────────

function HeroSlideForm({ nextOrder, onDone, onCancel }: {
  nextOrder: number;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('hero').upload(path, file);
    if (error) { alert('Upload failed: ' + error.message); setUploading(false); return; }
    const imageUrl = supabase.storage.from('hero').getPublicUrl(path).data.publicUrl;
    await supabase.from('hero_slides').insert({ image_url: imageUrl, display_order: nextOrder, is_active: true });
    setUploading(false);
    onDone();
  };

  return (
    <>
      <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div>
          <h3 className="font-serif text-xl">New Hero Slide</h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Product image for homepage hero</p>
        </div>
        <button onClick={onCancel}><X className="w-5 h-5 text-gray-400" /></button>
      </div>
      <div className="overflow-y-auto flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">
              Image <span className="normal-case font-normal opacity-60">(3:4 portrait — e.g. 900 × 1200px)</span>
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-primary-dark/15 rounded-xl p-6 text-center cursor-pointer hover:border-accent-caramel transition-colors"
            >
              {preview ? (
                <img src={preview} className="max-h-56 mx-auto rounded-lg object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Upload className="w-8 h-8 opacity-40" />
                  <p className="text-sm">Click to upload image</p>
                  <p className="text-[10px] opacity-60">Best size: 900 × 1200 px</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel}
              className="flex-1 py-3 border border-primary-dark/20 text-primary-dark text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-primary-cream transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || uploading}
              className="flex-[2] py-3 bg-primary-dark disabled:opacity-40 text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-accent-caramel transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading…' : 'Add Slide'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Banners Tab ──────────────────────────────────────────────────────────────

function BannersTab() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const fetchBanners = async () => {
    const { data } = await supabase.from('banners').select('*').order('display_order');
    setBanners(data ?? []);
    setLoading(false);
    setOrderChanged(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setBanners(prev => {
      const oldIndex = prev.findIndex(b => b.id === active.id);
      const newIndex = prev.findIndex(b => b.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
    setOrderChanged(true);
  };

  const saveOrder = async () => {
    setSaving(true);
    await Promise.all(banners.map((b, i) =>
      supabase.from('banners').update({ display_order: i }).eq('id', b.id)
    ));
    setSaving(false);
    setOrderChanged(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('banners').update({ is_active: !current }).eq('id', id);
    fetchBanners();
  };

  const deleteBanner = async (id: string, mediaUrl: string) => {
    if (!confirm('Delete this banner?')) return;
    const path = mediaUrl.split('/banners/')[1];
    if (path) await supabase.storage.from('banners').remove([path]);
    await supabase.from('banners').delete().eq('id', id);
    fetchBanners();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif">Banners</h2>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-dark text-white text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-accent-caramel transition-all"
        >
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      <SaveOrderBar changed={orderChanged} saving={saving} onSave={saveOrder} />

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : banners.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No banners yet.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={banners.map(b => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {banners.map((b) => (
                <SortableRow key={b.id} id={b.id}>
                  {b.media_type === 'image' ? (
                    <img src={b.media_url} alt={b.title} className="w-20 h-14 object-cover rounded-lg shrink-0" />
                  ) : (
                    <div className="w-20 h-14 bg-primary-dark/10 rounded-lg flex items-center justify-center shrink-0 text-[10px] text-gray-400 uppercase tracking-widest">Video</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{b.title || '(no title)'}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">{b.media_type}</p>
                  </div>
                  <div
                    onClick={() => toggleActive(b.id, b.is_active)}
                    className={`w-10 h-5 rounded-full transition-all relative cursor-pointer shrink-0 ${b.is_active ? 'bg-green-400' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${b.is_active ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 shrink-0 hidden sm:block">
                    {b.is_active ? 'Active' : 'Hidden'}
                  </span>
                  <button
                    onClick={() => { setEditing(b); setShowForm(true); }}
                    className="text-gray-400 hover:text-primary-dark transition-colors text-[10px] uppercase tracking-widest shrink-0"
                  >
                    Edit
                  </button>
                  <button onClick={() => deleteBanner(b.id, b.media_url)} className="text-red-400 hover:text-red-600 transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </SortableRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {showForm && (
        <Modal onClose={closeForm}>
          <BannerForm
            initial={editing}
            nextOrder={banners.length}
            onDone={() => { closeForm(); fetchBanners(); }}
            onCancel={closeForm}
          />
        </Modal>
      )}
    </div>
  );
}

// ─── Banner Form ──────────────────────────────────────────────────────────────

function BannerForm({ initial, nextOrder, onDone, onCancel }: {
  initial: Banner | null;
  nextOrder: number;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [mediaType, setMediaType] = useState<'image' | 'video'>(initial?.media_type ?? 'image');
  const [videoUrl, setVideoUrl] = useState(initial?.media_type === 'video' ? initial.media_url : '');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(initial?.media_type === 'image' ? initial.media_url : '');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setUploading(true);
    let mediaUrl = initial?.media_url ?? '';

    if (mediaType === 'image' && file) {
      // Delete old image from storage if replacing
      if (initial?.media_type === 'image' && initial.media_url) {
        const oldPath = initial.media_url.split('/banners/')[1];
        if (oldPath) await supabase.storage.from('banners').remove([oldPath]);
      }
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('banners').upload(path, file);
      if (error) { alert('Upload failed: ' + error.message); setUploading(false); return; }
      mediaUrl = supabase.storage.from('banners').getPublicUrl(path).data.publicUrl;
    } else if (mediaType === 'video') {
      mediaUrl = toYouTubeEmbed(videoUrl);
    }

    const payload = { title, media_url: mediaUrl, media_type: mediaType, is_active: initial?.is_active ?? true };

    if (initial) {
      await supabase.from('banners').update(payload).eq('id', initial.id);
    } else {
      await supabase.from('banners').insert({ ...payload, display_order: nextOrder });
    }

    setUploading(false);
    onDone();
  };

  return (
    <>
      <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
        <h3 className="font-serif text-xl">{initial ? 'Edit Banner' : 'New Banner'}</h3>
        <button onClick={onCancel}><X className="w-5 h-5 text-gray-400" /></button>
      </div>
      <div className="overflow-y-auto flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
              placeholder="e.g. Ramadan Special" />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-2">Type</label>
            <div className="flex rounded-lg border border-primary-dark/15 overflow-hidden w-fit">
              {(['image', 'video'] as const).map((t) => (
                <button key={t} type="button" onClick={() => setMediaType(t)}
                  className={`px-6 py-2 text-xs font-semibold uppercase tracking-widest transition-all ${mediaType === t ? 'bg-primary-dark text-white' : 'bg-white text-gray-400'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {mediaType === 'image' ? (
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Image</label>
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-primary-dark/15 rounded-xl p-6 text-center cursor-pointer hover:border-accent-caramel transition-colors">
                {preview
                  ? <img src={preview} className="h-32 mx-auto object-cover rounded-lg" />
                  : <div className="flex flex-col items-center gap-2 text-gray-400"><Upload className="w-6 h-6" /><span className="text-xs">Click to upload image</span></div>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
          ) : (
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">YouTube URL</label>
              <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
                placeholder="https://www.youtube.com/watch?v=xxxx" />
              <p className="text-[10px] text-gray-400 mt-1">YouTube URL (any format) or a direct video file URL (.mp4, .webm).</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel}
              className="flex-1 py-2.5 border border-primary-dark/20 text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-primary-cream transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || (mediaType === 'image' && !file && !initial?.media_url) || (mediaType === 'video' && !videoUrl)}
              className="flex-[2] py-2.5 bg-primary-dark text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-accent-caramel transition-all disabled:opacity-40"
            >
              {uploading ? 'Saving…' : initial ? 'Save Changes' : 'Add Banner'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [orderChanged, setOrderChanged] = useState(false);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const fetchAll = async () => {
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*').order('display_order'),
      supabase.from('categories').select('name').order('display_order'),
    ]);
    const fetchedProducts = prods ?? [];
    const fetchedCategories = (cats ?? []).map((c: { name: string }) => c.name);
    setAllProducts(fetchedProducts);
    setCategories(fetchedCategories);
    if (fetchedCategories.length > 0) {
      setSelectedCategory(prev => fetchedCategories.includes(prev) ? prev : fetchedCategories[0]);
    }
    setLoading(false);
    setOrderChanged(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Products visible in the current category tab
  const visibleProducts = allProducts.filter(p => p.category === selectedCategory);

  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setAllProducts(prev => {
      const oldIndex = prev.findIndex(p => p.id === active.id);
      const newIndex = prev.findIndex(p => p.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
    setOrderChanged(true);
  };

  const saveOrder = async () => {
    setSaving(true);
    // Re-index display_order only within the current category
    const updated = visibleProducts;
    await Promise.all(updated.map((p, i) =>
      supabase.from('products').update({ display_order: i }).eq('id', p.id)
    ));
    setSaving(false);
    setOrderChanged(false);
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_available: !current }).eq('id', id);
    fetchAll();
  };

  const deleteProduct = async (id: string, imageUrl: string) => {
    if (!confirm('Delete this product?')) return;
    const path = imageUrl?.split('/products/')[1];
    if (path) await supabase.storage.from('products').remove([path]);
    await supabase.from('products').delete().eq('id', id);
    fetchAll();
  };

  // Count products per category for the tab badge
  const countByCategory = (cat: string) => allProducts.filter(p => p.category === cat).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif">Products</h2>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-dark text-white text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-accent-caramel transition-all"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Category filter tabs */}
      {!loading && categories.length > 0 && (
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1.5 shadow-sm overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setOrderChanged(false); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary-dark text-white'
                  : 'text-gray-400 hover:text-primary-dark hover:bg-primary-cream'
              }`}
            >
              {cat}
              <span className={`text-[9px] rounded-full px-1.5 py-0.5 font-bold ${
                selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {countByCategory(cat)}
              </span>
            </button>
          ))}
        </div>
      )}

      <SaveOrderBar changed={orderChanged} saving={saving} onSave={saveOrder} />

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : visibleProducts.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No products in this category yet.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={visibleProducts.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {visibleProducts.map((p) => (
                <SortableRow key={p.id} id={p.id}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="w-16 h-16 object-cover rounded-lg shrink-0" />
                    : <div className="w-16 h-16 bg-primary-cream rounded-lg shrink-0 flex items-center justify-center text-[10px] text-gray-400">No img</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                      RM {Number(p.price).toFixed(2)} · Stock: {p.stock_qty}
                    </p>
                  </div>
                  <div
                    onClick={() => toggleAvailability(p.id, p.is_available)}
                    className={`w-10 h-5 rounded-full transition-all relative cursor-pointer shrink-0 ${p.is_available ? 'bg-green-400' : 'bg-red-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${p.is_available ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 shrink-0 hidden sm:block">
                    {p.is_available ? 'Available' : 'Out of Stock'}
                  </span>
                  <button
                    onClick={() => { setEditing(p); setShowForm(true); }}
                    className="text-gray-400 hover:text-primary-dark transition-colors text-[10px] uppercase tracking-widest shrink-0"
                  >
                    Edit
                  </button>
                  <button onClick={() => deleteProduct(p.id, p.image_url)} className="text-red-400 hover:text-red-600 transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </SortableRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {showForm && (
        <Modal onClose={closeForm}>
          <ProductForm
            initial={editing}
            nextOrder={visibleProducts.length}
            onDone={() => { closeForm(); fetchAll(); }}
            onCancel={closeForm}
          />
        </Modal>
      )}
    </div>
  );
}

// ─── Product Form ─────────────────────────────────────────────────────────────

function ProductForm({ initial, nextOrder, onDone, onCancel }: {
  initial: Product | null;
  nextOrder: number;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState(initial?.category ?? '');
  const [price, setPrice] = useState(initial?.price?.toString() ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [stockQty, setStockQty] = useState(initial?.stock_qty?.toString() ?? '0');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(initial?.image_url ?? '');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from('categories').select('name').order('display_order').then(({ data }) => {
      const names = (data ?? []).map((c: { name: string }) => c.name);
      setCategories(names);
      if (!initial?.category && names.length > 0) setCategory(names[0]);
    });
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setUploading(true);
    let imageUrl = initial?.image_url ?? '';

    if (file) {
      if (initial?.image_url) {
        const oldPath = initial.image_url.split('/products/')[1];
        if (oldPath) await supabase.storage.from('products').remove([oldPath]);
      }
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('products').upload(path, file);
      if (error) { alert('Upload failed: ' + error.message); setUploading(false); return; }
      imageUrl = supabase.storage.from('products').getPublicUrl(path).data.publicUrl;
    }

    const qty = parseInt(stockQty) || 0;
    const payload = { name, category, price: parseFloat(price), description, image_url: imageUrl, stock_qty: qty, is_available: qty > 0 };

    if (initial) {
      await supabase.from('products').update(payload).eq('id', initial.id);
    } else {
      await supabase.from('products').insert({ ...payload, display_order: nextOrder });
    }

    setUploading(false);
    onDone();
  };

  return (
    <>
      <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
        <h3 className="font-serif text-xl">{initial ? 'Edit Product' : 'New Product'}</h3>
        <button onClick={onCancel}><X className="w-5 h-5 text-gray-400" /></button>
      </div>
      <div className="overflow-y-auto flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
                placeholder="e.g. Basque Cheesecake" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Price (RM) *</label>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required
                className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
                placeholder="65.00" />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">
              Stock Qty <span className="normal-case font-normal opacity-60">(hidden from customers)</span>
            </label>
            <input type="number" min="0" value={stockQty} onChange={(e) => setStockQty(e.target.value)}
              className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
              placeholder="0" />
            <p className="text-[10px] text-gray-400 mt-1">Product shows as Out of Stock when qty reaches 0.</p>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Category *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel bg-white">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel resize-none"
              placeholder="Short description of the product…" />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Product Image</label>
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-primary-dark/15 rounded-xl p-6 text-center cursor-pointer hover:border-accent-caramel transition-colors">
              {preview
                ? <img src={preview} className="h-32 mx-auto object-cover rounded-lg" />
                : <div className="flex flex-col items-center gap-2 text-gray-400"><Upload className="w-6 h-6" /><span className="text-xs">Click to upload image</span></div>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel}
              className="flex-1 py-2.5 border border-primary-dark/20 text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-primary-cream transition-all">
              Cancel
            </button>
            <button type="submit" disabled={uploading || !name || !price}
              className="flex-[2] py-2.5 bg-primary-dark text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-accent-caramel transition-all disabled:opacity-40">
              {uploading ? 'Saving…' : initial ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Categories Tab ───────────────────────────────────────────────────────────

function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('display_order');
    setCategories(data ?? []);
    setLoading(false);
    setOrderChanged(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setCategories(prev => {
      const oldIndex = prev.findIndex(c => c.id === active.id);
      const newIndex = prev.findIndex(c => c.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
    setOrderChanged(true);
  };

  const saveOrder = async () => {
    setSaving(true);
    await Promise.all(categories.map((c, i) =>
      supabase.from('categories').update({ display_order: i }).eq('id', c.id)
    ));
    setSaving(false);
    setOrderChanged(false);
  };

  const addCategory = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    await supabase.from('categories').insert({ name: newName.trim(), display_order: categories.length });
    setNewName('');
    setAdding(false);
    fetchCategories();
  };

  const deleteCategory = async (id: string, name: string) => {
    const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('category', name);
    if ((count ?? 0) > 0) {
      alert(`Cannot delete "${name}" — ${count} product(s) are assigned to it. Reassign them first.`);
      return;
    }
    if (!confirm(`Delete category "${name}"?`)) return;
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif">Categories</h2>
      </div>

      <SaveOrderBar changed={orderChanged} saving={saving} onSave={saveOrder} />

      <form onSubmit={addCategory} className="bg-white rounded-xl p-4 mb-6 shadow-sm flex gap-3">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="e.g. Seasonal Special"
          className="flex-1 border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
        />
        <button type="submit" disabled={adding || !newName.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-primary-dark text-white text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-accent-caramel transition-all disabled:opacity-40">
          <Plus className="w-4 h-4" /> Add
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No categories yet.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {categories.map((c) => (
                <SortableRow key={c.id} id={c.id}>
                  <p className="font-medium text-sm flex-1">{c.name}</p>
                  <button onClick={() => deleteCategory(c.id, c.name)} className="text-red-400 hover:text-red-600 transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </SortableRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      <p className="text-[10px] text-gray-400 mt-4">Drag to reorder — the sequence here controls the tab order on the public menu.</p>
    </div>
  );
}

// ─── Settings Tab ────────────────────────────────────────────────────────────

interface SiteSetting { key: string; value: string; }

function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((s: SiteSetting) => { map[s.key] = s.value; });
        setSettings(map);
      }
      setLoading(false);
    });
  }, []);

  const updateSetting = async (key: string, value: string) => {
    setSaving(key);
    setSettings(prev => ({ ...prev, [key]: value }));
    await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() });
    setSaving(null);
  };

  if (loading) return <p className="text-sm text-gray-400">Loading…</p>;

  const loginEnabled = settings.login_enabled !== 'false';
  const signupEnabled = settings.signup_enabled !== 'false';
  const paymentMethod = settings.payment_method ?? 'whatsapp';
  const quickOrder = settings.whatsapp_quick_order === 'true';
  const activeTheme = settings.active_theme ?? 'default';

  const THEMES = [
    { key: 'default',        label: 'Black Crème',          period: 'Default',         primary: '#2C1810', accent: '#C4956A' },
    { key: 'new-year',       label: 'New Year',             period: '1 Jan',           primary: '#0D1B2A', accent: '#D4AF37' },
    { key: 'cny',            label: 'Chinese New Year',     period: 'Jan / Feb',       primary: '#8B0000', accent: '#D4AF37' },
    { key: 'thaipusam',      label: 'Thaipusam',            period: 'Jan / Feb',       primary: '#7A3200', accent: '#C0A860' },
    { key: 'valentines',     label: "Valentine's Day",      period: '14 Feb',          primary: '#6B1A2A', accent: '#E8648A' },
    { key: 'wesak',          label: 'Wesak Day',            period: 'May',             primary: '#4A3000', accent: '#D4A020' },
    { key: 'mothers-day',    label: "Mother's Day",         period: '2nd Sun May',     primary: '#4A2050', accent: '#E88AAA' },
    { key: 'raya',           label: 'Hari Raya Aidilfitri', period: 'Mar / Apr',       primary: '#1B4332', accent: '#D4AC0D' },
    { key: 'dragon-boat',    label: 'Dumpling Festival',    period: 'Jun',             primary: '#1A4A3A', accent: '#C0392B' },
    { key: 'fathers-day',    label: "Father's Day",         period: '3rd Sun Jun',     primary: '#1A2744', accent: '#4A7FA8' },
    { key: 'merdeka',        label: 'Hari Merdeka',         period: '31 Aug',          primary: '#003087', accent: '#CC0001' },
    { key: 'malaysia-day',   label: 'Malaysia Day',         period: '16 Sep',          primary: '#002366', accent: '#CC0001' },
    { key: 'maulidur-rasul', label: 'Maulidur Rasul',       period: 'Sep',             primary: '#1A3A2A', accent: '#C9A84C' },
    { key: 'raya-haji',      label: 'Hari Raya Aidiladha',  period: 'Jul / Aug',       primary: '#164E4E', accent: '#C07A3A' },
    { key: 'mid-autumn',     label: 'Mid-Autumn Festival',  period: 'Sep / Oct',       primary: '#1A2744', accent: '#D4823A' },
    { key: 'deepavali',      label: 'Deepavali',            period: 'Oct / Nov',       primary: '#3D1C6E', accent: '#E8A020' },
    { key: 'christmas',      label: 'Christmas',            period: 'Dec',             primary: '#1A3D2B', accent: '#C41E3A' },
  ] as const;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif">Settings</h2>
      </div>

      <div className="space-y-4">

        {/* Customer Accounts */}
        <div className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between gap-6">
          <div>
            <p className="font-medium text-sm">Customer Accounts</p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-sm">
              Show login and registration on the storefront. When off, customers order without an account.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 w-12 text-right">
              {loginEnabled ? 'On' : 'Off'}
            </span>
            <button
              onClick={() => updateSetting('login_enabled', loginEnabled ? 'false' : 'true')}
              disabled={saving === 'login_enabled'}
              className={`w-12 h-6 rounded-full transition-all relative disabled:opacity-50 ${loginEnabled ? 'bg-green-400' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${loginEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Customer Sign Up */}
        <div className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between gap-6">
          <div>
            <p className="font-medium text-sm">Customer Sign Up</p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-sm">
              Allow new customers to create an account. When off, existing accounts can still log in but the registration page is closed.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 w-12 text-right">
              {signupEnabled ? 'On' : 'Off'}
            </span>
            <button
              onClick={() => updateSetting('signup_enabled', signupEnabled ? 'false' : 'true')}
              disabled={saving === 'signup_enabled'}
              className={`w-12 h-6 rounded-full transition-all relative disabled:opacity-50 ${signupEnabled ? 'bg-green-400' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${signupEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="font-medium text-sm mb-1">Payment Method</p>
          <p className="text-[11px] text-gray-400 mb-4">Choose how customers pay at checkout.</p>

          <div className="flex rounded-lg border border-primary-dark/15 overflow-hidden w-fit">
            {(['whatsapp', 'stripe'] as const).map((method) => (
              <button
                key={method}
                onClick={() => updateSetting('payment_method', method)}
                disabled={saving === 'payment_method'}
                className={`px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-60 ${
                  paymentMethod === method
                    ? 'bg-primary-dark text-white'
                    : 'bg-white text-gray-400 hover:bg-primary-cream'
                }`}
              >
                {method === 'whatsapp' ? 'WhatsApp' : 'Stripe'}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-gray-400 mt-3">
            {paymentMethod === 'whatsapp'
              ? 'Orders are sent to you as a pre-filled WhatsApp message.'
              : 'Customers pay online via FPX or card. Invoice email sent automatically after payment.'
            }
          </p>
          {paymentMethod === 'stripe' && (
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
              ⚠ Stripe Edge Functions must be deployed before using this in production.
            </p>
          )}
        </div>

        {/* Quick WhatsApp Order — only shown when payment method is WhatsApp */}
        {paymentMethod === 'whatsapp' && (
          <div className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between gap-6">
            <div>
              <p className="font-medium text-sm">Quick WhatsApp Order</p>
              <p className="text-[11px] text-gray-400 mt-1 max-w-sm">
                When on, customers are sent directly to WhatsApp with their cart — no form to fill in. You collect their details through the chat.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 w-12 text-right">
                {quickOrder ? 'On' : 'Off'}
              </span>
              <button
                onClick={() => updateSetting('whatsapp_quick_order', quickOrder ? 'false' : 'true')}
                disabled={saving === 'whatsapp_quick_order'}
                className={`w-12 h-6 rounded-full transition-all relative disabled:opacity-50 ${quickOrder ? 'bg-green-400' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${quickOrder ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        )}

        {/* Festive Theme */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="font-medium text-sm mb-1">Festive Theme</p>
          <p className="text-[11px] text-gray-400 mb-4">Change the storefront colour palette to match the current season. Takes effect immediately for all visitors.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {THEMES.map((t) => {
              const isActive = activeTheme === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => updateSetting('active_theme', t.key)}
                  disabled={saving === 'active_theme'}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-left disabled:opacity-60 ${
                    isActive
                      ? 'border-primary-dark bg-primary-dark/5'
                      : 'border-transparent hover:border-primary-dark/20 hover:bg-gray-50'
                  }`}
                >
                  {/* Colour swatch */}
                  <div className="w-full h-8 rounded-lg overflow-hidden flex">
                    <div className="w-1/2 h-full" style={{ backgroundColor: t.primary }} />
                    <div className="w-1/2 h-full" style={{ backgroundColor: t.accent }} />
                  </div>
                  <div className="w-full">
                    <p className="text-[11px] font-semibold text-primary-dark leading-tight">{t.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{t.period}</p>
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-primary-dark flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

interface OrderItem { id: string; product_name: string; product_price: number; quantity: number; }
interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_type: string;
  delivery_address_line_1: string;
  delivery_address_line_2: string;
  delivery_city: string;
  delivery_state: string;
  delivery_postcode: string;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  total: number;
  cake_message: string;
  scheduled_date: string;
  scheduled_time: string;
  payment_gateway: string;
  status: string;
  created_at: string;
  order_items: OrderItem[];
  profiles: { full_name: string; phone: string } | null;
}

const STATUSES = ['pending', 'paid', 'confirmed', 'completed', 'cancelled'];

const STATUS_STYLE: Record<string, string> = {
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  paid:      'bg-purple-50 text-purple-700 border-purple-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-500 border-red-200',
};

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*), profiles(full_name, phone)')
      .order('created_at', { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setUpdatingId(null);
  };

  const deleteOrder = async (id: string, orderNumber: string) => {
    if (!confirm(`Permanently delete order ${orderNumber}? This cannot be undone.`)) return;
    setDeletingId(id);
    await supabase.from('order_items').delete().eq('order_id', id);
    await supabase.from('orders').delete().eq('id', id);
    setOrders(prev => prev.filter(o => o.id !== id));
    setExpanded(null);
    setDeletingId(null);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatDateTime = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
      + ' · ' + dt.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const visible = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif">Orders</h2>
        <span className="text-xs text-gray-400">{visible.length} order{visible.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Status filter */}
      <div className="flex gap-1 bg-white rounded-xl p-1.5 shadow-sm mb-6 overflow-x-auto">
        {(['all', ...STATUSES]).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`flex-1 py-2 rounded-lg text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-all ${
              filterStatus === s ? 'bg-primary-dark text-white' : 'text-gray-400 hover:text-primary-dark'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No orders found.</p>
      ) : (
        <div className="space-y-3">
          {visible.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Header row */}
              <div className="px-5 py-4 flex items-center gap-4">
                <button
                  className="flex-1 flex items-center gap-4 text-left"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{order.customer_name ?? order.profiles?.full_name ?? 'Guest'}</p>
                      {order.order_number && <span className="text-[9px] text-gray-400 uppercase tracking-widest">{order.order_number}</span>}
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                      {formatDate(order.scheduled_date)} · {order.scheduled_time} · {order.delivery_type}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Ordered {formatDateTime(order.created_at)}
                    </p>
                  </div>
                  <p className="font-serif text-accent-caramel shrink-0">RM {Number(order.total).toFixed(2)}</p>
                </button>

                {/* Status changer */}
                <select
                  value={order.status}
                  disabled={updatingId === order.id}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none ${STATUS_STYLE[order.status]}`}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Expanded details */}
              {expanded === order.id && (
                <div className="border-t border-primary-dark/5 px-5 py-4 space-y-3 bg-primary-cream/30">

                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                      <p className="font-medium">{order.customer_name ?? order.profiles?.full_name ?? '—'}</p>
                      <p className="text-gray-500">{order.customer_phone ?? order.profiles?.phone ?? '—'}</p>
                      {order.customer_email && <p className="text-gray-500 break-all">{order.customer_email}</p>}
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase tracking-widest mb-1">Schedule</p>
                      <p className="font-medium capitalize">{order.delivery_type}</p>
                      <p className="text-gray-500">{formatDate(order.scheduled_date)}</p>
                      <p className="text-gray-500">{order.scheduled_time}</p>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {order.delivery_type === 'delivery' && order.delivery_address_line_1 && (
                    <div className="text-xs">
                      <p className="text-gray-400 uppercase tracking-widest mb-1">Delivery Address</p>
                      <p className="text-primary-dark/80">{order.delivery_address_line_1}</p>
                      {order.delivery_address_line_2 && <p className="text-primary-dark/80">{order.delivery_address_line_2}</p>}
                      <p className="text-primary-dark/80">{order.delivery_postcode} {order.delivery_city}</p>
                      <p className="text-primary-dark/80">{order.delivery_state}</p>
                    </div>
                  )}

                  {/* Items */}
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Items</p>
                    <div className="space-y-1">
                      {order.order_items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-primary-dark/70">{item.product_name} × {item.quantity}</span>
                          <span className="font-medium">RM {(item.product_price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t border-primary-dark/10 pt-3 space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Subtotal</span><span>RM {Number(order.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Delivery fee</span><span>{order.delivery_fee === 0 ? 'Free' : `RM ${Number(order.delivery_fee).toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span>Total</span><span className="text-accent-caramel">RM {Number(order.total).toFixed(2)}</span>
                    </div>
                  </div>

                  {order.cake_message && (
                    <div className="bg-white rounded-lg px-3 py-2 text-sm text-primary-dark/60 italic">
                      ✉️ "{order.cake_message}"
                    </div>
                  )}

                  {/* Delete */}
                  <div className="pt-2 border-t border-primary-dark/5">
                    <button
                      onClick={() => deleteOrder(order.id, order.order_number ?? order.id)}
                      disabled={deletingId === order.id}
                      className="flex items-center gap-1.5 text-red-400 hover:text-red-600 text-[10px] uppercase tracking-widest font-bold transition-colors disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deletingId === order.id ? 'Deleting…' : 'Delete Order'}
                    </button>
                  </div>

                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
