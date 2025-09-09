<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\WaitlistSignup;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<WaitlistSignup>
 */
class WaitlistSignupRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, WaitlistSignup::class);
    }

    public function findByEmail(string $email): ?WaitlistSignup
    {
        return $this->findOneBy(['email' => strtolower($email)]);
    }

    public function findByToken(string $token): ?WaitlistSignup
    {
        return $this->findOneBy(['optInToken' => $token]);
    }

    public function findByReferralCode(string $referralCode): array
    {
        return $this->findBy(['referralCode' => $referralCode]);
    }

    public function save(WaitlistSignup $signup): void
    {
        $this->getEntityManager()->persist($signup);
        $this->getEntityManager()->flush();
    }

    public function remove(WaitlistSignup $signup): void
    {
        $this->getEntityManager()->remove($signup);
        $this->getEntityManager()->flush();
    }
}
