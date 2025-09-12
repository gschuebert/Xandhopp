<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\ConsentLog;
use App\Entity\User;
use App\Entity\WaitlistSignup;
use App\Repository\UserRepository;
use App\Repository\WaitlistSignupRepository;
use App\Service\EmailService;
use App\Service\SecurityService;
use App\Service\TokenService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserRepository $userRepository,
        private WaitlistSignupRepository $waitlistRepository,
        private TokenService $tokenService,
        private SecurityService $securityService,
        private UserPasswordHasherInterface $passwordHasher,
        private ValidatorInterface $validator,
        private EmailService $emailService
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

        // Log authentication event (temporarily disabled due to ClickHouse issues)
        // $this->clickHouseService->log('auth_login', $user->getId(), [
        //     'stytch_user_id' => $stytchUserId,
        //     'email_hash' => hash('sha256', $email),
        //     'is_new_user' => $user->getCreatedAt() === $user->getUpdatedAt()
        // ]);

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

    #[Route('/login', name: 'auth_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['email']) || !isset($data['password'])) {
            return new JsonResponse(['error' => 'Email and password are required'], 400);
        }

        try {
            $result = $this->securityService->authenticateWithPassword(
                $data['email'],
                $data['password'],
                $request
            );

            $user = $result['user'];
            $requires2FA = $result['requires_2fa'];
            $isSuspicious = $result['is_suspicious'];
            $deviceFingerprint = $result['device_fingerprint'];

            $response = [
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'role' => $user->getRole(),
                    'email_verified' => $user->isEmailVerified(),
                    'two_factor_enabled' => $user->isTwoFactorEnabled()
                ],
                'requires_2fa' => $requires2FA,
                'is_suspicious' => $isSuspicious,
                'device_fingerprint' => $deviceFingerprint
            ];

            if ($requires2FA) {
                $response['message'] = '2FA verification required';
                return new JsonResponse($response, 202); // 202 Accepted - requires 2FA
            }

            if ($isSuspicious) {
                $response['message'] = 'Suspicious activity detected. Please verify your identity.';
                return new JsonResponse($response, 202); // 202 Accepted - requires verification
            }

            // Generate JWT token for successful login
            $token = $this->tokenService->generateToken($user);
            $response['token'] = $token;

            return new JsonResponse($response);

        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 401);
        }
    }

    #[Route('/verify-2fa', name: 'auth_verify_2fa', methods: ['POST'])]
    public function verify2FA(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['code']) || !isset($data['device_fingerprint'])) {
            return new JsonResponse(['error' => 'Code and device fingerprint are required'], 400);
        }

        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        if ($this->securityService->verify2FA($user, $data['code'], $data['device_fingerprint'])) {
            // Trust device if requested
            if (isset($data['trust_device']) && $data['trust_device']) {
                $this->securityService->trustDevice($user, $data['device_fingerprint']);
            }

            // Generate JWT token
            $token = $this->tokenService->generateToken($user);

            return new JsonResponse([
                'token' => $token,
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'role' => $user->getRole(),
                    'email_verified' => $user->isEmailVerified(),
                    'two_factor_enabled' => $user->isTwoFactorEnabled()
                ]
            ]);
        }

        return new JsonResponse(['error' => 'Invalid 2FA code'], 401);
    }

    #[Route('/setup-2fa', name: 'auth_setup_2fa', methods: ['POST'])]
    public function setup2FA(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        if ($user->isTwoFactorEnabled()) {
            return new JsonResponse(['error' => '2FA is already enabled'], 400);
        }

        $result = $this->securityService->setup2FA($user);

        return new JsonResponse($result);
    }

    #[Route('/enable-2fa', name: 'auth_enable_2fa', methods: ['POST'])]
    public function enable2FA(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['code'])) {
            return new JsonResponse(['error' => 'Verification code is required'], 400);
        }

        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        if ($this->securityService->enable2FA($user, $data['code'])) {
            return new JsonResponse(['message' => '2FA enabled successfully']);
        }

        return new JsonResponse(['error' => 'Invalid verification code'], 400);
    }

    #[Route('/register', name: 'auth_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['email']) || !isset($data['password'])) {
            return new JsonResponse(['error' => 'Email and password are required'], 400);
        }

        $email = $data['email'];
        $password = $data['password'];

        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['error' => 'Invalid email format'], 400);
        }

        // Check if user already exists
        if ($this->userRepository->findOneBy(['email' => $email])) {
            return new JsonResponse(['error' => 'User already exists'], 409);
        }

        // Create new user
        $user = new User();
        $user->setEmail($email);
        $user->setPasswordHash($this->passwordHasher->hashPassword($user, $password));
        $user->setEmailVerified(false);
        $user->setRole('user');

        // Generate referral code
        $referralCode = $this->generateReferralCode();
        $user->setReferralCode($referralCode);

        // Generate email verification token
        $verificationToken = $this->tokenService->generateEmailVerificationToken();
        $user->setEmailVerificationToken($verificationToken);
        $user->setEmailVerificationTokenExpiresAt(new \DateTimeImmutable('+24 hours'));

        // Set profile fields if provided
        if (isset($data['firstName'])) {
            $user->setFirstName($data['firstName']);
        }
        if (isset($data['lastName'])) {
            $user->setLastName($data['lastName']);
        }
        if (isset($data['dateOfBirth'])) {
            $user->setDateOfBirth($data['dateOfBirth'] ? new \DateTimeImmutable($data['dateOfBirth']) : null);
        }
        if (isset($data['nationality'])) {
            $user->setNationality($data['nationality']);
        }
        if (isset($data['currentCountry'])) {
            $user->setCurrentCountry($data['currentCountry']);
        }
        if (isset($data['currentCity'])) {
            $user->setCurrentCity($data['currentCity']);
        }
        if (isset($data['profession'])) {
            $user->setProfession($data['profession']);
        }
        if (isset($data['company'])) {
            $user->setCompany($data['company']);
        }
        if (isset($data['website'])) {
            $user->setWebsite($data['website']);
        }
        if (isset($data['linkedin'])) {
            $user->setLinkedin($data['linkedin']);
        }
        if (isset($data['bio'])) {
            $user->setBio($data['bio']);
        }

        // Set address fields if provided
        if (isset($data['addressLine1'])) {
            $user->setAddressLine1($data['addressLine1']);
        }
        if (isset($data['addressLine2'])) {
            $user->setAddressLine2($data['addressLine2']);
        }
        if (isset($data['city'])) {
            $user->setCity($data['city']);
        }
        if (isset($data['state'])) {
            $user->setState($data['state']);
        }
        if (isset($data['postalCode'])) {
            $user->setPostalCode($data['postalCode']);
        }
        if (isset($data['country'])) {
            $user->setCountry($data['country']);
        }

        // Set preferences
        if (isset($data['preferredLanguage'])) {
            $user->setPreferredLanguage($data['preferredLanguage']);
        }
        if (isset($data['timezone'])) {
            $user->setTimezone($data['timezone']);
        }
        if (isset($data['emailNotifications'])) {
            $user->setEmailNotifications((bool)$data['emailNotifications']);
        }
        if (isset($data['marketingEmails'])) {
            $user->setMarketingEmails((bool)$data['marketingEmails']);
        }
        if (isset($data['profilePublic'])) {
            $user->setProfilePublic((bool)$data['profilePublic']);
        }

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        // Log registration event (temporarily disabled due to ClickHouse issues)
        // $this->clickHouseService->log('user_registered', $user->getId(), [
        //     'email_hash' => hash('sha256', $email),
        //     'ip' => $request->getClientIp(),
        //     'user_agent' => $request->headers->get('User-Agent', ''),
        //     'has_profile_data' => !empty($data['firstName']) || !empty($data['lastName']),
        //     'nationality' => $data['nationality'] ?? null,
        //     'current_country' => $data['currentCountry'] ?? null
        // ]);

        // Send email verification
        try {
            $firstName = $user->getFirstName() ?: 'User';
            $this->emailService->sendVerificationEmail($email, $firstName, $verificationToken);
        } catch (\Exception $e) {
            // Log error but don't fail registration
            error_log("Failed to send verification email: " . $e->getMessage());
        }

        return new JsonResponse([
            'message' => 'User registered successfully. Please check your email to verify your account.',
            'user_id' => $user->getId(),
            'email_verification_required' => true
        ], 201);
    }

    #[Route('/verify-email', name: 'auth_verify_email', methods: ['POST'])]
    public function verifyEmail(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['token'])) {
            return new JsonResponse(['error' => 'Verification token is required'], 400);
        }

        $token = $data['token'];
        $user = $this->userRepository->findOneBy(['emailVerificationToken' => $token]);

        if (!$user) {
            return new JsonResponse(['error' => 'Invalid verification token'], 400);
        }

        if ($user->getEmailVerificationTokenExpiresAt() < new \DateTimeImmutable()) {
            return new JsonResponse(['error' => 'Verification token has expired'], 400);
        }

        if ($user->isEmailVerified()) {
            return new JsonResponse(['error' => 'Email already verified'], 400);
        }

        // Verify the email
        $user->setEmailVerified(true);
        $user->setEmailVerificationToken(null);
        $user->setEmailVerificationTokenExpiresAt(null);
        
        $this->entityManager->flush();

        // Send welcome email
        try {
            $firstName = $user->getFirstName() ?: 'User';
            $this->emailService->sendWelcomeEmail($user->getEmail(), $firstName);
        } catch (\Exception $e) {
            error_log("Failed to send welcome email: " . $e->getMessage());
        }

        return new JsonResponse([
            'message' => 'Email verified successfully',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'email_verified' => true
            ]
        ]);
    }

    #[Route('/forgot-password', name: 'auth_forgot_password', methods: ['POST'])]
    public function forgotPassword(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['email'])) {
            return new JsonResponse(['error' => 'Email is required'], 400);
        }

        $user = $this->userRepository->findOneBy(['email' => $data['email']]);
        
        if ($user) {
            // TODO: Generate password reset token and send email
            // $this->clickHouseService->log('password_reset_requested', $user->getId(), [
            //     'ip' => $request->getClientIp(),
            //     'user_agent' => $request->headers->get('User-Agent', '')
            // ]);
        }

        // Always return success to prevent email enumeration
        return new JsonResponse(['message' => 'If the email exists, a password reset link has been sent']);
    }

    #[Route('/reset-password', name: 'auth_reset_password', methods: ['POST'])]
    public function resetPassword(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['token']) || !isset($data['password'])) {
            return new JsonResponse(['error' => 'Token and password are required'], 400);
        }

        // TODO: Implement password reset token validation
        // For now, just return success
        return new JsonResponse(['message' => 'Password reset successfully']);
    }

    #[Route('/change-password', name: 'auth_change_password', methods: ['POST'])]
    public function changePassword(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['current_password']) || !isset($data['new_password'])) {
            return new JsonResponse(['error' => 'Current and new passwords are required'], 400);
        }

        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        // Verify current password
        if (!$user->getPasswordHash() || !$this->passwordHasher->isPasswordValid($user, $data['current_password'])) {
            return new JsonResponse(['error' => 'Invalid current password'], 400);
        }

        // Set new password
        $user->setPasswordHash($this->passwordHasher->hashPassword($user, $data['new_password']));
        $this->entityManager->flush();

        // $this->clickHouseService->log('password_changed', $user->getId(), [
        //     'ip' => $request->getClientIp(),
        //     'user_agent' => $request->headers->get('User-Agent', '')
        // ]);

        return new JsonResponse(['message' => 'Password changed successfully']);
    }

    #[Route('/trust-device', name: 'auth_trust_device', methods: ['POST'])]
    public function trustDevice(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['device_fingerprint'])) {
            return new JsonResponse(['error' => 'Device fingerprint is required'], 400);
        }

        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        $this->securityService->trustDevice($user, $data['device_fingerprint']);

        return new JsonResponse(['message' => 'Device trusted successfully']);
    }

    private function generateReferralCode(): string
    {
        do {
            $code = strtoupper(substr(md5(random_bytes(16)), 0, 8));
        } while ($this->userRepository->findOneBy(['referralCode' => $code]));

        return $code;
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

    #[Route('/profile', name: 'auth_profile', methods: ['GET'])]
    public function getProfile(Request $request): JsonResponse
    {
        // Temporary solution: get user by email from request
        $email = $request->query->get('email');
        if (!$email) {
            return new JsonResponse(['error' => 'Email parameter required'], 400);
        }

        $user = $this->userRepository->findByEmail($email);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        return new JsonResponse([
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'dateOfBirth' => $user->getDateOfBirth()?->format('Y-m-d'),
                'nationality' => $user->getNationality(),
                'currentCountry' => $user->getCurrentCountry(),
                'currentCity' => $user->getCurrentCity(),
                'profession' => $user->getProfession(),
                'company' => $user->getCompany(),
                'website' => $user->getWebsite(),
                'linkedin' => $user->getLinkedin(),
                'bio' => $user->getBio(),
                'addressLine1' => $user->getAddressLine1(),
                'addressLine2' => $user->getAddressLine2(),
                'city' => $user->getCity(),
                'state' => $user->getState(),
                'postalCode' => $user->getPostalCode(),
                'country' => $user->getCountry(),
                'preferredLanguage' => $user->getPreferredLanguage(),
                'timezone' => $user->getTimezone(),
                'emailNotifications' => $user->isEmailNotifications(),
                'marketingEmails' => $user->isMarketingEmails(),
                'profilePublic' => $user->isProfilePublic(),
                'createdAt' => $user->getCreatedAt()->format('Y-m-d H:i:s'),
                'updatedAt' => $user->getUpdatedAt()->format('Y-m-d H:i:s'),
            ]
        ]);
    }

    #[Route('/profile-simple', name: 'auth_profile_simple', methods: ['GET'])]
    public function getProfileSimple(Request $request): JsonResponse
    {
        // Simple route without authentication
        $email = $request->query->get('email');
        if (!$email) {
            return new JsonResponse(['error' => 'Email parameter required'], 400);
        }

        $user = $this->userRepository->findByEmail($email);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        return new JsonResponse([
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'dateOfBirth' => $user->getDateOfBirth()?->format('Y-m-d'),
                'nationality' => $user->getNationality(),
                'currentCountry' => $user->getCurrentCountry(),
                'currentCity' => $user->getCurrentCity(),
                'profession' => $user->getProfession(),
                'company' => $user->getCompany(),
                'website' => $user->getWebsite(),
                'linkedin' => $user->getLinkedin(),
                'bio' => $user->getBio(),
                'addressLine1' => $user->getAddressLine1(),
                'addressLine2' => $user->getAddressLine2(),
                'city' => $user->getCity(),
                'state' => $user->getState(),
                'postalCode' => $user->getPostalCode(),
                'country' => $user->getCountry(),
                'preferredLanguage' => $user->getPreferredLanguage(),
                'timezone' => $user->getTimezone(),
                'emailNotifications' => $user->isEmailNotifications(),
                'marketingEmails' => $user->isMarketingEmails(),
                'profilePublic' => $user->isProfilePublic(),
                'createdAt' => $user->getCreatedAt()->format('Y-m-d H:i:s'),
                'updatedAt' => $user->getUpdatedAt()->format('Y-m-d H:i:s'),
            ]
        ]);
    }

    #[Route('/profile-simple', name: 'auth_update_profile_simple', methods: ['PUT'])]
    public function updateProfileSimple(Request $request): JsonResponse
    {
        // Simple route without authentication
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;
        
        if (!$email) {
            return new JsonResponse(['error' => 'Email is required'], 400);
        }

        $user = $this->userRepository->findByEmail($email);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        // Update profile fields
        if (isset($data['firstName'])) {
            $user->setFirstName($data['firstName']);
        }
        if (isset($data['lastName'])) {
            $user->setLastName($data['lastName']);
        }
        if (isset($data['dateOfBirth'])) {
            $user->setDateOfBirth($data['dateOfBirth'] ? new \DateTimeImmutable($data['dateOfBirth']) : null);
        }
        if (isset($data['nationality'])) {
            $user->setNationality($data['nationality']);
        }
        if (isset($data['currentCountry'])) {
            $user->setCurrentCountry($data['currentCountry']);
        }
        if (isset($data['currentCity'])) {
            $user->setCurrentCity($data['currentCity']);
        }
        if (isset($data['profession'])) {
            $user->setProfession($data['profession']);
        }
        if (isset($data['company'])) {
            $user->setCompany($data['company']);
        }
        if (isset($data['website'])) {
            $user->setWebsite($data['website']);
        }
        if (isset($data['linkedin'])) {
            $user->setLinkedin($data['linkedin']);
        }
        if (isset($data['bio'])) {
            $user->setBio($data['bio']);
        }
        if (isset($data['addressLine1'])) {
            $user->setAddressLine1($data['addressLine1']);
        }
        if (isset($data['addressLine2'])) {
            $user->setAddressLine2($data['addressLine2']);
        }
        if (isset($data['city'])) {
            $user->setCity($data['city']);
        }
        if (isset($data['state'])) {
            $user->setState($data['state']);
        }
        if (isset($data['postalCode'])) {
            $user->setPostalCode($data['postalCode']);
        }
        if (isset($data['country'])) {
            $user->setCountry($data['country']);
        }
        if (isset($data['preferredLanguage'])) {
            $user->setPreferredLanguage($data['preferredLanguage']);
        }
        if (isset($data['timezone'])) {
            $user->setTimezone($data['timezone']);
        }
        if (isset($data['emailNotifications'])) {
            $user->setEmailNotifications($data['emailNotifications']);
        }
        if (isset($data['marketingEmails'])) {
            $user->setMarketingEmails($data['marketingEmails']);
        }
        if (isset($data['profilePublic'])) {
            $user->setProfilePublic($data['profilePublic']);
        }

        $this->entityManager->flush();

        return new JsonResponse([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'dateOfBirth' => $user->getDateOfBirth()?->format('Y-m-d'),
                'nationality' => $user->getNationality(),
                'currentCountry' => $user->getCurrentCountry(),
                'currentCity' => $user->getCurrentCity(),
                'profession' => $user->getProfession(),
                'company' => $user->getCompany(),
                'website' => $user->getWebsite(),
                'linkedin' => $user->getLinkedin(),
                'bio' => $user->getBio(),
                'addressLine1' => $user->getAddressLine1(),
                'addressLine2' => $user->getAddressLine2(),
                'city' => $user->getCity(),
                'state' => $user->getState(),
                'postalCode' => $user->getPostalCode(),
                'country' => $user->getCountry(),
                'preferredLanguage' => $user->getPreferredLanguage(),
                'timezone' => $user->getTimezone(),
                'emailNotifications' => $user->isEmailNotifications(),
                'marketingEmails' => $user->isMarketingEmails(),
                'profilePublic' => $user->isProfilePublic(),
                'createdAt' => $user->getCreatedAt()->format('Y-m-d H:i:s'),
                'updatedAt' => $user->getUpdatedAt()->format('Y-m-d H:i:s'),
            ]
        ]);
    }

    #[Route('/profile', name: 'auth_update_profile', methods: ['PUT'])]
    public function updateProfile(Request $request): JsonResponse
    {
        // Temporary solution: get user by email from request body
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;
        
        if (!$email) {
            return new JsonResponse(['error' => 'Email is required'], 400);
        }

        $user = $this->userRepository->findByEmail($email);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        // Update profile fields
        if (isset($data['firstName'])) {
            $user->setFirstName($data['firstName']);
        }
        if (isset($data['lastName'])) {
            $user->setLastName($data['lastName']);
        }
        if (isset($data['dateOfBirth'])) {
            $user->setDateOfBirth($data['dateOfBirth'] ? new \DateTimeImmutable($data['dateOfBirth']) : null);
        }
        if (isset($data['nationality'])) {
            $user->setNationality($data['nationality']);
        }
        if (isset($data['currentCountry'])) {
            $user->setCurrentCountry($data['currentCountry']);
        }
        if (isset($data['currentCity'])) {
            $user->setCurrentCity($data['currentCity']);
        }
        if (isset($data['profession'])) {
            $user->setProfession($data['profession']);
        }
        if (isset($data['company'])) {
            $user->setCompany($data['company']);
        }
        if (isset($data['website'])) {
            $user->setWebsite($data['website']);
        }
        if (isset($data['linkedin'])) {
            $user->setLinkedin($data['linkedin']);
        }
        if (isset($data['bio'])) {
            $user->setBio($data['bio']);
        }

        // Update address fields
        if (isset($data['addressLine1'])) {
            $user->setAddressLine1($data['addressLine1']);
        }
        if (isset($data['addressLine2'])) {
            $user->setAddressLine2($data['addressLine2']);
        }
        if (isset($data['city'])) {
            $user->setCity($data['city']);
        }
        if (isset($data['state'])) {
            $user->setState($data['state']);
        }
        if (isset($data['postalCode'])) {
            $user->setPostalCode($data['postalCode']);
        }
        if (isset($data['country'])) {
            $user->setCountry($data['country']);
        }

        // Update preferences
        if (isset($data['preferredLanguage'])) {
            $user->setPreferredLanguage($data['preferredLanguage']);
        }
        if (isset($data['timezone'])) {
            $user->setTimezone($data['timezone']);
        }
        if (isset($data['emailNotifications'])) {
            $user->setEmailNotifications((bool)$data['emailNotifications']);
        }
        if (isset($data['marketingEmails'])) {
            $user->setMarketingEmails((bool)$data['marketingEmails']);
        }
        if (isset($data['profilePublic'])) {
            $user->setProfilePublic((bool)$data['profilePublic']);
        }

        $this->entityManager->flush();

        return new JsonResponse([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'dateOfBirth' => $user->getDateOfBirth()?->format('Y-m-d'),
                'nationality' => $user->getNationality(),
                'currentCountry' => $user->getCurrentCountry(),
                'currentCity' => $user->getCurrentCity(),
                'profession' => $user->getProfession(),
                'company' => $user->getCompany(),
                'website' => $user->getWebsite(),
                'linkedin' => $user->getLinkedin(),
                'bio' => $user->getBio(),
                'addressLine1' => $user->getAddressLine1(),
                'addressLine2' => $user->getAddressLine2(),
                'city' => $user->getCity(),
                'state' => $user->getState(),
                'postalCode' => $user->getPostalCode(),
                'country' => $user->getCountry(),
                'preferredLanguage' => $user->getPreferredLanguage(),
                'timezone' => $user->getTimezone(),
                'emailNotifications' => $user->isEmailNotifications(),
                'marketingEmails' => $user->isMarketingEmails(),
                'profilePublic' => $user->isProfilePublic(),
                'updatedAt' => $user->getUpdatedAt()->format('Y-m-d H:i:s'),
            ]
        ]);
    }
}
