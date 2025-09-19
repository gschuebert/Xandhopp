'use client';

import { useState, useEffect } from 'react';

export interface MediaAsset {
  id: number;
  country_id: number;
  language_code: string;
  title: string;
  type: 'thumbnail' | 'image';
  url: string;
  attribution: string;
  source_url: string;
  uploaded_at: string;
}

export interface MediaResponse {
  media: MediaAsset[];
  country: string;
  language: string;
  type?: string;
}

export function useCountryMedia(slug: string, lang: string = 'en', type?: 'thumbnail' | 'image') {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchMedia = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          lang: lang
        });
        
        if (type) {
          params.append('type', type);
        }

        const response = await fetch(`/api/countries/${slug}/media?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch media: ${response.statusText}`);
        }

        const data: MediaResponse = await response.json();
        setMedia(data.media);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch media');
        console.error('Error fetching country media:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [slug, lang, type]);

  // Helper functions
  const getThumbnails = () => media.filter(m => m.type === 'thumbnail');
  const getImages = () => media.filter(m => m.type === 'image');
  const getFirstThumbnail = () => getThumbnails()[0] || null;
  const getFirstImage = () => getImages()[0] || null;

  return {
    media,
    loading,
    error,
    getThumbnails,
    getImages,
    getFirstThumbnail,
    getFirstImage,
  };
}
