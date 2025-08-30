import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { getEvents } from '../services/apiService'; // Zaimportuj funkcję

const containerStyle = {
  width: '100%',
  height: '80vh',
};

const center = {
  lat: 52.2297,
  lng: 21.0122,
};

const MapContainer = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // Stan do przechowywania listy wydarzeń
  const [events, setEvents] = useState([]);

  // useEffect do pobrania danych, gdy komponent jest gotowy
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getEvents();
        setEvents(response.data); // Zapisz pobrane wydarzenia w stanie
      } catch (error) {
        console.error('Błąd podczas pobierania wydarzeń:', error);
      }
    };

    fetchEvents();
  }, []); // Pusta tablica zależności oznacza, że efekt uruchomi się tylko raz

  return isLoaded ? (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
      {/* Mapowanie po liście wydarzeń i renderowanie dla każdego znacznika */}
      {events.map((event) => (
        <Marker
          key={event.id}
          position={{ lat: parseFloat(event.latitude), lng: parseFloat(event.longitude) }}
          title={event.title}
        />
      ))}
    </GoogleMap>
  ) : <p>Ładowanie mapy...</p>;
};

export default React.memo(MapContainer);