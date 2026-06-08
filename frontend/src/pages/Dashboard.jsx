import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Filters from '../components/Filters';
import ArticleCard from '../components/ArticleCard';
import { Skeleton } from '../components/Loader';
import { Newspaper, Landmark, Building2, BookOpen, RefreshCw } from 'lucide-react';

const COLUMNS = [
  { key: 'govt', label: 'Government Updates', icon: Landmark, dot: 'bg-emerald-500' },
  { key: 'news', label: 'News', icon: Newspaper, dot: 'bg-blue-500' },
  { key: 'evergreen', label: 'Evergreen', icon: BookOpen, dot: 'bg-violet-500' },
  { key: 'competitor', label: 'Competitors', icon: Building2, dot: 'bg-orange-500' },
];

function SkeletonCard() {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex gap-2">
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-4/5 rounded" />
      <Skeleton className="h-3 w-3/4 rounded" />
      <Skeleton className="h-3 w-24 rounded" />
    </div>
  );
}

function EmptyState({ icon: Icon, isAdmin }) {
  return (
    <div className="card p-8 text-center flex flex-col items-center gap-2">
      <Icon size={24} className="text-ink-200" />
      <span className="text-sm font-medium text-ink-400">Nothing here yet.</span>
      {isAdmin && (
        <span className="text-[11px] text-ink-300">Go to Admin → trigger a fetch.</span>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState({ news: [], govt: [], competitor: [], evergreen: [] });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(() => {
    if (!user?._id) return {};
    try {
      const saved = localStorage.getItem(`dashboard_filters_${user._id}`);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user?._id)
      localStorage.setItem(`dashboard_filters_${user._id}`, JSON.stringify(filters));
  }, [filters, user?._id]);

  const load = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = {};
      for (const [k, v] of Object.entries(f || {})) if (v) params[k] = v;
      const { data } = await api.get('/articles/dashboard', { params });
      setData(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(filters); }, [load, filters, refreshKey]);

  const activeType = filters.type;
  const visibleColumns = activeType ? COLUMNS.filter((c) => c.key === activeType) : COLUMNS;

  return (
    /*
     * Height chain for desktop independent-column scroll:
     *   #root (height:100%) → this div (h-full flex-col) →
     *   main (flex-1 min-h-0 flex-col) → grid (flex-1 min-h-0) →
     *   column (h-full flex-col) → scroll area (flex-1 overflow-y-auto)
     *
     * On mobile (<lg) we fall back to normal page scroll via
     * `lg:overflow-hidden` / `lg:h-full` guards.
     */
    <div className="h-full flex flex-col bg-canvas">
      <Navbar />

      <main className="flex-1 min-h-0 flex flex-col max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto lg:overflow-hidden">

        {/* Page header */}
        <div className="flex items-start sm:items-end justify-between mb-4 sm:mb-5 gap-4 flex-wrap shrink-0">
          <div>
            <div className="eyebrow mb-1">Singapore · Daily Brief</div>
            <h1 className="section-title text-3xl sm:text-4xl">The Desk.</h1>
            <p className="text-ink-400 text-sm mt-1">
              {isAdmin
                ? 'Admin view — published items are visible to all members.'
                : 'Curated intelligence across Ascentium service lines.'}
            </p>
          </div>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="btn-secondary shrink-0"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 sm:mb-5 shrink-0">
          <Filters initial={filters} onChange={setFilters} showAdmin={isAdmin} />
        </div>

        {/* ══════════════════════════════════════════════════
            FILTERED VIEW — single type, scrollable card grid
            ══════════════════════════════════════════════════ */}
        {activeType ? (() => {
          const col = visibleColumns[0];
          if (!col) return null;
          return (
            <div className="flex-1 min-h-0 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-3 px-0.5 shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <col.icon size={15} className="text-ink-500" />
                  <h2 className="font-display text-[17px] text-ink-800 tracking-tight">{col.label}</h2>
                </div>
                <span className="text-[11px] text-ink-400 uppercase tracking-wider font-mono">
                  {loading ? '…' : data[col.key]?.length || 0}
                </span>
              </div>

              {/* Scrollable grid */}
              <div className="flex-1 overflow-y-auto pb-6 pr-1">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : data[col.key]?.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {data[col.key].map((item) => (
                      <ArticleCard key={item._id} item={item} />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={col.icon} isAdmin={isAdmin} />
                )}
              </div>
            </div>
          );
        })() : (

          /* ══════════════════════════════════════════════════
              DEFAULT VIEW — 4 columns, each with own scroll
              ══════════════════════════════════════════════════ */
          <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {visibleColumns.map((col) => (
              /*
               * Each column: full height, flex-col.
               * The inner scroll div gets overflow-y-auto only on lg+
               * so mobile just extends naturally.
               */
              <div key={col.key} className="flex flex-col min-h-[300px] lg:h-full lg:min-h-0">

                {/* Column header */}
                <div className="flex items-center justify-between mb-3 px-0.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <col.icon size={14} className="text-ink-500" />
                    <h2 className="font-display text-[15px] sm:text-[17px] text-ink-800 tracking-tight">
                      {col.label}
                    </h2>
                  </div>
                  <span className="text-[11px] text-ink-400 uppercase tracking-wider font-mono">
                    {loading ? '…' : data[col.key]?.length || 0}
                  </span>
                </div>

                {/* ← THIS is the independently scrolling area on desktop */}
                <div className="space-y-3 pb-4 flex-1 lg:overflow-y-auto lg:pr-1">
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                    : data[col.key]?.length
                      ? data[col.key].map((item) => <ArticleCard key={item._id} item={item} />)
                      : <EmptyState icon={col.icon} isAdmin={isAdmin} />
                  }
                </div>

              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
