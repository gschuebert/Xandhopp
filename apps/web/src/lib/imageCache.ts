/**
 * Client-side image caching and optimization utilities
 */

interface CachedImage {
  url: string;
  timestamp: number;
  isValid: boolean;
}

class ImageCache {
  private cache = new Map<string, CachedImage>();
  private readonly CACHE_DURATION = 1000 * 60 * 30; // 30 minutes
  private readonly MAX_CACHE_SIZE = 100;

  /**
   * Check if an image URL is valid and cached
   */
  isImageCached(url: string): boolean {
    const cached = this.cache.get(url);
    if (!cached) return false;
    
    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(url);
      return false;
    }
    
    return cached.isValid;
  }

  /**
   * Mark an image as valid/invalid in cache
   */
  setImageValidity(url: string, isValid: boolean): void {
    // Clean old entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.cleanOldEntries();
    }

    this.cache.set(url, {
      url,
      timestamp: Date.now(),
      isValid
    });
  }

  /**
   * Preload an image and cache the result
   */
  async preloadImage(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new window.Image();
      
      img.onload = () => {
        this.setImageValidity(url, true);
        resolve(true);
      };
      
      img.onerror = () => {
        this.setImageValidity(url, false);
        resolve(false);
      };
      
      img.src = url;
    });
  }

  /**
   * Batch preload multiple images
   */
  async preloadImages(urls: string[]): Promise<boolean[]> {
    return Promise.all(urls.map(url => this.preloadImage(url)));
  }

  /**
   * Clean expired cache entries
   */
  private cleanOldEntries(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [url, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.CACHE_DURATION) {
        toDelete.push(url);
      }
    }

    toDelete.forEach(url => this.cache.delete(url));

    // If still too many, remove oldest entries
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, Math.floor(this.MAX_CACHE_SIZE / 2));
      toRemove.forEach(([url]) => this.cache.delete(url));
    }
  }

  /**
   * Clear all cached images
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; validImages: number; invalidImages: number } {
    const entries = Array.from(this.cache.values());
    return {
      size: entries.length,
      validImages: entries.filter(e => e.isValid).length,
      invalidImages: entries.filter(e => !e.isValid).length
    };
  }
}

// Singleton instance
export const imageCache = new ImageCache();

/**
 * Hook for using image cache in React components
 */
export function useImageCache() {
  const preloadCountryImages = async (slug: string, lang: string = 'en') => {
    try {
      const response = await fetch(`/api/countries/${slug}/media?lang=${lang}`);
      if (!response.ok) return [];

      const data = await response.json();
      const urls = data.media.map((m: any) => m.url);
      
      return imageCache.preloadImages(urls);
    } catch (error) {
      console.error('Failed to preload country images:', error);
      return [];
    }
  };

  return {
    preloadCountryImages,
    isImageCached: imageCache.isImageCached.bind(imageCache),
    setImageValidity: imageCache.setImageValidity.bind(imageCache),
    preloadImage: imageCache.preloadImage.bind(imageCache),
    getCacheStats: imageCache.getCacheStats.bind(imageCache),
    clearCache: imageCache.clearCache.bind(imageCache)
  };
}

/**
 * Utility to fix Wikipedia image URLs
 */
export function fixImageUrl(url: string): string {
  if (!url) return '';
  
  // Fix protocol-relative URLs
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  
  return url;
}

/**
 * Generate responsive image sizes for different breakpoints
 */
export function generateImageSizes(options: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  default?: string;
}): string {
  const {
    mobile = '100vw',
    tablet = '50vw',
    desktop = '33vw',
    default: defaultSize = '300px'
  } = options;

  return `(max-width: 640px) ${mobile}, (max-width: 1024px) ${tablet}, ${desktop}`;
}

/**
 * Get optimized image URL with size parameters (if supported by the image service)
 */
export function getOptimizedImageUrl(url: string, width?: number, height?: number): string {
  const fixedUrl = fixImageUrl(url);
  
  // For Wikipedia images, we can add size parameters
  if (fixedUrl.includes('upload.wikimedia.org') && (width || height)) {
    const urlParts = fixedUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    if (width) {
      // Insert width parameter before filename
      urlParts.splice(-1, 0, `${width}px-${filename}`);
      urlParts[urlParts.length - 1] = filename;
      return urlParts.join('/');
    }
  }
  
  return fixedUrl;
}
