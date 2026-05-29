import { Component } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">ขออภัย เกิดข้อผิดพลาด</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          มีบางอย่างทำงานไม่ถูกต้อง ลองโหลดหน้านี้ใหม่หรือกลับไปหน้าแรก
        </p>
        {import.meta.env.DEV && this.state.error && (
          <pre className="mt-4 max-w-2xl overflow-auto rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-left text-xs text-destructive">
            {String(this.state.error?.stack || this.state.error)}
          </pre>
        )}
        <div className="mt-6 flex gap-2">
          <Button onClick={this.handleReload} className="gap-2 active:scale-95">
            <RotateCw className="h-4 w-4" />
            โหลดใหม่
          </Button>
          <Button variant="outline" onClick={this.handleGoHome} className="active:scale-95">
            กลับหน้าแรก
          </Button>
        </div>
      </div>
    );
  }
}
