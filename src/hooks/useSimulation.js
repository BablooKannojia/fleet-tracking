import { useState, useEffect, useRef, useCallback } from 'react';
import { eventProcessor } from '../utils/eventProcessor';

export const useSimulation = (trips, setTrips) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [currentTime, setCurrentTime] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const simulationRef = useRef(null);

  // Find earliest start time
  useEffect(() => {
    if (Object.keys(trips).length > 0 && !currentTime) {
      const startTimes = Object.values(trips).map(trip => trip.startTime);
      const earliestTime = new Date(Math.min(...startTimes));
      setCurrentTime(earliestTime);
    }
  }, [trips, currentTime]);

  const processEvents = useCallback(() => {
    const newEvents = [];
    const updatedTrips = { ...trips };

    Object.keys(updatedTrips).forEach(tripId => {
      const trip = updatedTrips[tripId];
      const nextEvent = trip.events[trip.currentIndex];

      if (nextEvent && new Date(nextEvent.timestamp) <= currentTime) {
        // Use event processor to handle the event
        const processedEvent = eventProcessor.processEvent(nextEvent, trip);
        
        if (processedEvent) {
          newEvents.push(nextEvent);
          trip.completedEvents.push(nextEvent);
          
          // Update trip status based on event type
          if (nextEvent.event_type === 'trip_completed') {
            trip.status = 'completed';
          } else if (nextEvent.event_type === 'trip_cancelled') {
            trip.status = 'cancelled';
          }

          // Track alerts using event processor
          if (eventProcessor.isAlertEvent(nextEvent)) {
            trip.alerts.push(nextEvent);
          }

          trip.currentIndex++;
          trip.progress = (trip.currentIndex / trip.events.length) * 100;
        }
      }
    });

    if (newEvents.length > 0) {
      setRecentEvents(prev => [...prev, ...newEvents].slice(-20));
      setTrips(updatedTrips);
    }
  }, [trips, currentTime, setTrips]);

  // Simulation loop
  useEffect(() => {
    if (isPlaying && currentTime) {
      simulationRef.current = setInterval(() => {
        setCurrentTime(prev => new Date(prev.getTime() + (1000 * speedMultiplier)));
        processEvents();
      }, 100);
    } else {
      clearInterval(simulationRef.current);
    }

    return () => clearInterval(simulationRef.current);
  }, [isPlaying, currentTime, speedMultiplier, processEvents]);

  const playPause = () => setIsPlaying(!isPlaying);

  const resetSimulation = () => {
    setIsPlaying(false);
    eventProcessor.clearProcessedEvents();
    setRecentEvents([]);

    const resetTrips = { ...trips };
    Object.keys(resetTrips).forEach(tripId => {
      resetTrips[tripId] = {
        ...resetTrips[tripId],
        currentIndex: 0,
        status: 'active',
        progress: 0,
        alerts: [],
        completedEvents: []
      };
    });

    setTrips(resetTrips);
    
    // Reset to earliest start time
    const startTimes = Object.values(resetTrips).map(trip => trip.startTime);
    const earliestTime = new Date(Math.min(...startTimes));
    setCurrentTime(earliestTime);
  };

  return {
    isPlaying,
    playPause,
    speedMultiplier,
    setSpeedMultiplier,
    currentTime,
    recentEvents,
    resetSimulation
  };
};