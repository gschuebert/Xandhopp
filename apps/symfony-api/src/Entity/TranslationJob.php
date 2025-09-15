<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\TranslationJobRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TranslationJobRepository::class)]
#[ORM\Table(name: 'translation_job')]
class TranslationJob
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::BIGINT)]
    private ?int $id = null;

    #[ORM\Column(type: Types::INTEGER)]
    private int $countryId;

    #[ORM\Column(type: Types::TEXT)]
    private string $section;

    #[ORM\Column(type: Types::STRING, length: 2)]
    private string $sourceLang;

    #[ORM\Column(type: Types::STRING, length: 2)]
    private string $targetLang;

    #[ORM\Column(type: Types::TEXT)]
    private string $sourceContent;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $translatedContent = null;

    #[ORM\Column(type: Types::STRING, length: 50, nullable: true)]
    private ?string $translationMethod = null;

    #[ORM\Column(type: Types::STRING, length: 20)]
    private string $status = 'pending';

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $errorMessage = null;

    #[ORM\Column(type: Types::DATETIMETZ_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: Types::DATETIMETZ_IMMUTABLE)]
    private \DateTimeImmutable $updatedAt;

    #[ORM\Column(type: Types::DATETIMETZ_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $completedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCountryId(): int
    {
        return $this->countryId;
    }

    public function setCountryId(int $countryId): static
    {
        $this->countryId = $countryId;
        return $this;
    }

    public function getSection(): string
    {
        return $this->section;
    }

    public function setSection(string $section): static
    {
        $this->section = $section;
        return $this;
    }

    public function getSourceLang(): string
    {
        return $this->sourceLang;
    }

    public function setSourceLang(string $sourceLang): static
    {
        $this->sourceLang = $sourceLang;
        return $this;
    }

    public function getTargetLang(): string
    {
        return $this->targetLang;
    }

    public function setTargetLang(string $targetLang): static
    {
        $this->targetLang = $targetLang;
        return $this;
    }

    public function getSourceContent(): string
    {
        return $this->sourceContent;
    }

    public function setSourceContent(string $sourceContent): static
    {
        $this->sourceContent = $sourceContent;
        return $this;
    }

    public function getTranslatedContent(): ?string
    {
        return $this->translatedContent;
    }

    public function setTranslatedContent(?string $translatedContent): static
    {
        $this->translatedContent = $translatedContent;
        return $this;
    }

    public function getTranslationMethod(): ?string
    {
        return $this->translationMethod;
    }

    public function setTranslationMethod(?string $translationMethod): static
    {
        $this->translationMethod = $translationMethod;
        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        $this->updatedAt = new \DateTimeImmutable();
        
        if ($status === 'completed') {
            $this->completedAt = new \DateTimeImmutable();
        }
        
        return $this;
    }

    public function getErrorMessage(): ?string
    {
        return $this->errorMessage;
    }

    public function setErrorMessage(?string $errorMessage): static
    {
        $this->errorMessage = $errorMessage;
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

    public function getCompletedAt(): ?\DateTimeImmutable
    {
        return $this->completedAt;
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function getDuration(): ?\DateInterval
    {
        if (!$this->completedAt) {
            return null;
        }

        return $this->createdAt->diff($this->completedAt);
    }
}
