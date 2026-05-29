import { cloneElement, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ImageOff, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PageMotion from '@/components/PageMotion';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

const TYPES = ['Sport', 'Naked', 'Adventure', 'Touring', 'Cruiser', 'Scooter'];

const numberOptional = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => (v === '' || v === undefined || v === null ? null : Number(v)))
  .refine((v) => v === null || !Number.isNaN(v), 'ต้องเป็นตัวเลข');

const schema = z.object({
  brand: z.string().min(1, 'จำเป็น'),
  model: z.string().min(1, 'จำเป็น'),
  year: z.coerce.number().int().min(1900).max(2100),
  type: z.enum(TYPES),
  price: z.coerce.number().nonnegative('ต้องไม่ติดลบ'),
  imageUrl: z.string().optional(),

  engineCc: z.coerce.number().int().positive('ต้องมากกว่า 0'),
  engineType: z.string().optional(),
  horsepower: numberOptional,
  torque: numberOptional,
  transmission: z.string().optional(),

  frontBrake: z.string().optional(),
  rearBrake: z.string().optional(),
  frontSuspension: z.string().optional(),
  rearSuspension: z.string().optional(),

  weightKg: numberOptional,
  seatHeightMm: numberOptional,
  fuelCapacityL: numberOptional,

  description: z.string().optional(),
});

function Field({ label, error, children }) {
  const enhanced = error ? cloneElement(children, { 'aria-invalid': true }) : children;
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</Label>
      {enhanced}
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}

