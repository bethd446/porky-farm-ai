import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/hooks/useAuth';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Utilisateur';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          userName={userName}
          alertsCount={5}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
        
        {/* Bottom Navigation - Mobile only */}
        <BottomNav />
      </div>
    </div>
  );
}
