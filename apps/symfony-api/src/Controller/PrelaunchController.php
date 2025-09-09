<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\ConsentLog;
use App\Entity\User;
use App\Entity\WaitlistSignup;
use App\Repository\UserRepository;
use App\Repository\WaitlistSignupRepository;
use App\Service\ClickHouseService;
use App\Service\RateLimitService;
use App\Service\TokenService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/prelaunch')]
class PrelaunchController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private WaitlistSignupRepository $waitlistRepository,
        private UserRepository $userRepository,
        private RateLimitService $rateLimitService,
        private ClickHouseService $clickHouseService,
        private TokenService $tokenService
    ) {}

    #[Route('/signup', name: 'prelaunch_signup', methods: ['POST'])]
    public function signup(Request $request): JsonResponse
    {
        // Check rate limiting
        $rateLimitResult = $this->rateLimitService->checkPrelaunchRateLimit($request);
        if ($rateLimitResult['limited']) {
            return new JsonResponse([
                'error' => 'Rate limit exceeded',
                'retry_after' => $rateLimitResult['retry_after']
            ], 429, [
                'Retry-After' => (string) $rateLimitResult['retry_after']
            ]);
        }

        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? '';
        $locale = $data['locale'] ?? 'en';
        $countryInterest = $data['country_interest'] ?? null;
        $referredBy = $data['referred_by'] ?? null;
        $utm = $data['utm'] ?? null;

        // Validate email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['error' => 'Invalid email address'], 400);
        }

        $email = strtolower($email);

        // Check if user already exists
        $existingUser = $this->userRepository->findByEmail($email);
        if ($existingUser) {
            return new JsonResponse(['error' => 'User already registered'], 409);
        }

        // Check if already on waitlist
        $existingSignup = $this->waitlistRepository->findByEmail($email);
        
        if ($existingSignup) {
            if ($existingSignup->isConfirmed()) {
                return new JsonResponse(['error' => 'Already confirmed on waitlist'], 409);
            }
            
            // Update existing signup
            $existingSignup->setLocale($locale);
            $existingSignup->setCountryInterest($countryInterest);
            $existingSignup->setReferredBy($referredBy);
            $existingSignup->setUtm($utm);
            $existingSignup->setOptInToken($this->tokenService->generateOptInToken());
            $existingSignup->setTokenExpiresAt(new \DateTimeImmutable('+48 hours'));
            $existingSignup->setIp($request->getClientIp());
            $existingSignup->setUserAgent($request->headers->get('User-Agent'));
            
            $this->waitlistRepository->save($existingSignup);
        } else {
            // Create new signup
            $signup = new WaitlistSignup();
            $signup->setEmail($email);
            $signup->setLocale($locale);
            $signup->setCountryInterest($countryInterest);
            $signup->setReferralCode($this->tokenService->generateReferralCode());
            $signup->setReferredBy($referredBy);
            $signup->setUtm($utm);
            $signup->setOptInToken($this->tokenService->generateOptInToken());
            $signup->setTokenExpiresAt(new \DateTimeImmutable('+48 hours'));
            $signup->setIp($request->getClientIp());
            $signup->setUserAgent($request->headers->get('User-Agent'));
            
            $this->waitlistRepository->save($signup);
        }

        // Log event
        $this->clickHouseService->log('prelaunch_submit', null, [
            'email_hash' => hash('sha256', $email),
            'locale' => $locale,
            'country_interest' => $countryInterest,
            'referred_by' => $referredBy,
            'ip' => $request->getClientIp()
        ]);

        // TODO: Send confirmation email
        // For now, just return success
        return new JsonResponse([
            'message' => 'Please check your email to confirm your subscription',
            'status' => 'pending'
        ]);
    }

    #[Route('/confirm', name: 'prelaunch_confirm', methods: ['GET'])]
    public function confirm(Request $request): RedirectResponse
    {
        $token = $request->query->get('token');
        
        if (!$token) {
            return new RedirectResponse('/invalid?reason=missing_token');
        }

        $signup = $this->waitlistRepository->findByToken($token);
        
        if (!$signup || $signup->isTokenExpired()) {
            return new RedirectResponse('/invalid?reason=invalid_token');
        }

        if ($signup->isConfirmed()) {
            return new RedirectResponse('/welcome?status=already_confirmed');
        }

        // Confirm signup
        $signup->setOptInStatus('confirmed');
        $signup->setConfirmedAt(new \DateTimeImmutable());
        $this->waitlistRepository->save($signup);

        // Log consent
        $consentLog = new ConsentLog();
        $consentLog->setSubjectEmailSha256(hash('sha256', strtolower($signup->getEmail()), true));
        $consentLog->setType('prelaunch_opt_in');
        $consentLog->setTextSnapshot('User confirmed prelaunch waitlist subscription');
        $consentLog->setIp($request->getClientIp());
        $consentLog->setUserAgent($request->headers->get('User-Agent'));
        
        $this->entityManager->persist($consentLog);
        $this->entityManager->flush();

        // Log event
        $this->clickHouseService->log('prelaunch_confirm', null, [
            'email_hash' => hash('sha256', $signup->getEmail()),
            'referral_code' => $signup->getReferralCode(),
            'referred_by' => $signup->getReferredBy()
        ]);

        return new RedirectResponse('/welcome?status=confirmed');
    }

    #[Route('/resend', name: 'prelaunch_resend', methods: ['POST'])]
    public function resend(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = strtolower($data['email'] ?? '');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['error' => 'Invalid email address'], 400);
        }

        $signup = $this->waitlistRepository->findByEmail($email);
        
        if (!$signup) {
            return new JsonResponse(['error' => 'Email not found on waitlist'], 404);
        }

        if ($signup->isConfirmed()) {
            return new JsonResponse(['error' => 'Already confirmed'], 409);
        }

        // Generate new token
        $signup->setOptInToken($this->tokenService->generateOptInToken());
        $signup->setTokenExpiresAt(new \DateTimeImmutable('+48 hours'));
        $this->waitlistRepository->save($signup);

        // TODO: Send new confirmation email

        return new JsonResponse(['message' => 'Confirmation email resent']);
    }

    #[Route('/unsubscribe', name: 'prelaunch_unsubscribe', methods: ['POST'])]
    public function unsubscribe(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = strtolower($data['email'] ?? '');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['error' => 'Invalid email address'], 400);
        }

        $signup = $this->waitlistRepository->findByEmail($email);
        
        if (!$signup) {
            return new JsonResponse(['error' => 'Email not found'], 404);
        }

        // Mark as unsubscribed
        $signup->setOptInStatus('unsubscribed');
        $this->waitlistRepository->save($signup);

        // Log consent
        $consentLog = new ConsentLog();
        $consentLog->setSubjectEmailSha256(hash('sha256', $email, true));
        $consentLog->setType('unsubscribe');
        $consentLog->setTextSnapshot('User unsubscribed from prelaunch waitlist');
        $consentLog->setIp($request->getClientIp());
        $consentLog->setUserAgent($request->headers->get('User-Agent'));
        
        $this->entityManager->persist($consentLog);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Successfully unsubscribed']);
    }
}
