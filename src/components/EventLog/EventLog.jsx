import React from 'react';
import { formatTime, getEventDisplayName, isAlertEvent } from '../../utils/helpers';
import './EventLog.css';

const EventLog = ({ events }) => {
  return (
    <div className="event-log card">
      <h3>Recent Events</h3>
      <div className="events-container">
        {events.length === 0 ? (
          <div className="no-events">No events yet. Start the simulation to see events.</div>
        ) : (
          events.slice().reverse().map((event, index) => (
            <div key={`${event.event_id}-${index}`} className="event-item">
              <div className="event-header">
                <span className="event-time">{formatTime(event.timestamp)}</span>
                <span className="event-type">{getEventDisplayName(event.event_type)}</span>
                {isAlertEvent(event) && (
                  <span className="alert-badge">ALERT</span>
                )}
              </div>
              <div className="event-details">
                <span className="vehicle-id">{event.vehicle_id}</span>
                {event.movement?.speed_kmh && (
                  <span className="event-speed">{Math.round(event.movement.speed_kmh)} km/h</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventLog;