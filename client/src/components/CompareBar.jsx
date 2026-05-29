import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { X, GitCompareArrows, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompare } from '@/contexts/CompareContext';

const FALLBACK_IMG = 'https://placehold.co/120x80/1f1f1f/666666?text=No+Img';

export default function CompareBar() {
  const { t } = useTranslation();
  const { items, remove, clear, max } = useCompare();

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="no-print fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-xl"
        >
          <div className="container flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-thin">
              <div className="flex shrink-0 flex-col leading-none">
                <span className="text-xs font-medium text-muted-foreground">{t('compareBar.selectedLabel')}</span>
                <span className="text-lg font-extrabold">
                  <span className="text-primary">{items.length}</span>
                  <span className="text-muted-foreground">/{max}</span>
                </span>
              </div>
              <div className="flex gap-2">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="relative shrink-0"
                    >
                      <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-2 py-1.5 transition-colors hover:border-primary/40">
                        <img
                          src={item.imageUrl || FALLBACK_IMG}
                          alt={item.model}
                          className="h-8 w-12 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_IMG;
                          }}
                        />
                        <div className="hidden sm:block">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">{item.brand}</div>
                          <div className="text-xs font-bold leading-tight">{item.model}</div>
                        </div>
                        <button
                          onClick={() => remove(item.id)}
                          className="ml-1 rounded-full p-0.5 transition-colors hover:bg-destructive hover:text-destructive-foreground"
                          aria-label={`remove ${item.model}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clear} className="hidden sm:inline-flex">
                {t('common.clear')}
              </Button>
              <Link to="/compare">
                <Button size="sm" disabled={items.length < 2} className="gap-1 active:scale-95">
                  <GitCompareArrows className="h-4 w-4" />
                  {t('compareBar.compareBtn')}
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
