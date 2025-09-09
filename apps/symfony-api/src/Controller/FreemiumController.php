<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Service\FreemiumService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/freemium')]
class FreemiumController extends AbstractController
{
    public function __construct(
        private FreemiumService $freemiumService
    ) {}

    #[Route('/check/{featureKey}', name: 'freemium_check', methods: ['GET'])]
    public function checkEntitlement(string $featureKey): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        $result = $this->freemiumService->checkEntitlement($user, $featureKey);
        
        if (!$result['allowed']) {
            return new JsonResponse($result, 402); // Payment Required
        }

        return new JsonResponse($result);
    }

    #[Route('/use/{featureKey}', name: 'freemium_use', methods: ['POST'])]
    public function useFeature(string $featureKey, Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        $data = json_decode($request->getContent(), true);
        $quantity = $data['quantity'] ?? 1;

        // Check entitlement first
        $entitlement = $this->freemiumService->checkEntitlement($user, $featureKey);
        
        if (!$entitlement['allowed']) {
            return new JsonResponse($entitlement, 402);
        }

        // Record usage
        $this->freemiumService->recordUsage($user, $featureKey, $quantity);

        return new JsonResponse([
            'message' => 'Feature usage recorded',
            'remaining' => $entitlement['remaining'] - $quantity
        ]);
    }

    #[Route('/usage/{featureKey}', name: 'freemium_usage', methods: ['GET'])]
    public function getUsage(string $featureKey): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        $entitlement = $this->freemiumService->checkEntitlement($user, $featureKey);
        
        return new JsonResponse([
            'feature_key' => $featureKey,
            'current_usage' => $entitlement['current_usage'] ?? 0,
            'limit' => $entitlement['limit'] ?? null,
            'remaining' => $entitlement['remaining'] ?? null,
            'period' => $entitlement['period'] ?? null
        ]);
    }
}
