import { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const REQUIRED = ['brand', 'model', 'year', 'type', 'price', 'engineCc'];
const NUMERIC = ['year', 'price', 'engineCc', 'horsepower', 'torque', 'weightKg', 'seatHeightMm', 'fuelCapacityL'];

function normalizeRow(row) {
  const out = {};
  for (const key of Object.keys(row)) {
    const v = row[key];
    if (v === '' || v === null || v === undefined) {
      out[key] = null;
    } else if (NUMERIC.includes(key)) {
      const n = Number(v);
      out[key] = Number.isNaN(n) ? null : n;
    } else {
      out[key] = v;
    }
  }
  return out;
}

function validateRow(row) {
  for (const f of REQUIRED) {
    if (row[f] === null || row[f] === undefined || row[f] === '') {
      return `ขาด field "${f}"`;
    }
  }
  return null;
}

export default function ImportCsvDialog({ open, onOpenChange, onComplete }) {
  const [rows, setRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  function reset() {
    setRows([]);
    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length > 0) {
          toast.error(`Parse error: ${result.errors[0].message}`);
          return;
        }
        const normalized = result.data.map(normalizeRow);
        setRows(normalized);
      },
      error: (err) => toast.error(`อ่านไฟล์ไม่ได้: ${err.message}`),
    });
  }

  async function handleImport() {
    setImporting(true);
    let success = 0;
    let failed = 0;
    for (const row of rows) {
      const error = validateRow(row);
      if (error) {
        failed++;
        continue;
      }
      const { id: _id, createdAt: _c, updatedAt: _u, ...data } = row;
      try {
        await api.post('/motorcycles', data);
        success++;
      } catch {
        failed++;
      }
    }
    setImporting(false);
    if (success > 0) toast.success(`Import สำเร็จ ${success} รุ่น`);
    if (failed > 0) toast.error(`Import ไม่สำเร็จ ${failed} รุ่น`);
    reset();
    onOpenChange(false);
    onComplete?.();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            นำเข้าข้อมูลจาก CSV
          </DialogTitle>
          <DialogDescription>
            อัปโหลดไฟล์ CSV (เช่นที่ Export มา) — ต้องมี column: brand, model, year, type, price, engineCc
          </DialogDescription>
        </DialogHeader>

        {rows.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-card/40 text-center backdrop-blur-sm transition-colors hover:border-primary/50 hover:bg-card"
          >
            <Upload className="h-8 w-8 text-primary" />
            <p className="text-sm font-medium">คลิกเพื่อเลือกไฟล์ CSV</p>
            <p className="text-xs text-muted-foreground">หรือ drag-drop ที่นี่</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFile}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm">
              พบ <span className="font-bold text-primary">{rows.length}</span> แถวพร้อม import
            </p>
            <div className="max-h-60 overflow-auto rounded-lg border border-border/60">
              <table className="w-full text-xs">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Brand</th>
                    <th className="p-2 text-left">Model</th>
                    <th className="p-2 text-left">Year</th>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 10).map((r, i) => {
                    const err = validateRow(r);
                    return (
                      <tr key={i} className={err ? 'bg-destructive/10' : ''}>
                        <td className="p-2 text-muted-foreground">{i + 1}</td>
                        <td className="p-2">{r.brand || <span className="text-destructive">-</span>}</td>
                        <td className="p-2">{r.model || <span className="text-destructive">-</span>}</td>
                        <td className="p-2">{r.year || <span className="text-destructive">-</span>}</td>
                        <td className="p-2">{r.type || <span className="text-destructive">-</span>}</td>
                        <td className="p-2">{r.price || <span className="text-destructive">-</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {rows.length > 10 && (
                <p className="p-2 text-center text-xs text-muted-foreground">… และอีก {rows.length - 10} แถว</p>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={importing}>
            ยกเลิก
          </Button>
          {rows.length > 0 && (
            <Button onClick={handleImport} disabled={importing} className="gap-2 active:scale-95">
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              นำเข้า {rows.length} รุ่น
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
