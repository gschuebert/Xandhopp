<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250911104431 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP SEQUENCE waitlist_referrals_id_seq CASCADE');
        $this->addSql('CREATE SEQUENCE checklist_item_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE country_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE provider_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE residency_program_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE checklist_item (id INT NOT NULL, country_id INT NOT NULL, title VARCHAR(255) NOT NULL, description TEXT NOT NULL, category VARCHAR(255) NOT NULL, order_index INT NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_99EB20F9F92F3E70 ON checklist_item (country_id)');
        $this->addSql('CREATE TABLE country (id INT NOT NULL, name VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, iso2 VARCHAR(2) NOT NULL, continent VARCHAR(255) NOT NULL, summary TEXT DEFAULT NULL, cost_of_living_index NUMERIC(8, 2) NOT NULL, tax_rate NUMERIC(5, 2) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_5373C966989D9B62 ON country (slug)');
        $this->addSql('COMMENT ON COLUMN country.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN country.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE provider (id INT NOT NULL, country_id INT NOT NULL, name VARCHAR(255) NOT NULL, city VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, phone VARCHAR(255) DEFAULT NULL, services TEXT NOT NULL, rating NUMERIC(3, 2) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_92C4739CF92F3E70 ON provider (country_id)');
        $this->addSql('CREATE TABLE residency_program (id INT NOT NULL, country_id INT NOT NULL, type VARCHAR(50) NOT NULL, name VARCHAR(255) NOT NULL, requirements TEXT NOT NULL, fees NUMERIC(10, 2) NOT NULL, processing_time_days INT NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_969BAAA7F92F3E70 ON residency_program (country_id)');
        $this->addSql('ALTER TABLE checklist_item ADD CONSTRAINT FK_99EB20F9F92F3E70 FOREIGN KEY (country_id) REFERENCES country (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE provider ADD CONSTRAINT FK_92C4739CF92F3E70 FOREIGN KEY (country_id) REFERENCES country (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE residency_program ADD CONSTRAINT FK_969BAAA7F92F3E70 FOREIGN KEY (country_id) REFERENCES country (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('DROP TABLE waitlist_referrals');
        $this->addSql('DROP INDEX idx_consent_subject_time');
        $this->addSql('ALTER TABLE consent_log ALTER id DROP DEFAULT');
        $this->addSql('ALTER TABLE consent_log ALTER "timestamp" TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE consent_log ALTER "timestamp" DROP DEFAULT');
        $this->addSql('COMMENT ON COLUMN consent_log.timestamp IS \'(DC2Type:datetimetz_immutable)\'');
        $this->addSql('DROP INDEX idx_early_access_created_at');
        $this->addSql('DROP INDEX idx_early_access_email');
        $this->addSql('ALTER TABLE early_access_registrations ALTER id DROP DEFAULT');
        $this->addSql('ALTER TABLE early_access_registrations ALTER locale DROP DEFAULT');
        $this->addSql('ALTER TABLE early_access_registrations ALTER created_at DROP DEFAULT');
        $this->addSql('ALTER TABLE early_access_registrations ALTER updated_at DROP DEFAULT');
        $this->addSql('ALTER INDEX early_access_registrations_email_key RENAME TO UNIQ_8C2A93DAE7927C74');
        $this->addSql('ALTER TABLE plan_entitlements ALTER enabled DROP DEFAULT');
        $this->addSql('ALTER TABLE plan_entitlements ALTER enabled SET NOT NULL');
        $this->addSql('ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_user_id_fkey');
        $this->addSql('ALTER TABLE subscriptions ALTER started_at TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE subscriptions ALTER started_at DROP DEFAULT');
        $this->addSql('ALTER TABLE subscriptions ALTER started_at SET NOT NULL');
        $this->addSql('COMMENT ON COLUMN subscriptions.started_at IS \'(DC2Type:datetimetz_immutable)\'');
        $this->addSql('ALTER TABLE subscriptions ADD CONSTRAINT FK_4778A01A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE usage_events DROP CONSTRAINT usage_events_user_id_fkey');
        $this->addSql('ALTER TABLE usage_events ALTER id DROP DEFAULT');
        $this->addSql('ALTER TABLE usage_events ALTER user_id DROP NOT NULL');
        $this->addSql('ALTER TABLE usage_events ALTER qty DROP DEFAULT');
        $this->addSql('ALTER TABLE usage_events ALTER created_at TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE usage_events ALTER created_at DROP DEFAULT');
        $this->addSql('COMMENT ON COLUMN usage_events.created_at IS \'(DC2Type:datetimetz_immutable)\'');
        $this->addSql('ALTER TABLE usage_events ADD CONSTRAINT FK_9084632A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('DROP INDEX idx_users_country');
        $this->addSql('DROP INDEX idx_users_current_country');
        $this->addSql('DROP INDEX idx_users_email_verified');
        $this->addSql('DROP INDEX idx_users_first_name');
        $this->addSql('DROP INDEX idx_users_last_login_at');
        $this->addSql('DROP INDEX idx_users_last_name');
        $this->addSql('DROP INDEX idx_users_locked_until');
        $this->addSql('DROP INDEX idx_users_nationality');
        $this->addSql('DROP INDEX idx_users_profession');
        $this->addSql('DROP INDEX idx_users_two_factor_enabled');
        $this->addSql('ALTER TABLE users ADD email_verification_token TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD email_verification_token_expires_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE users ALTER id DROP DEFAULT');
        $this->addSql('ALTER TABLE users ALTER role DROP DEFAULT');
        $this->addSql('ALTER TABLE users ALTER referral_code TYPE VARCHAR(8)');
        $this->addSql('ALTER TABLE users ALTER created_at TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE users ALTER created_at DROP DEFAULT');
        $this->addSql('ALTER TABLE users ALTER updated_at TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE users ALTER updated_at DROP DEFAULT');
        $this->addSql('ALTER TABLE users ALTER last_login_attempt TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE users ALTER locked_until TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE users ALTER last_login_at TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE users ALTER date_of_birth TYPE DATE');
        $this->addSql('COMMENT ON COLUMN users.email_verification_token_expires_at IS \'(DC2Type:datetimetz_immutable)\'');
        $this->addSql('COMMENT ON COLUMN users.created_at IS \'(DC2Type:datetimetz_immutable)\'');
        $this->addSql('COMMENT ON COLUMN users.updated_at IS \'(DC2Type:datetimetz_immutable)\'');
        $this->addSql('COMMENT ON COLUMN users.last_login_attempt IS \'(DC2Type:datetimetz_immutable)\'');
        $this->addSql('COMMENT ON COLUMN users.locked_until IS \'(DC2Type:datetimetz_immutable)\'');
        $this->addSql('COMMENT ON COLUMN users.last_login_at IS \'(DC2Type:datetimetz_immutable)\'');
        $this->addSql('COMMENT ON COLUMN users.date_of_birth IS \'(DC2Type:date_immutable)\'');
        $this->addSql('ALTER INDEX users_email_key RENAME TO UNIQ_1483A5E9E7927C74');
        $this->addSql('ALTER INDEX users_stytch_user_id_key RENAME TO UNIQ_1483A5E9A18F1211');
        $this->addSql('ALTER INDEX users_referral_code_key RENAME TO UNIQ_1483A5E96447454A');
        $this->addSql('ALTER TABLE waitlist_signups DROP CONSTRAINT waitlist_signups_user_id_fkey');
        $this->addSql('DROP INDEX idx_waitlist_email_sha256');
        $this->addSql('DROP INDEX idx_waitlist_referral_code');
        $this->addSql('DROP INDEX idx_waitlist_status_created');
        $this->addSql('DROP INDEX uniq_waitlist_email_norm');
        $this->addSql('ALTER TABLE waitlist_signups DROP email_norm');
        $this->addSql('ALTER TABLE waitlist_signups DROP email_sha256');
        $this->addSql('ALTER TABLE waitlist_signups ALTER id DROP DEFAULT');
        $this->addSql('ALTER TABLE waitlist_signups ALTER country_interest TYPE VARCHAR(2)');
        $this->addSql('ALTER TABLE waitlist_signups ALTER referral_code TYPE VARCHAR(8)');
        $this->addSql('ALTER TABLE waitlist_signups ALTER referred_by TYPE VARCHAR(8)');
        $this->addSql('ALTER TABLE waitlist_signups ALTER opt_in_status DROP DEFAULT');
        $this->addSql('ALTER TABLE waitlist_signups ALTER token_expires_at TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE waitlist_signups ALTER confirmed_at TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE waitlist_signups ALTER created_at TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE waitlist_signups ALTER created_at DROP DEFAULT');
        $this->addSql('ALTER TABLE waitlist_signups ALTER updated_at TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE waitlist_signups ALTER updated_at DROP DEFAULT');
        $this->addSql('COMMENT ON COLUMN waitlist_signups.token_expires_at IS \'(DC2Type:datetimetz_immutable)\'');
        $this->addSql('COMMENT ON COLUMN waitlist_signups.confirmed_at IS \'(DC2Type:datetimetz_immutable)\'');
        $this->addSql('COMMENT ON COLUMN waitlist_signups.created_at IS \'(DC2Type:datetimetz_immutable)\'');
        $this->addSql('COMMENT ON COLUMN waitlist_signups.updated_at IS \'(DC2Type:datetimetz_immutable)\'');
        $this->addSql('ALTER TABLE waitlist_signups ADD CONSTRAINT FK_E14870D7A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP SEQUENCE checklist_item_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE country_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE provider_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE residency_program_id_seq CASCADE');
        $this->addSql('CREATE SEQUENCE waitlist_referrals_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE waitlist_referrals (id BIGSERIAL NOT NULL, referrer_code CHAR(8) NOT NULL, referee_email_sha256 BYTEA NOT NULL, created_at TIMESTAMP(0) WITH TIME ZONE DEFAULT \'now()\' NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX uniq_ref ON waitlist_referrals (referrer_code, referee_email_sha256)');
        $this->addSql('ALTER TABLE checklist_item DROP CONSTRAINT FK_99EB20F9F92F3E70');
        $this->addSql('ALTER TABLE provider DROP CONSTRAINT FK_92C4739CF92F3E70');
        $this->addSql('ALTER TABLE residency_program DROP CONSTRAINT FK_969BAAA7F92F3E70');
        $this->addSql('DROP TABLE checklist_item');
        $this->addSql('DROP TABLE country');
        $this->addSql('DROP TABLE provider');
        $this->addSql('DROP TABLE residency_program');
        $this->addSql('CREATE SEQUENCE consent_log_id_seq');
        $this->addSql('SELECT setval(\'consent_log_id_seq\', (SELECT MAX(id) FROM consent_log))');
        $this->addSql('ALTER TABLE consent_log ALTER id SET DEFAULT nextval(\'consent_log_id_seq\')');
        $this->addSql('ALTER TABLE consent_log ALTER timestamp TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE consent_log ALTER timestamp SET DEFAULT \'now()\'');
        $this->addSql('COMMENT ON COLUMN consent_log."timestamp" IS NULL');
        $this->addSql('CREATE INDEX idx_consent_subject_time ON consent_log (subject_email_sha256, "timestamp")');
        $this->addSql('ALTER TABLE users DROP email_verification_token');
        $this->addSql('ALTER TABLE users DROP email_verification_token_expires_at');
        $this->addSql('CREATE SEQUENCE users_id_seq');
        $this->addSql('SELECT setval(\'users_id_seq\', (SELECT MAX(id) FROM users))');
        $this->addSql('ALTER TABLE users ALTER id SET DEFAULT nextval(\'users_id_seq\')');
        $this->addSql('ALTER TABLE users ALTER role SET DEFAULT \'user\'');
        $this->addSql('ALTER TABLE users ALTER referral_code TYPE CHAR(8)');
        $this->addSql('ALTER TABLE users ALTER created_at TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE users ALTER created_at SET DEFAULT \'now()\'');
        $this->addSql('ALTER TABLE users ALTER updated_at TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE users ALTER updated_at SET DEFAULT \'now()\'');
        $this->addSql('ALTER TABLE users ALTER last_login_attempt TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE users ALTER locked_until TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE users ALTER last_login_at TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE users ALTER date_of_birth TYPE DATE');
        $this->addSql('COMMENT ON COLUMN users.created_at IS NULL');
        $this->addSql('COMMENT ON COLUMN users.updated_at IS NULL');
        $this->addSql('COMMENT ON COLUMN users.last_login_attempt IS NULL');
        $this->addSql('COMMENT ON COLUMN users.locked_until IS NULL');
        $this->addSql('COMMENT ON COLUMN users.last_login_at IS NULL');
        $this->addSql('COMMENT ON COLUMN users.date_of_birth IS NULL');
        $this->addSql('CREATE INDEX idx_users_country ON users (country)');
        $this->addSql('CREATE INDEX idx_users_current_country ON users (current_country)');
        $this->addSql('CREATE INDEX idx_users_email_verified ON users (email_verified)');
        $this->addSql('CREATE INDEX idx_users_first_name ON users (first_name)');
        $this->addSql('CREATE INDEX idx_users_last_login_at ON users (last_login_at)');
        $this->addSql('CREATE INDEX idx_users_last_name ON users (last_name)');
        $this->addSql('CREATE INDEX idx_users_locked_until ON users (locked_until)');
        $this->addSql('CREATE INDEX idx_users_nationality ON users (nationality)');
        $this->addSql('CREATE INDEX idx_users_profession ON users (profession)');
        $this->addSql('CREATE INDEX idx_users_two_factor_enabled ON users (two_factor_enabled)');
        $this->addSql('ALTER INDEX uniq_1483a5e9e7927c74 RENAME TO users_email_key');
        $this->addSql('ALTER INDEX uniq_1483a5e96447454a RENAME TO users_referral_code_key');
        $this->addSql('ALTER INDEX uniq_1483a5e9a18f1211 RENAME TO users_stytch_user_id_key');
        $this->addSql('ALTER TABLE subscriptions DROP CONSTRAINT FK_4778A01A76ED395');
        $this->addSql('ALTER TABLE subscriptions ALTER started_at TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE subscriptions ALTER started_at SET DEFAULT \'now()\'');
        $this->addSql('ALTER TABLE subscriptions ALTER started_at DROP NOT NULL');
        $this->addSql('COMMENT ON COLUMN subscriptions.started_at IS NULL');
        $this->addSql('ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE SEQUENCE early_access_registrations_id_seq');
        $this->addSql('SELECT setval(\'early_access_registrations_id_seq\', (SELECT MAX(id) FROM early_access_registrations))');
        $this->addSql('ALTER TABLE early_access_registrations ALTER id SET DEFAULT nextval(\'early_access_registrations_id_seq\')');
        $this->addSql('ALTER TABLE early_access_registrations ALTER locale SET DEFAULT \'en\'');
        $this->addSql('ALTER TABLE early_access_registrations ALTER created_at SET DEFAULT CURRENT_TIMESTAMP');
        $this->addSql('ALTER TABLE early_access_registrations ALTER updated_at SET DEFAULT CURRENT_TIMESTAMP');
        $this->addSql('CREATE INDEX idx_early_access_created_at ON early_access_registrations (created_at)');
        $this->addSql('CREATE INDEX idx_early_access_email ON early_access_registrations (email)');
        $this->addSql('ALTER INDEX uniq_8c2a93dae7927c74 RENAME TO early_access_registrations_email_key');
        $this->addSql('ALTER TABLE usage_events DROP CONSTRAINT FK_9084632A76ED395');
        $this->addSql('CREATE SEQUENCE usage_events_id_seq');
        $this->addSql('SELECT setval(\'usage_events_id_seq\', (SELECT MAX(id) FROM usage_events))');
        $this->addSql('ALTER TABLE usage_events ALTER id SET DEFAULT nextval(\'usage_events_id_seq\')');
        $this->addSql('ALTER TABLE usage_events ALTER user_id SET NOT NULL');
        $this->addSql('ALTER TABLE usage_events ALTER qty SET DEFAULT 1');
        $this->addSql('ALTER TABLE usage_events ALTER created_at TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE usage_events ALTER created_at SET DEFAULT \'now()\'');
        $this->addSql('COMMENT ON COLUMN usage_events.created_at IS NULL');
        $this->addSql('ALTER TABLE usage_events ADD CONSTRAINT usage_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE plan_entitlements ALTER enabled SET DEFAULT true');
        $this->addSql('ALTER TABLE plan_entitlements ALTER enabled DROP NOT NULL');
        $this->addSql('ALTER TABLE waitlist_signups DROP CONSTRAINT FK_E14870D7A76ED395');
        $this->addSql('ALTER TABLE waitlist_signups ADD email_norm TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE waitlist_signups ADD email_sha256 BYTEA DEFAULT NULL');
        $this->addSql('CREATE SEQUENCE waitlist_signups_id_seq');
        $this->addSql('SELECT setval(\'waitlist_signups_id_seq\', (SELECT MAX(id) FROM waitlist_signups))');
        $this->addSql('ALTER TABLE waitlist_signups ALTER id SET DEFAULT nextval(\'waitlist_signups_id_seq\')');
        $this->addSql('ALTER TABLE waitlist_signups ALTER country_interest TYPE CHAR(2)');
        $this->addSql('ALTER TABLE waitlist_signups ALTER referral_code TYPE CHAR(8)');
        $this->addSql('ALTER TABLE waitlist_signups ALTER referred_by TYPE CHAR(8)');
        $this->addSql('ALTER TABLE waitlist_signups ALTER opt_in_status SET DEFAULT \'pending\'');
        $this->addSql('ALTER TABLE waitlist_signups ALTER token_expires_at TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE waitlist_signups ALTER confirmed_at TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE waitlist_signups ALTER created_at TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE waitlist_signups ALTER created_at SET DEFAULT \'now()\'');
        $this->addSql('ALTER TABLE waitlist_signups ALTER updated_at TYPE TIMESTAMP(0) WITH TIME ZONE');
        $this->addSql('ALTER TABLE waitlist_signups ALTER updated_at SET DEFAULT \'now()\'');
        $this->addSql('COMMENT ON COLUMN waitlist_signups.token_expires_at IS NULL');
        $this->addSql('COMMENT ON COLUMN waitlist_signups.confirmed_at IS NULL');
        $this->addSql('COMMENT ON COLUMN waitlist_signups.created_at IS NULL');
        $this->addSql('COMMENT ON COLUMN waitlist_signups.updated_at IS NULL');
        $this->addSql('ALTER TABLE waitlist_signups ADD CONSTRAINT waitlist_signups_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX idx_waitlist_email_sha256 ON waitlist_signups (email_sha256)');
        $this->addSql('CREATE INDEX idx_waitlist_referral_code ON waitlist_signups (referral_code)');
        $this->addSql('CREATE INDEX idx_waitlist_status_created ON waitlist_signups (opt_in_status, created_at)');
        $this->addSql('CREATE UNIQUE INDEX uniq_waitlist_email_norm ON waitlist_signups (email_norm)');
    }
}
