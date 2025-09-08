<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241207000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create early_access_registrations table';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE early_access_registrations (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            locale VARCHAR(5) NOT NULL DEFAULT \'en\',
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        )');
        
        $this->addSql('CREATE INDEX idx_early_access_email ON early_access_registrations (email)');
        $this->addSql('CREATE INDEX idx_early_access_created_at ON early_access_registrations (created_at)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE early_access_registrations');
    }
}
