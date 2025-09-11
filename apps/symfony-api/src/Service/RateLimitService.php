<?php

declare(strict_types=1);

namespace App\Service;

use Symfony\Component\HttpFoundation\Request;

class RateLimitService
{
    private ?\Redis $redis;
    private array $inMemoryStore = [];

    public function __construct(?\Redis $redis = null)
    {
        $this->redis = $redis;
    }

    public function isRateLimited(string $key, int $limit, int $windowSeconds): bool
    {
        $now = time();
        $windowStart = $now - $windowSeconds;
        
        if ($this->redis) {
            // Use Redis if available
            $this->redis->zRemRangeByScore($key, 0, $windowStart);
            $currentCount = $this->redis->zCard($key);
            
            if ($currentCount >= $limit) {
                return true;
            }
            
            $this->redis->zAdd($key, $now, uniqid());
            $this->redis->expire($key, $windowSeconds);
        } else {
            // Use in-memory store as fallback
            if (!isset($this->inMemoryStore[$key])) {
                $this->inMemoryStore[$key] = [];
            }
            
            // Remove expired entries
            $this->inMemoryStore[$key] = array_filter(
                $this->inMemoryStore[$key],
                fn($timestamp) => $timestamp > $windowStart
            );
            
            $currentCount = count($this->inMemoryStore[$key]);
            
            if ($currentCount >= $limit) {
                return true;
            }
            
            $this->inMemoryStore[$key][] = $now;
        }
        
        return false;
    }

    public function getRemainingRequests(string $key, int $limit): int
    {
        if ($this->redis) {
            $currentCount = $this->redis->zCard($key);
        } else {
            $currentCount = count($this->inMemoryStore[$key] ?? []);
        }
        return max(0, $limit - $currentCount);
    }

    public function getRetryAfter(string $key, int $windowSeconds): int
    {
        if ($this->redis) {
            $oldestRequest = $this->redis->zRange($key, 0, 0, true);
            if (empty($oldestRequest)) {
                return 0;
            }
            $oldestTime = (int) array_values($oldestRequest)[0];
        } else {
            $timestamps = $this->inMemoryStore[$key] ?? [];
            if (empty($timestamps)) {
                return 0;
            }
            $oldestTime = min($timestamps);
        }
        
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
