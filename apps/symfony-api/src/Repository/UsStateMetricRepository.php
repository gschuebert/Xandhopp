<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\UsStateMetric;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UsStateMetric>
 */
class UsStateMetricRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UsStateMetric::class);
    }

    public function findByStateAndKey(int $stateId, string $metricKey): ?UsStateMetric
    {
        return $this->findOneBy([
            'state' => $stateId,
            'metricKey' => $metricKey
        ]);
    }
}
