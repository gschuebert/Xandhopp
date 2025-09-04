<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\ResidencyProgramRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ResidencyProgramRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
        new Post(),
        new Put(),
        new Delete()
    ],
    normalizationContext: ['groups' => ['program:read']],
    denormalizationContext: ['groups' => ['program:write']]
)]
class ResidencyProgram
{
    public const TYPE_RESIDENCY = 'residency';
    public const TYPE_WORK = 'work';
    public const TYPE_INVESTOR = 'investor';
    public const TYPE_DIGITAL_NOMAD = 'digital_nomad';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['program:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'residencyPrograms')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['program:read', 'program:write'])]
    private ?Country $country = null;

    #[ORM\Column(length: 50)]
    #[Groups(['program:read', 'program:write'])]
    private ?string $type = null;

    #[ORM\Column(length: 255)]
    #[Groups(['program:read', 'program:write'])]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['program:read', 'program:write'])]
    private ?string $requirements = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['program:read', 'program:write'])]
    private ?string $fees = null;

    #[ORM\Column]
    #[Groups(['program:read', 'program:write'])]
    private ?int $processingTimeDays = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCountry(): ?Country
    {
        return $this->country;
    }

    public function setCountry(?Country $country): static
    {
        $this->country = $country;
        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;
        return $this;
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

    public function getRequirements(): ?string
    {
        return $this->requirements;
    }

    public function setRequirements(string $requirements): static
    {
        $this->requirements = $requirements;
        return $this;
    }

    public function getFees(): ?string
    {
        return $this->fees;
    }

    public function setFees(string $fees): static
    {
        $this->fees = $fees;
        return $this;
    }

    public function getProcessingTimeDays(): ?int
    {
        return $this->processingTimeDays;
    }

    public function setProcessingTimeDays(int $processingTimeDays): static
    {
        $this->processingTimeDays = $processingTimeDays;
        return $this;
    }
}
