import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown, Search, Zap, Bike, Mountain, MapPin, Heart, FileText, ArrowUpDown, Clock } from 'lucide-react';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ResponsiveFilters from '@/components/ResponsiveFilters';
import Pagination from '@/components/Pagination';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { getRecentlyViewed } from '@/lib/recentlyViewed';
import MotorcycleCard from '@/components/MotorcycleCard';
import { MotorcycleGridSkeleton } from '@/components/MotorcycleCardSkeleton';
import PageMotion from '@/components/PageMotion';
import { cn } from '@/lib/utils';

const DEFAULT_FILTERS = { brands: [], types: [], cc: {}, price: {} };

const SORT_OPTIONS = [
  { value: 'default', labelKey: 'sort.default' },
  { value: 'price:asc', labelKey: 'sort.priceAsc', sort: 'price', order: 'asc' },
  { value: 'price:desc', labelKey: 'sort.priceDesc', sort: 'price', order: 'desc' },
  { value: 'horsepower:desc', labelKey: 'sort.hpDesc', sort: 'horsepower', order: 'desc' },
  { value: 'engineCc:desc', labelKey: 'sort.ccDesc', sort: 'engineCc', order: 'desc' },
  { value: 'engineCc:asc', labelKey: 'sort.ccAsc', sort: 'engineCc', order: 'asc' },
  { value: 'year:desc', labelKey: 'sort.yearDesc', sort: 'year', order: 'desc' },
];

const PAGE_SIZE = 12;

const CATEGORIES = [
  { type: 'Sport', label: 'Sport', icon: Zap, color: 'from-red-500 to-orange-500' },
  { type: 'Naked', label: 'Naked', icon: Bike, color: 'from-orange-500 to-yellow-500' },
  { type: 'Adventure', label: 'Adventure', icon: Mountain, color: 'from-emerald-500 to-teal-500' },
  { type: 'Touring', label: 'Touring', icon: MapPin, color: 'from-blue-500 to-indigo-500' },
  { type: 'Cruiser', label: 'Cruiser', icon: Heart, color: 'from-purple-500 to-pink-500' },
  { type: 'Scooter', label: 'Scooter', icon: FileText, color: 'from-sky-500 to-cyan-500' },
];

