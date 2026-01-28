import React, { createContext, useContext, useState } from 'react';

interface RefreshContextType {
    isRefreshing: boolean; // For backend job
    isDataFetching: boolean; // For frontend refetch
    refreshJobId: string | null;
    refreshTrigger: number;
    setIsRefreshing: (value: boolean) => void;
    setIsDataFetching: (value: boolean) => void;
    setRefreshJobId: (value: string | null) => void;
    triggerRefresh: () => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export function RefreshProvider({ children }: { children: React.ReactNode }) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDataFetching, setIsDataFetching] = useState(false);
    const [refreshJobId, setRefreshJobId] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const triggerRefresh = () => {
        setIsDataFetching(true); // Signal that we are starting to fetch data
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <RefreshContext.Provider value={{
            isRefreshing,
            isDataFetching,
            refreshJobId,
            refreshTrigger,
            setIsRefreshing,
            setIsDataFetching,
            setRefreshJobId,
            triggerRefresh
        }}>
            {children}
        </RefreshContext.Provider>
    );
}

export function useRefresh() {
    const context = useContext(RefreshContext);
    if (context === undefined) {
        throw new Error('useRefresh must be used within a RefreshProvider');
    }
    return context;
}
