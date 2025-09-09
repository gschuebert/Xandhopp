<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'plan_entitlements')]
class PlanEntitlement
{
    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: Plan::class)]
    #[ORM\JoinColumn(name: 'plan_id', referencedColumnName: 'id')]
    private Plan $plan;

    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: Feature::class)]
    #[ORM\JoinColumn(name: 'feature_key', referencedColumnName: 'key')]
    private Feature $feature;

    #[ORM\Column(type: Types::INTEGER, nullable: true)]
    private ?int $limitPerPeriod = null;

    #[ORM\Column(type: Types::TEXT)]
    private string $period;

    #[ORM\Column(type: Types::BOOLEAN)]
    private bool $enabled = true;

    public function getPlan(): Plan
    {
        return $this->plan;
    }

    public function setPlan(Plan $plan): self
    {
        $this->plan = $plan;
        return $this;
    }

    public function getFeature(): Feature
    {
        return $this->feature;
    }

    public function setFeature(Feature $feature): self
    {
        $this->feature = $feature;
        return $this;
    }

    public function getLimitPerPeriod(): ?int
    {
        return $this->limitPerPeriod;
    }

    public function setLimitPerPeriod(?int $limitPerPeriod): self
    {
        $this->limitPerPeriod = $limitPerPeriod;
        return $this;
    }

    public function getPeriod(): string
    {
        return $this->period;
    }

    public function setPeriod(string $period): self
    {
        $this->period = $period;
        return $this;
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    public function setEnabled(bool $enabled): self
    {
        $this->enabled = $enabled;
        return $this;
    }
}
