import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Calendar, Camera, 
  Bell, Lock, CreditCard, HelpCircle, LogOut, 
  Edit2, Save, X, Shield, Globe, Moon, Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { hapticLight, hapticSuccess } from '@/lib/haptic-feedback';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Page de profil et paramètres
 * Inspirée du design Settings/Profile page for mobile
 */
export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    language: 'fr',
  });

  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        email: user?.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
  }, [profile, user]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone || null,
          address: formData.address || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setIsEditing(false);
      hapticSuccess();
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    hapticLight();
    await signOut();
    navigate('/auth');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="content-area space-y-6 pb-20">
      {/* Header avec avatar */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl -z-10" />
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/95">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={profile?.avatar_url} alt={formData.fullName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-2xl font-bold text-primary-foreground">
                    {getInitials(formData.fullName || user.email || 'U')}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary shadow-lg"
                    onClick={() => {
                      // TODO: Implémenter upload photo
                      toast.info('Upload de photo à venir');
                    }}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="text-xl font-bold mb-1"
                    placeholder="Nom complet"
                  />
                ) : (
                  <h1 className="text-2xl font-display font-bold text-foreground mb-1">
                    {formData.fullName || user.email?.split('@')[0] || 'Utilisateur'}
                  </h1>
                )}
                <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {profile?.subscription_tier === 'premium' ? 'Premium' : 'Gratuit'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations personnelles */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informations personnelles
            </CardTitle>
            <CardDescription>Gérez vos informations de profil</CardDescription>
          </div>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsEditing(true);
                hapticLight();
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsEditing(false);
                  hapticLight();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                onClick={handleSave}
                disabled={loading}
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email
            </Label>
            <Input
              id="email"
              value={formData.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Téléphone
            </Label>
            {isEditing ? (
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+225 XX XX XX XX XX"
              />
            ) : (
              <p className="text-sm text-foreground py-2">
                {formData.phone || 'Non renseigné'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Adresse
            </Label>
            {isEditing ? (
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Votre adresse"
              />
            ) : (
              <p className="text-sm text-foreground py-2">
                {formData.address || 'Non renseigné'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Membre depuis
            </Label>
            <p className="text-sm text-foreground py-2">
              {user.created_at
                ? format(new Date(user.created_at), 'd MMMM yyyy', { locale: fr })
                : 'Date inconnue'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Paramètres */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>Gérez vos préférences de notification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Notifications générales</Label>
              <p className="text-xs text-muted-foreground">
                Activer toutes les notifications
              </p>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notifications: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Notifications email</Label>
              <p className="text-xs text-muted-foreground">
                Recevoir des emails
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, emailNotifications: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Notifications push</Label>
              <p className="text-xs text-muted-foreground">
                Notifications sur votre appareil
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={settings.pushNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, pushNotifications: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Préférences */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Préférences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Mode sombre</Label>
              <p className="text-xs text-muted-foreground">
                Activer le thème sombre
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={settings.darkMode}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, darkMode: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Sécurité */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={() => {
            toast.info('Changement de mot de passe à venir');
          }}>
            <Lock className="h-4 w-4 mr-2" />
            Changer le mot de passe
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => {
            toast.info('Authentification à deux facteurs à venir');
          }}>
            <Shield className="h-4 w-4 mr-2" />
            Authentification à deux facteurs
          </Button>
        </CardContent>
      </Card>

      {/* Autres */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Autres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={() => {
            toast.info('Aide et support à venir');
          }}>
            <HelpCircle className="h-4 w-4 mr-2" />
            Aide et support
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => {
            toast.info('Conditions d\'utilisation à venir');
          }}>
            <Globe className="h-4 w-4 mr-2" />
            Conditions d'utilisation
          </Button>
        </CardContent>
      </Card>

      {/* Déconnexion */}
      <Card className="shadow-md border-destructive/20">
        <CardContent className="p-6">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

