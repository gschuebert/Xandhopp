# Build stage
FROM php:8.2-fpm-alpine AS builder

# Install system dependencies
RUN apk add --no-cache \
    git \
    unzip \
    libzip-dev \
    postgresql-dev \
    icu-dev \
    oniguruma-dev \
    && docker-php-ext-install \
    pdo \
    pdo_pgsql \
    zip \
    intl \
    mbstring \
    opcache

# Install Redis extension
RUN apk add --no-cache redis-dev \
    && pecl install redis \
    && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy composer files
COPY composer.json composer.lock ./

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy application code
COPY . .

# Generate JWT keys
RUN mkdir -p config/jwt
RUN openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096 -pass pass:portalis
RUN openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout -passin pass:portalis

# Set permissions
RUN chown -R www-data:www-data /app
RUN chmod -R 755 /app

# Production stage with Caddy
FROM caddy:2-alpine

# Install PHP
RUN apk add --no-cache \
    php83 \
    php83-fpm \
    php83-pdo \
    php83-pdo_pgsql \
    php83-zip \
    php83-intl \
    php83-mbstring \
    php83-opcache \
    php83-session \
    php83-tokenizer \
    php83-xml \
    php83-ctype \
    php83-json \
    php83-pcntl \
    php83-redis \
    supervisor

# Copy Caddy configuration
COPY <<EOF /etc/caddy/Caddyfile
:8080 {
    root * /app/public
    
    # Enable compression
    encode gzip
    
    # Handle PHP files
    php_fastcgi unix//run/php-fpm.sock
    
    # Fallback for API Platform routes
    try_files {path} {path}/ /index.php?{query}
    
    # Security headers
    header {
        X-Frame-Options DENY
        X-Content-Type-Options nosniff
        Referrer-Policy strict-origin-when-cross-origin
    }
    
    # CORS for development
    header Access-Control-Allow-Origin "http://localhost:3000, http://localhost:3001"
    header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    header Access-Control-Allow-Headers "Content-Type, Authorization"
}
EOF

# Copy PHP-FPM configuration
COPY <<EOF /etc/php83/php-fpm.d/www.conf
[www]
user = caddy
group = caddy
listen = /run/php-fpm.sock
listen.owner = caddy
listen.group = caddy
pm = dynamic
pm.max_children = 20
pm.start_servers = 2
pm.min_spare_servers = 1
pm.max_spare_servers = 3
EOF

# Copy supervisor configuration
COPY <<EOF /etc/supervisor/conf.d/services.conf
[supervisord]
nodaemon=true
user=root

[program:php-fpm]
command=php-fpm83 --nodaemonize
autostart=true
autorestart=true
stderr_logfile=/var/log/php-fpm.err.log
stdout_logfile=/var/log/php-fpm.out.log

[program:caddy]
command=caddy run --config /etc/caddy/Caddyfile
autostart=true
autorestart=true
stderr_logfile=/var/log/caddy.err.log
stdout_logfile=/var/log/caddy.out.log
EOF

# Copy application from builder stage
COPY --from=builder --chown=caddy:caddy /app /app

# Set working directory
WORKDIR /app

# Expose port
EXPOSE 8080

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/services.conf"]
