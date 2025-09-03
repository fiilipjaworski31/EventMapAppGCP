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
    console.log("Fetching events with filters:", filters);
    eventService.getAllEvents(filters)
      .then(response => {
        setEvents(response.data);
      })
      .catch(error => {
        console.error("Error fetching events!", error);
      });
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
              <div>
                <h4>{selectedEvent.title}</h4>
                <p>{selectedEvent.address}</p>
                <Link to={`/event/${selectedEvent.id}`}>See Details</Link>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
};

export default MapContainer;