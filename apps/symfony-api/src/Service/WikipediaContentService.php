<?php

declare(strict_types=1);

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class WikipediaContentService
{
    public function __construct(private HttpClientInterface $http) {}

    /**
     * Get comprehensive content for a US state from Wikipedia
     */
    public function getStateContent(string $stateName): array
    {
        $content = [
            'overview' => '',
            'culture' => '',
            'economy' => '',
            'history' => '',
            'demography' => ''
        ];

        try {
            // Get English Wikipedia content
            $enContent = $this->fetchWikipediaContent($stateName, 'en');
            if ($enContent) {
                $content = array_merge($content, $this->parseWikipediaContent($enContent, $stateName));
            }

            // Get German Wikipedia content for additional details
            $deContent = $this->fetchWikipediaContent($stateName, 'de');
            if ($deContent) {
                $deParsed = $this->parseWikipediaContent($deContent, $stateName);
                $content = $this->mergeContent($content, $deParsed);
            }

        } catch (\Throwable $e) {
            error_log("Wikipedia content fetch failed for {$stateName}: " . $e->getMessage());
        }

        return $content;
    }

    private function fetchWikipediaContent(string $stateName, string $lang = 'en'): ?string
    {
        try {
            $url = "https://{$lang}.wikipedia.org/api/rest_v1/page/summary/{$stateName}";
            
            $response = $this->http->request('GET', $url, [
                'headers' => ['User-Agent' => 'Xandhopp-Live-Data/1.0'],
                'timeout' => 10
            ]);

            if ($response->getStatusCode() === 200) {
                $data = $response->toArray(false);
                return $data['extract'] ?? null;
            }
        } catch (\Throwable $e) {
            error_log("Wikipedia API error for {$stateName} ({$lang}): " . $e->getMessage());
        }

        return null;
    }

    private function parseWikipediaContent(string $content, string $stateName): array
    {
        $parsed = [
            'overview' => '',
            'culture' => '',
            'economy' => '',
            'history' => '',
            'demography' => ''
        ];

        // Extract overview (first paragraph)
        $sentences = explode('. ', $content);
        $overview = '';
        $sentenceCount = 0;
        
        foreach ($sentences as $sentence) {
            $overview .= $sentence . '. ';
            $sentenceCount++;
            if ($sentenceCount >= 3) break; // First 3 sentences for overview
        }
        
        $parsed['overview'] = trim($overview);

        // Extract sections based on keywords
        $contentLower = strtolower($content);
        
        // Culture keywords
        if (preg_match('/(culture|music|art|cuisine|tradition|festival|sport|entertainment).*?\./i', $content, $matches)) {
            $parsed['culture'] = $this->extractSection($content, $matches[0]);
        }

        // Economy keywords
        if (preg_match('/(economy|industry|agriculture|manufacturing|tourism|business|employment).*?\./i', $content, $matches)) {
            $parsed['economy'] = $this->extractSection($content, $matches[0]);
        }

        // History keywords
        if (preg_match('/(history|founded|established|war|independence|colony|territory).*?\./i', $content, $matches)) {
            $parsed['history'] = $this->extractSection($content, $matches[0]);
        }

        // Demography keywords
        if (preg_match('/(population|demographics|ethnic|race|language|religion|urban|rural).*?\./i', $content, $matches)) {
            $parsed['demography'] = $this->extractSection($content, $matches[0]);
        }

        return $parsed;
    }

    private function extractSection(string $content, string $match): string
    {
        $start = strpos($content, $match);
        if ($start === false) return '';

        $section = substr($content, $start);
        $sentences = explode('. ', $section);
        
        $result = '';
        $sentenceCount = 0;
        
        foreach ($sentences as $sentence) {
            $result .= $sentence . '. ';
            $sentenceCount++;
            if ($sentenceCount >= 2) break; // 2 sentences per section
        }
        
        return trim($result);
    }

    private function mergeContent(array $primary, array $secondary): array
    {
        $merged = $primary;
        
        foreach ($secondary as $key => $value) {
            if (empty($merged[$key]) && !empty($value)) {
                $merged[$key] = $value;
            } elseif (!empty($merged[$key]) && !empty($value) && strlen($value) > strlen($merged[$key])) {
                $merged[$key] = $value; // Use longer content
            }
        }
        
        return $merged;
    }

    /**
     * Get state-specific cultural and economic data
     */
    public function getStateSpecificData(string $stateCode): array
    {
        $stateData = [
            'AL' => ['culture' => 'Southern hospitality, college football, civil rights history', 'economy' => 'Automotive manufacturing, aerospace, agriculture'],
            'AK' => ['culture' => 'Native Alaskan culture, outdoor recreation, frontier spirit', 'economy' => 'Oil and gas, fishing, tourism'],
            'AZ' => ['culture' => 'Desert lifestyle, Native American heritage, outdoor recreation', 'economy' => 'Technology, manufacturing, tourism, mining'],
            'AR' => ['culture' => 'Southern culture, country music, outdoor recreation', 'economy' => 'Agriculture, manufacturing, retail'],
            'CA' => ['culture' => 'Entertainment industry, technology innovation, diverse population', 'economy' => 'Technology, entertainment, agriculture, manufacturing'],
            'CO' => ['culture' => 'Outdoor recreation, craft beer, mountain culture', 'economy' => 'Technology, aerospace, energy, tourism'],
            'CT' => ['culture' => 'New England heritage, education, innovation', 'economy' => 'Finance, insurance, manufacturing, healthcare'],
            'DE' => ['culture' => 'Corporate-friendly environment, colonial history', 'economy' => 'Finance, corporate law, chemicals'],
            'FL' => ['culture' => 'Diverse culture, tourism, Hispanic influence', 'economy' => 'Tourism, agriculture, international trade, aerospace'],
            'GA' => ['culture' => 'Southern culture, music, civil rights history', 'economy' => 'Agriculture, manufacturing, logistics, technology'],
            'HI' => ['culture' => 'Polynesian culture, aloha spirit, multiculturalism', 'economy' => 'Tourism, military, agriculture'],
            'ID' => ['culture' => 'Outdoor recreation, agricultural heritage', 'economy' => 'Agriculture, manufacturing, technology'],
            'IL' => ['culture' => 'Chicago culture, architecture, diverse population', 'economy' => 'Manufacturing, agriculture, finance, technology'],
            'IN' => ['culture' => 'Basketball culture, auto racing, rural heritage', 'economy' => 'Manufacturing, agriculture, services'],
            'IA' => ['culture' => 'Agricultural heritage, education, rural culture', 'economy' => 'Agriculture, manufacturing, biotechnology'],
            'KS' => ['culture' => 'Agricultural heritage, wheat production', 'economy' => 'Agriculture, aviation, manufacturing'],
            'KY' => ['culture' => 'Bourbon whiskey, horse racing, bluegrass music', 'economy' => 'Agriculture, manufacturing, coal mining'],
            'LA' => ['culture' => 'Creole and Cajun cultures, jazz music, cuisine', 'economy' => 'Oil and gas, petrochemicals, agriculture, tourism'],
            'ME' => ['culture' => 'Lobster industry, lighthouses, maritime culture', 'economy' => 'Fishing, agriculture, forestry, tourism'],
            'MD' => ['culture' => 'Blue crabs, proximity to DC, maritime history', 'economy' => 'Government, biotechnology, defense, education'],
            'MA' => ['culture' => 'Colonial history, education, innovation', 'economy' => 'Technology, biotechnology, education, finance'],
            'MI' => ['culture' => 'Automotive heritage, Great Lakes culture', 'economy' => 'Automotive, manufacturing, agriculture'],
            'MN' => ['culture' => 'Scandinavian heritage, outdoor recreation', 'economy' => 'Agriculture, manufacturing, technology'],
            'MS' => ['culture' => 'Southern culture, blues music, civil rights history', 'economy' => 'Agriculture, manufacturing, energy'],
            'MO' => ['culture' => 'Gateway to the West, barbecue, jazz', 'economy' => 'Agriculture, manufacturing, transportation'],
            'MT' => ['culture' => 'Big Sky country, outdoor recreation, ranching', 'economy' => 'Agriculture, mining, tourism'],
            'NE' => ['culture' => 'Agricultural heritage, college football', 'economy' => 'Agriculture, manufacturing, transportation'],
            'NV' => ['culture' => 'Entertainment, gaming, outdoor recreation', 'economy' => 'Tourism, gaming, mining, technology'],
            'NH' => ['culture' => 'Live Free or Die, outdoor recreation', 'economy' => 'Manufacturing, tourism, technology'],
            'NJ' => ['culture' => 'Diverse population, proximity to NYC', 'economy' => 'Pharmaceuticals, chemicals, finance'],
            'NM' => ['culture' => 'Native American heritage, Hispanic culture', 'economy' => 'Energy, agriculture, tourism, technology'],
            'NY' => ['culture' => 'Global cultural center, diversity, innovation', 'economy' => 'Finance, technology, media, tourism'],
            'NC' => ['culture' => 'Southern culture, research triangle', 'economy' => 'Technology, agriculture, manufacturing'],
            'ND' => ['culture' => 'Agricultural heritage, oil boom', 'economy' => 'Energy, agriculture, manufacturing'],
            'OH' => ['culture' => 'Industrial heritage, aviation history', 'economy' => 'Manufacturing, agriculture, technology'],
            'OK' => ['culture' => 'Native American heritage, oil culture', 'economy' => 'Energy, agriculture, aerospace'],
            'OR' => ['culture' => 'Outdoor recreation, environmentalism', 'economy' => 'Technology, agriculture, forestry'],
            'PA' => ['culture' => 'Industrial heritage, Amish culture', 'economy' => 'Manufacturing, agriculture, energy'],
            'RI' => ['culture' => 'Colonial history, maritime heritage', 'economy' => 'Manufacturing, services, tourism'],
            'SC' => ['culture' => 'Southern culture, coastal heritage', 'economy' => 'Manufacturing, agriculture, tourism'],
            'SD' => ['culture' => 'Mount Rushmore, agricultural heritage', 'economy' => 'Agriculture, tourism, manufacturing'],
            'TN' => ['culture' => 'Country music, Southern culture', 'economy' => 'Music industry, agriculture, manufacturing'],
            'TX' => ['culture' => 'Everything is bigger, diverse culture', 'economy' => 'Energy, technology, agriculture, manufacturing'],
            'UT' => ['culture' => 'Mormon heritage, outdoor recreation', 'economy' => 'Technology, mining, agriculture'],
            'VT' => ['culture' => 'Maple syrup, environmentalism', 'economy' => 'Agriculture, manufacturing, tourism'],
            'VA' => ['culture' => 'Colonial history, military heritage', 'economy' => 'Government, technology, agriculture'],
            'WA' => ['culture' => 'Coffee culture, outdoor recreation', 'economy' => 'Technology, aerospace, agriculture'],
            'WV' => ['culture' => 'Coal mining heritage, Appalachian culture', 'economy' => 'Energy, chemicals, tourism'],
            'WI' => ['culture' => 'Cheese, beer, outdoor recreation', 'economy' => 'Manufacturing, agriculture, tourism'],
            'WY' => ['culture' => 'Cowboy culture, outdoor recreation', 'economy' => 'Energy, mining, agriculture']
        ];

        return $stateData[$stateCode] ?? ['culture' => '', 'economy' => ''];
    }
}
