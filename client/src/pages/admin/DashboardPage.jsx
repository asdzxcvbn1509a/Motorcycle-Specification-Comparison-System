import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Pencil, Plus, Search, Trash2, Bike, Tag, Gauge, Wallet, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ResponsiveFilters from '@/components/ResponsiveFilters';
import PageMotion from '@/components/PageMotion';
import ImportCsvDialog from '@/components/ImportCsvDialog';
import { formatPrice } from '@/lib/utils';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { downloadCsv } from '@/lib/csv';

const DEFAULT_FILTERS = { brands: [], types: [], cc: {}, price: {} };

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="glass-card flex items-center gap-3 rounded-xl p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-xl font-extrabold">{value}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const [motorcycles, setMotorcycles] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/motorcycles', { params: { limit: 1000 } });
      setMotorcycles(data.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    api.get('/motorcycles/meta/filters').then((r) => setMeta(r.data)).catch(() => {});
  }, []);

  const stats = useMemo(() => {
    if (motorcycles.length === 0) {
      return { total: 0, brands: 0, avgPrice: 0, avgCc: 0 };
    }
    const total = motorcycles.length;
    const brands = new Set(motorcycles.map((m) => m.brand)).size;
    const avgPrice = Math.round(motorcycles.reduce((s, m) => s + Number(m.price), 0) / total);
    const avgCc = Math.round(motorcycles.reduce((s, m) => s + Number(m.engineCc), 0) / total);
    return { total, brands, avgPrice, avgCc };
  }, [motorcycles]);

  const filtered = useMemo(() => {
    return motorcycles.filter((m) => {
      if (search) {
        const q = search.toLowerCase();
        if (!m.brand.toLowerCase().includes(q) && !m.model.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (filters.brands?.length && !filters.brands.includes(m.brand)) return false;
      if (filters.types?.length && !filters.types.includes(m.type)) return false;
      const cc = Number(m.engineCc);
      if (filters.cc?.min && cc < Number(filters.cc.min)) return false;
      if (filters.cc?.max && cc > Number(filters.cc.max)) return false;
      const price = Number(m.price);
      if (filters.price?.min && price < Number(filters.price.min)) return false;
      if (filters.price?.max && price > Number(filters.price.max)) return false;
      return true;
    });
  }, [motorcycles, search, filters]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/motorcycles/${deleteTarget.id}`);
      toast.success(`ลบ ${deleteTarget.brand} ${deleteTarget.model} แล้ว`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'ลบไม่สำเร็จ');
    } finally {
      setDeleting(false);
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    const allFilteredIds = filtered.map((m) => m.id);
    const allSelected = allFilteredIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allFilteredIds));
    }
  }

  async function handleBulkDelete() {
    setBulkDeleting(true);
    const ids = Array.from(selectedIds);
    try {
      const results = await Promise.allSettled(
        ids.map((id) => api.delete(`/motorcycles/${id}`))
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      const succeeded = ids.length - failed;
      if (succeeded > 0) toast.success(`ลบสำเร็จ ${succeeded} รุ่น`);
      if (failed > 0) toast.error(`ลบไม่สำเร็จ ${failed} รุ่น`);
      setSelectedIds(new Set());
      setBulkConfirm(false);
      load();
    } finally {
      setBulkDeleting(false);
    }
  }

  function handleExportCsv() {
    if (motorcycles.length === 0) {
      toast.error('ไม่มีข้อมูลให้ export');
      return;
    }
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(motorcycles, `motorcycles-${date}.csv`);
    toast.success(`ดาวน์โหลด CSV (${motorcycles.length} รุ่น)`);
  }

  return (
    <PageMotion>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">จัดการข้อมูลรถมอเตอร์ไซค์</h1>
            <p className="mt-1 text-sm text-muted-foreground">เพิ่ม / แก้ไข / ลบ ข้อมูลสเปครถในระบบ</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)} className="gap-2 active:scale-95">
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
            <Button variant="outline" onClick={handleExportCsv} className="gap-2 active:scale-95">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Link to="/admin/motorcycles/new">
              <Button size="lg" className="gap-2 active:scale-95">
                <Plus className="h-4 w-4" />
                เพิ่มรถใหม่
              </Button>
            </Link>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="sticky top-16 z-30 flex items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 backdrop-blur-xl">
            <span className="text-sm font-semibold">
              เลือกแล้ว <span className="text-primary">{selectedIds.size}</span> รุ่น
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                ยกเลิก
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkConfirm(true)}
                className="gap-1 active:scale-95"
              >
                <Trash2 className="h-3.5 w-3.5" />
                ลบทั้งหมด
              </Button>
            </div>
          </div>
        )}

        {/* Stats strip */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard icon={Bike} label="รถทั้งหมด" value={stats.total} accent />
          <StatCard icon={Tag} label="ยี่ห้อ" value={stats.brands} />
          <StatCard icon={Wallet} label="ราคาเฉลี่ย" value={formatPrice(stats.avgPrice)} />
          <StatCard icon={Gauge} label="CC เฉลี่ย" value={`${stats.avgCc} cc`} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <ResponsiveFilters meta={meta} value={filters} onChange={setFilters} />

          <div className="min-w-0 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหาในรายการ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-10"
              />
            </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground">
                  แสดง <span className="font-bold text-foreground">{filtered.length}</span> จาก{' '}
                  <span className="font-bold text-foreground">{motorcycles.length}</span> รุ่น
                </div>
                <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="border-border/60 hover:bg-transparent">
                        <TableHead className="w-10">
                          <Checkbox
                            checked={filtered.length > 0 && filtered.every((m) => selectedIds.has(m.id))}
                            onCheckedChange={toggleSelectAll}
                            aria-label="เลือกทั้งหมด"
                          />
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">ยี่ห้อ / รุ่น</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">ประเภท</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">ปี</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">CC</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">ราคา</TableHead>
                        <TableHead className="text-right text-xs font-bold uppercase tracking-wider">การจัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                            <Search className="mx-auto mb-2 h-8 w-8 opacity-30" />
                            ไม่พบข้อมูลที่ตรงกับเงื่อนไข
                          </TableCell>
                        </TableRow>
                      ) : (
                        filtered.map((m) => (
                          <TableRow key={m.id} className="border-border/40 transition-colors hover:bg-primary/5 data-[selected=true]:bg-primary/10" data-selected={selectedIds.has(m.id) || undefined}>
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.has(m.id)}
                                onCheckedChange={() => toggleSelect(m.id)}
                                aria-label={`เลือก ${m.brand} ${m.model}`}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-primary">{m.brand}</div>
                              <div className="font-semibold">{m.model}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{m.type}</Badge>
                            </TableCell>
                            <TableCell>{m.year}</TableCell>
                            <TableCell>{m.engineCc}</TableCell>
                            <TableCell className="font-semibold">{formatPrice(m.price)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link to={`/admin/motorcycles/${m.id}/edit`}>
                                  <Button variant="outline" size="sm" className="gap-1 active:scale-95" aria-label="แก้ไข">
                                    <Pencil className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">แก้ไข</span>
                                  </Button>
                                </Link>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="gap-1 active:scale-95"
                                  onClick={() => setDeleteTarget(m)}
                                  aria-label="ลบ"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">ลบ</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        </div>

        <ImportCsvDialog open={importOpen} onOpenChange={setImportOpen} onComplete={load} />

        <Dialog open={bulkConfirm} onOpenChange={(open) => !open && setBulkConfirm(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ยืนยันการลบหลายรุ่น</DialogTitle>
              <DialogDescription>
                ต้องการลบ <strong className="text-foreground">{selectedIds.size}</strong> รุ่นที่เลือกใช่หรือไม่?
                การกระทำนี้ไม่สามารถย้อนกลับได้
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setBulkConfirm(false)}>
                ยกเลิก
              </Button>
              <Button variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleting} className="gap-2 active:scale-95">
                {bulkDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                ยืนยันลบ {selectedIds.size} รุ่น
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ยืนยันการลบ</DialogTitle>
              <DialogDescription>
                ต้องการลบ <strong className="text-foreground">{deleteTarget?.brand} {deleteTarget?.model}</strong> ใช่หรือไม่?
                การกระทำนี้ไม่สามารถย้อนกลับได้
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                ยกเลิก
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="gap-2 active:scale-95">
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                ยืนยันการลบ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageMotion>
  );
}
