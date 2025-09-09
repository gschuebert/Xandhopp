<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Feature;
use App\Entity\Plan;
use App\Entity\PlanEntitlement;
use App\Entity\Subscription;
use App\Entity\UsageEvent;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class FreemiumService
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    public function checkEntitlement(User $user, string $featureKey): array
    {
        // Get user's subscription
        $subscription = $this->entityManager->getRepository(Subscription::class)
            ->findOneBy(['user' => $user]);
        
        if (!$subscription) {
            // Default to free plan
            $planId = 'free';
        } else {
            $planId = $subscription->getPlan()->getId();
        }

        // Get entitlement
        $entitlement = $this->entityManager->getRepository(PlanEntitlement::class)
            ->findOneBy([
                'plan' => $planId,
                'feature' => $featureKey,
                'enabled' => true
            ]);

        if (!$entitlement) {
            return [
                'allowed' => false,
                'reason' => 'Feature not available in current plan',
                'upgrade_required' => true
            ];
        }

        // Check if unlimited
        if ($entitlement->getLimitPerPeriod() === null) {
            return ['allowed' => true];
        }

        // Count current usage
        $usage = $this->getCurrentUsage($user, $featureKey, $entitlement->getPeriod());
        
        if ($usage >= $entitlement->getLimitPerPeriod()) {
            return [
                'allowed' => false,
                'reason' => 'Usage limit exceeded',
                'current_usage' => $usage,
                'limit' => $entitlement->getLimitPerPeriod(),
                'period' => $entitlement->getPeriod(),
                'upgrade_required' => true
            ];
        }

        return [
            'allowed' => true,
            'current_usage' => $usage,
            'limit' => $entitlement->getLimitPerPeriod(),
            'remaining' => $entitlement->getLimitPerPeriod() - $usage
        ];
    }

    public function recordUsage(User $user, string $featureKey, int $quantity = 1): void
    {
        $usageEvent = new UsageEvent();
        $usageEvent->setUser($user);
        $usageEvent->setFeatureKey($featureKey);
        $usageEvent->setQty($quantity);
        
        $this->entityManager->persist($usageEvent);
        $this->entityManager->flush();
    }

    public function getCurrentUsage(User $user, string $featureKey, string $period): int
    {
        $qb = $this->entityManager->getRepository(UsageEvent::class)
            ->createQueryBuilder('ue')
            ->select('SUM(ue.qty)')
            ->where('ue.user = :user')
            ->andWhere('ue.featureKey = :featureKey')
            ->setParameter('user', $user)
            ->setParameter('featureKey', $featureKey);

        switch ($period) {
            case 'month':
                $qb->andWhere('ue.createdAt >= :startOfMonth')
                   ->setParameter('startOfMonth', new \DateTime('first day of this month'));
                break;
            case 'lifetime':
                // No additional filter needed
                break;
            case 'none':
                // No usage tracking
                return 0;
        }

        $result = $qb->getQuery()->getSingleScalarResult();
        return (int) ($result ?? 0);
    }

    public function seedDefaultData(): void
    {
        // Create features
        $features = [
            'countries_unlocked' => 'count',
            'visa_checks' => 'count',
            'saves' => 'count',
            'alerts_realtime' => 'boolean'
        ];

        foreach ($features as $key => $unit) {
            $feature = $this->entityManager->getRepository(Feature::class)->find($key);
            if (!$feature) {
                $feature = new Feature();
                $feature->setKey($key);
                $feature->setUnit($unit);
                $this->entityManager->persist($feature);
            }
        }

        // Create plans
        $plans = [
            'free' => 'Free',
            'plus' => 'Plus',
            'pro' => 'Pro'
        ];

        foreach ($plans as $id => $name) {
            $plan = $this->entityManager->getRepository(Plan::class)->find($id);
            if (!$plan) {
                $plan = new Plan();
                $plan->setId($id);
                $plan->setName($name);
                $this->entityManager->persist($plan);
            }
        }

        $this->entityManager->flush();

        // Create plan entitlements
        $entitlements = [
            'free' => [
                'countries_unlocked' => ['limit' => 2, 'period' => 'lifetime'],
                'visa_checks' => ['limit' => 1, 'period' => 'month'],
                'saves' => ['limit' => 5, 'period' => 'lifetime'],
                'alerts_realtime' => ['limit' => 0, 'period' => 'none']
            ],
            'plus' => [
                'countries_unlocked' => ['limit' => 10, 'period' => 'lifetime'],
                'visa_checks' => ['limit' => 10, 'period' => 'month'],
                'saves' => ['limit' => 50, 'period' => 'lifetime'],
                'alerts_realtime' => ['limit' => 1, 'period' => 'none']
            ],
            'pro' => [
                'countries_unlocked' => ['limit' => null, 'period' => 'lifetime'],
                'visa_checks' => ['limit' => null, 'period' => 'month'],
                'saves' => ['limit' => null, 'period' => 'lifetime'],
                'alerts_realtime' => ['limit' => 1, 'period' => 'none']
            ]
        ];

        foreach ($entitlements as $planId => $planFeatures) {
            $plan = $this->entityManager->getRepository(Plan::class)->find($planId);
            
            foreach ($planFeatures as $featureKey => $config) {
                $feature = $this->entityManager->getRepository(Feature::class)->find($featureKey);
                
                $entitlement = $this->entityManager->getRepository(PlanEntitlement::class)
                    ->findOneBy(['plan' => $plan, 'feature' => $feature]);
                
                if (!$entitlement) {
                    $entitlement = new PlanEntitlement();
                    $entitlement->setPlan($plan);
                    $entitlement->setFeature($feature);
                }
                
                $entitlement->setLimitPerPeriod($config['limit']);
                $entitlement->setPeriod($config['period']);
                $entitlement->setEnabled(true);
                
                $this->entityManager->persist($entitlement);
            }
        }

        $this->entityManager->flush();
    }
}
