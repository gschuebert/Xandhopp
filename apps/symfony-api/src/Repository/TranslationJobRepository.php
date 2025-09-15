<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\TranslationJob;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TranslationJob>
 */
class TranslationJobRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TranslationJob::class);
    }

    /**
     * Find pending translation jobs
     */
    public function findPendingJobs(int $limit = 10): array
    {
        $sql = 'SELECT * FROM translation_job 
                WHERE status = \'pending\' 
                ORDER BY created_at ASC 
                LIMIT :limit';
        
        $stmt = $this->getEntityManager()->getConnection()->prepare($sql);
        $result = $stmt->executeQuery(['limit' => $limit]);
        
        return $result->fetchAllAssociative();
    }

    /**
     * Find pending job for specific country and section
     */
    public function findPendingJob(int $countryId, string $section, string $sourceLang, string $targetLang): ?array
    {
        $sql = 'SELECT * FROM translation_job 
                WHERE country_id = :country_id 
                AND section = :section 
                AND source_lang = :source_lang 
                AND target_lang = :target_lang 
                AND status IN (\'pending\', \'processing\')';
        
        $stmt = $this->getEntityManager()->getConnection()->prepare($sql);
        $result = $stmt->executeQuery([
            'country_id' => $countryId,
            'section' => $section,
            'source_lang' => $sourceLang,
            'target_lang' => $targetLang,
        ]);
        
        return $result->fetchAssociative() ?: null;
    }

    /**
     * Find jobs by status
     */
    public function findByStatus(string $status, int $limit = 50): array
    {
        $sql = 'SELECT * FROM translation_job 
                WHERE status = :status 
                ORDER BY created_at DESC 
                LIMIT :limit';
        
        $stmt = $this->getEntityManager()->getConnection()->prepare($sql);
        $result = $stmt->executeQuery([
            'status' => $status,
            'limit' => $limit,
        ]);
        
        return $result->fetchAllAssociative();
    }

    /**
     * Find jobs by country
     */
    public function findByCountry(int $countryId): array
    {
        $sql = 'SELECT tj.*, c.name_en as country_name, c.slug as country_slug
                FROM translation_job tj
                JOIN country c ON c.id = tj.country_id
                WHERE tj.country_id = :country_id
                ORDER BY tj.created_at DESC';
        
        $stmt = $this->getEntityManager()->getConnection()->prepare($sql);
        $result = $stmt->executeQuery(['country_id' => $countryId]);
        
        return $result->fetchAllAssociative();
    }

    /**
     * Get translation statistics by language
     */
    public function getStatsByLanguage(): array
    {
        $sql = 'SELECT 
                    target_lang,
                    status,
                    COUNT(*) as count,
                    AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_duration_seconds
                FROM translation_job 
                WHERE completed_at IS NOT NULL
                GROUP BY target_lang, status
                ORDER BY target_lang, status';
        
        $stmt = $this->getEntityManager()->getConnection()->prepare($sql);
        $result = $stmt->executeQuery();
        
        return $result->fetchAllAssociative();
    }

    /**
     * Get failed jobs that can be retried
     */
    public function findRetryableJobs(int $limit = 10): array
    {
        $sql = 'SELECT * FROM translation_job 
                WHERE status = \'failed\' 
                AND created_at > now() - INTERVAL \'7 days\'
                ORDER BY created_at ASC 
                LIMIT :limit';
        
        $stmt = $this->getEntityManager()->getConnection()->prepare($sql);
        $result = $stmt->executeQuery(['limit' => $limit]);
        
        return $result->fetchAllAssociative();
    }

    /**
     * Clean up old completed jobs
     */
    public function cleanupOldJobs(int $daysOld = 30): int
    {
        $sql = 'DELETE FROM translation_job 
                WHERE status = \'completed\' 
                AND completed_at < now() - INTERVAL \':days days\'';
        
        $stmt = $this->getEntityManager()->getConnection()->prepare($sql);
        $result = $stmt->executeQuery(['days' => $daysOld]);
        
        return $result->rowCount();
    }

    /**
     * Get jobs requiring attention (failed or stuck)
     */
    public function findJobsRequiringAttention(): array
    {
        $sql = 'SELECT tj.*, c.name_en as country_name, c.slug as country_slug
                FROM translation_job tj
                JOIN country c ON c.id = tj.country_id
                WHERE tj.status = \'failed\' 
                OR (tj.status = \'processing\' AND tj.updated_at < now() - INTERVAL \'1 hour\')
                ORDER BY tj.updated_at DESC';
        
        $stmt = $this->getEntityManager()->getConnection()->prepare($sql);
        $result = $stmt->executeQuery();
        
        return $result->fetchAllAssociative();
    }
}
