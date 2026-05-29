import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import FilterPanel from '@/components/FilterPanel';

function countActive(filters) {
  return (
    (filters.brands?.length || 0) +
    (filters.types?.length || 0) +
    (filters.cc?.min || filters.cc?.max ? 1 : 0) +
    (filters.price?.min || filters.price?.max ? 1 : 0)
  );
}

export default function ResponsiveFilters({ meta, value, onChange }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const active = countActive(value);

  return (
    <>
      {/* Mobile: trigger button */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2 active:scale-95">
              <Filter className="h-4 w-4 text-primary" />
              {t('filter.title')}
              {active > 0 && (
                <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {active}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full overflow-y-auto p-0 sm:max-w-sm">
            <SheetHeader className="border-b border-border/60 p-4">
              <SheetTitle className="text-left">{t('filter.title')}</SheetTitle>
            </SheetHeader>
            <div className="p-4">
              <FilterPanel meta={meta} value={value} onChange={onChange} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: inline sidebar */}
      <div className="hidden lg:block">
        <FilterPanel meta={meta} value={value} onChange={onChange} />
      </div>
    </>
  );
}
