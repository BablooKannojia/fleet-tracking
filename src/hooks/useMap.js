import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { TRIP_COLORS, TRIP_NAMES } from '../utils/constants';

export const useMap = (trips, selectedTrip, onTripSelect) => {
  const [map, setMap] = useState(null);
  const markersRef = useRef({});
  const routesRef = useRef({});

  // Initialize map
  const initializeMap = (mapInstance) => {
    console.log('🗺️ Map initialized');
    setMap(mapInstance);
    
    // Force map to resize and render
    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 500);
  };

  // Create custom vehicle icon
  const createVehicleIcon = (color, status, isSelected = false) => {
    const size = isSelected ? 35 : 30;
    
    let statusColor = '#10b981'; // active - green
    if (status === 'completed') statusColor = '#2563eb'; // blue
    if (status === 'cancelled') statusColor = '#ef4444'; // red

    return L.divIcon({
      className: 'vehicle-marker',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${statusColor};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isSelected ? '16px' : '14px'};
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          color: white;
        ">
          🚛
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  // Update vehicle positions and routes
  useEffect(() => {
    if (!map) {
      console.log('🗺️ Map not ready yet');
      return;
    }

    console.log('🗺️ Updating map with', Object.keys(trips).length, 'trips');

    Object.keys(trips).forEach(tripId => {
      const trip = trips[tripId];
      const lastEvent = trip.completedEvents[trip.completedEvents.length - 1] || trip.events[0];
      
      if (!lastEvent?.location) {
        console.log('❌ No location for trip:', tripId);
        return;
      }

      const position = [lastEvent.location.lat, lastEvent.location.lng];
      const color = TRIP_COLORS[tripId] || '#666';
      const isSelected = selectedTrip === tripId;

      console.log('📍 Updating trip:', tripId, 'at position:', position);

      // Create or update marker
      if (!markersRef.current[tripId]) {
        console.log('➕ Creating new marker for:', tripId);
        const marker = L.marker(position, {
          icon: createVehicleIcon(color, trip.status, isSelected)
        }).addTo(map);

        marker.on('click', () => {
          console.log('🎯 Marker clicked:', tripId);
          onTripSelect(tripId);
        });

        // Add popup
        marker.bindPopup(createPopupContent(tripId, trip, lastEvent));
        
        markersRef.current[tripId] = marker;
        console.log('✅ Marker created for:', tripId);
      } else {
        markersRef.current[tripId].setLatLng(position);
        markersRef.current[tripId].setIcon(createVehicleIcon(color, trip.status, isSelected));
        
        // Update popup content
        markersRef.current[tripId].setPopupContent(
          createPopupContent(tripId, trip, lastEvent)
        );
      }

      // Update route
      updateRoute(tripId, trip, color, isSelected);
    });

    // Clean up markers for trips that no longer exist
    Object.keys(markersRef.current).forEach(tripId => {
      if (!trips[tripId]) {
        map.removeLayer(markersRef.current[tripId]);
        delete markersRef.current[tripId];
        console.log('🗑️ Removed marker for:', tripId);
      }
    });

  }, [map, trips, selectedTrip, onTripSelect]);

  const updateRoute = (tripId, trip, color, isSelected) => {
    if (!map) return;

    const routePoints = trip.completedEvents
      .filter(event => event.location)
      .map(event => [event.location.lat, event.location.lng]);

    if (routePoints.length === 0) {
      console.log('🔄 No route points for:', tripId);
      return;
    }

    console.log('🔄 Updating route for:', tripId, 'with', routePoints.length, 'points');

    if (!routesRef.current[tripId]) {
      console.log('🆕 Creating new route for:', tripId);
      const route = L.polyline(routePoints, {
        color: isSelected ? '#000000' : color,
        weight: isSelected ? 4 : 3,
        opacity: 0.7,
        smoothFactor: 1
      }).addTo(map);

      routesRef.current[tripId] = route;
    } else {
      routesRef.current[tripId].setLatLngs(routePoints);
      routesRef.current[tripId].setStyle({
        color: isSelected ? '#000000' : color,
        weight: isSelected ? 4 : 3
      });
    }
  };

  const createPopupContent = (tripId, trip, lastEvent) => {
    const tripName = TRIP_NAMES[tripId] || tripId;
    const speed = lastEvent.movement?.speed_kmh ? Math.round(lastEvent.movement.speed_kmh) : 0;
    const distance = lastEvent.distance_travelled_km ? Math.round(lastEvent.distance_travelled_km) : 0;
    
    return `
      <div style="min-width: 200px; font-family: Arial, sans-serif;">
        <h3 style="margin: 0 0 8px 0; color: #2563eb; font-size: 14px;">${tripName}</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 12px;">
          <div>
            <strong>Status:</strong><br>
            <span style="color: ${getStatusColor(trip.status)}; font-weight: bold;">${trip.status.toUpperCase()}</span>
          </div>
          <div>
            <strong>Progress:</strong><br>
            ${Math.round(trip.progress)}%
          </div>
          <div>
            <strong>Speed:</strong><br>
            ${speed} km/h
          </div>
          <div>
            <strong>Distance:</strong><br>
            ${distance} km
          </div>
          <div>
            <strong>Alerts:</strong><br>
            <span style="color: ${trip.alerts.length > 0 ? '#ef4444' : '#10b981'}">${trip.alerts.length}</span>
          </div>
          <div>
            <strong>Events:</strong><br>
            ${trip.completedEvents.length}/${trip.events.length}
          </div>
        </div>
        ${trip.alerts.length > 0 ? `
          <div style="margin-top: 8px; padding: 6px; background: #fef2f2; border-radius: 4px; font-size: 11px; border-left: 3px solid #ef4444;">
            <strong style="color: #ef4444;">⚠️ Recent Alerts:</strong><br>
            ${trip.alerts.slice(-2).map(alert => 
              `<div style="margin-top: 2px;">• ${formatEventType(alert.event_type)}</div>`
            ).join('')}
          </div>
        ` : ''}
      </div>
    `;
  };

  const formatEventType = (eventType) => {
    const eventNames = {
      'speed_violation': 'Speed Violation',
      'device_error': 'Device Error',
      'battery_low': 'Low Battery',
      'fuel_level_low': 'Low Fuel',
      'signal_lost': 'Signal Lost',
      'trip_cancelled': 'Trip Cancelled'
    };
    return eventNames[eventType] || eventType;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'completed': return '#2563eb';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      if (map) {
        console.log('🧹 Cleaning up map layers');
        Object.values(markersRef.current).forEach(marker => {
          map.removeLayer(marker);
        });
        Object.values(routesRef.current).forEach(route => {
          map.removeLayer(route);
        });
      }
    };
  }, [map]);

  return {
    initializeMap
  };
};