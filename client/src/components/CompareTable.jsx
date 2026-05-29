import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, formatPrice, formatNumber } from '@/lib/utils';

const FALLBACK_IMG = 'https://placehold.co/300x200/1f1f1f/666666?text=No+Image';

const SECTIONS = [
  {
    titleKey: 'compare.section.overview',
    rows: [
      { labelKey: 'compare.row.brand', key: (m) => m.brand },
      { labelKey: 'compare.row.model', key: (m) => m.model },
      { labelKey: 'compare.row.year', key: (m) => m.year, numeric: true, higherBetter: true },
      { labelKey: 'compare.row.type', key: (m) => m.type },
      { labelKey: 'compare.row.price', key: (m) => formatPrice(m.price), numeric: true, value: (m) => Number(m.price), higherBetter: false },
    ],
  },
  {
    titleKey: 'compare.section.engine',
    rows: [
      { labelKey: 'compare.row.engineSize', key: (m) => formatNumber(m.engineCc, 'cc'), numeric: true, value: (m) => Number(m.engineCc), higherBetter: true },
      { labelKey: 'compare.row.engineType', key: (m) => m.engineType || '-' },
      { labelKey: 'compare.row.horsepower', key: (m) => formatNumber(m.horsepower, 'HP'), numeric: true, value: (m) => Number(m.horsepower) || 0, higherBetter: true },
      { labelKey: 'compare.row.torque', key: (m) => formatNumber(m.torque, 'Nm'), numeric: true, value: (m) => Number(m.torque) || 0, higherBetter: true },
      { labelKey: 'compare.row.transmission', key: (m) => m.transmission || '-' },
    ],
  },
  {
    titleKey: 'compare.section.brakes',
    rows: [
      { labelKey: 'compare.row.frontBrake', key: (m) => m.frontBrake || '-' },
      { labelKey: 'compare.row.rearBrake', key: (m) => m.rearBrake || '-' },
      { labelKey: 'compare.row.frontSuspension', key: (m) => m.frontSuspension || '-' },
      { labelKey: 'compare.row.rearSuspension', key: (m) => m.rearSuspension || '-' },
    ],
  },
  {
    titleKey: 'compare.section.dimensions',
    rows: [
      { labelKey: 'compare.row.weight', key: (m) => formatNumber(m.weightKg, 'kg'), numeric: true, value: (m) => Number(m.weightKg) || Infinity, higherBetter: false },
      { labelKey: 'compare.row.seatHeight', key: (m) => formatNumber(m.seatHeightMm, 'mm') },
      { labelKey: 'compare.row.fuelCapacity', key: (m) => formatNumber(m.fuelCapacityL, 'L'), numeric: true, value: (m) => Number(m.fuelCapacityL) || 0, higherBetter: true },
    ],
  },
];

function rowDiffers(motorcycles, getter) {
  const values = motorcycles.map((m) => String(getter(m)));
  return new Set(values).size > 1;
}

function findWinners(motorcycles, row) {
  if (!row.numeric || !row.value) return new Set();
  const values = motorcycles.map((m) => row.value(m));
  if (values.every((v) => !v || v === Infinity)) return new Set();
  const best = row.higherBetter
    ? Math.max(...values.filter((v) => v && v !== Infinity))
    : Math.min(...values.filter((v) => v && v !== Infinity));
  const winners = new Set();
  motorcycles.forEach((m) => {
    if (row.value(m) === best) winners.add(m.id);
  });
  return winners.size === motorcycles.length ? new Set() : winners;
}

export default function CompareTable({ motorcycles, onRemove }) {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-full overflow-x-auto overflow-y-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm scrollbar-thin">
      <table className="w-full text-sm">
        <thead className="sticky top-16 z-20 bg-background/95 backdrop-blur-xl">
          <tr className="border-b border-border">
            <th className="w-[120px] p-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground sm:w-[160px]">{t('compare.row.item')}</th>
            {motorcycles.map((m) => (
              <th key={m.id} className="min-w-[160px] p-3 text-left align-top sm:min-w-[200px]">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-primary">{m.brand}</div>
                    <div className="truncate text-sm font-extrabold leading-tight md:text-base">{m.model}</div>
                    <Badge variant="secondary" className="mt-1 text-[10px]">{m.type}</Badge>
                  </div>
                  {onRemove && (
                    <button
                      onClick={() => onRemove(m.id)}
                      className="shrink-0 rounded-full p-1 transition-colors hover:bg-destructive hover:text-destructive-foreground"
                      aria-label="remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Preview images (non-sticky, scrolls away normally) */}
          <tr className="border-b border-border/40">
            <td className="p-3" />
            {motorcycles.map((m) => (
              <td key={m.id} className="p-3 align-top">
                <img
                  src={m.imageUrl || FALLBACK_IMG}
                  alt={m.model}
                  className="aspect-[4/3] w-full max-w-[220px] rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />
              </td>
            ))}
          </tr>

          {SECTIONS.map((section) => (
            <Fragment key={section.titleKey}>
              <tr className="bg-muted/30">
                <td colSpan={motorcycles.length + 1} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t(section.titleKey)}
                </td>
              </tr>
              {section.rows.map((row) => {
                const differs = rowDiffers(motorcycles, row.key);
                const winners = findWinners(motorcycles, row);
                return (
                  <tr
                    key={`${section.titleKey}-${row.labelKey}`}
                    className={cn('border-t border-border/40 transition-colors', differs && 'border-l-2 border-l-primary/60 bg-primary/[0.03]')}
                  >
                    <td className="p-3 font-semibold text-muted-foreground">{t(row.labelKey)}</td>
                    {motorcycles.map((m) => {
                      const isWinner = winners.has(m.id);
                      return (
                        <td key={m.id} className="p-3 align-top">
                          <div className="flex items-center gap-2">
                            <span className={cn(isWinner && 'font-bold text-primary')}>
                              {row.key(m)}
                            </span>
                            {isWinner && (
                              <span title={t('compare.bestValue')} className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                                <Trophy className="h-3 w-3" />
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
