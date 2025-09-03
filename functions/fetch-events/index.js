const functions = require('@google-cloud/functions-framework');
const axios = require('axios');
const knex = require('knex');

// The main function, triggered by a Pub/Sub event
functions.cloudEvent('fetchTicketmasterEvents', async (cloudEvent) => {
  console.log('Starting to fetch events from Ticketmaster...');
  
  try {
    const apiKey = process.env.TICKETMASTER_API_KEY;
    const instanceConnectionName = process.env.INSTANCE_CONNECTION_NAME;
    const dbPassword = process.env.DB_PASSWORD;

    if (!apiKey || !instanceConnectionName || !dbPassword) {
      throw new Error('One or more required environment variables are missing!');
    }
    
    // --- CHANGE #1: Request additional fields from the API ---
    const apiUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&city=Warsaw&countryCode=PL&size=50&fields=id,name,info,pleaseNote,url,images,dates,_embedded`;

    const response = await axios.get(apiUrl);
    if (!response.data._embedded || !response.data._embedded.events) {
      console.log('No new events found in the API response.');
      return;
    }
    const eventsFromApi = response.data._embedded.events;
    console.log(`Successfully fetched ${eventsFromApi.length} events!`);

    const db = knex({
      client: 'pg',
      connection: {
        user: 'postgres',
        password: dbPassword,
        database: 'eventsdb',
        host: `/cloudsql/${instanceConnectionName}`,
      }
    });

    console.log('Processing and saving events...');
    let eventsSaved = 0;
    let eventsUpdated = 0;
    let eventsSkipped = 0;
    
    for (const event of eventsFromApi) {
      try {
        const startDateTime = event.dates?.start?.dateTime || event.dates?.start?.localDate;
        if (!startDateTime) {
          console.log(`Skipping event "${event.name}" - missing start time`);
          eventsSkipped++;
          continue;
        }

        const venue = event._embedded?.venues?.[0];
        const latitude = parseFloat(venue?.location?.latitude);
        const longitude = parseFloat(venue?.location?.longitude);
        
        if (isNaN(latitude) || isNaN(longitude)) {
          console.log(`Skipping event "${event.name}" - missing location data`);
          eventsSkipped++;
          continue;
        }

        // --- CHANGE #2: Map the new fields ---
        const newEvent = {
          external_id: event.id,
          title: event.name,
          description: event.info || event.pleaseNote || `More info at: ${event.url}`,
          start_time: startDateTime,
          end_time: event.dates?.end?.dateTime || event.dates?.end?.localDate || null,
          latitude: latitude,
          longitude: longitude,
          address: venue?.address?.line1 || venue?.name || 'Address not available',
          creator_id: 1,
          // New fields added here:
          url: event.url,
          image_url: event.images?.find(img => img.ratio === '16_9')?.url || event.images?.[0]?.url, // Find a 16:9 image, or fallback to the first one
          venue_name: venue?.name,
        };

        if (!newEvent.external_id || !newEvent.title) {
          console.log(`Skipping event - missing required fields`);
          eventsSkipped++;
          continue;
        }

        // --- CHANGE #3: Use .merge() to update existing events ---
        const result = await db('events')
          .insert(newEvent)
          .onConflict('external_id')
          .merge(); // This will UPDATE the row if the external_id already exists
        
        if (result.rowCount > 0) {
            // In PostgreSQL with .merge(), it's hard to tell if it was an INSERT or UPDATE.
            // We can just count all successful operations.
            eventsSaved++;
        }

      } catch (eventError) {
        console.error(`Error processing event "${event.name}":`, eventError);
        eventsSkipped++;
        continue;
      }
    }

    console.log(`✅ Finished processing. Processed ${eventsSaved + eventsSkipped} events. Saved/Updated ${eventsSaved} events, skipped ${eventsSkipped} events.`);
    
    await db.destroy();

  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
});