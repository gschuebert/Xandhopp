<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'us_state_metric')]
class UsStateMetric
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::INTEGER)]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: UsState::class, inversedBy: 'metrics')]
    #[ORM\JoinColumn(nullable: false)]
    private UsState $state;

    #[ORM\Column(type: Types::STRING, length: 100)]
    private string $metricKey;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $metricValue = null;

    #[ORM\Column(type: Types::STRING, length: 20, nullable: true)]
    private ?string $metricUnit = null;

    #[ORM\ManyToOne(targetEntity: Source::class)]
    #[ORM\JoinColumn(nullable: false)]
    private Source $source;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getState(): UsState
    {
        return $this->state;
    }

    public function setState(UsState $state): self
    {
        $this->state = $state;
        return $this;
    }

    public function getMetricKey(): string
    {
        return $this->metricKey;
    }

    public function setMetricKey(string $metricKey): self
    {
        $this->metricKey = $metricKey;
        return $this;
    }

    public function getMetricValue(): ?string
    {
        return $this->metricValue;
    }

    public function setMetricValue(?string $metricValue): self
    {
        $this->metricValue = $metricValue;
        return $this;
    }

    public function getMetricUnit(): ?string
    {
        return $this->metricUnit;
    }

    public function setMetricUnit(?string $metricUnit): self
    {
        $this->metricUnit = $metricUnit;
        return $this;
    }

    public function getSource(): Source
    {
        return $this->source;
    }

    public function setSource(Source $source): self
    {
        $this->source = $source;
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

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): self
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
}
