<?php

declare(strict_types=1);

namespace App\Service;

class TokenService
{
    public function generateOptInToken(): string
    {
        return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    }

    public function generateReferralCode(): string
    {
        $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $code = '';
        
        for ($i = 0; $i < 8; $i++) {
            $code .= $characters[random_int(0, strlen($characters) - 1)];
        }
        
        return $code;
    }

    public function isTokenValid(string $token, \DateTimeImmutable $expiresAt): bool
    {
        return !empty($token) && $expiresAt > new \DateTimeImmutable();
    }
}
