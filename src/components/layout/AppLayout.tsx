import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-20 lg:pb-8">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
