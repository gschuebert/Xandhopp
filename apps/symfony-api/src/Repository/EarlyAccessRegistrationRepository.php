<?php

namespace App\Repository;

use App\Entity\EarlyAccessRegistration;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<EarlyAccessRegistration>
 */
class EarlyAccessRegistrationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EarlyAccessRegistration::class);
    }

    public function findByEmail(string $email): ?EarlyAccessRegistration
    {
        return $this->createQueryBuilder('e')
            ->andWhere('LOWER(e.email) = LOWER(:email)')
            ->setParameter('email', $email)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function countRegistrations(): int
    {
        return $this->createQueryBuilder('e')
            ->select('COUNT(e.id)')
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function findRecentRegistrations(int $limit = 10): array
    {
        return $this->createQueryBuilder('e')
            ->orderBy('e.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findRecentRegistrationsByIp(string $ipAddress, int $hours = 1): array
    {
        $since = new \DateTime("-{$hours} hours");
        
        return $this->createQueryBuilder('e')
            ->andWhere('e.ipAddress = :ip')
            ->andWhere('e.createdAt >= :since')
            ->setParameter('ip', $ipAddress)
            ->setParameter('since', $since)
            ->orderBy('e.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
