import { TRIP_NAMES, EVENT_TYPE_LABELS } from './constants';

export class EventProcessor {
  constructor() {
    this.processedEvents = new Set();
    this.eventHandlers = new Map();
    this.alertTypes = new Set([
      'speed_violation', 'device_error', 'battery_low', 
      'fuel_level_low', 'signal_lost', 'trip_cancelled'
    ]);
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Trip lifecycle events
    this.eventHandlers.set('trip_started', this.handleTripStarted.bind(this));
    this.eventHandlers.set('trip_completed', this.handleTripCompleted.bind(this));
    this.eventHandlers.set('trip_cancelled', this.handleTripCancelled.bind(this));
    
    // Alert events
    this.eventHandlers.set('speed_violation', this.handleSpeedViolation.bind(this));
    this.eventHandlers.set('device_error', this.handleDeviceError.bind(this));
    this.eventHandlers.set('battery_low', this.handleBatteryLow.bind(this));
    this.eventHandlers.set('fuel_level_low', this.handleFuelLow.bind(this));
    this.eventHandlers.set('signal_lost', this.handleSignalLost.bind(this));
    
    // Movement events
    this.eventHandlers.set('vehicle_stopped', this.handleVehicleStopped.bind(this));
    this.eventHandlers.set('vehicle_moving', this.handleVehicleMoving.bind(this));
    
    // Telemetry events
    this.eventHandlers.set('vehicle_telemetry', this.handleVehicleTelemetry.bind(this));
    this.eventHandlers.set('refueling_started', this.handleRefuelingStarted.bind(this));
    this.eventHandlers.set('refueling_completed', this.handleRefuelingCompleted.bind(this));
  }

  processEvent(event, tripState) {
    if (this.processedEvents.has(event.event_id)) {
      return null;
    }

    this.processedEvents.add(event.event_id);
    
    const handler = this.eventHandlers.get(event.event_type);
    if (handler) {
      return handler(event, tripState);
    }

    // Default handler for unhandled events
    return this.handleGenericEvent(event, tripState);
  }

  handleTripStarted(event, tripState) {
    return {
      type: 'TRIP_STARTED',
      payload: {
        event,
        startTime: new Date(event.timestamp),
        plannedDistance: event.planned_distance_km,
        estimatedDuration: event.estimated_duration_hours
      }
    };
  }

  handleTripCompleted(event, tripState) {
    return {
      type: 'TRIP_COMPLETED',
      payload: {
        event,
        totalDistance: event.total_distance_km,
        duration: event.duration_minutes,
        fuelConsumed: event.fuel_consumed_percent
      }
    };
  }

  handleTripCancelled(event, tripState) {
    return {
      type: 'TRIP_CANCELLED',
      payload: {
        event,
        reason: event.cancellation_reason,
        distanceCompleted: event.distance_completed_km,
        elapsedTime: event.elapsed_time_minutes
      }
    };
  }

  handleSpeedViolation(event, tripState) {
    const severity = event.violation_amount_kmh > 20 ? 'HIGH' : 'MODERATE';
    
    return {
      type: 'SPEED_VIOLATION',
      payload: {
        event,
        severity,
        speedLimit: event.speed_limit_kmh,
        actualSpeed: event.movement.speed_kmh,
        violationAmount: event.violation_amount_kmh
      },
      isAlert: true
    };
  }

  handleDeviceError(event, tripState) {
    return {
      type: 'DEVICE_ERROR',
      payload: {
        event,
        errorType: event.error_type,
        errorCode: event.error_code,
        errorMessage: event.error_message,
        severity: event.severity
      },
      isAlert: true
    };
  }

  handleBatteryLow(event, tripState) {
    return {
      type: 'BATTERY_LOW',
      payload: {
        event,
        batteryLevel: event.battery_level_percent,
        threshold: event.threshold_percent,
        estimatedRemaining: event.estimated_remaining_hours
      },
      isAlert: true
    };
  }

  handleFuelLow(event, tripState) {
    return {
      type: 'FUEL_LOW',
      payload: {
        event,
        fuelLevel: event.fuel_level_percent,
        threshold: event.threshold_percent,
        estimatedRange: event.estimated_range_km
      },
      isAlert: true
    };
  }

  handleSignalLost(event, tripState) {
    return {
      type: 'SIGNAL_LOST',
      payload: {
        event,
        signalQuality: event.signal_quality,
        location: event.location
      },
      isAlert: true
    };
  }

  handleVehicleStopped(event, tripState) {
    return {
      type: 'VEHICLE_STOPPED',
      payload: {
        event,
        location: event.location,
        duration: null // Will be set when vehicle starts moving
      }
    };
  }

  handleVehicleMoving(event, tripState) {
    return {
      type: 'VEHICLE_MOVING',
      payload: {
        event,
        location: event.location,
        speed: event.movement.speed_kmh,
        stopDuration: event.stop_duration_minutes
      }
    };
  }

