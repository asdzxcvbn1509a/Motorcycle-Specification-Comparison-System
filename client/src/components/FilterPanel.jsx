import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function FilterPanel({ meta, value, onChange }) {
  const { t } = useTranslation();
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  function toggleArrayValue(key, item) {
    const arr = local[key] || [];
    const next = arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
    const updated = { ...local, [key]: next };
    setLocal(updated);
    onChange(updated);
  }

  function setRange(key, field, val) {
    const updated = { ...local, [key]: { ...local[key], [field]: val } };
    setLocal(updated);
    onChange(updated);
  }

  function reset() {
    const cleared = { brands: [], types: [], cc: {}, price: {} };
    setLocal(cleared);
    onChange(cleared);
  }

  const activeCount =
    (local.brands?.length || 0) +
    (local.types?.length || 0) +
    (local.cc?.min || local.cc?.max ? 1 : 0) +
    (local.price?.min || local.price?.max ? 1 : 0);

  return (
    <aside className="sticky top-20 space-y-5 self-start rounded-xl border border-border/60 bg-card/40 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
          <Filter className="h-4 w-4 text-primary" />
          {t('filter.title')}
          {activeCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </h2>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={reset} className="h-7 gap-1 text-xs">
            <X className="h-3 w-3" />
            {t('common.clear')}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('filter.brand')}</Label>
        <div className="space-y-2">
          {meta?.brands?.map((brand) => {
            const checked = local.brands?.includes(brand) || false;
            return (
              <label
                key={brand}
                className="flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-primary"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleArrayValue('brands', brand)}
                />
                <span className={checked ? 'font-semibold' : ''}>{brand}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('filter.type')}</Label>
        <div className="space-y-2">
          {meta?.types?.map((type) => {
            const checked = local.types?.includes(type) || false;
            return (
              <label
                key={type}
                className="flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-primary"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleArrayValue('types', type)}
                />
                <span className={checked ? 'font-semibold' : ''}>{type}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('filter.engineSize')}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={t('filter.min')}
            value={local.cc?.min || ''}
            onChange={(e) => setRange('cc', 'min', e.target.value)}
            className="h-9"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder={t('filter.max')}
            value={local.cc?.max || ''}
            onChange={(e) => setRange('cc', 'max', e.target.value)}
            className="h-9"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('filter.priceRange')}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={t('filter.min')}
            value={local.price?.min || ''}
            onChange={(e) => setRange('price', 'min', e.target.value)}
            className="h-9"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder={t('filter.max')}
            value={local.price?.max || ''}
            onChange={(e) => setRange('price', 'max', e.target.value)}
            className="h-9"
          />
        </div>
      </div>
    </aside>
  );
}
