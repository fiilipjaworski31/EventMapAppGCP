#!/bin/bash

# Stop on any error
set -e

# --- Configuration - Change these values ---
FUNCTION_NAME="fetch-ticketmaster-events"
REGION="europe-central2"
RUNTIME="nodejs22"
ENTRY_POINT="fetchTicketmasterEvents"
TRIGGER_TOPIC="daily-event-fetch-trigger"
SQL_INSTANCE_CONNECTION_NAME="healthy-result-469611-e9:europe-central2:event-map-db"
TICKETMASTER_API_KEY="hDnIlCqkVnpOU5sY2URzsd3LerZEtfrZ"
DB_PASSWORD_SECRET_NAME="db-password"
# ------------------------------------

echo "Rozpoczynam wdrożenie funkcji $FUNCTION_NAME..."

# The gcloud command will now securely set the DB_PASSWORD environment variable
# for the function by referencing the secret in Secret Manager.
gcloud functions deploy "$FUNCTION_NAME" \
  --gen2 \
  --runtime="$RUNTIME" \
  --region="$REGION" \
  --source=. \
  --entry-point="$ENTRY_POINT" \
  --trigger-topic="$TRIGGER_TOPIC" \
  --set-env-vars="TICKETMASTER_API_KEY=$TICKETMASTER_API_KEY,INSTANCE_CONNECTION_NAME=$SQL_INSTANCE_CONNECTION_NAME" \
  --set-secrets="DB_PASSWORD=$DB_PASSWORD_SECRET_NAME:latest"

# For Gen2 functions, we need to add the Cloud SQL connection to the underlying Cloud Run service
echo "Adding Cloud SQL connection to the underlying Cloud Run service..."
gcloud run services update "$FUNCTION_NAME" \
  --region="$REGION" \
  --add-cloudsql-instances="$SQL_INSTANCE_CONNECTION_NAME" \
  --add-cloudsql-instances="$SQL_INSTANCE_CONNECTION_NAME"

echo "✅ Wdrożenie zakończone pomyślnie."