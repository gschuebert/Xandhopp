.PHONY: help up down build install dev clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Start all services with docker-compose
	docker-compose up -d

down: ## Stop all services
	docker-compose down

build: ## Build all docker images
	docker-compose build

install: ## Install dependencies for all packages
	pnpm install

dev: ## Start development servers
	pnpm run dev

clean: ## Clean all build artifacts
	pnpm run clean
	docker-compose down -v
	docker system prune -f

# Database commands
db-create: ## Create database
	docker-compose exec api php bin/console doctrine:database:create --if-not-exists

db-migrate: ## Run database migrations
	docker-compose exec api php bin/console doctrine:migrations:migrate -n

db-seed: ## Seed database with demo data
	docker-compose exec api php bin/console app:seed:demo

# API commands
api-docs: ## Generate OpenAPI documentation
	pnpm --filter @xandhopp/shared run generate:openapi

# Full setup
setup: install up db-create db-migrate db-seed api-docs ## Complete setup for development
