<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Country;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Country>
 */
class CountryRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Country::class);
    }

    public function findBySlug(string $slug): ?Country
    {
        return $this->findOneBy(['slug' => $slug]);
    }

    public function findByIso2(string $iso2): ?Country
    {
        return $this->findOneBy(['iso2' => $iso2]);
    }

    public function findByIso3(string $iso3): ?Country
    {
        return $this->findOneBy(['iso3' => $iso3]);
    }

    public function findByContinent(string $continent): array
    {
        return $this->findBy(['continent' => $continent], ['nameEn' => 'ASC']);
    }

    public function searchByName(string $query, int $limit = 10): array
    {
        return $this->createQueryBuilder('c')
            ->where('LOWER(c.nameEn) LIKE LOWER(:query)')
            ->orWhere('LOWER(c.nameLocal) LIKE LOWER(:query)')
            ->orWhere('LOWER(c.capital) LIKE LOWER(:query)')
            ->setParameter('query', '%' . $query . '%')
            ->orderBy('c.nameEn', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findAllOrderedByName(): array
    {
        return $this->findBy([], ['nameEn' => 'ASC']);
    }

    public function save(Country $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Country $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}
