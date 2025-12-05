import { memo, useEffect, useState } from 'react';
import { MapPin, Cloud, Sun, Droplets, Wind, Gauge, Sunrise, Sunset } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGeolocation } from '@/hooks/useGeolocation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface WeatherData {
  temperature: number;
  high: number;
  low: number;
  humidity: number;
  precipitation: number;
  pressure: number;
  windSpeed: number;
  condition: string;
  sunrise: string;
  sunset: string;
  location: string;
}

/**
 * Widget météo avec localisation
 * Inspiré du design Smart Farming
 */
export const WeatherWidget = memo(function WeatherWidget() {
  const { latitude, longitude, getCurrentPosition, loading: geoLoading, error: geoError } = useGeolocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (latitude && longitude) {
      fetchWeather();
    } else if (!geoLoading && !geoError) {
      getCurrentPosition();
    }
  }, [latitude, longitude, geoLoading, geoError]);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      // Pour l'instant, on utilise des données mockées
      // Dans une vraie app, on utiliserait une API météo comme OpenWeatherMap
      const mockWeather: WeatherData = {
        temperature: 28,
        high: 32,
        low: 24,
        humidity: 65,
        precipitation: 2.5,
        pressure: 1013,
        windSpeed: 15,
        condition: 'Ensoleillé',
        sunrise: '6:15',
        sunset: '18:30',
        location: latitude && longitude ? `${latitude.toFixed(2)}, ${longitude.toFixed(2)}` : 'Localisation inconnue',
      };
      
      // Simuler un délai d'API
      await new Promise(resolve => setTimeout(resolve, 500));
      setWeather(mockWeather);
    } catch (error) {
      console.error('Error fetching weather:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || geoLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
        <CardContent className="p-6">
          <Skeleton className="h-48 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <p className="text-muted-foreground">Impossible de charger les données météo</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6 space-y-4">
        {/* Header avec localisation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{weather.location}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {format(new Date(), 'EEEE d MMMM', { locale: fr })}
          </span>
        </div>

        {/* Température principale */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-primary">{weather.temperature}°C</span>
              <Sun className="h-8 w-8 text-warning animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">{weather.condition}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>H: {weather.high}°C</span>
              <span>L: {weather.low}°C</span>
            </div>
          </div>
        </div>

        {/* Stats détaillées */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-info" />
            <div>
              <p className="text-xs text-muted-foreground">Humidité</p>
              <p className="text-sm font-semibold">{weather.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Précipitation</p>
              <p className="text-sm font-semibold">{weather.precipitation}mm</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-warning" />
            <div>
              <p className="text-xs text-muted-foreground">Pression</p>
              <p className="text-sm font-semibold">{weather.pressure} hPa</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Vent</p>
              <p className="text-sm font-semibold">{weather.windSpeed} m/s</p>
            </div>
          </div>
        </div>

        {/* Lever/Coucher du soleil */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Sunrise className="h-4 w-4 text-warning" />
            <div>
              <p className="text-xs text-muted-foreground">Lever</p>
              <p className="text-sm font-semibold">{weather.sunrise}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sunset className="h-4 w-4 text-warning" />
            <div>
              <p className="text-xs text-muted-foreground">Coucher</p>
              <p className="text-sm font-semibold">{weather.sunset}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

