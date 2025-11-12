import { useState, useEffect } from 'react';

export const useTripData = () => {
  const [trips, setTrips] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTripData = async () => {
      try {
        setLoading(true);
        const tripFiles = [
          '/data/trip_1_cross_country.json',
          '/data/trip_2_urban_dense.json',
          '/data/trip_3_mountain_cancelled.json',
          '/data/trip_4_southern_technical.json',
          '/data/trip_5_regional_logistics.json'
        ];

        const tripData = {};

        for (const file of tripFiles) {
          const response = await fetch(file);
          const data = await response.json();
          const tripId = data[0]?.trip_id;
          
          if (tripId) {
            tripData[tripId] = {
              events: data,
              currentIndex: 0,
              status: 'active',
              progress: 0,
              startTime: new Date(data[0].timestamp),
              alerts: [],
              completedEvents: []
            };
          }
        }

        setTrips(tripData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load trip data');
        setLoading(false);
      }
    };

    loadTripData();
  }, []);

  return { trips, loading, error, setTrips };
};