<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\CountryMetric;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CountryMetric>
 */
class CountryMetricRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CountryMetric::class);
    }

    public function findByCountryAndMetric(int $countryId, string $metricKey, ?int $year = null): array
    {
        $qb = $this->createQueryBuilder('cm')
            ->where('cm.country = :countryId')
            ->andWhere('cm.metricKey = :metricKey')
            ->setParameter('countryId', $countryId)
            ->setParameter('metricKey', $metricKey);

        if ($year !== null) {
            $qb->andWhere('cm.year = :year')
               ->setParameter('year', $year);
        }

        return $qb->orderBy('cm.year', 'DESC')
                  ->getQuery()
                  ->getResult();
    }

    public function findByCountry(int $countryId): array
    {
        return $this->findBy(['country' => $countryId], ['metricKey' => 'ASC', 'year' => 'DESC']);
    }

    public function findLatestByCountryAndMetric(int $countryId, string $metricKey): ?CountryMetric
    {
        return $this->createQueryBuilder('cm')
            ->where('cm.country = :countryId')
            ->andWhere('cm.metricKey = :metricKey')
            ->setParameter('countryId', $countryId)
            ->setParameter('metricKey', $metricKey)
            ->orderBy('cm.year', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function save(CountryMetric $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(CountryMetric $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}
