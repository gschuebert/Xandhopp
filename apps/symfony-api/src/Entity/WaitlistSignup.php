<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'waitlist_signups')]
#[ORM\HasLifecycleCallbacks]
class WaitlistSignup
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::BIGINT)]
    private ?int $id = null;

    #[ORM\Column(type: Types::TEXT)]
    private string $email;

    #[ORM\Column(type: Types::STRING, length: 10, nullable: true)]
    private ?string $locale = null;

    #[ORM\Column(type: Types::STRING, length: 2, nullable: true)]
    private ?string $countryInterest = null;

    #[ORM\Column(type: Types::STRING, length: 8)]
    private string $referralCode;

    #[ORM\Column(type: Types::STRING, length: 8, nullable: true)]
    private ?string $referredBy = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $utm = null;

    #[ORM\Column(type: Types::STRING, nullable: true)]
    private ?string $ip = null;

    #[ORM\Column(type: Types::STRING, length: 255, nullable: true)]
    private ?string $userAgent = null;

    #[ORM\Column(type: Types::TEXT)]
    private string $optInStatus = 'pending';

    #[ORM\Column(type: Types::TEXT)]
    private string $optInToken;

    #[ORM\Column(type: Types::DATETIMETZ_IMMUTABLE)]
    private \DateTimeImmutable $tokenExpiresAt;

    #[ORM\Column(type: Types::DATETIMETZ_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $confirmedAt = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: true)]
    private ?User $user = null;

    #[ORM\Column(type: Types::DATETIMETZ_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: Types::DATETIMETZ_IMMUTABLE)]
    private \DateTimeImmutable $updatedAt;

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

    public function getLocale(): ?string
    {
        return $this->locale;
    }

    public function setLocale(?string $locale): self
    {
        $this->locale = $locale;
        return $this;
    }

    public function getCountryInterest(): ?string
    {
        return $this->countryInterest;
    }

    public function setCountryInterest(?string $countryInterest): self
    {
        $this->countryInterest = $countryInterest;
        return $this;
    }

    public function getReferralCode(): string
    {
        return $this->referralCode;
    }

    public function setReferralCode(string $referralCode): self
    {
        $this->referralCode = $referralCode;
        return $this;
    }

    public function getReferredBy(): ?string
    {
        return $this->referredBy;
    }

    public function setReferredBy(?string $referredBy): self
    {
        $this->referredBy = $referredBy;
        return $this;
    }

    public function getUtm(): ?array
    {
        return $this->utm;
    }

    public function setUtm(?array $utm): self
    {
        $this->utm = $utm;
        return $this;
    }

    public function getIp(): ?string
    {
        return $this->ip;
    }

    public function setIp(?string $ip): self
    {
        $this->ip = $ip;
        return $this;
    }

    public function getUserAgent(): ?string
    {
        return $this->userAgent;
    }

    public function setUserAgent(?string $userAgent): self
    {
        $this->userAgent = $userAgent;
        return $this;
    }

    public function getOptInStatus(): string
    {
        return $this->optInStatus;
    }

    public function setOptInStatus(string $optInStatus): self
    {
        $this->optInStatus = $optInStatus;
        return $this;
    }

    public function getOptInToken(): string
    {
        return $this->optInToken;
    }

    public function setOptInToken(string $optInToken): self
    {
        $this->optInToken = $optInToken;
        return $this;
    }

    public function getTokenExpiresAt(): \DateTimeImmutable
    {
        return $this->tokenExpiresAt;
    }

    public function setTokenExpiresAt(\DateTimeImmutable $tokenExpiresAt): self
    {
        $this->tokenExpiresAt = $tokenExpiresAt;
        return $this;
    }

    public function getConfirmedAt(): ?\DateTimeImmutable
    {
        return $this->confirmedAt;
    }

    public function setConfirmedAt(?\DateTimeImmutable $confirmedAt): self
    {
        $this->confirmedAt = $confirmedAt;
        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;
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

    public function isTokenExpired(): bool
    {
        return $this->tokenExpiresAt < new \DateTimeImmutable();
    }

    public function isConfirmed(): bool
    {
        return $this->optInStatus === 'confirmed';
    }
}
