<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Fix us_state_metric.metric_value column type from DECIMAL to TEXT
 */
final class Version20250115000003 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Fix us_state_metric.metric_value column type from DECIMAL to TEXT';
    }

    public function up(Schema $schema): void
    {
        // Check if the table exists
        if (!$schema->hasTable('us_state_metric')) {
            return;
        }

        $table = $schema->getTable('us_state_metric');
        
        // Check if the column exists and has the wrong type
        if ($table->hasColumn('metric_value')) {
            $column = $table->getColumn('metric_value');
            if ($column->getType()->getName() === 'decimal') {
                $this->addSql('ALTER TABLE us_state_metric ALTER COLUMN metric_value TYPE TEXT');
            }
        }
    }

    public function down(Schema $schema): void
    {
        // Check if the table exists
        if (!$schema->hasTable('us_state_metric')) {
            return;
        }

        $table = $schema->getTable('us_state_metric');
        
        // Check if the column exists
        if ($table->hasColumn('metric_value')) {
            $this->addSql('ALTER TABLE us_state_metric ALTER COLUMN metric_value TYPE DECIMAL(15,4)');
        }
    }
}
