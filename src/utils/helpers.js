import { TRIP_NAMES, EVENT_TYPE_LABELS } from './constants';

export const getTripDisplayName = (tripId) => {
  return TRIP_NAMES[tripId] || tripId;
};

export const getEventDisplayName = (eventType) => {
  return EVENT_TYPE_LABELS[eventType] || eventType;
};

export const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString();
};

export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString();
};

export const getCurrentDistance = (trip) => {
  const currentEvent = trip.completedEvents[trip.completedEvents.length - 1];
  return currentEvent?.distance_travelled_km ? 
    Math.round(currentEvent.distance_travelled_km) : 0;
};

export const getCurrentSpeed = (trip) => {
  const currentEvent = trip.completedEvents[trip.completedEvents.length - 1];
  return currentEvent?.movement?.speed_kmh ? 
    Math.round(currentEvent.movement.speed_kmh) : 0;
};

export const isAlertEvent = (event) => {
  const alertTypes = [
    'speed_violation', 'device_error', 'battery_low', 
    'fuel_level_low', 'signal_lost', 'trip_cancelled'
  ];
  return alertTypes.includes(event.event_type);
};