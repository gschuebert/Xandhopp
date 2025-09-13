<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'us_state')]
class UsState
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::INTEGER)]
    private ?int $id = null;

    #[ORM\Column(type: Types::STRING, length: 2, unique: true)]
    private string $stateCode;

    #[ORM\Column(type: Types::STRING, length: 100)]
    private string $nameEn;

    #[ORM\Column(type: Types::STRING, length: 100, nullable: true)]
    private ?string $nameLocal = null;

    #[ORM\Column(type: Types::STRING, length: 100, nullable: true)]
    private ?string $capital = null;

    #[ORM\Column(type: Types::INTEGER, nullable: true)]
    private ?int $population = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    private ?string $areaKm2 = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 6, nullable: true)]
    private ?string $lat = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 6, nullable: true)]
    private ?string $lon = null;

    #[ORM\Column(type: Types::STRING, length: 50, nullable: true)]
    private ?string $timezone = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $establishedDate = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $updatedAt;

    /**
     * @var Collection<int, UsStateText>
     */
    #[ORM\OneToMany(targetEntity: UsStateText::class, mappedBy: 'state', cascade: ['persist', 'remove'])]
    private Collection $texts;

    /**
     * @var Collection<int, UsStateMetric>
     */
    #[ORM\OneToMany(targetEntity: UsStateMetric::class, mappedBy: 'state', cascade: ['persist', 'remove'])]
    private Collection $metrics;

    public function __construct()
    {
        $this->texts = new ArrayCollection();
        $this->metrics = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStateCode(): string
    {
        return $this->stateCode;
    }

    public function setStateCode(string $stateCode): self
    {
        $this->stateCode = $stateCode;
        return $this;
    }

    public function getNameEn(): string
    {
        return $this->nameEn;
    }

    public function setNameEn(string $nameEn): self
    {
        $this->nameEn = $nameEn;
        return $this;
    }

    public function getNameLocal(): ?string
    {
        return $this->nameLocal;
    }

    public function setNameLocal(?string $nameLocal): self
    {
        $this->nameLocal = $nameLocal;
        return $this;
    }

    public function getCapital(): ?string
    {
        return $this->capital;
    }

    public function setCapital(?string $capital): self
    {
        $this->capital = $capital;
        return $this;
    }

    public function getPopulation(): ?int
    {
        return $this->population;
    }

    public function setPopulation(?int $population): self
    {
        $this->population = $population;
        return $this;
    }

    public function getAreaKm2(): ?string
    {
        return $this->areaKm2;
    }

    public function setAreaKm2(?string $areaKm2): self
    {
        $this->areaKm2 = $areaKm2;
        return $this;
    }

    public function getLat(): ?string
    {
        return $this->lat;
    }

    public function setLat(?string $lat): self
    {
        $this->lat = $lat;
        return $this;
    }

    public function getLon(): ?string
    {
        return $this->lon;
    }

    public function setLon(?string $lon): self
    {
        $this->lon = $lon;
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

    public function getEstablishedDate(): ?\DateTimeInterface
    {
        return $this->establishedDate;
    }

    public function setEstablishedDate(?\DateTimeInterface $establishedDate): self
    {
        $this->establishedDate = $establishedDate;
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

    /**
     * @return Collection<int, UsStateText>
     */
    public function getTexts(): Collection
    {
        return $this->texts;
    }

    public function addText(UsStateText $text): self
    {
        if (!$this->texts->contains($text)) {
            $this->texts->add($text);
            $text->setState($this);
        }
        return $this;
    }

    public function removeText(UsStateText $text): self
    {
        if ($this->texts->removeElement($text)) {
            if ($text->getState() === $this) {
                $text->setState(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, UsStateMetric>
     */
    public function getMetrics(): Collection
    {
        return $this->metrics;
    }

    public function addMetric(UsStateMetric $metric): self
    {
        if (!$this->metrics->contains($metric)) {
            $this->metrics->add($metric);
            $metric->setState($this);
        }
        return $this;
    }

    public function removeMetric(UsStateMetric $metric): self
    {
        if ($this->metrics->removeElement($metric)) {
            if ($metric->getState() === $this) {
                $metric->setState(null);
            }
        }
        return $this;
    }
}
