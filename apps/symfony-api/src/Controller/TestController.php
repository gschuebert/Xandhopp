<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\ClickHouseService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/test')]
class TestController extends AbstractController
{
    public function __construct(
        private ClickHouseService $clickHouseService
    ) {}

    #[Route('/health', name: 'test_health', methods: ['GET'])]
    public function health(): JsonResponse
    {
        return new JsonResponse([
            'status' => 'ok',
            'timestamp' => date('c'),
            'service' => 'xandhopp-api'
        ]);
    }

    #[Route('/clickhouse', name: 'test_clickhouse', methods: ['GET'])]
    public function testClickHouse(): JsonResponse
    {
        try {
            // Ensure events table exists
            $this->clickHouseService->ensureEventsTable();
            
            // Log a test event
            $this->clickHouseService->log('test_event', 1, [
                'message' => 'ClickHouse test successful',
                'timestamp' => date('c')
            ]);

            return new JsonResponse([
                'status' => 'ok',
                'message' => 'ClickHouse test successful'
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'ClickHouse test failed: ' . $e->getMessage()
            ], 500);
        }
    }

    #[Route('/prelaunch', name: 'test_prelaunch', methods: ['POST'])]
    public function testPrelaunch(): JsonResponse
    {
        $testData = [
            'email' => 'test@example.com',
            'locale' => 'en',
            'country_interest' => 'DE',
            'utm' => ['source' => 'test', 'medium' => 'api']
        ];

        return new JsonResponse([
            'message' => 'Test prelaunch data prepared',
            'data' => $testData,
            'endpoint' => '/api/prelaunch/signup'
        ]);
    }
}
