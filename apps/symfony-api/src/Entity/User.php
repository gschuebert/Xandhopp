<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;

#[ORM\Entity]
#[ORM\Table(name: 'users')]
#[ORM\HasLifecycleCallbacks]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::BIGINT)]
    private ?int $id = null;

    #[ORM\Column(type: Types::TEXT, unique: true)]
    private string $email;

    #[ORM\Column(type: Types::TEXT, unique: true, nullable: true)]
    private ?string $stytchUserId = null;

    #[ORM\Column(type: Types::TEXT)]
    private string $role = 'user';

    #[ORM\Column(type: Types::STRING, length: 8, unique: true, nullable: true)]
    private ?string $referralCode = null;

    #[ORM\Column(type: Types::DATETIMETZ_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: Types::DATETIMETZ_IMMUTABLE)]
    private \DateTimeImmutable $updatedAt;

    // Security fields
    #[ORM\Column(type: Types::BOOLEAN, options: ['default' => false])]
    private bool $emailVerified = false;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $emailVerificationToken = null;

    #[ORM\Column(type: Types::DATETIMETZ_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $emailVerificationTokenExpiresAt = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $passwordHash = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $totpSecret = null;

    #[ORM\Column(type: Types::BOOLEAN, options: ['default' => false])]
    private bool $twoFactorEnabled = false;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $backupCodes = null; // JSON array of backup codes

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $phoneNumber = null;

    #[ORM\Column(type: Types::BOOLEAN, options: ['default' => false])]
    private bool $phoneVerified = false;

    #[ORM\Column(type: Types::INTEGER, options: ['default' => 0])]
    private int $loginAttempts = 0;

    #[ORM\Column(type: Types::DATETIMETZ_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $lastLoginAttempt = null;

    #[ORM\Column(type: Types::DATETIMETZ_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $lockedUntil = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $lastKnownIps = null; // JSON array of recent IPs

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $trustedDevices = null; // JSON array of trusted device fingerprints

    #[ORM\Column(type: Types::DATETIMETZ_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $lastLoginAt = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $lastLoginIp = null;

    // Profile fields
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $firstName = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $lastName = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $dateOfBirth = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $nationality = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $currentCountry = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $currentCity = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $profession = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $company = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $website = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $linkedin = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $bio = null;

    // Address fields
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $addressLine1 = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $addressLine2 = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $city = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $state = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $postalCode = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $country = null;

    // Preferences
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $preferredLanguage = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $timezone = null;

    #[ORM\Column(type: Types::BOOLEAN, options: ['default' => true])]
    private bool $emailNotifications = true;

    #[ORM\Column(type: Types::BOOLEAN, options: ['default' => true])]
    private bool $marketingEmails = true;

    #[ORM\Column(type: Types::BOOLEAN, options: ['default' => false])]
    private bool $profilePublic = false;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;
        return $this;
    }

    public function getStytchUserId(): ?string
    {
        return $this->stytchUserId;
    }

    public function setStytchUserId(?string $stytchUserId): self
    {
        $this->stytchUserId = $stytchUserId;
        return $this;
    }

    public function getRole(): string
    {
        return $this->role;
    }

    public function setRole(string $role): self
    {
        $this->role = $role;
        return $this;
    }

    public function getReferralCode(): ?string
    {
        return $this->referralCode;
    }

    public function setReferralCode(?string $referralCode): self
    {
        $this->referralCode = $referralCode;
        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }

    // Security getters and setters
    public function isEmailVerified(): bool
    {
        return $this->emailVerified;
    }

    public function setEmailVerified(bool $emailVerified): self
    {
        $this->emailVerified = $emailVerified;
        return $this;
    }

    public function getPasswordHash(): ?string
    {
        return $this->passwordHash;
    }

    public function getPassword(): ?string
    {
        return $this->passwordHash;
    }

    public function setPasswordHash(?string $passwordHash): self
    {
        $this->passwordHash = $passwordHash;
        return $this;
    }

    public function getTotpSecret(): ?string
    {
        return $this->totpSecret;
    }

    public function setTotpSecret(?string $totpSecret): self
    {
        $this->totpSecret = $totpSecret;
        return $this;
    }

    public function isTwoFactorEnabled(): bool
    {
        return $this->twoFactorEnabled;
    }

    public function setTwoFactorEnabled(bool $twoFactorEnabled): self
    {
        $this->twoFactorEnabled = $twoFactorEnabled;
        return $this;
    }

    public function getBackupCodes(): ?string
    {
        return $this->backupCodes;
    }

    public function setBackupCodes(?string $backupCodes): self
    {
        $this->backupCodes = $backupCodes;
        return $this;
    }

    public function getPhoneNumber(): ?string
    {
        return $this->phoneNumber;
    }

    public function setPhoneNumber(?string $phoneNumber): self
    {
        $this->phoneNumber = $phoneNumber;
        return $this;
    }

    public function isPhoneVerified(): bool
    {
        return $this->phoneVerified;
    }

    public function setPhoneVerified(bool $phoneVerified): self
    {
        $this->phoneVerified = $phoneVerified;
        return $this;
    }

    public function getLoginAttempts(): int
    {
        return $this->loginAttempts;
    }

    public function setLoginAttempts(int $loginAttempts): self
    {
        $this->loginAttempts = $loginAttempts;
        return $this;
    }

    public function getLastLoginAttempt(): ?\DateTimeImmutable
    {
        return $this->lastLoginAttempt;
    }

    public function setLastLoginAttempt(?\DateTimeImmutable $lastLoginAttempt): self
    {
        $this->lastLoginAttempt = $lastLoginAttempt;
        return $this;
    }

    public function getLockedUntil(): ?\DateTimeImmutable
    {
        return $this->lockedUntil;
    }

    public function setLockedUntil(?\DateTimeImmutable $lockedUntil): self
    {
        $this->lockedUntil = $lockedUntil;
        return $this;
    }

    public function getLastKnownIps(): ?string
    {
        return $this->lastKnownIps;
    }

    public function setLastKnownIps(?string $lastKnownIps): self
    {
        $this->lastKnownIps = $lastKnownIps;
        return $this;
    }

    public function getTrustedDevices(): ?string
    {
        return $this->trustedDevices;
    }

    public function setTrustedDevices(?string $trustedDevices): self
    {
        $this->trustedDevices = $trustedDevices;
        return $this;
    }

    public function getLastLoginAt(): ?\DateTimeImmutable
    {
        return $this->lastLoginAt;
    }

    public function setLastLoginAt(?\DateTimeImmutable $lastLoginAt): self
    {
        $this->lastLoginAt = $lastLoginAt;
        return $this;
    }

    public function getLastLoginIp(): ?string
    {
        return $this->lastLoginIp;
    }

    public function setLastLoginIp(?string $lastLoginIp): self
    {
        $this->lastLoginIp = $lastLoginIp;
        return $this;
    }

    // Helper methods
    public function isLocked(): bool
    {
        return $this->lockedUntil && $this->lockedUntil > new \DateTimeImmutable();
    }

    public function addKnownIp(string $ip): void
    {
        $ips = $this->getLastKnownIps() ? json_decode($this->getLastKnownIps(), true) : [];
        $ips = array_unique(array_merge($ips, [$ip]));
        $ips = array_slice($ips, -10); // Keep only last 10 IPs
        $this->setLastKnownIps(json_encode($ips));
    }

    public function addTrustedDevice(string $deviceFingerprint): void
    {
        $devices = $this->getTrustedDevices() ? json_decode($this->getTrustedDevices(), true) : [];
        $devices[] = [
            'fingerprint' => $deviceFingerprint,
            'trusted_at' => (new \DateTimeImmutable())->format('c')
        ];
        $devices = array_slice($devices, -5); // Keep only last 5 devices
        $this->setTrustedDevices(json_encode($devices));
    }

    public function isDeviceTrusted(string $deviceFingerprint): bool
    {
        $devices = $this->getTrustedDevices() ? json_decode($this->getTrustedDevices(), true) : [];
        foreach ($devices as $device) {
            if ($device['fingerprint'] === $deviceFingerprint) {
                return true;
            }
        }
        return false;
    }

    public function isIpKnown(string $ip): bool
    {
        $ips = $this->getLastKnownIps() ? json_decode($this->getLastKnownIps(), true) : [];
        return in_array($ip, $ips);
    }

    // Profile getters and setters
    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(?string $firstName): self
    {
        $this->firstName = $firstName;
        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(?string $lastName): self
    {
        $this->lastName = $lastName;
        return $this;
    }

    public function getDateOfBirth(): ?\DateTimeImmutable
    {
        return $this->dateOfBirth;
    }

    public function setDateOfBirth(?\DateTimeImmutable $dateOfBirth): self
    {
        $this->dateOfBirth = $dateOfBirth;
        return $this;
    }

    public function getNationality(): ?string
    {
        return $this->nationality;
    }

    public function setNationality(?string $nationality): self
    {
        $this->nationality = $nationality;
        return $this;
    }

    public function getCurrentCountry(): ?string
    {
        return $this->currentCountry;
    }

    public function setCurrentCountry(?string $currentCountry): self
    {
        $this->currentCountry = $currentCountry;
        return $this;
    }

    public function getCurrentCity(): ?string
    {
        return $this->currentCity;
    }

    public function setCurrentCity(?string $currentCity): self
    {
        $this->currentCity = $currentCity;
        return $this;
    }

    public function getProfession(): ?string
    {
        return $this->profession;
    }

    public function setProfession(?string $profession): self
    {
        $this->profession = $profession;
        return $this;
    }

    public function getCompany(): ?string
    {
        return $this->company;
    }

    public function setCompany(?string $company): self
    {
        $this->company = $company;
        return $this;
    }

    public function getWebsite(): ?string
    {
        return $this->website;
    }

    public function setWebsite(?string $website): self
    {
        $this->website = $website;
        return $this;
    }

    public function getLinkedin(): ?string
    {
        return $this->linkedin;
    }

    public function setLinkedin(?string $linkedin): self
    {
        $this->linkedin = $linkedin;
        return $this;
    }

    public function getBio(): ?string
    {
        return $this->bio;
    }

    public function setBio(?string $bio): self
    {
        $this->bio = $bio;
        return $this;
    }

    // Address getters and setters
    public function getAddressLine1(): ?string
    {
        return $this->addressLine1;
    }

    public function setAddressLine1(?string $addressLine1): self
    {
        $this->addressLine1 = $addressLine1;
        return $this;
    }

    public function getAddressLine2(): ?string
    {
        return $this->addressLine2;
    }

    public function setAddressLine2(?string $addressLine2): self
    {
        $this->addressLine2 = $addressLine2;
        return $this;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(?string $city): self
    {
        $this->city = $city;
        return $this;
    }

    public function getState(): ?string
    {
        return $this->state;
    }

    public function setState(?string $state): self
    {
        $this->state = $state;
        return $this;
    }

    public function getPostalCode(): ?string
    {
        return $this->postalCode;
    }

    public function setPostalCode(?string $postalCode): self
    {
        $this->postalCode = $postalCode;
        return $this;
    }

    public function getCountry(): ?string
    {
        return $this->country;
    }

    public function setCountry(?string $country): self
    {
        $this->country = $country;
        return $this;
    }

    // Preferences getters and setters
    public function getPreferredLanguage(): ?string
    {
        return $this->preferredLanguage;
    }

    public function setPreferredLanguage(?string $preferredLanguage): self
    {
        $this->preferredLanguage = $preferredLanguage;
        return $this;
    }

    public function getTimezone(): ?string
    {
        return $this->timezone;
    }

    public function setTimezone(?string $timezone): self
    {
        $this->timezone = $timezone;
        return $this;
    }

    public function isEmailNotifications(): bool
    {
        return $this->emailNotifications;
    }

    public function setEmailNotifications(bool $emailNotifications): self
    {
        $this->emailNotifications = $emailNotifications;
        return $this;
    }

    public function isMarketingEmails(): bool
    {
        return $this->marketingEmails;
    }

    public function setMarketingEmails(bool $marketingEmails): self
    {
        $this->marketingEmails = $marketingEmails;
        return $this;
    }

    public function isProfilePublic(): bool
    {
        return $this->profilePublic;
    }

    public function setProfilePublic(bool $profilePublic): self
    {
        $this->profilePublic = $profilePublic;
        return $this;
    }

    // Helper methods
    public function getFullName(): string
    {
        return trim(($this->firstName ?? '') . ' ' . ($this->lastName ?? ''));
    }

    public function getDisplayName(): string
    {
        $fullName = $this->getFullName();
        return $fullName ?: $this->email;
    }

    // UserInterface implementation
    public function getUserIdentifier(): string
    {
        return $this->email;
    }

    public function getRoles(): array
    {
        return [$this->role];
    }

    public function eraseCredentials(): void
    {
        // No credentials to erase for Stytch-based auth
    }

    public function getEmailVerificationToken(): ?string
    {
        return $this->emailVerificationToken;
    }

    public function setEmailVerificationToken(?string $emailVerificationToken): self
    {
        $this->emailVerificationToken = $emailVerificationToken;
        return $this;
    }

    public function getEmailVerificationTokenExpiresAt(): ?\DateTimeImmutable
    {
        return $this->emailVerificationTokenExpiresAt;
    }

    public function setEmailVerificationTokenExpiresAt(?\DateTimeImmutable $emailVerificationTokenExpiresAt): self
    {
        $this->emailVerificationTokenExpiresAt = $emailVerificationTokenExpiresAt;
        return $this;
    }
}
