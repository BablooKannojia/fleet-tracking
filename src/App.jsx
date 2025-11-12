import React, { useState } from 'react';
import { useTripData } from './hooks/useTripData';
import { useSimulation } from './hooks/useSimulation';
import Map from './components/Map/Map';
import TripList from './components/TripList/TripList';
import FleetOverview from './components/FleetOverview/FleetOverview';
import Controls from './components/Controls/Controls';
import EventLog from './components/EventLog/EventLog';
import SimulationStatus from './components/SimulationStatus/SimulationStatus';
import './App.css';

function App() {
  const { trips, loading, error, setTrips } = useTripData();
  const [selectedTrip, setSelectedTrip] = useState(null);
  
  const {
    isPlaying,
    playPause,
    speedMultiplier,
    setSpeedMultiplier,
    currentTime,
    recentEvents,
    resetSimulation
  } = useSimulation(trips, setTrips);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🚛</div>
        <h2>Loading Fleet Data...</h2>
        <p>Loaded {Object.keys(trips).length} trips so far...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Data</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚛 MapUp Fleet Tracking Dashboard</h1>
        <div className="header-info">
          {currentTime && (
            <span>Current Time: {currentTime.toLocaleString()}</span>
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="sidebar">
          <SimulationStatus 
            trips={trips}
            currentTime={currentTime}
            isPlaying={isPlaying}
            speedMultiplier={speedMultiplier}
          />
          <FleetOverview trips={trips} recentEvents={recentEvents} />
          <Controls
            isPlaying={isPlaying}
            playPause={playPause}
            speedMultiplier={speedMultiplier}
            setSpeedMultiplier={setSpeedMultiplier}
            resetSimulation={resetSimulation}
            currentTime={currentTime}
          />
          <TripList
            trips={trips}
            selectedTrip={selectedTrip}
            onTripSelect={setSelectedTrip}
          />
          <EventLog events={recentEvents} />
        </div>

        <div className="map-section">
          <Map
            trips={trips}
            selectedTrip={selectedTrip}
            onTripSelect={setSelectedTrip}
          />
        </div>
      </main>
    </div>
  );
}

export default App;