  handleVehicleTelemetry(event, tripState) {
    return {
      type: 'VEHICLE_TELEMETRY',
      payload: {
        event,
        telemetry: event.telemetry,
        fuelLevel: event.telemetry.fuel_level_percent,
        odometer: event.telemetry.odometer_km
      }
    };
  }

  handleRefuelingStarted(event, tripState) {
    return {
      type: 'REFUELING_STARTED',
      payload: {
        event,
        location: event.location,
        startTime: new Date(event.timestamp)
      }
    };
  }

  handleRefuelingCompleted(event, tripState) {
    return {
      type: 'REFUELING_COMPLETED',
      payload: {
        event,
        location: event.location,
        duration: event.refuel_duration_minutes,
        fuelLevelAfter: event.fuel_level_after_refuel,
        fuelAdded: event.fuel_added_percent
      }
    };
  }

  handleGenericEvent(event, tripState) {
    return {
      type: event.event_type.toUpperCase(),
      payload: { event }
    };
  }

  // Batch processing for performance
  processEvents(events, tripStates) {
    const results = [];
    const newEvents = events.filter(event => !this.processedEvents.has(event.event_id));

    for (const event of newEvents) {
      const tripState = tripStates[event.trip_id];
      if (tripState) {
        const result = this.processEvent(event, tripState);
        if (result) {
          results.push(result);
          this.processedEvents.add(event.event_id);
        }
      }
    }

    return results;
  }

  // Get event statistics
  getEventStatistics(events) {
    const stats = {
      total: events.length,
      byType: {},
      alerts: 0,
      locations: 0,
      telemetry: 0
    };

    events.forEach(event => {
      // Count by type
      stats.byType[event.event_type] = (stats.byType[event.event_type] || 0) + 1;
      
      // Count categories
      if (this.alertTypes.has(event.event_type)) {
        stats.alerts++;
      }
      if (event.event_type === 'location_ping') {
        stats.locations++;
      }
      if (event.event_type === 'vehicle_telemetry') {
        stats.telemetry++;
      }
    });

    return stats;
  }

  // Filter events by criteria
  filterEvents(events, filters) {
    return events.filter(event => {
      if (filters.tripId && event.trip_id !== filters.tripId) return false;
      if (filters.eventType && event.event_type !== filters.eventType) return false;
      if (filters.vehicleId && event.vehicle_id !== filters.vehicleId) return false;
      if (filters.isAlert && !this.alertTypes.has(event.event_type)) return false;
      
      if (filters.timeRange) {
        const eventTime = new Date(event.timestamp);
        if (filters.timeRange.start && eventTime < filters.timeRange.start) return false;
        if (filters.timeRange.end && eventTime > filters.timeRange.end) return false;
      }

      return true;
    });
  }

  // Get events for a specific time window
  getEventsInTimeWindow(events, startTime, endTime) {
    return events.filter(event => {
      const eventTime = new Date(event.timestamp);
      return eventTime >= startTime && eventTime <= endTime;
    });
  }

  // Clear processed events (useful for simulation reset)
  clearProcessedEvents() {
    this.processedEvents.clear();
  }

  // Check if event is an alert
  isAlertEvent(event) {
    return this.alertTypes.has(event.event_type);
  }

  // Get event severity for styling
  getEventSeverity(event) {
    if (!this.isAlertEvent(event)) return 'info';
    
    switch (event.event_type) {
      case 'speed_violation':
        return event.violation_amount_kmh > 20 ? 'high' : 'medium';
      case 'device_error':
        return event.severity || 'medium';
      case 'trip_cancelled':
        return 'high';
      default:
        return 'medium';
    }
  }

  // Format event for display
  formatEventForDisplay(event) {
    const baseEvent = {
      id: event.event_id,
      type: event.event_type,
      displayType: EVENT_TYPE_LABELS[event.event_type] || event.event_type,
      timestamp: new Date(event.timestamp),
      vehicleId: event.vehicle_id,
      tripId: event.trip_id,
      isAlert: this.isAlertEvent(event),
      severity: this.getEventSeverity(event)
    };

    // Add event-specific data
    switch (event.event_type) {
      case 'location_ping':
        return {
          ...baseEvent,
          location: event.location,
          speed: event.movement?.speed_kmh,
          heading: event.movement?.heading_degrees,
          distance: event.distance_travelled_km
        };
      case 'speed_violation':
        return {
          ...baseEvent,
          speedLimit: event.speed_limit_kmh,
          actualSpeed: event.movement?.speed_kmh,
          violationAmount: event.violation_amount_kmh
        };
      case 'vehicle_telemetry':
        return {
          ...baseEvent,
          fuelLevel: event.telemetry?.fuel_level_percent,
          odometer: event.telemetry?.odometer_km
        };
      default:
        return baseEvent;
    }
  }
}

// Create singleton instance
export const eventProcessor = new EventProcessor();