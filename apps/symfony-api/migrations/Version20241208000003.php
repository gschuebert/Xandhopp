<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add profile and address fields to users table
 */
final class Version20241208000003 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add profile and address fields to users table';
    }

    public function up(Schema $schema): void
    {
        // Add profile fields
        $this->addSql('ALTER TABLE users ADD COLUMN first_name TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN last_name TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN date_of_birth DATE DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN nationality TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN current_country TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN current_city TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN profession TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN company TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN website TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN linkedin TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL');

        // Add address fields
        $this->addSql('ALTER TABLE users ADD COLUMN address_line1 TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN address_line2 TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN city TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN state TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN postal_code TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN country TEXT DEFAULT NULL');

        // Add preferences
        $this->addSql('ALTER TABLE users ADD COLUMN preferred_language TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN email_notifications BOOLEAN DEFAULT TRUE NOT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN marketing_emails BOOLEAN DEFAULT TRUE NOT NULL');
        $this->addSql('ALTER TABLE users ADD COLUMN profile_public BOOLEAN DEFAULT FALSE NOT NULL');

        // Create indexes for common queries
        $this->addSql('CREATE INDEX idx_users_first_name ON users (first_name)');
        $this->addSql('CREATE INDEX idx_users_last_name ON users (last_name)');
        $this->addSql('CREATE INDEX idx_users_nationality ON users (nationality)');
        $this->addSql('CREATE INDEX idx_users_current_country ON users (current_country)');
        $this->addSql('CREATE INDEX idx_users_country ON users (country)');
        $this->addSql('CREATE INDEX idx_users_profession ON users (profession)');
    }

    public function down(Schema $schema): void
    {
        // Drop indexes
        $this->addSql('DROP INDEX IF EXISTS idx_users_first_name');
        $this->addSql('DROP INDEX IF EXISTS idx_users_last_name');
        $this->addSql('DROP INDEX IF EXISTS idx_users_nationality');
        $this->addSql('DROP INDEX IF EXISTS idx_users_current_country');
        $this->addSql('DROP INDEX IF EXISTS idx_users_country');
        $this->addSql('DROP INDEX IF EXISTS idx_users_profession');

        // Drop profile fields
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS first_name');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS last_name');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS date_of_birth');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS nationality');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS current_country');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS current_city');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS profession');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS company');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS website');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS linkedin');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS bio');

        // Drop address fields
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS address_line1');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS address_line2');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS city');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS state');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS postal_code');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS country');

        // Drop preferences
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS preferred_language');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS timezone');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS email_notifications');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS marketing_emails');
        $this->addSql('ALTER TABLE users DROP COLUMN IF EXISTS profile_public');
    }
}
