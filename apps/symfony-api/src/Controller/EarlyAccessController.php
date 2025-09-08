<?php

namespace App\Controller;

use App\Entity\EarlyAccessRegistration;
use App\Repository\EarlyAccessRegistrationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api')]
class EarlyAccessController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private EarlyAccessRegistrationRepository $repository,
        private ValidatorInterface $validator
    ) {
    }

    #[Route('/early-access', name: 'early_access_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['email'])) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Email is required'
            ], Response::HTTP_BAD_REQUEST);
        }

        $email = trim($data['email']);
        $locale = $data['locale'] ?? 'en';

        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Invalid email format'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Check if email already exists
        $existingRegistration = $this->repository->findByEmail($email);
        if ($existingRegistration) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Email already registered'
            ], Response::HTTP_CONFLICT);
        }

        // Create new registration
        $registration = new EarlyAccessRegistration();
        $registration->setEmail($email);
        $registration->setLocale($locale);
        $registration->setIpAddress($request->getClientIp());
        $registration->setUserAgent($request->headers->get('User-Agent'));

        // Validate entity
        $errors = $this->validator->validate($registration);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return new JsonResponse([
                'success' => false,
                'message' => 'Validation failed: ' . implode(', ', $errorMessages)
            ], Response::HTTP_BAD_REQUEST);
        }

        // Save to database
        try {
            $this->entityManager->persist($registration);
            $this->entityManager->flush();

            return new JsonResponse([
                'success' => true,
                'message' => 'Successfully registered for early access',
                'data' => [
                    'id' => $registration->getId(),
                    'email' => $registration->getEmail(),
                    'locale' => $registration->getLocale(),
                    'createdAt' => $registration->getCreatedAt()->format('Y-m-d H:i:s')
                ]
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Failed to register: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/early-access/stats', name: 'early_access_stats', methods: ['GET'])]
    public function stats(): JsonResponse
    {
        $totalRegistrations = $this->repository->countRegistrations();
        $recentRegistrations = $this->repository->findRecentRegistrations(5);

        $stats = [
            'total' => $totalRegistrations,
            'recent' => array_map(function (EarlyAccessRegistration $registration) {
                return [
                    'email' => $registration->getEmail(),
                    'locale' => $registration->getLocale(),
                    'createdAt' => $registration->getCreatedAt()->format('Y-m-d H:i:s')
                ];
            }, $recentRegistrations)
        ];

        return new JsonResponse([
            'success' => true,
            'data' => $stats
        ]);
    }
}
