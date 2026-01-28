import { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, RefreshCw } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useLanguage } from '../lib/contexts/LanguageContext';
import { useRefresh } from '../lib/contexts/RefreshContext';
import { apiClient } from '../lib/api';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

export function Sidebar() {
  const location = useLocation();
  const { t } = useLanguage();
  const { isRefreshing, setIsRefreshing, setRefreshJobId, triggerRefresh, setIsDataFetching } = useRefresh();
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchMetadata = async () => {
    try {
      const meta = await apiClient.getSourceMetadata();
      if (meta.last_fetched_at) {
        const date = new Date(meta.last_fetched_at);
        const formatted = date.toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        setLastUpdate(formatted);
      }
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
      setLastUpdate('N/A');
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  const handleRefreshClick = () => {
    setShowConfirm(true);
  };

  const handleRefreshConfirm = async () => {
    setShowConfirm(false);
    setIsRefreshing(true);

    try {
      const adminKey = import.meta.env.VITE_ADMIN_KEY || 'super-secret-admin-key';
      const response = await apiClient.refreshData(adminKey);

      // Set job ID for progress tracking
      setRefreshJobId(response.jobId);

      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const status = await apiClient.getRefreshJobStatus(response.jobId);

          if (status.status === 'SUCCESS') {
            clearInterval(pollInterval);

            // 1. Trigger frontend data refetch (increments trigger + sets isDataFetching=true)
            triggerRefresh();

            // 2. Close backend refresh state
            setIsRefreshing(false);
            setRefreshJobId(null);

            // 3. Refresh metadata timestamp
            await fetchMetadata();

            // 4. Fallback: if not on dashboard or data refetch fails to signal, clear after 5s
            // This ensures the overlay doesn't get stuck
            const fallbackTimeout = setTimeout(() => {
              setIsDataFetching(false);
            }, 5000);

            // If we are on dashboard, the DashboardPage will clear it sooner (500ms after fetch)
            // If we're not on dashboard, this 5s fallback (or logic below) will handle it.
            if (location.pathname !== '/') {
              setTimeout(() => {
                clearTimeout(fallbackTimeout);
                setIsDataFetching(false);
              }, 1500);
            }

            // Show success toast/event
            window.dispatchEvent(new CustomEvent('refresh-success'));
          } else if (status.status === 'ERROR') {
            clearInterval(pollInterval);
            setIsRefreshing(false);
            setRefreshJobId(null);
            window.dispatchEvent(new CustomEvent('refresh-error'));
          }
        } catch (err) {
          console.error('Poll error:', err);
        }
      }, 1000);

    } catch (error) {
      console.error('Refresh failed:', error);
      window.dispatchEvent(new CustomEvent('refresh-error'));
      setIsRefreshing(false);
      setRefreshJobId(null);
    }
  };

  const navItems = [
    {
      path: '/',
      label: t('sidebar.dashboard'),
      icon: LayoutDashboard,
    },
    {
      path: '/methodology',
      label: t('sidebar.methodology'),
      icon: BookOpen,
    },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border lg:bg-[#0F1A2B]">
        {/* Branding */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 h-[73px]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-[0_0_15px_rgba(22,163,74,0.3)] shrink-0">
            <span className="text-lg font-bold text-white">INI</span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-foreground leading-none mb-1">
              {t('header.title')}
            </h1>
            <p className="text-[10px] text-muted-foreground truncate">
              {t('header.subtitle')}
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-2 px-4 py-6">
          {navItems.map((item, index) => {
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

            return (
              <div key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    isRefreshing && "pointer-events-none opacity-50"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
                {index === 0 && (
                  <div className="my-3 h-px bg-border" />
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer with Refresh */}
        <div className="border-t border-border p-4 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">
              {t('sidebar.lastUpdate')}:
            </p>
            <p className="text-xs font-medium text-primary mt-1">
              {lastUpdate || 'Loading...'}
            </p>
          </div>

          <Button
            type="button"
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="w-full h-9 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
            variant="outline"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
            {t('sidebar.refresh')}
          </Button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white dark:bg-[#0F1A2B] px-4 py-3">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs transition-colors",
                  isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground",
                  isRefreshing && "pointer-events-none opacity-50"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('sidebar.refreshConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('sidebar.refreshConfirmBody')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('sidebar.refreshCancel')}</AlertDialogCancel>
            <AlertDialogAction type="button" onClick={handleRefreshConfirm}>
              {t('sidebar.refreshConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
