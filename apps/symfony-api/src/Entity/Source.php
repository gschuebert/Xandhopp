<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity]
#[ORM\Table(name: 'source')]
class Source
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::INTEGER)]
    private ?int $id = null;

    #[ORM\Column(type: Types::TEXT, unique: true)]
    private string $key;

    #[ORM\Column(type: Types::TEXT)]
    private string $baseUrl;

    #[ORM\OneToMany(mappedBy: 'source', targetEntity: CountryText::class)]
    private Collection $countryTexts;

    #[ORM\OneToMany(mappedBy: 'source', targetEntity: CountryMetric::class)]
    private Collection $countryMetrics;

    public function __construct()
    {
        $this->countryTexts = new ArrayCollection();
        $this->countryMetrics = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getKey(): string
    {
        return $this->key;
    }

    public function setKey(string $key): self
    {
        $this->key = $key;
        return $this;
    }

    public function getBaseUrl(): string
    {
        return $this->baseUrl;
    }

    public function setBaseUrl(string $baseUrl): self
    {
        $this->baseUrl = $baseUrl;
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
            $countryText->setSource($this);
        }
        return $this;
    }

    public function removeCountryText(CountryText $countryText): self
    {
        if ($this->countryTexts->removeElement($countryText)) {
            if ($countryText->getSource() === $this) {
                $countryText->setSource($this);
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
            $countryMetric->setSource($this);
        }
        return $this;
    }

    public function removeCountryMetric(CountryMetric $countryMetric): self
    {
        if ($this->countryMetrics->removeElement($countryMetric)) {
            if ($countryMetric->getSource() === $this) {
                $countryMetric->setSource($this);
            }
        }
        return $this;
    }
}
