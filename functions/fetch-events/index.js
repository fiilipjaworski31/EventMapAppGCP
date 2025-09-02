const functions = require('@google-cloud/functions-framework');
const axios = require('axios');
const knex = require('knex');

// The main function, triggered by a Pub/Sub event
functions.cloudEvent('fetchTicketmasterEvents', async (cloudEvent) => {
  console.log('Starting to fetch events from Ticketmaster...');
  
  try {
    // --- 1. Read all required configuration from environment variables ---
    const apiKey = process.env.TICKETMASTER_API_KEY;
    const instanceConnectionName = process.env.INSTANCE_CONNECTION_NAME;
    const dbPassword = process.env.DB_PASSWORD; // Injected securely by the --set-secrets flag

    // Check if all variables are present
    if (!apiKey || !instanceConnectionName || !dbPassword) {
      throw new Error('One or more required environment variables are missing!');
    }
    
    // --- 2. Fetch data from the external API ---
    const apiUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&city=Warsaw&countryCode=PL&size=50`;

    const response = await axios.get(apiUrl);
    if (!response.data._embedded || !response.data._embedded.events) {
      console.log('No new events found in the API response.');
      return; // End execution if no events are found
    }
    const eventsFromApi = response.data._embedded.events;
    console.log(`Successfully fetched ${eventsFromApi.length} events!`);
    
    // DEBUG: Log sample event structure
    if (eventsFromApi.length > 0) {
      console.log('Sample event structure:', JSON.stringify(eventsFromApi[0], null, 2));
    }

    // --- 3. Connect to the database using Knex ---
    const db = knex({
      client: 'pg',
      connection: {
        user: 'postgres',
        password: dbPassword,
        database: 'eventsdb',
        host: `/cloudsql/${instanceConnectionName}`, // Use the secure Unix socket
      }
    });

    // --- 4. Process and save events to the database ---
    console.log('Processing and saving events...');
    let eventsSaved = 0;
    let eventsSkipped = 0;
    
    for (const event of eventsFromApi) {
      try {
        // --- WALIDACJA DANYCH ---
        // Sprawdź czy event ma wymagane dane czasowe
        const startDateTime = event.dates?.start?.dateTime || event.dates?.start?.localDate;
        if (!startDateTime) {
          console.log(`Skipping event "${event.name}" - missing start time`);
          eventsSkipped++;
          continue;
        }

        // Sprawdź czy event ma dane lokalizacyjne
        const venue = event._embedded?.venues?.[0];
        const latitude = parseFloat(venue?.location?.latitude);
        const longitude = parseFloat(venue?.location?.longitude);
        
        if (isNaN(latitude) || isNaN(longitude)) {
          console.log(`Skipping event "${event.name}" - missing location data`);
          eventsSkipped++;
          continue;
        }

        // --- MAPOWANIE DANYCH ---
        const newEvent = {
          external_id: event.id,
          title: event.name,
          description: event.info || event.pleaseNote || `More info at: ${event.url}`,
          start_time: startDateTime, // Już zwalidowane powyżej
          end_time: event.dates?.end?.dateTime || event.dates?.end?.localDate || null,
          latitude: latitude,
          longitude: longitude,
          address: venue?.address?.line1 || venue?.name || 'Address not available',
          creator_id: 1, // Assign a system user ID for imported events
        };

        // Dodatkowa walidacja przed zapisem
        if (!newEvent.external_id || !newEvent.title) {
          console.log(`Skipping event - missing required fields: external_id=${newEvent.external_id}, title=${newEvent.title}`);
          eventsSkipped++;
          continue;
        }

        // --- ZAPIS DO BAZY ---
        const result = await db('events')
          .insert(newEvent)
          .onConflict('external_id')
          .ignore();
        
        if (result.rowCount > 0) {
          eventsSaved++;
          console.log(`✅ Saved event: "${newEvent.title}"`);
        } else {
          console.log(`ℹ️ Event "${newEvent.title}" already exists (skipped due to duplicate external_id)`);
        }

      } catch (eventError) {
        console.error(`Error processing event "${event.name}":`, eventError);
        eventsSkipped++;
        // Continue with next event instead of failing the entire function
        continue;
      }
    }

    console.log(`✅ Finished processing. Saved ${eventsSaved} new events, skipped ${eventsSkipped} events.`);
    
    // Close database connection
    await db.destroy();

  } catch (error) {
    console.error('An error occurred:', error);
    throw error; // Re-throw the error to ensure the function execution is marked as failed
  }
});