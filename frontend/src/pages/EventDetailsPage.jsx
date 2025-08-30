import React from 'react';
import { useParams } from 'react-router-dom';

const EventDetailsPage = () => {
  const { id } = useParams(); // Hook do odczytania ID wydarzenia z URL

  return (
    <div>
      <h2>Szczegóły wydarzenia</h2>
      <p>ID wybranego wydarzenia: {id}</p>
      {/* Tutaj w przyszłości pojawią się pełne informacje o wydarzeniu */}
    </div>
  );
};

export default EventDetailsPage;