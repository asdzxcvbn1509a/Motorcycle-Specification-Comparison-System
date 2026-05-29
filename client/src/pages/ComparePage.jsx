import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, GitCompareArrows, Trophy, Copy, Check, Printer, MoveHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PageMotion from '@/components/PageMotion';
import { useCompare } from '@/contexts/CompareContext';
import CompareTable from '@/components/CompareTable';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

function CompareTableSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-card/40 p-4 backdrop-blur-sm">
      <div className="flex gap-4">
        <Skeleton className="h-32 w-40" />
        <Skeleton className="h-32 w-40" />
        <Skeleton className="h-32 w-40" />
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export default function ComparePage() {
  const { t } = useTranslation();
  useDocumentTitle(t('compare.pageTitle'));
  const { items, remove, clear, replace } = useCompare();
  const [searchParams, setSearchParams] = useSearchParams();
  const [motorcycles, setMotorcycles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const urlSyncedRef = useRef(false);

  // Hydrate from URL on first load if ?ids= present
  useEffect(() => {
    const idsParam = searchParams.get('ids');
    if (!idsParam || urlSyncedRef.current) return;
    const ids = idsParam
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));
    if (ids.length === 0) return;

    const sameAsContext =
      ids.length === items.length && ids.every((id) => items.find((it) => it.id === id));
    if (sameAsContext) {
      urlSyncedRef.current = true;
      return;
    }

    setLoading(true);
    api
      .post('/motorcycles/compare', { ids })
      .then((r) => {
        replace(r.data);
        urlSyncedRef.current = true;
      })
      .catch(() => toast.error('โหลดรายการจากลิงก์ไม่สำเร็จ'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (items.length < 2) {
      setMotorcycles([]);
      return;
    }
    setLoading(true);
    api
      .post('/motorcycles/compare', { ids: items.map((i) => i.id) })
      .then((r) => setMotorcycles(r.data))
      .finally(() => setLoading(false));
  }, [items]);

  async function handleCopyLink() {
    const ids = items.map((i) => i.id).join(',');
    const url = `${window.location.origin}/compare?ids=${ids}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('คัดลอกลิงก์แล้ว');
      setSearchParams({ ids });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('คัดลอกไม่สำเร็จ');
    }
  }

  return (
    <PageMotion>
      <div className="space-y-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          {t('common.backToHome')}
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight md:text-4xl">
              <GitCompareArrows className="h-7 w-7 text-primary" />
              {t('compare.pageTitle')}
            </h1>
            <p className="mt-1 inline-flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
              {t('compare.subtitle')}
              <Trophy className="h-3.5 w-3.5 text-primary" />
            </p>
          </div>
          {items.length >= 2 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1 active:scale-95">
                <Printer className="h-3.5 w-3.5" />
                {t('compare.print')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1 active:scale-95">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? t('compare.copied') : t('compare.copyLink')}
              </Button>
              <Button variant="ghost" size="sm" onClick={clear}>
                {t('common.clear')}
              </Button>
            </div>
          )}
        </div>

        {items.length < 2 ? (
          <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-card/40 text-center backdrop-blur-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <GitCompareArrows className="h-7 w-7 text-primary" />
            </div>
            <p className="text-base font-semibold">{t('compare.minSelectHint')}</p>
            <p className="text-sm text-muted-foreground">
              {t('compare.selectedOf', { count: items.length })}
            </p>
            <Link to="/" className="mt-2">
              <Button>{t('compare.goSelect')}</Button>
            </Link>
          </div>
        ) : loading ? (
          <CompareTableSkeleton />
        ) : (
          <>
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground lg:hidden">
              <MoveHorizontal className="h-3.5 w-3.5" />
              {t('compare.scrollHint')}
            </p>
            <CompareTable motorcycles={motorcycles} onRemove={remove} />
          </>
        )}
      </div>
    </PageMotion>
  );
}
