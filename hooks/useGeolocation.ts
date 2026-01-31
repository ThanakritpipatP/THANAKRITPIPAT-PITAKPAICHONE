import { useState, useCallback } from 'react';
import { Branch } from '../types';

const haversineDistance = (coords1: GeolocationCoordinates, coords2: { lat: number, lng: number }) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(coords2.lat - coords1.latitude);
  const dLon = toRad(coords2.lng - coords1.longitude);
  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const useGeolocation = (branches: Branch[]) => {
  const [nearestBranch, setNearestBranch] = useState<Branch | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const findNearestBranch = useCallback((position: GeolocationPosition): Branch | null => {
    let closestBranch: Branch | null = null;
    let minDistance = Infinity;

    for (const branch of branches) {
      const distance = haversineDistance(position.coords, branch);
      if (distance < minDistance) {
        minDistance = distance;
        closestBranch = branch;
      }
    }
    return closestBranch;
  }, [branches]);

  const triggerGeolocation = useCallback((): Promise<{ branch: Branch | null }> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            const errorMsg = 'เบราว์เซอร์ของคุณไม่รองรับ Geolocation';
            setLocationError(errorMsg);
            reject(new Error(errorMsg));
            return;
        }

        setLocationError(null);
        setNearestBranch(null); // Reset while fetching

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const foundBranch = findNearestBranch(position);
                setNearestBranch(foundBranch); // Set state for UI
                resolve({ branch: foundBranch }); // Resolve with branch for immediate use
            },
            (error) => {
                let errorMsg = 'ไม่สามารถเข้าถึงตำแหน่งของคุณได้';
                if (error.code === error.PERMISSION_DENIED) {
                    errorMsg = 'กรุณาอนุญาตให้เข้าถึงตำแหน่งของคุณ';
                }
                setLocationError(errorMsg);
                reject(new Error(errorMsg));
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });
  }, [findNearestBranch]);

  const resetLocation = useCallback(() => {
    setNearestBranch(null);
    setLocationError(null);
  }, []);

  return { nearestBranch, locationError, triggerGeolocation, resetLocation };
};

export default useGeolocation;