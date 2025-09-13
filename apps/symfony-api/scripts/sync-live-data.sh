#!/bin/bash

# Live Data Sync Script for Xandhopp
# This script runs the live data synchronization command
# Designed to be called by cron every 6 hours

# Set working directory
cd "$(dirname "$0")/.."

# Log file
LOG_FILE="var/log/live-sync.log"
mkdir -p "$(dirname "$LOG_FILE")"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting live data sync..."

# Run the sync command
php bin/console app:countries:sync-live 2>&1 | while read line; do
    log "$line"
done

# Check exit code
if [ $? -eq 0 ]; then
    log "Live data sync completed successfully"
else
    log "Live data sync failed with exit code $?"
fi

log "Live data sync finished"
