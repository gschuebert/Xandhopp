<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\CountryText;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CountryText>
 */
class CountryTextRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CountryText::class);
    }

    public function findByCountryAndSection(int $countryId, string $section, string $lang = 'en'): ?CountryText
    {
        return $this->findOneBy([
            'country' => $countryId,
            'section' => $section,
            'lang' => $lang
        ]);
    }

    public function findByCountry(int $countryId, string $lang = 'en'): array
    {
        return $this->findBy([
            'country' => $countryId,
            'lang' => $lang
        ]);
    }

    public function save(CountryText $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(CountryText $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}
