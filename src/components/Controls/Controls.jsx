import React from 'react';
import './Controls.css';

const Controls = ({ 
  isPlaying, 
  playPause, 
  speedMultiplier, 
  setSpeedMultiplier, 
  resetSimulation,
  currentTime 
}) => {
  return (
    <div className="controls card">
      <h3>Simulation Controls</h3>
      
      <div className="controls-grid">
        <div className="control-group">
          <label>Current Time:</label>
          <div className="time-display">
            {currentTime ? currentTime.toLocaleString() : 'Loading...'}
          </div>
        </div>
        
        <div className="control-group">
          <label>Playback Speed:</label>
          <select 
            value={speedMultiplier} 
            onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
            className="speed-select"
          >
            <option value="1">1x Real Time</option>
            <option value="5">5x Faster</option>
            <option value="10">10x Faster</option>
            <option value="50">50x Faster</option>
            <option value="100">100x Faster</option>
          </select>
        </div>
        
        <div className="button-group">
          <button 
            onClick={playPause}
            className={`control-btn ${isPlaying ? 'pause' : 'play'}`}
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          
          <button 
            onClick={resetSimulation}
            className="control-btn reset"
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;