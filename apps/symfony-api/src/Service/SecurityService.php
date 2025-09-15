<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class SecurityService
{
    private const MAX_LOGIN_ATTEMPTS = 5;
    private const LOCKOUT_DURATION = 900; // 15 minutes
    private const SUSPICIOUS_IP_THRESHOLD = 3; // 3 failed attempts from same IP

    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher,
        private RateLimitService $rateLimitService,
        private ClickHouseService $clickHouseService,
        private TokenService $tokenService
    ) {}

    /**
     * Authenticate user with email and password
     */
    public function authenticateWithPassword(string $email, string $password, Request $request): array
    {
        $ip = $this->getClientIp($request);
        $userAgent = $request->headers->get('User-Agent', '');
        $deviceFingerprint = $this->generateDeviceFingerprint($request);

        // Check rate limiting
        if ($this->rateLimitService->isRateLimited("login:{$ip}", 10, 300)) {
            $this->logSecurityEvent('rate_limit_exceeded', null, [
                'ip' => $ip,
                'email' => $email,
                'user_agent' => $userAgent
            ]);
            throw new \Exception('Too many login attempts. Please try again later.');
        }

        $user = $this->userRepository->findOneBy(['email' => $email]);
        
        if (!$user) {
            $this->logSecurityEvent('login_failed_user_not_found', null, [
                'ip' => $ip,
                'email' => $email,
                'user_agent' => $userAgent
            ]);
            throw new \Exception('Invalid credentials');
        }

        // Check if account is locked
        if ($user->isLocked()) {
            $this->logSecurityEvent('login_failed_account_locked', $user->getId(), [
                'ip' => $ip,
                'email' => $email,
                'locked_until' => $user->getLockedUntil()->format('c')
            ]);
            throw new \Exception('Account is temporarily locked. Please try again later.');
        }

        // Verify password
        if (!$user->getPasswordHash() || !$this->passwordHasher->isPasswordValid($user, $password)) {
            $this->handleFailedLogin($user, $ip, $userAgent);
            throw new \Exception('Invalid credentials');
        }

        // Check for suspicious activity
        $isSuspicious = $this->detectSuspiciousActivity($user, $ip, $deviceFingerprint);
        
        if ($isSuspicious) {
            $this->logSecurityEvent('suspicious_login_detected', $user->getId(), [
                'ip' => $ip,
                'email' => $email,
                'user_agent' => $userAgent,
                'device_fingerprint' => $deviceFingerprint,
                'is_new_ip' => !$user->isIpKnown($ip),
                'is_new_device' => !$user->isDeviceTrusted($deviceFingerprint)
            ]);
        }

        // Reset login attempts on successful login
        $user->setLoginAttempts(0);
        $user->setLastLoginAttempt(null);
        $user->setLockedUntil(null);
        $user->setLastLoginAt(new \DateTimeImmutable());
        $user->setLastLoginIp($ip);
        $user->addKnownIp($ip);

        $this->entityManager->flush();

        $this->logSecurityEvent('login_success', $user->getId(), [
            'ip' => $ip,
            'email' => $email,
            'user_agent' => $userAgent,
            'device_fingerprint' => $deviceFingerprint,
            'is_suspicious' => $isSuspicious
        ]);

        return [
            'user' => $user,
            'requires_2fa' => $user->isTwoFactorEnabled(),
            'is_suspicious' => $isSuspicious,
            'device_fingerprint' => $deviceFingerprint
        ];
    }

    /**
     * Verify 2FA code
     */
    public function verify2FA(User $user, string $code, string $deviceFingerprint): bool
    {
        if (!$user->isTwoFactorEnabled()) {
            return true;
        }

        // Check if it's a backup code
        if ($this->verifyBackupCode($user, $code)) {
            $this->logSecurityEvent('2fa_backup_code_used', $user->getId(), [
                'device_fingerprint' => $deviceFingerprint
            ]);
            return true;
        }

        // Verify TOTP code
        if ($this->verifyTotpCode($user->getTotpSecret(), $code)) {
            $this->logSecurityEvent('2fa_totp_verified', $user->getId(), [
                'device_fingerprint' => $deviceFingerprint
            ]);
            return true;
        }

        $this->logSecurityEvent('2fa_verification_failed', $user->getId(), [
            'device_fingerprint' => $deviceFingerprint
        ]);

        return false;
    }

    /**
     * Setup 2FA for user
     */
    public function setup2FA(User $user): array
    {
        $secret = $this->generateTotpSecret();
        $user->setTotpSecret($secret);
        
        // Generate backup codes
        $backupCodes = $this->generateBackupCodes();
        $user->setBackupCodes(json_encode($backupCodes));
        
        $this->entityManager->flush();

        $this->logSecurityEvent('2fa_setup_initiated', $user->getId(), []);

        return [
            'secret' => $secret,
            'qr_code_url' => $this->generateQrCodeUrl($user->getEmail(), $secret),
            'backup_codes' => $backupCodes
        ];
    }

    /**
     * Enable 2FA after verification
     */
    public function enable2FA(User $user, string $code): bool
    {
        if (!$this->verifyTotpCode($user->getTotpSecret(), $code)) {
            return false;
        }

        $user->setTwoFactorEnabled(true);
        $this->entityManager->flush();

        $this->logSecurityEvent('2fa_enabled', $user->getId(), []);

        return true;
    }

    /**
     * Trust device for user
     */
    public function trustDevice(User $user, string $deviceFingerprint): void
    {
        $user->addTrustedDevice($deviceFingerprint);
        $this->entityManager->flush();

        $this->logSecurityEvent('device_trusted', $user->getId(), [
            'device_fingerprint' => $deviceFingerprint
        ]);
    }

    /**
     * Generate device fingerprint
     */
    public function generateDeviceFingerprint(Request $request): string
    {
        $components = [
            $request->headers->get('User-Agent', ''),
            $request->headers->get('Accept-Language', ''),
            $request->headers->get('Accept-Encoding', ''),
            $request->getClientIp()
        ];

        return hash('sha256', implode('|', $components));
    }

    /**
     * Detect suspicious login activity
     */
    private function detectSuspiciousActivity(User $user, string $ip, string $deviceFingerprint): bool
    {
        $isNewIp = !$user->isIpKnown($ip);
        $isNewDevice = !$user->isDeviceTrusted($deviceFingerprint);
        
        // Consider suspicious if both IP and device are new
        return $isNewIp && $isNewDevice;
    }

    /**
     * Handle failed login attempt
     */
    private function handleFailedLogin(User $user, string $ip, string $userAgent): void
    {
        $attempts = $user->getLoginAttempts() + 1;
        $user->setLoginAttempts($attempts);
        $user->setLastLoginAttempt(new \DateTimeImmutable());

        // Lock account after max attempts
        if ($attempts >= self::MAX_LOGIN_ATTEMPTS) {
            $user->setLockedUntil(new \DateTimeImmutable('+' . self::LOCKOUT_DURATION . ' seconds'));
            
            $this->logSecurityEvent('account_locked', $user->getId(), [
                'ip' => $ip,
                'email' => $user->getEmail(),
                'user_agent' => $userAgent,
                'attempts' => $attempts
            ]);
        }

        $this->entityManager->flush();

        $this->logSecurityEvent('login_failed', $user->getId(), [
            'ip' => $ip,
            'email' => $user->getEmail(),
            'user_agent' => $userAgent,
            'attempts' => $attempts
        ]);
    }

    /**
     * Verify TOTP code
     */
    private function verifyTotpCode(?string $secret, string $code): bool
    {
        if (!$secret) {
            return false;
        }

        // Simple TOTP verification (in production, use a proper TOTP library)
        $time = floor(time() / 30);
        $expectedCode = $this->generateTotpCode($secret, $time);
        
        return hash_equals($expectedCode, $code);
    }

    /**
     * Verify backup code
     */
    private function verifyBackupCode(User $user, string $code): bool
    {
        $backupCodes = $user->getBackupCodes() ? json_decode($user->getBackupCodes(), true) : [];
        
        if (in_array($code, $backupCodes)) {
            // Remove used backup code
            $backupCodes = array_diff($backupCodes, [$code]);
            $user->setBackupCodes(json_encode(array_values($backupCodes)));
            $this->entityManager->flush();
            return true;
        }

        return false;
    }

    /**
     * Generate TOTP secret
     */
    private function generateTotpSecret(): string
    {
        return base32_encode(random_bytes(20));
    }

    /**
     * Generate TOTP code
     */
    private function generateTotpCode(string $secret, int $time): string
    {
        $key = base32_decode($secret);
        $time = pack('N*', 0) . pack('N*', $time);
        $hash = hash_hmac('sha1', $time, $key, true);
        $offset = ord($hash[19]) & 0xf;
        $code = (
            ((ord($hash[$offset + 0]) & 0x7f) << 24) |
            ((ord($hash[$offset + 1]) & 0xff) << 16) |
            ((ord($hash[$offset + 2]) & 0xff) << 8) |
            (ord($hash[$offset + 3]) & 0xff)
        ) % 1000000;
        
        return str_pad((string)$code, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Generate backup codes
     */
    private function generateBackupCodes(): array
    {
        $codes = [];
        for ($i = 0; $i < 10; $i++) {
            $codes[] = strtoupper(substr(md5(random_bytes(16)), 0, 8));
        }
        return $codes;
    }

    /**
     * Generate QR code URL for TOTP setup
     */
    private function generateQrCodeUrl(string $email, string $secret): string
    {
        $issuer = 'Xandhopp';
        $label = urlencode($issuer . ':' . $email);
        $params = http_build_query([
            'secret' => $secret,
            'issuer' => $issuer,
            'algorithm' => 'SHA1',
            'digits' => 6,
            'period' => 30
        ]);
        
        return "otpauth://totp/{$label}?{$params}";
    }

    /**
     * Get client IP address
     */
    private function getClientIp(Request $request): string
    {
        $ip = $request->getClientIp();
        
        // Handle forwarded IPs
        if ($request->headers->has('X-Forwarded-For')) {
            $ips = explode(',', $request->headers->get('X-Forwarded-For'));
            $ip = trim($ips[0]);
        }
        
        return $ip;
    }

    /**
     * Log security event
     */
    private function logSecurityEvent(string $event, ?int $userId, array $data): void
    {
        $this->clickHouseService->log($event, $userId, $data);
    }
}

// Helper functions for base32 encoding/decoding
function base32_encode(string $data): string
{
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $output = '';
    $v = 0;
    $vbits = 0;
    
    for ($i = 0, $j = strlen($data); $i < $j; $i++) {
        $v <<= 8;
        $v += ord($data[$i]);
        $vbits += 8;
        
        while ($vbits >= 5) {
            $vbits -= 5;
            $output .= $alphabet[$v >> $vbits];
            $v &= ((1 << $vbits) - 1);
        }
    }
    
    if ($vbits > 0) {
        $v <<= (5 - $vbits);
        $output .= $alphabet[$v];
    }
    
    return $output;
}

function base32_decode(string $data): string
{
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $output = '';
    $v = 0;
    $vbits = 0;
    
    for ($i = 0, $j = strlen($data); $i < $j; $i++) {
        $v <<= 5;
        $v += strpos($alphabet, $data[$i]);
        $vbits += 5;
        
        if ($vbits >= 8) {
            $vbits -= 8;
            $output .= chr($v >> $vbits);
            $v &= ((1 << $vbits) - 1);
        }
    }
    
    return $output;
}