function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function Hero({ onSearchClick, totalCount }) {
  const { t } = useTranslation();
  return (
    <section className="relative -mt-6 mb-10 overflow-hidden rounded-2xl border border-border/60 bg-card/40 px-4 py-10 backdrop-blur-sm sm:px-6 sm:py-16 md:py-24">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22><path d=%22M0 0h60v60H0z%22 fill=%22none%22/><path d=%22M30 0v60M0 30h60%22 stroke=%22%23ffffff%22 stroke-opacity=%220.03%22/></svg>')] opacity-50" />
      <div className="relative mx-auto max-w-3xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary sm:text-xs">
          <Zap className="h-3 w-3" />
          {t('home.heroBadge', { count: totalCount })}
        </div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
          {t('home.heroTitle')} <span className="gradient-text">{t('home.heroTitleHighlight')}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base md:text-lg">
          {t('home.heroSubtitle')}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-8">
          <Button size="lg" onClick={onSearchClick} className="gap-2 active:scale-95">
            <Search className="h-4 w-4" />
            {t('home.heroCta')}
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function CategoryStrip({ activeTypes, onToggleType }) {
  const { t } = useTranslation();
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('home.categories')}</h2>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const active = activeTypes?.includes(c.type);
          return (
            <button
              key={c.type}
              onClick={() => onToggleType(c.type)}
              className={cn(
                'group relative overflow-hidden rounded-xl border border-border/60 bg-card/40 p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10',
                active && 'border-primary/60 bg-primary/5'
              )}
            >
              <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-10', c.color)} />
              <div className="relative flex flex-col items-center gap-2">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-md', c.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn('text-xs font-bold', active && 'text-primary')}>{c.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function FeaturedStrip({ motorcycles }) {
  const { t } = useTranslation();
  if (motorcycles.length === 0) return null;
  const top4 = [...motorcycles].sort((a, b) => Number(b.price) - Number(a.price)).slice(0, 4);
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">{t('home.featured')}</h2>
          <p className="text-sm text-muted-foreground">{t('home.featuredHint')}</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {top4.map((m) => (
          <MotorcycleCard key={m.id} motorcycle={m} />
        ))}
      </div>
    </section>
  );
}

function RecentlyViewedStrip({ allMotorcycles }) {
  const { t } = useTranslation();
  const recentIds = getRecentlyViewed();
  if (recentIds.length === 0 || allMotorcycles.length === 0) return null;
  const lookup = new Map(allMotorcycles.map((m) => [m.id, m]));
  const recent = recentIds.map((id) => lookup.get(id)).filter(Boolean);
  if (recent.length === 0) return null;
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
            <Clock className="h-5 w-5 text-primary" />
            {t('home.recentlyViewed')}
          </h2>
          <p className="text-sm text-muted-foreground">{t('home.recentlyViewedHint')}</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {recent.map((m) => (
          <MotorcycleCard key={m.id} motorcycle={m} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  useDocumentTitle(t('home.pageTitle'));
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState('default');
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState({ data: [], total: 0, totalPages: 0 });
  const [allMotorcycles, setAllMotorcycles] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const gridRef = useRef(null);

  const debouncedSearch = useDebounced(search, 300);

  useEffect(() => {
    api.get('/motorcycles/meta/filters').then((r) => setMeta(r.data)).catch(() => {});
    api.get('/motorcycles', { params: { limit: 1000 } }).then((r) => setAllMotorcycles(r.data.data || [])).catch(() => {});
  }, []);

  const params = useMemo(() => {
    const p = { page, limit: PAGE_SIZE };
    if (debouncedSearch) p.search = debouncedSearch;
    if (filters.brands?.length) p.brand = filters.brands.join(',');
    if (filters.types?.length) p.type = filters.types.join(',');
    if (filters.cc?.min) p.minCc = filters.cc.min;
    if (filters.cc?.max) p.maxCc = filters.cc.max;
    if (filters.price?.min) p.minPrice = filters.price.min;
    if (filters.price?.max) p.maxPrice = filters.price.max;
    const sortOpt = SORT_OPTIONS.find((s) => s.value === sort);
    if (sortOpt?.sort) {
      p.sort = sortOpt.sort;
      p.order = sortOpt.order;
    }
    return p;
  }, [debouncedSearch, filters, page, sort]);

  // Reset to page 1 when filters/search/sort change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters, sort]);

  useEffect(() => {
    setLoading(true);
    api
      .get('/motorcycles', { params })
      .then((r) => setPageData(r.data))
      .finally(() => setLoading(false));
  }, [params]);

  const motorcycles = pageData.data;

  function toggleCategory(type) {
    const current = filters.types || [];
    const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
    setFilters({ ...filters, types: next });
    scrollToGrid();
  }

  function scrollToGrid() {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <PageMotion>
      <Hero onSearchClick={scrollToGrid} totalCount={allMotorcycles.length || 18} />
      <CategoryStrip activeTypes={filters.types} onToggleType={toggleCategory} />
      <RecentlyViewedStrip allMotorcycles={allMotorcycles} />
      <FeaturedStrip motorcycles={allMotorcycles} />

      <section ref={gridRef} className="scroll-mt-20">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">{t('home.all')}</h2>
            <p className="text-sm text-muted-foreground">{t('home.allHint')}</p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('home.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 pl-10"
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-12 sm:w-[200px]">
              <ArrowUpDown className="mr-1 h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <ResponsiveFilters meta={meta} value={filters} onChange={setFilters} />

          <div className="min-w-0">
            {loading ? (
              <MotorcycleGridSkeleton count={6} />
            ) : motorcycles.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/40 text-center text-muted-foreground backdrop-blur-sm">
                <Search className="mb-2 h-10 w-10 opacity-30" />
                <p className="font-semibold">{t('common.noResultsFiltered')}</p>
                <p className="text-xs">{t('common.tryClear')}</p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  {t('home.foundCount', { count: pageData.total })}
                  {pageData.totalPages > 1 && (
                    <span> · {t('home.page', { page, total: pageData.totalPages })}</span>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {motorcycles.map((m) => (
                    <MotorcycleCard key={m.id} motorcycle={m} />
                  ))}
                </div>
                <div className="mt-6">
                  <Pagination page={page} totalPages={pageData.totalPages} onPageChange={(p) => { setPage(p); gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} />
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </PageMotion>
  );
}
