<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\UsStateText;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UsStateText>
 */
class UsStateTextRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UsStateText::class);
    }

    public function findByStateAndSection(int $stateId, string $section, string $lang = 'en'): ?UsStateText
    {
        return $this->findOneBy([
            'state' => $stateId,
            'section' => $section,
            'lang' => $lang
        ]);
    }
}
