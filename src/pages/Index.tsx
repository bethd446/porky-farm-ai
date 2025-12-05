import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    // Attendre que le chargement soit terminé
    if (loading) return;
    
    // Éviter les redirections multiples
    if (redirected) return;
    
    setRedirected(true);
    
    if (user) {
      console.log('User authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    } else {
      console.log('No user, redirecting to auth');
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate, redirected]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default Index;
