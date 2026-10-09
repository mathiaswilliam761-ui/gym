import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { useCardioStore } from '../store';

export const BACKGROUND_LOCATION_TASK = 'background-location-task';

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    
    if (locations.length > 0) {
      const latestLocation = locations[0];
      
      // Get the active cardio session
      const state = useCardioStore.getState();
      if (state.activeCardio) {
        const updatedRoute = [...(state.activeCardio.route || [])];
        
        updatedRoute.push({
          latitude: latestLocation.coords.latitude,
          longitude: latestLocation.coords.longitude,
          timestamp: new Date(latestLocation.timestamp).toISOString(),
          altitude: latestLocation.coords.altitude || undefined,
          accuracy: latestLocation.coords.accuracy || undefined,
        });

        // Calculate distance incrementally
        let totalDistance = 0;
        if (updatedRoute.length >= 2) {
          for (let i = 1; i < updatedRoute.length; i++) {
            totalDistance += calculateDistance(
              updatedRoute[i - 1].latitude,
              updatedRoute[i - 1].longitude,
              updatedRoute[i].latitude,
              updatedRoute[i].longitude
            );
          }
        }

        // Update the cardio session with new location and distance
        useCardioStore.getState().updateCardio({
          route: updatedRoute,
          distanceMeters: totalDistance,
        });
      }
    }
  }
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function startBackgroundLocationUpdates() {
  const hasPermissions = await Location.requestForegroundPermissionsAsync();
  if (hasPermissions.status !== 'granted') {
    throw new Error('Foreground location permission not granted');
  }

  const hasBackgroundPermissions = await Location.requestBackgroundPermissionsAsync();
  if (hasBackgroundPermissions.status !== 'granted') {
    throw new Error('Background location permission not granted');
  }

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: 5000, // 5 seconds
    distanceInterval: 10, // 10 meters
    deferredUpdatesInterval: 10000,
    deferredUpdatesDistance: 50,
    foregroundService: {
      notificationTitle: 'Cardio Tracking Active',
      notificationBody: 'Tracking your outdoor workout...',
    },
  });
}

export async function stopBackgroundLocationUpdates() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
  if (isRegistered) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
}

export async function isBackgroundLocationRunning(): Promise<boolean> {
  return await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
}