import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2, LogIn, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageMotion from '@/components/PageMotion';
import { useAuth } from '@/contexts/AuthContext';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

export default function LoginPage() {
  useDocumentTitle('เข้าสู่ระบบ Admin');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(username, password);
      toast.success('เข้าสู่ระบบสำเร็จ');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageMotion>
      <div className="relative mx-auto flex max-w-md flex-col items-center justify-center py-16">
        <div className="absolute inset-0 -z-10 gradient-hero opacity-60" />
        <Card className="glass-card w-full glow-red-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl font-extrabold">เข้าสู่ระบบผู้ดูแล</CardTitle>
            <CardDescription>กรอก Username และ Password เพื่อจัดการระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  autoFocus
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11"
                />
              </div>
              <Button type="submit" size="lg" className="w-full gap-2 active:scale-95" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                เข้าสู่ระบบ
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageMotion>
  );
}
