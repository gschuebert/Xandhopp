#!/bin/bash

# Bash script to setup xandhopp.local subdomain
# Run this with sudo

echo "Setting up xandhopp.local subdomain..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "This script requires root privileges. Please run with sudo."
    exit 1
fi

# Add entries to hosts file
HOSTS_FILE="/etc/hosts"

# Check if entries already exist
if grep -q "xandhopp.local" "$HOSTS_FILE"; then
    echo "Subdomain entries already exist in hosts file."
else
    echo "Adding subdomain entries to hosts file..."
    
    # Create backup
    cp "$HOSTS_FILE" "$HOSTS_FILE.backup.$(date +%Y%m%d-%H%M%S)"
    
    # Add entries
    cat >> "$HOSTS_FILE" << EOF

# Xandhopp local subdomains
127.0.0.1 xandhopp.local
127.0.0.1 admin.xandhopp.local
127.0.0.1 api.xandhopp.local
127.0.0.1 search.xandhopp.local
127.0.0.1 mail.xandhopp.local
127.0.0.1 storage.xandhopp.local
EOF
    
    echo "Hosts file updated successfully!"
fi

echo ""
echo "Subdomain setup complete! You can now access:"
echo "  Main App:     http://xandhopp.local"
echo "  Admin:        http://admin.xandhopp.local"
echo "  API:          http://api.xandhopp.local"
echo "  Search:       http://search.xandhopp.local"
echo "  Mail:         http://mail.xandhopp.local"
echo "  Storage:      http://storage.xandhopp.local"
echo ""
echo "To start the services, run:"
echo "  docker-compose -f docker-compose.subdomain.yml up -d"
