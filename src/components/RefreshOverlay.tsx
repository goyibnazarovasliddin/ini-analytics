import { useEffect, useState } from 'react';
import { useRefresh } from '../lib/contexts/RefreshContext';
import { useLanguage } from '../lib/contexts/LanguageContext';
import { apiClient } from '../lib/api';
import { Loader2 } from 'lucide-react';

export function RefreshOverlay() {
    const { isRefreshing, isDataFetching, refreshJobId } = useRefresh();
    const { t } = useLanguage();
    const [progress, setProgress] = useState(0);
    const [etaSeconds, setEtaSeconds] = useState<number | null>(null);

    useEffect(() => {
        if (isDataFetching) {
            setProgress(100);
            return;
        }

        if (!isRefreshing || !refreshJobId) {
            setProgress(0);
            setEtaSeconds(null);
            return;
        }

        const pollInterval = setInterval(async () => {
            try {
                const status = await apiClient.getRefreshJobStatus(refreshJobId);
                // Don't go back in progress
                setProgress(prev => Math.max(prev, status.progress));
                setEtaSeconds(status.eta_seconds);

                if (status.status === 'SUCCESS' || status.status === 'ERROR') {
                    clearInterval(pollInterval);
                }
            } catch (error) {
                console.error('Failed to poll job status:', error);
            }
        }, 500);

        return () => clearInterval(pollInterval);
    }, [isRefreshing, isDataFetching, refreshJobId]);

    const formatETA = (seconds: number | null) => {
        if (seconds === null || seconds === 0) return '';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `~${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isRefreshing && !isDataFetching) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-6 rounded-[24px] bg-card p-10 shadow-2xl border border-border min-w-[450px]">
                <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        {isDataFetching && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-2 w-2 bg-primary rounded-full animate-ping" />
                            </div>
                        )}
                    </div>
                    <p className="text-2xl font-bold text-foreground mt-2">
                        {isDataFetching ? "Ma'lumotlar yangilanmoqda" : t('sidebar.refreshing')}
                    </p>
                </div>

                <div className="w-full space-y-4">
                    <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-primary text-lg">{progress}%</span>
                        {isRefreshing && etaSeconds !== null && etaSeconds > 0 && (
                            <span className="text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md">
                                {formatETA(etaSeconds)}
                            </span>
                        )}
                        {isDataFetching && (
                            <span className="text-emerald-500 font-bold animate-pulse">
                                Yakunlanmoqda...
                            </span>
                        )}
                    </div>
                </div>

                <div className="text-sm text-muted-foreground text-center max-w-sm space-y-1">
                    <p className="font-medium">
                        {isDataFetching
                            ? "Bazadagi o'zgarishlar interfeysga qo'llanilmoqda."
                            : "Iltimos, kuting. Ma'lumotlar bazasi yangilanmoqda..."}
                    </p>
                    <p className="text-xs opacity-70">
                        Bu jarayon davomida sahifani yopmang yoki yangilamang.
                    </p>
                </div>
            </div>
        </div>
    );
}
