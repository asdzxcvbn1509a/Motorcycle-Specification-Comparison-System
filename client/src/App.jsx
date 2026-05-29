import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import CompareBar from '@/components/CompareBar';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';
import { CompareProvider } from '@/contexts/CompareContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';

const HomePage = lazy(() => import('@/pages/HomePage'));
const MotorcycleDetailPage = lazy(() => import('@/pages/MotorcycleDetailPage'));
const ComparePage = lazy(() => import('@/pages/ComparePage'));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'));
const LoginPage = lazy(() => import('@/pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const MotorcycleFormPage = lazy(() => import('@/pages/admin/MotorcycleFormPage'));

function RouteFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex h-64 items-center justify-center text-muted-foreground">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      {t('common.loading')}
    </div>
  );
}

function NotFoundPage() {
  const { t } = useTranslation();
  return <div className="py-16 text-center text-muted-foreground">{t('app.routeNotFound')}</div>;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<RouteFallback />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/motorcycle/:id" element={<MotorcycleDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />

          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/motorcycles/new"
            element={
              <ProtectedRoute>
                <MotorcycleFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/motorcycles/:id/edit"
            element={
              <ProtectedRoute>
                <MotorcycleFormPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavoritesProvider>
          <CompareProvider>
            <div className="relative min-h-screen overflow-x-clip bg-background pb-32">
              <div className="pointer-events-none fixed inset-0 -z-10 gradient-radial" />
              <Navbar />
              <main className="container overflow-x-clip py-6">
                <ErrorBoundary>
                  <AnimatedRoutes />
                </ErrorBoundary>
              </main>
              <CompareBar />
              <Toaster position="top-right" richColors theme="system" />
            </div>
          </CompareProvider>
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
