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

    public function generateEmailVerificationToken(): string
    {
        return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    }

    public function generateToken($user): string
    {
        // Simple JWT-like token generation
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'user_id' => $user->getId(),
            'email' => $user->getEmail(),
            'exp' => time() + (24 * 60 * 60) // 24 hours
        ]);
        
        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, 'your-secret-key', true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }

    public function isTokenValid(string $token, \DateTimeImmutable $expiresAt): bool
    {
        return !empty($token) && $expiresAt > new \DateTimeImmutable();
    }
}
