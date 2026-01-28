import { Outlet } from 'react-router';
import { ThemeProvider } from '../lib/contexts/ThemeContext';
import { LanguageProvider } from '../lib/contexts/LanguageContext';
import { RefreshProvider } from '../lib/contexts/RefreshContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { RefreshOverlay } from './RefreshOverlay';

export function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <RefreshProvider>
          <div className="min-h-screen bg-background flex">
            <Sidebar />
            <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
              <Header />
              <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
                <Outlet />
              </main>
            </div>
          </div>
          <RefreshOverlay />
        </RefreshProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
