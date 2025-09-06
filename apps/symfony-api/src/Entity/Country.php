<?php

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
    #[ORM\Column]
    #[Groups(['country:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['country:read', 'country:write'])]
    private ?string $name = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Groups(['country:read', 'country:write'])]
    private ?string $slug = null;

    #[ORM\Column(length: 2)]
    #[Groups(['country:read', 'country:write'])]
    private ?string $iso2 = null;

    #[ORM\Column(length: 255)]
    #[Groups(['country:read', 'country:write'])]
    private ?string $continent = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['country:read', 'country:write'])]
    private ?string $summary = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 8, scale: 2)]
    #[Groups(['country:read', 'country:write'])]
    private ?string $costOfLivingIndex = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 5, scale: 2)]
    #[Groups(['country:read', 'country:write'])]
    private ?string $taxRate = null;

    #[ORM\Column]
    #[Groups(['country:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['country:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    /**
     * @var Collection<int, ResidencyProgram>
     */
    #[ORM\OneToMany(targetEntity: ResidencyProgram::class, mappedBy: 'country')]
    #[Groups(['country:read'])]
    private Collection $residencyPrograms;

    /**
     * @var Collection<int, Provider>
     */
    #[ORM\OneToMany(targetEntity: Provider::class, mappedBy: 'country')]
    #[Groups(['country:read'])]
    private Collection $providers;

    /**
     * @var Collection<int, ChecklistItem>
     */
    #[ORM\OneToMany(targetEntity: ChecklistItem::class, mappedBy: 'country')]
    #[Groups(['country:read'])]
    private Collection $checklistItems;

    public function __construct()
    {
        $this->residencyPrograms = new ArrayCollection();
        $this->providers = new ArrayCollection();
        $this->checklistItems = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): static
    {
        $this->slug = $slug;
        return $this;
    }

    public function getIso2(): ?string
    {
        return $this->iso2;
    }

    public function setIso2(string $iso2): static
    {
        $this->iso2 = $iso2;
        return $this;
    }

    public function getContinent(): ?string
    {
        return $this->continent;
    }

    public function setContinent(string $continent): static
    {
        $this->continent = $continent;
        return $this;
    }

    public function getSummary(): ?string
    {
        return $this->summary;
    }

    public function setSummary(?string $summary): static
    {
        $this->summary = $summary;
        return $this;
    }

    public function getCostOfLivingIndex(): ?string
    {
        return $this->costOfLivingIndex;
    }

    public function setCostOfLivingIndex(string $costOfLivingIndex): static
    {
        $this->costOfLivingIndex = $costOfLivingIndex;
        return $this;
    }

    public function getTaxRate(): ?string
    {
        return $this->taxRate;
    }

    public function setTaxRate(string $taxRate): static
    {
        $this->taxRate = $taxRate;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    /**
     * @return Collection<int, ResidencyProgram>
     */
    public function getResidencyPrograms(): Collection
    {
        return $this->residencyPrograms;
    }

    public function addResidencyProgram(ResidencyProgram $residencyProgram): static
    {
        if (!$this->residencyPrograms->contains($residencyProgram)) {
            $this->residencyPrograms->add($residencyProgram);
            $residencyProgram->setCountry($this);
        }

        return $this;
    }

    public function removeResidencyProgram(ResidencyProgram $residencyProgram): static
    {
        if ($this->residencyPrograms->removeElement($residencyProgram)) {
            if ($residencyProgram->getCountry() === $this) {
                $residencyProgram->setCountry(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Provider>
     */
    public function getProviders(): Collection
    {
        return $this->providers;
    }

    public function addProvider(Provider $provider): static
    {
        if (!$this->providers->contains($provider)) {
            $this->providers->add($provider);
            $provider->setCountry($this);
        }

        return $this;
    }

    public function removeProvider(Provider $provider): static
    {
        if ($this->providers->removeElement($provider)) {
            if ($provider->getCountry() === $this) {
                $provider->setCountry(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, ChecklistItem>
     */
    public function getChecklistItems(): Collection
    {
        return $this->checklistItems;
    }

    public function addChecklistItem(ChecklistItem $checklistItem): static
    {
        if (!$this->checklistItems->contains($checklistItem)) {
            $this->checklistItems->add($checklistItem);
            $checklistItem->setCountry($this);
        }

        return $this;
    }

    public function removeChecklistItem(ChecklistItem $checklistItem): static
    {
        if ($this->checklistItems->removeElement($checklistItem)) {
            if ($checklistItem->getCountry() === $this) {
                $checklistItem->setCountry(null);
            }
        }

        return $this;
    }

    #[ORM\PreUpdate]
    public function preUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }
}
