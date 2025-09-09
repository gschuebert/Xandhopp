#!/usr/bin/env bash
set -euo pipefail

# Prune expired waitlist entries
# This script removes waitlist signups that have been pending for more than 30 days

echo "Starting waitlist cleanup at $(date)"

# Database connection string
DB_URL="${DATABASE_URL:-postgresql://xandhopp:xandhopp@localhost:5432/xandhopp}"

# Execute cleanup query
psql "$DB_URL" -v ON_ERROR_STOP=1 -c "
  DELETE FROM waitlist_signups
  WHERE opt_in_status = 'pending' 
    AND created_at < (now() - interval '30 days');
  
  -- Log the cleanup
  INSERT INTO consent_log (subject_email_sha256, type, text_snapshot, timestamp)
  SELECT 
    email_sha256,
    'privacy_request',
    'Expired waitlist entry automatically removed after 30 days',
    now()
  FROM waitlist_signups
  WHERE opt_in_status = 'pending' 
    AND created_at < (now() - interval '30 days');
"

echo "Waitlist cleanup completed at $(date)"
