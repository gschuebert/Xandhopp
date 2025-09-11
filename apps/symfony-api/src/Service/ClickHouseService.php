<?php

declare(strict_types=1);

namespace App\Service;

use Symfony\Component\HttpClient\HttpClient;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ClickHouseService
{
    private ?HttpClientInterface $httpClient;
    private ?string $clickhouseUrl;

    public function __construct(?string $clickhouseUrl = null)
    {
        $this->clickhouseUrl = $clickhouseUrl;
        $this->httpClient = null; // Disable HttpClient for now
    }

    public function log(string $eventName, ?int $userId = null, array $properties = []): void
    {
        if (!$this->httpClient) {
            // If HttpClient is not available, just log to error log
            error_log("ClickHouse logging skipped - HttpClient not available");
            return;
        }

        $data = [
            'name' => $eventName,
            'ts' => date('Y-m-d H:i:s'),
            'user_id' => $userId ?? 0,
            'props' => json_encode($properties)
        ];

        $payload = json_encode($data) . "\n";

        try {
            $this->httpClient->request('POST', $this->clickhouseUrl . '/', [
                'body' => $payload,
                'headers' => [
                    'Content-Type' => 'application/x-ndjson',
                ],
            ]);
        } catch (\Exception $e) {
            // Log error but don't fail the request
            error_log("ClickHouse logging failed: " . $e->getMessage());
        }
    }

    public function ensureEventsTable(): void
    {
        if (!$this->httpClient) {
            error_log("ClickHouse table creation skipped - HttpClient not available");
            return;
        }

        $createTableQuery = "
            CREATE TABLE IF NOT EXISTS events (
                name String,
                ts DateTime,
                user_id UInt64,
                props String
            ) ENGINE = MergeTree()
            ORDER BY (name, ts)
        ";

        try {
            $this->httpClient->request('POST', $this->clickhouseUrl . '/', [
                'body' => $createTableQuery,
            ]);
        } catch (\Exception $e) {
            error_log("ClickHouse table creation failed: " . $e->getMessage());
        }
    }
}
