import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { useMap } from '../../hooks/useMap';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map events
function MapEvents({ onMapInit }) {
  const map = useMapEvents({});
  
  useEffect(() => {
    if (map) {
      onMapInit(map);
    }
  }, [map, onMapInit]);

  return null;
}

const Map = ({ trips, selectedTrip, onTripSelect }) => {
  const mapRef = useRef(null);
  const { initializeMap } = useMap(trips, selectedTrip, onTripSelect);

  const handleMapInit = (mapInstance) => {
    mapRef.current = mapInstance;
    initializeMap(mapInstance);
    
    // Add a small timeout to ensure map renders properly
    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 100);
  };

  return (
    <div className="map-container">
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onMapInit={handleMapInit} />
      </MapContainer>
    </div>
  );
};

export default Map;