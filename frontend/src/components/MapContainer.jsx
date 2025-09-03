// frontend/src/components/MapContainer.jsx

import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { Link } from 'react-router-dom';
import eventService from '../services/event.service';

const center = {
  lat: 52.2297, // Warsaw
  lng: 21.0122
};

const MapContainer = ({ filters }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    let isCancelled = false; // Flag to prevent state updates if component unmounts
    
    const fetchEvents = async () => {
      try {
        console.log("Fetching events with filters:", filters);
        const response = await eventService.getAllEvents(filters);
        
        // Only update state if the effect hasn't been cancelled
        if (!isCancelled) {
          setEvents(response.data);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Error fetching events!", error);
        }
      }
    };

    fetchEvents();

    // Cleanup function to cancel the effect if component unmounts
    return () => {
      isCancelled = true;
    };
  }, [filters]); // Re-run effect whenever filters change

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <div style={{ width: '100%', height: 'calc(100vh - 60px)' }}>
        <Map
          defaultCenter={center}
          defaultZoom={12}
          mapId={import.meta.env.VITE_GOOGLE_MAPS_ID}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        >
          {events.map(event => (
            <AdvancedMarker
              key={event.id}
              position={{
                lat: parseFloat(event.latitude),
                lng: parseFloat(event.longitude)
              }}
              onClick={() => setSelectedEvent(event)}
            />
          ))}

          {selectedEvent && (
            <InfoWindow
              position={{ lat: parseFloat(selectedEvent.latitude), lng: parseFloat(selectedEvent.longitude) }}
              onCloseClick={() => setSelectedEvent(null)}
            >
              <div style={{ maxWidth: '280px', padding: '8px' }}>
                {/* Zdjęcie wydarzenia */}
                {selectedEvent.image_url && (
                  <img 
                    src={selectedEvent.image_url} 
                    alt={selectedEvent.title}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '10px'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none'; // Ukryj obrazek jeśli się nie załaduje
                    }}
                  />
                )}
                
                {/* Tytuł wydarzenia */}
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#333',
                  lineHeight: '1.3'
                }}>
                  {selectedEvent.title}
                </h4>
                
                {/* Data rozpoczęcia */}
                {selectedEvent.start_time && (
                  <p style={{ 
                    margin: '0 0 6px 0', 
                    fontSize: '14px',
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '16px' }}>🗓️</span>
                    {new Date(selectedEvent.start_time).toLocaleString('pl-PL', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
                
                {/* Lokalizacja */}
                {(selectedEvent.venue_name || selectedEvent.address) && (
                  <p style={{ 
                    margin: '0 0 10px 0', 
                    fontSize: '14px',
                    color: '#666',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '16px', marginTop: '1px' }}>📍</span>
                    <span>
                      {selectedEvent.venue_name && (
                        <strong>{selectedEvent.venue_name}</strong>
                      )}
                      {selectedEvent.venue_name && selectedEvent.address && <br />}
                      {selectedEvent.address}
                    </span>
                  </p>
                )}
                
                {/* Link do szczegółów */}
                <Link 
                  to={`/event/${selectedEvent.id}`}
                  style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    backgroundColor: '#007cba',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginTop: '8px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#005a87'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#007cba'}
                >
                  Zobacz szczegóły
                </Link>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
};

export default MapContainer;