import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, GitCompareArrows, Gauge, Zap, Wind, Scale, Plus, Heart } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import PageMotion from '@/components/PageMotion';
import StatsRadarChart from '@/components/StatsRadarChart';
import MotorcycleCard from '@/components/MotorcycleCard';
import { useCompare } from '@/contexts/CompareContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { formatPrice, formatNumber, cn } from '@/lib/utils';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { pushRecentlyViewed } from '@/lib/recentlyViewed';
import { findSimilar } from '@/lib/similar';

const FALLBACK_IMG = 'https://placehold.co/1200x800/1f1f1f/666666?text=No+Image';

function HighlightCard({ icon: Icon, label, value, unit, accent }) {
  return (
    <div className={cn(
      'group relative overflow-hidden rounded-xl border border-border/60 bg-card/40 p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/50',
      accent && 'border-primary/40 bg-primary/5'
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          accent ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="truncate text-xl font-extrabold leading-tight">
            {value}
            {unit && <span className="ml-1 text-xs font-medium text-muted-foreground">{unit}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecSection({ title, items }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">{title}</h3>
      <dl className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between gap-4 border-b border-border/40 pb-2 text-sm last:border-0 sm:border-0 sm:pb-0">
            <dt className="text-muted-foreground">{item.label}</dt>
            <dd className="text-right font-semibold">{item.value || '-'}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="aspect-[21/9] w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function MotorcycleDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { toggle, has } = useCompare();
  const { has: hasFav, toggle: toggleFav } = useFavorites();
  const [motorcycle, setMotorcycle] = useState(null);
  const [allMotorcycles, setAllMotorcycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useDocumentTitle(motorcycle ? `${motorcycle.brand} ${motorcycle.model}` : t('detail.notFound'));

  useEffect(() => {
    setLoading(true);
    api
      .get(`/motorcycles/${id}`)
      .then((r) => {
        setMotorcycle(r.data);
        pushRecentlyViewed(r.data.id);
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    api
      .get('/motorcycles', { params: { limit: 1000 } })
      .then((r) => setAllMotorcycles(r.data.data || []))
      .catch(() => {});
  }, []);

  const similar = motorcycle ? findSimilar(motorcycle, allMotorcycles, 4) : [];

  if (loading) {
    return <PageMotion><LoadingSkeleton /></PageMotion>;
  }

  if (notFound || !motorcycle) {
    return (
      <PageMotion>
        <div className="py-16 text-center">
          <p className="text-muted-foreground">{t('detail.notFound')}</p>
          <Link to="/" className="mt-4 inline-block">
            <Button variant="outline">{t('common.backToHome')}</Button>
          </Link>
        </div>
      </PageMotion>
    );
  }

  const selected = has(motorcycle.id);
  const favorited = hasFav(motorcycle.id);

  return (
    <PageMotion>
      <div className="space-y-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          {t('common.backToHome')}
        </Link>

        {/* Hero strip */}
        <div className="relative overflow-hidden rounded-2xl border border-border/60">
          <div className="aspect-[4/3] w-full bg-muted sm:aspect-video md:aspect-[21/9]">
            <img
              src={motorcycle.imageUrl || FALLBACK_IMG}
              alt={`${motorcycle.brand} ${motorcycle.model}`}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMG;
              }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3 text-white sm:gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/90 sm:text-xs">{motorcycle.brand}</span>
                  <Badge variant="secondary" className="text-[10px]">{motorcycle.type}</Badge>
                  <Badge variant="outline" className="border-white/30 text-[10px] text-white/90">{motorcycle.year}</Badge>
                </div>
                <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">{motorcycle.model}</h1>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/70">{t('detail.price')}</div>
                <div className="text-2xl font-extrabold text-primary sm:text-3xl md:text-4xl">{formatPrice(motorcycle.price)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick facts */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <HighlightCard icon={Gauge} label={t('detail.engineCc')} value={formatNumber(motorcycle.engineCc)} unit="cc" accent />
          <HighlightCard icon={Zap} label={t('detail.horsepower')} value={formatNumber(motorcycle.horsepower)} unit="HP" accent />
          <HighlightCard icon={Wind} label={t('detail.torque')} value={formatNumber(motorcycle.torque)} unit="Nm" />
          <HighlightCard icon={Scale} label={t('detail.weight')} value={formatNumber(motorcycle.weightKg)} unit="kg" />
        </div>

        {/* Description + CTA */}
        <div className="glass-card flex flex-col gap-4 rounded-xl p-6 md:flex-row md:items-center md:justify-between">
          <p className="flex-1 text-muted-foreground">{motorcycle.description || '—'}</p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              size="lg"
              variant={selected ? 'default' : 'outline'}
              onClick={() => toggle(motorcycle)}
              className="gap-2 active:scale-95"
            >
              {selected ? <><Check className="h-4 w-4" />{t('detail.addedToCompare')}</> : <><Plus className="h-4 w-4" />{t('detail.addToCompare')}</>}
            </Button>
            <Button
              size="lg"
              variant={favorited ? 'default' : 'outline'}
              onClick={() => toggleFav(motorcycle.id)}
              className={cn('gap-2 active:scale-95', favorited && 'bg-primary')}
            >
              <Heart className={cn('h-4 w-4', favorited && 'fill-current')} />
              {favorited ? t('detail.inFavorites') : t('detail.addToFavorites')}
            </Button>
            <Link to="/compare">
              <Button size="lg" variant="ghost" className="gap-2 active:scale-95">
                <GitCompareArrows className="h-4 w-4" />
                {t('detail.toComparePage')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats radar */}
        <StatsRadarChart motorcycle={motorcycle} />

        {/* Similar bikes */}
        {similar.length > 0 && (
          <section>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">{t('detail.similarBikes')}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((m) => (
                <MotorcycleCard key={m.id} motorcycle={m} />
              ))}
            </div>
          </section>
        )}

        {/* Spec sections */}
        <div className="grid gap-4 md:grid-cols-2">
          <SpecSection
            title={t('detail.engine')}
            items={[
              { label: t('detail.engineCc'), value: formatNumber(motorcycle.engineCc, 'cc') },
              { label: t('detail.engineType'), value: motorcycle.engineType },
              { label: t('detail.horsepower'), value: formatNumber(motorcycle.horsepower, 'HP') },
              { label: t('detail.torque'), value: formatNumber(motorcycle.torque, 'Nm') },
              { label: t('detail.transmission'), value: motorcycle.transmission },
            ]}
          />
          <SpecSection
            title={t('detail.brakesSuspension')}
            items={[
              { label: t('detail.frontBrake'), value: motorcycle.frontBrake },
              { label: t('detail.rearBrake'), value: motorcycle.rearBrake },
              { label: t('detail.frontSuspension'), value: motorcycle.frontSuspension },
              { label: t('detail.rearSuspension'), value: motorcycle.rearSuspension },
            ]}
          />
          <SpecSection
            title={t('detail.dimensionsCapacity')}
            items={[
              { label: t('detail.weight'), value: formatNumber(motorcycle.weightKg, 'kg') },
              { label: t('detail.seatHeight'), value: formatNumber(motorcycle.seatHeightMm, 'mm') },
              { label: t('detail.fuelCapacity'), value: formatNumber(motorcycle.fuelCapacityL, 'L') },
            ]}
          />
        </div>
      </div>
    </PageMotion>
  );
}
