<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\UsState;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UsState>
 */
class UsStateRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UsState::class);
    }

    public function findByStateCode(string $stateCode): ?UsState
    {
        return $this->findOneBy(['stateCode' => $stateCode]);
    }

    public function findAllOrderedByName(): array
    {
        return $this->createQueryBuilder('s')
            ->orderBy('s.nameEn', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function searchByName(string $query, int $limit = 10): array
    {
        return $this->createQueryBuilder('s')
            ->where('LOWER(s.nameEn) LIKE LOWER(:query)')
            ->orWhere('LOWER(s.nameLocal) LIKE LOWER(:query)')
            ->orWhere('LOWER(s.capital) LIKE LOWER(:query)')
            ->setParameter('query', '%' . $query . '%')
            ->orderBy('s.nameEn', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function save(UsState $state, bool $flush = false): void
    {
        $this->getEntityManager()->persist($state);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(UsState $state, bool $flush = false): void
    {
        $this->getEntityManager()->remove($state);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}
