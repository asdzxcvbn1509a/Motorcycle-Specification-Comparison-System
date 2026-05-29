import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, Plus, Gauge, Zap, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCompare } from '@/contexts/CompareContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { cn, formatPrice } from '@/lib/utils';

const FALLBACK_IMG = 'https://placehold.co/600x400/1f1f1f/666666?text=No+Image';

export default function MotorcycleCard({ motorcycle }) {
  const { t } = useTranslation();
  const { toggle, has } = useCompare();
  const { has: hasFav, toggle: toggleFav } = useFavorites();
  const selected = has(motorcycle.id);
  const favorited = hasFav(motorcycle.id);

  return (
    <Card className="group relative overflow-hidden border-border/60 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-card hover:shadow-xl hover:shadow-primary/10">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggleFav(motorcycle.id);
        }}
        aria-label={favorited ? t('card.removeFavorite') : t('card.addFavorite')}
        className={cn(
          'absolute left-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/60',
          favorited && 'bg-primary/90 hover:bg-primary'
        )}
      >
        <Heart className={cn('h-4 w-4 transition-transform', favorited && 'fill-current')} />
      </button>
      {selected && (
        <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-lg">
          <Check className="h-3 w-3" />
          {t('detail.addedToCompare')}
        </div>
      )}
      <Link to={`/motorcycle/${motorcycle.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={motorcycle.imageUrl || FALLBACK_IMG}
            alt={`${motorcycle.brand} ${motorcycle.model}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMG;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">{motorcycle.brand}</span>
              <Badge variant="secondary" className="text-[10px]">{motorcycle.type}</Badge>
            </div>
            <Link to={`/motorcycle/${motorcycle.id}`}>
              <h3 className="mt-1 truncate text-lg font-bold leading-tight transition-colors group-hover:text-primary">
                {motorcycle.model}
              </h3>
            </Link>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5" />
            <span className="font-medium">{motorcycle.engineCc} cc</span>
          </span>
          {motorcycle.horsepower && (
            <span className="inline-flex items-center gap-1">
              <Zap className="h-3.5 w-3.5" />
              <span className="font-medium">{Number(motorcycle.horsepower)} HP</span>
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-base font-extrabold tracking-tight">{formatPrice(motorcycle.price)}</span>
          <Button
            size="sm"
            variant={selected ? 'default' : 'outline'}
            onClick={(e) => {
              e.preventDefault();
              toggle(motorcycle);
            }}
            className="gap-1 active:scale-95"
          >
            {selected ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>{t('card.compare')}</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
