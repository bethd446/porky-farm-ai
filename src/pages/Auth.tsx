import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      loginSchema.parse({ email: loginEmail, password: loginPassword });
      
      setLoading(true);
      const { error } = await signIn(loginEmail, loginPassword);
      
      if (error) {
        if (error.message.includes('Invalid login') || error.message.includes('Invalid credentials')) {
          toast.error('Email ou mot de passe incorrect');
        } else if (error.message.includes('password') && error.message.includes('compromised')) {
          toast.error('Ce mot de passe a été compromis dans une fuite de données. Veuillez en choisir un autre.');
        } else {
          toast.error(error.message);
        }
        setLoading(false);
        return;
      }
      
      toast.success('Connexion réussie');
      // Attendre que l'auth state change se propage avant de rediriger
      await new Promise(resolve => setTimeout(resolve, 300));
      // La redirection sera gérée par le useEffect qui écoute les changements de user
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
        });
        setErrors(fieldErrors);
      }
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      signupSchema.parse({
        fullName: signupName,
        email: signupEmail,
        password: signupPassword,
        confirmPassword: signupConfirm,
      });
      
      setLoading(true);
      const { error } = await signUp(signupEmail, signupPassword, signupName);
      
      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          toast.error('Cet email est déjà utilisé');
        } else if (error.message.includes('password') && (error.message.includes('compromised') || error.message.includes('pwned'))) {
          toast.error('Ce mot de passe a été compromis dans une fuite de données. Veuillez en choisir un autre.');
        } else if (error.message.includes('Password')) {
          toast.error('Le mot de passe ne respecte pas les critères de sécurité requis');
        } else {
          toast.error(error.message);
        }
        setLoading(false);
        return;
      }
      
      // Attendre que l'auth state change se propage
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Vérifier si l'utilisateur est maintenant connecté (si email confirmation est désactivée)
      // La redirection sera gérée par le useEffect qui écoute les changements de user
      toast.success('Compte créé ! Vérifiez votre email pour confirmer votre compte.');
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo avec animation */}
        <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
            <Leaf className="h-8 w-8 text-primary-foreground" />
          </div>
          <span className="text-4xl font-display font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            PorcPro
          </span>
        </div>

        <Card className="border-border/50 shadow-2xl bg-card/95 backdrop-blur-sm animate-scale-in">
          <CardHeader className="text-center pb-6 pt-8">
            <CardTitle className="text-3xl font-display bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Bienvenue
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Gérez votre élevage porcin efficacement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                >
                  Connexion
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                >
                  Inscription
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6 animate-fade-in">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className={`h-11 transition-all duration-200 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive animate-shake">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">Mot de passe</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={`h-11 transition-all duration-200 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive animate-shake">{errors.password}</p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      'Se connecter'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-6 animate-fade-in">
                <form onSubmit={handleSignup} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium">Nom complet</Label>
                    <Input
                      id="signup-name"
                      placeholder="Kouassi Jean"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className={`h-11 transition-all duration-200 ${errors.fullName ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive animate-shake">{errors.fullName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className={`h-11 transition-all duration-200 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive animate-shake">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">Mot de passe</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className={`h-11 transition-all duration-200 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive animate-shake">{errors.password}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="text-sm font-medium">Confirmer le mot de passe</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)}
                      className={`h-11 transition-all duration-200 ${errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive animate-shake">{errors.confirmPassword}</p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      'Créer un compte'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6 animate-fade-in">
          En continuant, vous acceptez nos{' '}
          <a href="#" className="text-primary hover:underline font-medium">conditions d'utilisation</a>
        </p>
      </div>
    </div>
  );
}
