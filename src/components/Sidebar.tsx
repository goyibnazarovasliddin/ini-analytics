import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, BookOpen, RefreshCw, Upload, FileSpreadsheet, Lock } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useLanguage } from '../lib/contexts/LanguageContext';
import { useRefresh } from '../lib/contexts/RefreshContext';
import { apiClient } from '../lib/api';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';

export function Sidebar() {
  const location = useLocation();
  const { t } = useLanguage();
  const { isRefreshing, setIsRefreshing, setRefreshJobId, triggerRefresh, setIsDataFetching } = useRefresh();
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Upload History States
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadStep, setUploadStep] = useState<'password' | 'file'>('password');
  const [uploadPassword, setUploadPassword] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

    // Check Upload Rate Limits
    const logStr = localStorage.getItem('upload_attempt_log');
    if (logStr) {
      const log = JSON.parse(logStr);
      const now = Date.now();
      // Reset if 24h passed
      if (now - log.firstAttempt > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('upload_attempt_log');
        setAttemptsLeft(3);
        setLockoutUntil(null);
      } else {
        setAttemptsLeft(log.remaining);
        if (log.remaining <= 0) {
          setLockoutUntil(log.firstAttempt + 24 * 60 * 60 * 1000);
        }
      }
    }
  }, []);

  const handleRefreshClick = () => {
    setShowConfirm(true);
  };

  const handleUploadClick = () => {
    setUploadStep('password');
    setUploadPassword('');
    setUploadError('');
    setSelectedFile(null);
    setShowUploadDialog(true);
  };

  const recordAttempt = (success: boolean) => {
    const now = Date.now();
    let log = { firstAttempt: now, remaining: 3 };
    const logStr = localStorage.getItem('upload_attempt_log');

    if (logStr) {
      log = JSON.parse(logStr);
      // If expired, reset would have happened in useEffect, but handling race condition slightly simply
      if (now - log.firstAttempt > 24 * 60 * 60 * 1000) {
        log = { firstAttempt: now, remaining: 3 };
      }
    }

    if (!success) {
      log.remaining = Math.max(0, log.remaining - 1);
      setAttemptsLeft(log.remaining);
      if (log.remaining === 0) {
        setLockoutUntil(log.firstAttempt + 24 * 60 * 60 * 1000);
      }
    }

    localStorage.setItem('upload_attempt_log', JSON.stringify(log));
  };

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutUntil && Date.now() < lockoutUntil) {
      setUploadError('Account locked due to too many failed attempts.');
      return;
    }

    if (uploadPassword === 'c0d3c0r3-cbu-admin') {
      setUploadStep('file');
      setUploadError('');
    } else {
      recordAttempt(false);
      setUploadError('Invalid password.');
    }
  };

  const handleFileSubmit = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file.');
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setUploadError('File is too large (Max 50MB).');
      return;
    }

    setShowUploadDialog(false);
    setIsRefreshing(true); // Reuse global refreshing state to show overlay

    try {
      const adminKey = import.meta.env.VITE_ADMIN_KEY || 'super-secret-admin-key';
      // Use 'c0d3c0r3-cbu-admin' as the second key as per requirement
      const response = await apiClient.uploadHistory(selectedFile, adminKey, 'c0d3c0r3-cbu-admin');

      setRefreshJobId(response.jobId);
      pollJob(response.jobId);

    } catch (err: any) {
      console.error("Upload failed", err);
      setIsRefreshing(false);
      // Ideally show error toast
      window.dispatchEvent(new CustomEvent('refresh-error', { detail: err.message }));
    }
  };

  const pollJob = (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await apiClient.getRefreshJobStatus(jobId);

        if (status.status === 'SUCCESS') {
          clearInterval(pollInterval);
          triggerRefresh(); // Update UI
          setIsRefreshing(false);
          setRefreshJobId(null);
          await fetchMetadata();

          // Show result toast/alert? For now dispatch event or let overlay handle generic success
          window.dispatchEvent(new CustomEvent('refresh-success'));
          alert(`Successfully imported historical data.\n${status.error_message || ''}`); // Reusing error_message field for success summary message from backend

        } else if (status.status === 'ERROR') {
          clearInterval(pollInterval);
          setIsRefreshing(false);
          setRefreshJobId(null);
          alert(`Import Failed: ${status.error_message}`);
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 1000);
  }

  const handleRefreshConfirm = async () => {
    setShowConfirm(false);
    setIsRefreshing(true);

    try {
      const adminKey = import.meta.env.VITE_ADMIN_KEY || 'super-secret-admin-key';
      const response = await apiClient.refreshData(adminKey);

      setRefreshJobId(response.jobId);
      pollJob(response.jobId); // Cleaned up code reuse

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

          {/* Refresh Button */}
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

          {/* Upload History Button */}
          <Button
            type="button"
            onClick={handleUploadClick}
            disabled={isRefreshing}
            className="w-full h-9 bg-secondary/10 hover:bg-secondary/20 text-secondary-foreground border border-secondary/20 mt-2"
            variant="ghost"
          >
            <Upload className="mr-2 h-4 w-4" />
            {t('sidebar.uploadHistory')}
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

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('sidebar.uploadTitle')}</DialogTitle>
          </DialogHeader>

          {uploadStep === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-4">
              {lockoutUntil && Date.now() < lockoutUntil ? (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>{t('sidebar.tooManyAttempts')}</span>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="upload-password">{t('sidebar.enterPassword')}</Label>
                    <Input
                      id="upload-password"
                      type="password"
                      value={uploadPassword}
                      onChange={(e) => setUploadPassword(e.target.value)}
                      placeholder="********"
                    />
                    {uploadError && <p className="text-red-500 text-xs">{uploadError}</p>}
                    <p className="text-xs text-muted-foreground">{t('sidebar.attemptsLeft')} {attemptsLeft}</p>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{t('sidebar.verify')}</Button>
                  </DialogFooter>
                </>
              )}
            </form>
          ) : (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t('sidebar.selectFile')}</Label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors border-border">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileSpreadsheet className="w-8 h-8 mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {selectedFile ? selectedFile.name : t('sidebar.clickToSelect')}
                      </p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".xlsx, .xls"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                      }}
                    />
                  </label>
                </div>
                {uploadError && <p className="text-red-500 text-xs">{uploadError}</p>}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadStep('password')}>{t('sidebar.back')}</Button>
                <Button onClick={handleFileSubmit} disabled={!selectedFile}>{t('sidebar.uploadProcess')}</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
