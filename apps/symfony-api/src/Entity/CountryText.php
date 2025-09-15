<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ORM\Table(name: 'country_text')]
class CountryText
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::BIGINT)]
    #[Groups(['country_text:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Country::class, inversedBy: 'countryTexts')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['country_text:read', 'country_text:write'])]
    private Country $country;

    #[ORM\Column(type: Types::STRING, length: 20)]
    #[Groups(['country_text:read', 'country_text:write'])]
    private string $section;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['country_text:read', 'country_text:write'])]
    private string $lang = 'en';

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['country_text:read', 'country_text:write'])]
    private string $content;

    #[ORM\ManyToOne(targetEntity: Source::class, inversedBy: 'countryTexts')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['country_text:read', 'country_text:write'])]
    private Source $source;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['country_text:read', 'country_text:write'])]
    private ?string $sourceUrl = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['country_text:read', 'country_text:write'])]
    private ?string $sourceRev = null;

    #[ORM\Column(type: Types::DATETIMETZ_IMMUTABLE)]
    #[Groups(['country_text:read'])]
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

    public function getSection(): string
    {
        return $this->section;
    }

    public function setSection(string $section): self
    {
        $this->section = $section;
        return $this;
    }

    public function getLang(): string
    {
        return $this->lang;
    }

    public function setLang(string $lang): self
    {
        $this->lang = $lang;
        return $this;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function setContent(string $content): self
    {
        $this->content = $content;
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

    public function getSourceUrl(): ?string
    {
        return $this->sourceUrl;
    }

    public function setSourceUrl(?string $sourceUrl): self
    {
        $this->sourceUrl = $sourceUrl;
        return $this;
    }

    public function getSourceRev(): ?string
    {
        return $this->sourceRev;
    }

    public function setSourceRev(?string $sourceRev): self
    {
        $this->sourceRev = $sourceRev;
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
