<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\ConsentLog;
use App\Entity\User;
use App\Entity\WaitlistSignup;
use App\Repository\UserRepository;
use App\Repository\WaitlistSignupRepository;
use App\Service\ClickHouseService;
use App\Service\TokenService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserRepository $userRepository,
        private WaitlistSignupRepository $waitlistRepository,
        private ClickHouseService $clickHouseService,
        private TokenService $tokenService
    ) {}

    #[Route('/stytch/webhook', name: 'stytch_webhook', methods: ['POST'])]
    public function stytchWebhook(Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);
        
        // Verify webhook signature
        $signature = $request->headers->get('stytch-signature');
        if (!$this->verifyStytchSignature($request->getContent(), $signature)) {
            return new JsonResponse(['error' => 'Invalid signature'], 401);
        }

        $eventType = $payload['type'] ?? '';
        $userData = $payload['data'] ?? [];

        switch ($eventType) {
            case 'user.created':
            case 'user.authenticated':
                return $this->handleUserAuth($userData);
            default:
                return new JsonResponse(['message' => 'Event type not handled'], 200);
        }
    }

    private function handleUserAuth(array $userData): JsonResponse
    {
        $stytchUserId = $userData['user_id'] ?? '';
        $email = strtolower($userData['email'] ?? '');
        
        if (empty($stytchUserId) || empty($email)) {
            return new JsonResponse(['error' => 'Missing user data'], 400);
        }

        // Find or create user
        $user = $this->userRepository->findByStytchUserId($stytchUserId);
        
        if (!$user) {
            $user = $this->userRepository->findByEmail($email);
            
            if (!$user) {
                // Create new user
                $user = new User();
                $user->setEmail($email);
                $user->setStytchUserId($stytchUserId);
                $user->setReferralCode($this->tokenService->generateReferralCode());
            } else {
                // Link existing user
                $user->setStytchUserId($stytchUserId);
            }
            
            $this->userRepository->save($user);
        }

        // Merge waitlist entry if exists
        $waitlistEntry = $this->waitlistRepository->findByEmail($email);
        if ($waitlistEntry && !$waitlistEntry->getUser()) {
            $waitlistEntry->setUser($user);
            
            // If still pending, mark as confirmed
            if ($waitlistEntry->getOptInStatus() === 'pending') {
                $waitlistEntry->setOptInStatus('confirmed');
                $waitlistEntry->setConfirmedAt(new \DateTimeImmutable());
                
                // Log consent
                $consentLog = new ConsentLog();
                $consentLog->setSubjectEmailSha256(hash('sha256', $email, true));
                $consentLog->setType('prelaunch_opt_in');
                $consentLog->setTextSnapshot('User confirmed via Stytch authentication');
                $consentLog->setDetails(['stytch_user_id' => $stytchUserId]);
                
                $this->entityManager->persist($consentLog);
            }
            
            $this->waitlistRepository->save($waitlistEntry);
        }

        // Log authentication event
        $this->clickHouseService->log('auth_login', $user->getId(), [
            'stytch_user_id' => $stytchUserId,
            'email_hash' => hash('sha256', $email),
            'is_new_user' => $user->getCreatedAt() === $user->getUpdatedAt()
        ]);

        // TODO: Create session cookie
        // For now, return user data
        return new JsonResponse([
            'user_id' => $user->getId(),
            'email' => $user->getEmail(),
            'referral_code' => $user->getReferralCode()
        ]);
    }

    #[Route('/me', name: 'auth_me', methods: ['GET'])]
    public function me(TokenStorageInterface $tokenStorage): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        return new JsonResponse([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'role' => $user->getRole(),
            'referral_code' => $user->getReferralCode(),
            'created_at' => $user->getCreatedAt()->format('c')
        ]);
    }

    #[Route('/logout', name: 'auth_logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        // TODO: Invalidate session cookie
        return new JsonResponse(['message' => 'Logged out successfully']);
    }

    private function verifyStytchSignature(string $payload, ?string $signature): bool
    {
        if (!$signature) {
            return false;
        }

        $webhookSecret = $_ENV['STYTCH_WEBHOOK_SECRET'] ?? '';
        if (empty($webhookSecret)) {
            return false;
        }

        $expectedSignature = hash_hmac('sha256', $payload, $webhookSecret);
        return hash_equals($expectedSignature, $signature);
    }
}
