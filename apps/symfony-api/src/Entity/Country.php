<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\CountryRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: CountryRepository::class)]
#[ORM\Table(name: 'country')]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
        new Post(),
        new Put(),
        new Delete()
    ],
    normalizationContext: ['groups' => ['country:read']],
    denormalizationContext: ['groups' => ['country:write']]
)]
class Country
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::INTEGER)]
    #[Groups(['country:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::STRING, length: 2, unique: true)]
    #[Groups(['country:read', 'country:write'])]
    private string $iso2;

    #[ORM\Column(type: Types::STRING, length: 3, unique: true)]
    #[Groups(['country:read', 'country:write'])]
    private string $iso3;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['country:read', 'country:write'])]
    private string $nameEn;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['country:read', 'country:write'])]
    private ?string $nameLocal = null;

    #[ORM\Column(type: Types::TEXT, unique: true)]
    #[Groups(['country:read', 'country:write'])]
    private string $slug;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['country:read', 'country:write'])]
    private ?string $continent = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['country:read', 'country:write'])]
    private ?string $capital = null;

    #[ORM\Column(type: Types::BIGINT, nullable: true)]
    #[Groups(['country:read', 'country:write'])]
    private ?int $population = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 15, scale: 2, nullable: true)]
    #[Groups(['country:read', 'country:write'])]
    private ?string $areaKm2 = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 7, nullable: true)]
    #[Groups(['country:read', 'country:write'])]
    private ?string $lat = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 7, nullable: true)]
    #[Groups(['country:read', 'country:write'])]
    private ?string $lon = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['country:read', 'country:write'])]
    private ?string $callingCode = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['country:read', 'country:write'])]
    private ?string $currencyCode = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['country:read', 'country:write'])]
    private ?array $languages = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['country:read', 'country:write'])]
    private ?string $flagSvgUrl = null;

    #[ORM\Column(type: Types::DATETIMETZ_IMMUTABLE)]
    #[Groups(['country:read'])]
    private \DateTimeImmutable $updatedAt;

    #[ORM\OneToMany(mappedBy: 'country', targetEntity: CountryText::class, cascade: ['persist', 'remove'])]
    #[Groups(['country:read'])]
    private Collection $countryTexts;

    #[ORM\OneToMany(mappedBy: 'country', targetEntity: CountryMetric::class, cascade: ['persist', 'remove'])]
    #[Groups(['country:read'])]
    private Collection $countryMetrics;

    public function __construct()
    {
        $this->countryTexts = new ArrayCollection();
        $this->countryMetrics = new ArrayCollection();
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIso2(): string
    {
        return $this->iso2;
    }

    public function setIso2(string $iso2): self
    {
        $this->iso2 = $iso2;
        return $this;
    }

    public function getIso3(): string
    {
        return $this->iso3;
    }

    public function setIso3(string $iso3): self
    {
        $this->iso3 = $iso3;
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

    public function getSlug(): string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): self
    {
        $this->slug = $slug;
        return $this;
    }

    public function getContinent(): ?string
    {
        return $this->continent;
    }

    public function setContinent(?string $continent): self
    {
        $this->continent = $continent;
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

    public function getCallingCode(): ?string
    {
        return $this->callingCode;
    }

    public function setCallingCode(?string $callingCode): self
    {
        $this->callingCode = $callingCode;
        return $this;
    }

    public function getCurrencyCode(): ?string
    {
        return $this->currencyCode;
    }

    public function setCurrencyCode(?string $currencyCode): self
    {
        $this->currencyCode = $currencyCode;
        return $this;
    }

    public function getLanguages(): ?array
    {
        return $this->languages;
    }

    public function setLanguages(?array $languages): self
    {
        $this->languages = $languages;
        return $this;
    }

    public function getFlagSvgUrl(): ?string
    {
        return $this->flagSvgUrl;
    }

    public function setFlagSvgUrl(?string $flagSvgUrl): self
    {
        $this->flagSvgUrl = $flagSvgUrl;
        return $this;
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
     * @return Collection<int, CountryText>
     */
    public function getCountryTexts(): Collection
    {
        return $this->countryTexts;
    }

    public function addCountryText(CountryText $countryText): self
    {
        if (!$this->countryTexts->contains($countryText)) {
            $this->countryTexts->add($countryText);
            $countryText->setCountry($this);
        }
        return $this;
    }

    public function removeCountryText(CountryText $countryText): self
    {
        if ($this->countryTexts->removeElement($countryText)) {
            if ($countryText->getCountry() === $this) {
                $countryText->setCountry($this);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, CountryMetric>
     */
    public function getCountryMetrics(): Collection
    {
        return $this->countryMetrics;
    }

    public function addCountryMetric(CountryMetric $countryMetric): self
    {
        if (!$this->countryMetrics->contains($countryMetric)) {
            $this->countryMetrics->add($countryMetric);
            $countryMetric->setCountry($this);
        }
        return $this;
    }

    public function removeCountryMetric(CountryMetric $countryMetric): self
    {
        if ($this->countryMetrics->removeElement($countryMetric)) {
            if ($countryMetric->getCountry() === $this) {
                $countryMetric->setCountry($this);
            }
        }
        return $this;
    }

    #[ORM\PrePersist]
    #[ORM\PreUpdate]
    public function updateTimestamps(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }
}