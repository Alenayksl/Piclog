import { useEffect, useState, useCallback } from 'react';
import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface UseLocationResult {
  location: LocationData | null;
  error: string | null;
  loading: boolean;
  requestPermission: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (e) {
      setError('Konum izni alınamadı');
      return false;
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setError('Konum izni gerekli');
        setLoading(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch (e) {
      setError('Konum alınamadı');
    } finally {
      setLoading(false);
    }
  }, [requestPermission]);

  useEffect(() => {
    refresh();
  }, []);

  return { location, error, loading, requestPermission, refresh };
}
