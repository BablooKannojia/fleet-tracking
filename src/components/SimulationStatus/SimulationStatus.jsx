import React from 'react';
import './SimulationStatus.css';

const SimulationStatus = ({ trips, currentTime, isPlaying, speedMultiplier }) => {
  const totalEvents = Object.values(trips).reduce((sum, trip) => sum + trip.events.length, 0);
  const processedEvents = Object.values(trips).reduce((sum, trip) => sum + trip.completedEvents.length, 0);
  const overallProgress = totalEvents > 0 ? (processedEvents / totalEvents) * 100 : 0;

  const activeTrips = Object.values(trips).filter(trip => trip.status === 'active').length;
  const completedTrips = Object.values(trips).filter(trip => trip.status === 'completed').length;
  const cancelledTrips = Object.values(trips).filter(trip => trip.status === 'cancelled').length;

  return (
    <div className="simulation-status card">
      <h3>Simulation Status</h3>
      
      <div className="status-grid">
        <div className="status-item">
          <div className="status-label">State</div>
          <div className={`status-value ${isPlaying ? 'playing' : 'paused'}`}>
            {isPlaying ? '▶️ PLAYING' : '⏸️ PAUSED'}
          </div>
        </div>
        
        <div className="status-item">
          <div className="status-label">Speed</div>
          <div className="status-value">{speedMultiplier}x</div>
        </div>
        
        <div className="status-item">
          <div className="status-label">Progress</div>
          <div className="status-value">{Math.round(overallProgress)}%</div>
        </div>
      </div>

      <div className="progress-bars">
        <div className="progress-item">
          <div className="progress-label">
            Events: {processedEvents.toLocaleString()} / {totalEvents.toLocaleString()}
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="trip-states">
        <div className="state-item">
          <span className="state-dot active"></span>
          <span>Active: {activeTrips}</span>
        </div>
        <div className="state-item">
          <span className="state-dot completed"></span>
          <span>Completed: {completedTrips}</span>
        </div>
        <div className="state-item">
          <span className="state-dot cancelled"></span>
          <span>Cancelled: {cancelledTrips}</span>
        </div>
      </div>

      {currentTime && (
        <div className="current-time">
          Current Time: {currentTime.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default SimulationStatus;