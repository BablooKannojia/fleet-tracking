import React from 'react';
import './FleetOverview.css';

const FleetOverview = ({ trips, recentEvents }) => {
  const fleetStats = React.useMemo(() => {
    const tripArray = Object.values(trips);
    return {
      totalTrips: tripArray.length,
      activeTrips: tripArray.filter(t => t.status === 'active').length,
      completedTrips: tripArray.filter(t => t.status === 'completed').length,
      cancelledTrips: tripArray.filter(t => t.status === 'cancelled').length,
      totalAlerts: tripArray.reduce((sum, trip) => sum + trip.alerts.length, 0),
      totalEvents: tripArray.reduce((sum, trip) => sum + trip.completedEvents.length, 0)
    };
  }, [trips]);

  const getProgressStats = () => {
    const tripArray = Object.values(trips);
    return {
      over50: tripArray.filter(t => t.progress >= 50).length,
      over80: tripArray.filter(t => t.progress >= 80).length,
      over90: tripArray.filter(t => t.progress >= 90).length
    };
  };

  const progressStats = getProgressStats();

  return (
    <div className="fleet-overview card">
      <h3>Fleet Overview</h3>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{fleetStats.activeTrips}</div>
          <div className="stat-label">Active Trips</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{fleetStats.completedTrips}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{fleetStats.cancelledTrips}</div>
          <div className="stat-label">Cancelled</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{fleetStats.totalAlerts}</div>
          <div className="stat-label">Alerts</div>
        </div>
      </div>

      <div className="progress-stats">
        <h4>Trip Progress</h4>
        <div className="progress-bars">
          <div className="progress-stat">
            <span>50%+ Complete</span>
            <span className="count">{progressStats.over50}</span>
          </div>
          <div className="progress-stat">
            <span>80%+ Complete</span>
            <span className="count">{progressStats.over80}</span>
          </div>
          <div className="progress-stat">
            <span>90%+ Complete</span>
            <span className="count">{progressStats.over90}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetOverview;