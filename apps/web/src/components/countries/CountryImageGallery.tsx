'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCountryMedia, type MediaAsset } from '../../hooks/useCountryMedia';

interface CountryImageGalleryProps {
  slug: string;
  countryName: string;
  lang?: string;
  className?: string;
}

export function CountryImageGallery({ 
  slug, 
  countryName, 
  lang = 'en',
  className = ''
}: CountryImageGalleryProps) {
  const { getImages, getThumbnails, loading, error } = useCountryMedia(slug, lang);
  const [selectedImage, setSelectedImage] = useState<MediaAsset | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Prefer full images, fallback to thumbnails
  const images = getImages();
  const thumbnails = getThumbnails();
  const allMedia = [...images, ...thumbnails].filter(
    (media, index, self) => 
      // Remove duplicates based on URL
      index === self.findIndex(m => m.url === media.url) &&
      // Remove errored images
      !imageErrors.has(media.id)
  );

  const handleImageError = (mediaId: number) => {
    setImageErrors(prev => new Set(prev).add(mediaId));
  };

  const openLightbox = (media: MediaAsset) => {
    setSelectedImage(media);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-xl font-semibold text-gray-900">Images</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || allMedia.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-xl font-semibold text-gray-900">Images</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            📷
          </div>
          <p>No images available for {countryName}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            Images ({allMedia.length})
          </h3>
          <div className="text-sm text-gray-500">
            Click to view full size
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allMedia.map((media) => (
            <div
              key={media.id}
              className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
              onClick={() => openLightbox(media)}
            >
              <Image
                src={media.url}
                alt={media.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => handleImageError(media.id)}
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              
              {/* Type indicator */}
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {media.type}
              </div>

              {/* Expand icon */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black/70 text-white p-1 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-7xl max-h-full">
            <Image
              src={selectedImage.url}
              alt={selectedImage.title}
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-4 rounded">
              <h4 className="font-semibold">{selectedImage.title}</h4>
              {selectedImage.attribution && (
                <p className="text-sm opacity-75 mt-1">{selectedImage.attribution}</p>
              )}
              <p className="text-xs opacity-60 mt-2">
                Type: {selectedImage.type} • Uploaded: {new Date(selectedImage.uploaded_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
