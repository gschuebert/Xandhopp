<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'consent_log')]
class ConsentLog
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::BIGINT)]
    private ?int $id = null;

    #[ORM\Column(type: Types::BLOB)]
    private string $subjectEmailSha256;

    #[ORM\Column(type: Types::TEXT)]
    private string $type;

    #[ORM\Column(type: Types::TEXT)]
    private string $textSnapshot;

    #[ORM\Column(type: Types::DATETIMETZ_IMMUTABLE)]
    private \DateTimeImmutable $timestamp;

    #[ORM\Column(type: Types::STRING, nullable: true)]
    private ?string $ip = null;

    #[ORM\Column(type: Types::STRING, length: 255, nullable: true)]
    private ?string $userAgent = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $details = null;

    public function __construct()
    {
        $this->timestamp = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getSubjectEmailSha256(): string
    {
        return $this->subjectEmailSha256;
    }

    public function setSubjectEmailSha256(string $subjectEmailSha256): self
    {
        $this->subjectEmailSha256 = $subjectEmailSha256;
        return $this;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        $this->type = $type;
        return $this;
    }

    public function getTextSnapshot(): string
    {
        return $this->textSnapshot;
    }

    public function setTextSnapshot(string $textSnapshot): self
    {
        $this->textSnapshot = $textSnapshot;
        return $this;
    }

    public function getTimestamp(): \DateTimeImmutable
    {
        return $this->timestamp;
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

    public function getDetails(): ?array
    {
        return $this->details;
    }

    public function setDetails(?array $details): self
    {
        $this->details = $details;
        return $this;
    }
}
