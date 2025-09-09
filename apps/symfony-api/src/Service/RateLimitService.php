<?php

declare(strict_types=1);

namespace App\Service;

use Redis;
use Symfony\Component\HttpFoundation\Request;

class RateLimitService
{
    private Redis $redis;

    public function __construct(Redis $redis)
    {
        $this->redis = $redis;
    }

    public function isRateLimited(string $key, int $limit, int $windowSeconds): bool
    {
        $now = time();
        $windowStart = $now - $windowSeconds;
        
        // Remove expired entries
        $this->redis->zRemRangeByScore($key, 0, $windowStart);
        
        // Count current requests
        $currentCount = $this->redis->zCard($key);
        
        if ($currentCount >= $limit) {
            return true;
        }
        
        // Add current request
        $this->redis->zAdd($key, $now, uniqid());
        $this->redis->expire($key, $windowSeconds);
        
        return false;
    }

    public function getRemainingRequests(string $key, int $limit): int
    {
        $currentCount = $this->redis->zCard($key);
        return max(0, $limit - $currentCount);
    }

    public function getRetryAfter(string $key, int $windowSeconds): int
    {
        $oldestRequest = $this->redis->zRange($key, 0, 0, true);
        if (empty($oldestRequest)) {
            return 0;
        }
        
        $oldestTime = (int) array_values($oldestRequest)[0];
        return max(0, $oldestTime + $windowSeconds - time());
    }

    public function checkPrelaunchRateLimit(Request $request): array
    {
        $ip = $request->getClientIp() ?? 'unknown';
        $email = $request->request->get('email', '');
        
        $ipKey = "prelaunch:ip:{$ip}";
        $emailKey = "prelaunch:email:" . hash('sha256', strtolower($email));
        
        $limit = 5;
        $window = 600; // 10 minutes
        
        $ipLimited = $this->isRateLimited($ipKey, $limit, $window);
        $emailLimited = $this->isRateLimited($emailKey, $limit, $window);
        
        if ($ipLimited || $emailLimited) {
            $retryAfter = $this->getRetryAfter($ipLimited ? $ipKey : $emailKey, $window);
            return [
                'limited' => true,
                'retry_after' => $retryAfter,
                'reason' => $ipLimited ? 'ip' : 'email'
            ];
        }
        
        return ['limited' => false];
    }
}
