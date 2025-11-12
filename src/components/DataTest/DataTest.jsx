import React from 'react';

const DataTest = ({ trips }) => {
  return (
    <div style={{ padding: '1rem', background: '#f3f4f6' }}>
      <h3>Data Structure Test</h3>
      {Object.keys(trips).map(tripId => {
        const trip = trips[tripId];
        const sampleEvent = trip.events[0];
        
        return (
          <div key={tripId} style={{ marginBottom: '1rem', padding: '1rem', background: 'white' }}>
            <h4>Trip: {tripId}</h4>
            <div>Total Events: {trip.events.length}</div>
            <div>First Event Type: {sampleEvent?.event_type}</div>
            <div>First Event Timestamp: {sampleEvent?.timestamp}</div>
            <div>Has Location: {!!sampleEvent?.location ? 'Yes' : 'No'}</div>
            {sampleEvent?.location && (
              <div>Location: {sampleEvent.location.lat}, {sampleEvent.location.lng}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DataTest;