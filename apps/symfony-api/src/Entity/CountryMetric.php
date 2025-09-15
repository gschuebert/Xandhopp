<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ORM\Table(name: 'country_metric')]
class CountryMetric
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::BIGINT)]
    #[Groups(['country_metric:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Country::class, inversedBy: 'countryMetrics')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['country_metric:read', 'country_metric:write'])]
    private Country $country;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['country_metric:read', 'country_metric:write'])]
    private string $metricKey;

    #[ORM\Column(type: Types::DECIMAL, precision: 20, scale: 6, nullable: true)]
    #[Groups(['country_metric:read', 'country_metric:write'])]
    private ?string $metricValue = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['country_metric:read', 'country_metric:write'])]
    private ?string $metricUnit = null;

    #[ORM\Column(type: Types::INTEGER, nullable: true)]
    #[Groups(['country_metric:read', 'country_metric:write'])]
    private ?int $year = null;

    #[ORM\ManyToOne(targetEntity: Source::class, inversedBy: 'countryMetrics')]
    #[Groups(['country_metric:read', 'country_metric:write'])]
    private ?Source $source = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['country_metric:read', 'country_metric:write'])]
    private ?string $sourceUrl = null;

    #[ORM\Column(type: Types::DATETIMETZ_IMMUTABLE)]
    #[Groups(['country_metric:read'])]
    private \DateTimeImmutable $extractedAt;

    public function __construct()
    {
        $this->extractedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCountry(): Country
    {
        return $this->country;
    }

    public function setCountry(Country $country): self
    {
        $this->country = $country;
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

    public function getYear(): ?int
    {
        return $this->year;
    }

    public function setYear(?int $year): self
    {
        $this->year = $year;
        return $this;
    }

    public function getSource(): ?Source
    {
        return $this->source;
    }

    public function setSource(?Source $source): self
    {
        $this->source = $source;
        return $this;
    }

    public function getSourceUrl(): ?string
    {
        return $this->sourceUrl;
    }

    public function setSourceUrl(?string $sourceUrl): self
    {
        $this->sourceUrl = $sourceUrl;
        return $this;
    }

    public function getExtractedAt(): \DateTimeImmutable
    {
        return $this->extractedAt;
    }

    public function setExtractedAt(\DateTimeImmutable $extractedAt): self
    {
        $this->extractedAt = $extractedAt;
        return $this;
    }
}
