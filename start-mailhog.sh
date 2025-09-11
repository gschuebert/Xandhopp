#!/bin/bash
set -euo pipefail

echo "📧 Starting MailHog for email testing..."

# Start MailHog
echo "🚀 Starting MailHog service..."
docker compose up -d mailhog

# Wait for MailHog to be ready
echo "⏳ Waiting for MailHog to be ready..."
sleep 5

# Test MailHog
if curl -s http://localhost:8025 > /dev/null 2>&1; then
    echo "✅ MailHog is running and accessible"
    echo ""
    echo "📧 MailHog Web UI: http://localhost:8025"
    echo "📮 SMTP Server: localhost:1025"
    echo ""
    echo "🔧 API Configuration:"
    echo "   MAILER_DSN=smtp://mailhog:1025"
    echo ""
    echo "📝 To test email sending:"
    echo "   1. Register a new account at /en/register"
    echo "   2. Check MailHog UI at http://localhost:8025"
    echo "   3. All emails will be captured and displayed there"
else
    echo "❌ MailHog is not accessible. Check logs:"
    docker compose logs mailhog --tail=20
fi
