import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import PageMotion from '@/components/PageMotion';
import MotorcycleCard from '@/components/MotorcycleCard';
import { MotorcycleGridSkeleton } from '@/components/MotorcycleCardSkeleton';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

export default function FavoritesPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('favorites.pageTitle'));
  const { ids, clear } = useFavorites();
  const [motorcycles, setMotorcycles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setMotorcycles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(ids.map((id) => api.get(`/motorcycles/${id}`).catch(() => null)))
      .then((results) => {
        setMotorcycles(results.filter(Boolean).map((r) => r.data));
      })
      .finally(() => setLoading(false));
  }, [ids]);

  const favorited = useMemo(() => {
    const idSet = new Set(ids);
    return motorcycles.filter((m) => idSet.has(m.id));
  }, [motorcycles, ids]);

  return (
    <PageMotion>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight md:text-4xl">
              <Heart className="h-7 w-7 fill-primary text-primary" />
              {t('favorites.pageTitle')}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('favorites.subtitle', { count: ids.length })}
            </p>
          </div>
          {ids.length > 0 && (
            <Button variant="outline" size="sm" onClick={clear}>
              {t('common.clear')}
            </Button>
          )}
        </div>

        {loading ? (
          <MotorcycleGridSkeleton count={Math.min(ids.length || 3, 6)} />
        ) : favorited.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-card/40 text-center backdrop-blur-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Heart className="h-7 w-7 text-primary" />
            </div>
            <p className="text-base font-semibold">{t('favorites.empty')}</p>
            <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              {t('favorites.emptyHint')}
              <Heart className="h-3.5 w-3.5" />
            </p>
            <Link to="/" className="mt-2">
              <Button>{t('compare.goSelect')}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorited.map((m) => (
              <MotorcycleCard key={m.id} motorcycle={m} />
            ))}
          </div>
        )}
      </div>
    </PageMotion>
  );
}
