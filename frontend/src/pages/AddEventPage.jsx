import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import eventService from '../services/event.service';
import { useAuth } from '../context/AuthContext';
import './AddEventPage.css';

const AddEventPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Add state for all fields including the new ones
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [venueName, setVenueName] = useState('');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be logged in to add an event.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lon)) {
      setError('Latitude and Longitude must be valid numbers.');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      
      // Add all fields to the data object sent to the API
      const eventData = {
        title,
        description,
        start_time: startTime,
        end_time: endTime || null,
        latitude: lat,
        longitude: lon,
        address,
        url,
        image_url: imageUrl,
        venue_name: venueName,
      };
      
      await eventService.createEvent(eventData, token);
      
      navigate('/'); 

    } catch (err) {
      setError('An error occurred while adding the event. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-container">
        <h2 className="form-title">Add a New Event</h2>
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
              placeholder="Enter event title"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your event..."
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Venue Name</label>
              <input 
                type="text" 
                value={venueName} 
                onChange={e => setVenueName(e.target.value)}
                placeholder="e.g., Warsaw Conference Center"
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input 
                type="text" 
                value={address} 
                onChange={e => setAddress(e.target.value)}
                placeholder="Full address"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <input 
                type="datetime-local" 
                value={startTime} 
                onChange={e => setStartTime(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>End Time <span className="optional">(optional)</span></label>
              <input 
                type="datetime-local" 
                value={endTime} 
                onChange={e => setEndTime(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Event URL <span className="optional">(optional)</span></label>
              <input 
                type="url" 
                value={url} 
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/event-page"
              />
            </div>
            <div className="form-group">
              <label>Image URL <span className="optional">(optional)</span></label>
              <input 
                type="url" 
                value={imageUrl} 
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://example.com/event-image.jpg"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Latitude</label>
              <input 
                type="number" 
                step="any" 
                value={latitude} 
                onChange={e => setLatitude(e.target.value)} 
                required 
                placeholder="e.g., 52.2297" 
              />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input 
                type="number" 
                step="any" 
                value={longitude} 
                onChange={e => setLongitude(e.target.value)} 
                required 
                placeholder="e.g., 21.0122" 
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={isSubmitting} className="submit-button">
            {isSubmitting ? 'Adding Event...' : 'Add Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEventPage;