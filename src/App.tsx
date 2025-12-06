import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Pages
import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import PigsList from '@/pages/PigsList';
import Formulator from '@/pages/Formulator';
import Finances from '@/pages/Finances';
import Calendar from '@/pages/Calendar';

// Layout
import { AppLayout } from '@/components/layout/AppLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [session, setSession] = useState<{ user: { id: string } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session as { user: { id: string } } | null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session as { user: { id: string } } | null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={session ? <Navigate to="/dashboard" /> : <Landing />} />
          <Route path="/auth" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
          
          <Route element={session ? <AppLayout /> : <Navigate to="/auth" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pigs" element={<PigsList />} />
            <Route path="/pigs/:id" element={<div>PigDetail - À implémenter</div>} />
            <Route path="/formulator" element={<Formulator />} />
            <Route path="/finances" element={<Finances />} />
            <Route path="/calendar" element={<Calendar />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
