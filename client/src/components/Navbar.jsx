import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bike, GitCompareArrows, Heart, LogOut, ShieldCheck, Home, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useCompare } from '@/contexts/CompareContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { cn } from '@/lib/utils';

function NavLink({ to, icon: Icon, children, active, onClick, fullWidth }) {
  return (
    <Link to={to} onClick={onClick} className={fullWidth ? 'w-full' : undefined}>
      <Button
        variant={active ? 'secondary' : 'ghost'}
        size="sm"
        className={cn(
          'gap-1.5',
          active && 'font-semibold',
          fullWidth && 'w-full justify-start'
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {children}
      </Button>
    </Link>
  );
}

function Badge({ count }) {
  if (!count) return null;
  return (
    <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
      {count}
    </span>
  );
}

function NavItems({ pathname, items, favoritesCount, onClickItem, fullWidth = false }) {
  const { t } = useTranslation();
  return (
    <>
      <NavLink to="/" icon={Home} active={pathname === '/'} onClick={onClickItem} fullWidth={fullWidth}>
        <span className={fullWidth ? '' : 'hidden sm:inline'}>{t('nav.search')}</span>
      </NavLink>
      <NavLink to="/compare" icon={GitCompareArrows} active={pathname === '/compare'} onClick={onClickItem} fullWidth={fullWidth}>
        <span className={fullWidth ? '' : 'hidden sm:inline'}>{t('nav.compare')}</span>
        <Badge count={items.length} />
      </NavLink>
      <NavLink to="/favorites" icon={Heart} active={pathname === '/favorites'} onClick={onClickItem} fullWidth={fullWidth}>
        <span className={fullWidth ? '' : 'hidden sm:inline'}>{t('nav.favorites')}</span>
        <Badge count={favoritesCount} />
      </NavLink>
    </>
  );
}

function AdminSection({ isAuthenticated, user, onLogout, onClickItem, fullWidth = false }) {
  const { t } = useTranslation();
  if (isAuthenticated) {
    return (
      <>
        <Link to="/admin/dashboard" onClick={onClickItem} className={fullWidth ? 'w-full' : undefined}>
          <Button variant="outline" size="sm" className={cn('gap-1.5', fullWidth && 'w-full justify-start')}>
            <ShieldCheck className="h-4 w-4" />
            <span className={fullWidth ? '' : 'hidden md:inline'}>{user?.username}</span>
            {fullWidth && <span className="ml-auto text-xs text-muted-foreground">{t('nav.dashboard')}</span>}
          </Button>
        </Link>
        <Button
          variant="ghost"
          size={fullWidth ? 'sm' : 'icon'}
          onClick={() => {
            onClickItem?.();
            onLogout();
          }}
          aria-label={t('nav.logout')}
          className={cn(fullWidth ? 'w-full justify-start gap-1.5' : 'h-9 w-9')}
        >
          <LogOut className="h-4 w-4" />
          {fullWidth && <span>{t('nav.logout')}</span>}
        </Button>
      </>
    );
  }
  return (
    <Link to="/admin/login" onClick={onClickItem} className={fullWidth ? 'w-full' : undefined}>
      <Button variant="outline" size="sm" className={cn('gap-1.5', fullWidth && 'w-full justify-start')}>
        <ShieldCheck className="h-4 w-4" />
        <span className={fullWidth ? '' : 'hidden sm:inline'}>
          {fullWidth ? t('nav.adminLogin') : t('nav.admin')}
        </span>
      </Button>
    </Link>
  );
}

export default function Navbar() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const { items } = useCompare();
  const { count: favoritesCount } = useFavorites();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/admin/login');
  }

  const totalBadge = items.length + favoritesCount;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="group flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-110">
            <Bike className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-extrabold tracking-tight">MotoSpec</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Compare</span>
          </div>
        </Link>

        {/* Desktop nav (md+) */}
        <nav className="hidden items-center gap-1 md:flex">
          <NavItems
            pathname={pathname}
            items={items}
            favoritesCount={favoritesCount}
          />
          <div className="mx-1 h-6 w-px bg-border" />
          <LanguageSwitcher />
          <ThemeToggle />
          <AdminSection
            isAuthenticated={isAuthenticated}
            user={user}
            onLogout={handleLogout}
          />
        </nav>

        {/* Mobile: quick toggles + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <LanguageSwitcher />
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('nav.menu')}
                className="relative h-9 w-9"
              >
                <Menu className="h-5 w-5" />
                {totalBadge > 0 && (
                  <span className="absolute right-0.5 top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                    {totalBadge}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0 sm:max-w-xs">
              <SheetHeader className="border-b border-border/60 p-4">
                <SheetTitle className="text-left">{t('nav.menu')}</SheetTitle>
              </SheetHeader>
              <div className="space-y-1 p-3">
                <NavItems
                  pathname={pathname}
                  items={items}
                  favoritesCount={favoritesCount}
                  onClickItem={() => setMobileOpen(false)}
                  fullWidth
                />
              </div>
              <div className="border-t border-border/60 p-3">
                <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Admin
                </p>
                <div className="space-y-1">
                  <AdminSection
                    isAuthenticated={isAuthenticated}
                    user={user}
                    onLogout={handleLogout}
                    onClickItem={() => setMobileOpen(false)}
                    fullWidth
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
