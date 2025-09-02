import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { Link } from 'react-router-dom';
import eventService from '../services/event.service';
import './MapContainer.css';

const containerStyle = {
  width: '100%',
  height: '60vh'
};

const center = {
  lat: 52.2297, // Centrum Warszawy
  lng: 21.0122
};

const MapContainer = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    eventService.getAllEvents()
      .then(response => {
        setEvents(response.data);
      })
      .catch(error => {
        console.error("Błąd podczas pobierania wydarzeń!", error);
      });
  }, []);

  return (
    // APIProvider to nowy, wymagany komponent opakowujący mapę
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
  <div className="map-container">
        <Map
          defaultCenter={center}
          defaultZoom={12}
          mapId={import.meta.env.VITE_GOOGLE_MAPS_ID} // Map ID jest tutaj kluczowe
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        >
          {events.map(event => (
            <AdvancedMarker
              key={event.id}
              position={{ 
                lat: parseFloat(event.latitude), // <-- POPRAWIONE
                lng: parseFloat(event.longitude) // <-- POPRAWIONE
              }}
              onClick={() => setSelectedEvent(event)}
            />
          ))}

          {selectedEvent && (
            <InfoWindow
              position={{ lat: parseFloat(selectedEvent.latitude), lng: parseFloat(selectedEvent.longitude) }}
              onCloseClick={() => setSelectedEvent(null)}
            >
              <div className="custom-info-window">
                <h4>{selectedEvent.title}</h4>
                <p>{selectedEvent.address}</p>
                <Link to={`/event/${selectedEvent.id}`}>Zobacz szczegóły</Link>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
};

export default MapContainer;