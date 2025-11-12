import React from 'react';
import { getTripDisplayName, getCurrentDistance, getCurrentSpeed } from '../../utils/helpers';
import './TripList.css';

const TripList = ({ trips, selectedTrip, onTripSelect }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'var(--success-color)';
      case 'completed': return 'var(--primary-color)';
      case 'cancelled': return 'var(--danger-color)';
      default: return 'var(--secondary-color)';
    }
  };

  return (
    <div className="trip-list">
      <h3>Active Trips</h3>
      <div className="trips-container">
        {Object.keys(trips).map(tripId => {
          const trip = trips[tripId];
          const isSelected = selectedTrip === tripId;

          return (
            <div
              key={tripId}
              className={`trip-card ${isSelected ? 'active' : ''}`}
              onClick={() => onTripSelect(tripId)}
            >
              <div className="trip-header">
                <div className="trip-name">{getTripDisplayName(tripId)}</div>
                <div 
                  className="trip-status"
                  style={{ backgroundColor: getStatusColor(trip.status) }}
                >
                  {trip.status.toUpperCase()}
                </div>
              </div>
              
              <div className="trip-metrics">
                <div className="metric">
                  <span className="metric-label">DISTANCE</span>
                  <span className="metric-value">{getCurrentDistance(trip)} km</span>
                </div>
                <div className="metric">
                  <span className="metric-label">SPEED</span>
                  <span className="metric-value">{getCurrentSpeed(trip)} km/h</span>
                </div>
                <div className="metric">
                  <span className="metric-label">PROGRESS</span>
                  <span className="metric-value">{Math.round(trip.progress)}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">ALERTS</span>
                  <span className="metric-value">{trip.alerts.length}</span>
                </div>
              </div>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${trip.progress}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TripList;