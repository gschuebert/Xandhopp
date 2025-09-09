<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Create users, waitlist, consent_log, referrals, and freemium tables
 */
final class Version20241208000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create users, waitlist, consent_log, referrals, and freemium tables';
    }

    public function up(Schema $schema): void
    {
        // Enable pgcrypto extension
        $this->addSql('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

        // Users table
        $this->addSql('CREATE TABLE IF NOT EXISTS users (
            id BIGSERIAL PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            stytch_user_id TEXT UNIQUE,
            role TEXT NOT NULL DEFAULT \'user\',
            referral_code CHAR(8) UNIQUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );');

        // Waitlist signups table
        $this->addSql('CREATE TABLE IF NOT EXISTS waitlist_signups (
            id BIGSERIAL PRIMARY KEY,
            email TEXT NOT NULL,
            email_norm TEXT GENERATED ALWAYS AS (lower(email)) STORED,
            email_sha256 BYTEA GENERATED ALWAYS AS (digest(lower(email), \'sha256\')) STORED,
            locale VARCHAR(10),
            country_interest CHAR(2),
            referral_code CHAR(8) NOT NULL,
            referred_by CHAR(8),
            utm JSONB,
            ip INET,
            user_agent VARCHAR(255),
            opt_in_status TEXT NOT NULL DEFAULT \'pending\' CHECK (opt_in_status IN (\'pending\',\'confirmed\',\'unsubscribed\')),
            opt_in_token TEXT NOT NULL,
            token_expires_at TIMESTAMPTZ NOT NULL,
            confirmed_at TIMESTAMPTZ,
            user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT uniq_waitlist_email_norm UNIQUE (email_norm)
        );');

        // Indexes for waitlist
        $this->addSql('CREATE INDEX IF NOT EXISTS idx_waitlist_status_created ON waitlist_signups (opt_in_status, created_at);');
        $this->addSql('CREATE INDEX IF NOT EXISTS idx_waitlist_referral_code ON waitlist_signups (referral_code);');
        $this->addSql('CREATE INDEX IF NOT EXISTS idx_waitlist_email_sha256 ON waitlist_signups (email_sha256);');

        // Updated_at trigger function
        $this->addSql('CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
            BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;');

        // Updated_at trigger for waitlist
        $this->addSql('DROP TRIGGER IF EXISTS trg_waitlist_updated_at ON waitlist_signups;');
        $this->addSql('CREATE TRIGGER trg_waitlist_updated_at BEFORE UPDATE ON waitlist_signups
            FOR EACH ROW EXECUTE FUNCTION set_updated_at();');

        // Consent log table
        $this->addSql('CREATE TABLE IF NOT EXISTS consent_log (
            id BIGSERIAL PRIMARY KEY,
            subject_email_sha256 BYTEA NOT NULL,
            type TEXT NOT NULL CHECK (type IN (\'prelaunch_opt_in\',\'unsubscribe\',\'privacy_request\')),
            text_snapshot TEXT NOT NULL,
            timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
            ip INET,
            user_agent VARCHAR(255),
            details JSONB
        );');
        $this->addSql('CREATE INDEX IF NOT EXISTS idx_consent_subject_time ON consent_log (subject_email_sha256, timestamp);');

        // Waitlist referrals table
        $this->addSql('CREATE TABLE IF NOT EXISTS waitlist_referrals (
            id BIGSERIAL PRIMARY KEY,
            referrer_code CHAR(8) NOT NULL,
            referee_email_sha256 BYTEA NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT uniq_ref UNIQUE (referrer_code, referee_email_sha256)
        );');

        // Freemium features table
        $this->addSql('CREATE TABLE IF NOT EXISTS features (
            key TEXT PRIMARY KEY,
            unit TEXT NOT NULL
        );');

        // Freemium plans table
        $this->addSql('CREATE TABLE IF NOT EXISTS plans (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL
        );');

        // Plan entitlements table
        $this->addSql('CREATE TABLE IF NOT EXISTS plan_entitlements (
            plan_id TEXT REFERENCES plans(id),
            feature_key TEXT REFERENCES features(key),
            limit_per_period INT,
            period TEXT NOT NULL,
            enabled BOOLEAN DEFAULT TRUE,
            PRIMARY KEY (plan_id, feature_key)
        );');

        // Subscriptions table
        $this->addSql('CREATE TABLE IF NOT EXISTS subscriptions (
            user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            plan_id TEXT REFERENCES plans(id),
            started_at TIMESTAMPTZ DEFAULT now()
        );');

        // Usage events table
        $this->addSql('CREATE TABLE IF NOT EXISTS usage_events (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            feature_key TEXT NOT NULL,
            qty INT NOT NULL DEFAULT 1,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE IF EXISTS usage_events;');
        $this->addSql('DROP TABLE IF EXISTS subscriptions;');
        $this->addSql('DROP TABLE IF EXISTS plan_entitlements;');
        $this->addSql('DROP TABLE IF EXISTS plans;');
        $this->addSql('DROP TABLE IF EXISTS features;');
        $this->addSql('DROP TABLE IF EXISTS waitlist_referrals;');
        $this->addSql('DROP TABLE IF EXISTS consent_log;');
        $this->addSql('DROP TRIGGER IF EXISTS trg_waitlist_updated_at ON waitlist_signups;');
        $this->addSql('DROP FUNCTION IF EXISTS set_updated_at();');
        $this->addSql('DROP TABLE IF EXISTS waitlist_signups;');
        $this->addSql('DROP TABLE IF EXISTS users;');
    }
}