function FormSection({ number, title, children }) {
  return (
    <section className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 border-b border-border/40 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-extrabold text-primary-foreground">
          {number}
        </div>
        <h2 className="text-lg font-extrabold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ImagePreview({ url }) {
  const [error, setError] = useState(false);
  useEffect(() => {
    setError(false);
  }, [url]);

  if (!url) return null;
  if (error) {
    return (
      <div className="flex h-32 items-center justify-center gap-2 rounded-lg border border-dashed border-destructive/40 bg-destructive/5 text-sm text-destructive">
        <ImageOff className="h-4 w-4" />
        โหลดรูปไม่สำเร็จ - URL ไม่ถูกต้องหรือเข้าไม่ได้
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-muted">
      <img
        src={url}
        alt="Preview"
        className="aspect-[16/9] w-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

export default function MotorcycleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  useDocumentTitle(isEdit ? 'แก้ไขข้อมูลรถ' : 'เพิ่มรถใหม่');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty, isSubmitSuccessful },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      type: 'Sport',
      price: '',
      imageUrl: '',
      engineCc: '',
      engineType: '',
      horsepower: '',
      torque: '',
      transmission: '',
      frontBrake: '',
      rearBrake: '',
      frontSuspension: '',
      rearSuspension: '',
      weightKg: '',
      seatHeightMm: '',
      fuelCapacityL: '',
      description: '',
    },
  });

  const typeValue = watch('type');
  const imageUrlValue = watch('imageUrl');

  useEffect(() => {
    const shouldWarn = isDirty && !isSubmitting && !isSubmitSuccessful;
    if (!shouldWarn) return;
    function handler(e) {
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty, isSubmitting, isSubmitSuccessful]);

  function handleCancel(e) {
    if (isDirty && !isSubmitSuccessful) {
      const ok = window.confirm('ข้อมูลที่กรอกจะไม่ถูกบันทึก ต้องการออกใช่หรือไม่?');
      if (!ok) {
        e.preventDefault();
        return;
      }
    }
    navigate('/admin/dashboard');
  }

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/motorcycles/${id}`)
      .then((r) => {
        const data = r.data;
        reset({
          ...data,
          price: data.price ?? '',
          horsepower: data.horsepower ?? '',
          torque: data.torque ?? '',
          weightKg: data.weightKg ?? '',
          seatHeightMm: data.seatHeightMm ?? '',
          fuelCapacityL: data.fuelCapacityL ?? '',
          imageUrl: data.imageUrl ?? '',
          engineType: data.engineType ?? '',
          transmission: data.transmission ?? '',
          frontBrake: data.frontBrake ?? '',
          rearBrake: data.rearBrake ?? '',
          frontSuspension: data.frontSuspension ?? '',
          rearSuspension: data.rearSuspension ?? '',
          description: data.description ?? '',
        });
      })
      .catch(() => toast.error('โหลดข้อมูลไม่สำเร็จ'))
      .finally(() => setLoading(false));
  }, [id, isEdit, reset]);

  async function onSubmit(values) {
    try {
      if (isEdit) {
        await api.put(`/motorcycles/${id}`, values);
        toast.success('แก้ไขข้อมูลสำเร็จ');
      } else {
        await api.post('/motorcycles', values);
        toast.success('เพิ่มข้อมูลสำเร็จ');
      }
      navigate('/admin/dashboard');
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]
        ? `${err.response.data.errors[0].path}: ${err.response.data.errors[0].message}`
        : err.response?.data?.message || 'บันทึกไม่สำเร็จ';
      toast.error(msg);
    }
  }

  if (loading) {
    return (
      <PageMotion>
        <div className="mx-auto max-w-4xl space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-60" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </PageMotion>
    );
  }

  return (
    <PageMotion>
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับหน้า Dashboard
        </Link>

        <div>
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">
            {isEdit ? 'แก้ไขข้อมูลรถ' : 'เพิ่มรถใหม่'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">กรอกข้อมูลให้ครบถ้วน — ช่องที่มี * จำเป็นต้องกรอก</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
          <FormSection number={1} title="ข้อมูลทั่วไป">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ยี่ห้อ *" error={errors.brand}>
                <Input {...register('brand')} placeholder="Honda" />
              </Field>
              <Field label="รุ่น *" error={errors.model}>
                <Input {...register('model')} placeholder="CBR650R" />
              </Field>
              <Field label="ปี *" error={errors.year}>
                <Input type="number" {...register('year')} />
              </Field>
              <Field label="ประเภท *" error={errors.type}>
                <Select value={typeValue} onValueChange={(v) => setValue('type', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="ราคา (บาท) *" error={errors.price}>
                <Input type="number" step="0.01" {...register('price')} />
              </Field>
              <Field label="URL รูปภาพ" error={errors.imageUrl}>
                <Input {...register('imageUrl')} placeholder="https://..." />
              </Field>
            </div>
            {imageUrlValue && (
              <div className="mt-3">
                <Label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ตัวอย่างรูป</Label>
                <ImagePreview url={imageUrlValue} />
              </div>
            )}
          </FormSection>

          <FormSection number={2} title="เครื่องยนต์">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ขนาดเครื่อง (cc) *" error={errors.engineCc}>
                <Input type="number" {...register('engineCc')} />
              </Field>
              <Field label="ประเภทเครื่อง" error={errors.engineType}>
                <Input {...register('engineType')} placeholder="Inline-4, Liquid-cooled" />
              </Field>
              <Field label="แรงม้า (HP)" error={errors.horsepower}>
                <Input type="number" step="0.1" {...register('horsepower')} />
              </Field>
              <Field label="แรงบิด (Nm)" error={errors.torque}>
                <Input type="number" step="0.1" {...register('torque')} />
              </Field>
              <Field label="ระบบเกียร์" error={errors.transmission}>
                <Input {...register('transmission')} placeholder="6-speed manual" />
              </Field>
            </div>
          </FormSection>

          <FormSection number={3} title="เบรกและช่วงล่าง">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="เบรกหน้า" error={errors.frontBrake}>
                <Input {...register('frontBrake')} />
              </Field>
              <Field label="เบรกหลัง" error={errors.rearBrake}>
                <Input {...register('rearBrake')} />
              </Field>
              <Field label="โช้คหน้า" error={errors.frontSuspension}>
                <Input {...register('frontSuspension')} />
              </Field>
              <Field label="โช้คหลัง" error={errors.rearSuspension}>
                <Input {...register('rearSuspension')} />
              </Field>
            </div>
          </FormSection>

          <FormSection number={4} title="มิติและความจุ">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="น้ำหนัก (kg)" error={errors.weightKg}>
                <Input type="number" step="0.1" {...register('weightKg')} />
              </Field>
              <Field label="ความสูงเบาะ (mm)" error={errors.seatHeightMm}>
                <Input type="number" {...register('seatHeightMm')} />
              </Field>
              <Field label="ความจุน้ำมัน (L)" error={errors.fuelCapacityL}>
                <Input type="number" step="0.1" {...register('fuelCapacityL')} />
              </Field>
            </div>
          </FormSection>

          <FormSection number={5} title="รายละเอียดเพิ่มเติม">
            <Field label="คำอธิบาย" error={errors.description}>
              <Textarea {...register('description')} rows={4} />
            </Field>
          </FormSection>

          <div className="sticky bottom-4 z-[60] flex justify-end gap-2 rounded-xl border border-border/60 bg-background/95 p-3 backdrop-blur-xl">
            <Button type="button" variant="ghost" onClick={handleCancel}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2 active:scale-95">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มรถ'}
            </Button>
          </div>
        </form>
      </div>
    </PageMotion>
  );
}
