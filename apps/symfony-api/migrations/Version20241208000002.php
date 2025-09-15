<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add security fields to users table
 */
final class Version20241208000002 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add security fields to users table for enhanced authentication';
    }

    public function up(Schema $schema): void
    {
        // Add security fields to users table
        $this->addSql('ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE NOT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN password_hash TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN totp_secret TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE NOT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN backup_codes TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN phone_number TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE NOT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN login_attempts INTEGER DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN last_login_attempt TIMESTAMPTZ DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN locked_until TIMESTAMPTZ DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN last_known_ips TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN trusted_devices TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN last_login_at TIMESTAMPTZ DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN last_login_ip TEXT DEFAULT NULL');

        // Create indexes for security queries
        $this->addSql('CREATE INDEX idx_users_email_verified ON users (email_verified)');
        $this->addSql('CREATE INDEX idx_users_two_factor_enabled ON users (two_factor_enabled)');
        $this->addSql('CREATE INDEX idx_users_locked_until ON users (locked_until)');
        $this->addSql('CREATE INDEX idx_users_last_login_at ON users (last_login_at)');
    }

    public function down(Schema $schema): void
    {
        // Drop indexes
        $this->addSql('DROP INDEX IF EXISTS idx_users_email_verified');
        $this->addSql('DROP INDEX IF EXISTS idx_users_two_factor_enabled');
        $this->addSql('DROP INDEX IF EXISTS idx_users_locked_until');
        $this->addSql('DROP INDEX IF EXISTS idx_users_last_login_at');

        // Drop security fields
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS email_verified');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS password_hash');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS totp_secret');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS two_factor_enabled');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS backup_codes');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS phone_number');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS phone_verified');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS login_attempts');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS last_login_attempt');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS locked_until');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS last_known_ips');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS trusted_devices');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS last_login_at');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS last_login_ip');
    }
}
