'use client';

import { useEffect, useRef, useState } from 'react';

interface CountryMapProps {
  countryName: string;
  latitude?: number;
  longitude?: number;
  className?: string;
}

export function CountryMap({ countryName, latitude, longitude, className = '' }: CountryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    // Create a simple map using OpenStreetMap
    const createMap = () => {
      if (!mapRef.current) return;

      // If we have coordinates, use them; otherwise, we'll show a placeholder
      if (latitude && longitude) {
        // Create an iframe with OpenStreetMap
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-2},${latitude-2},${longitude+2},${latitude+2}&layer=mapnik&marker=${latitude},${longitude}`;
        iframe.width = '100%';
        iframe.height = '300';
        iframe.frameBorder = '0';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';
        
        mapRef.current.appendChild(iframe);
        setMapLoaded(true);
      } else {
        // Show a placeholder with a link to Google Maps search
        const placeholder = document.createElement('div');
        placeholder.className = 'w-full h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300';
        placeholder.innerHTML = `
          <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <p class="text-gray-500 text-sm mb-2">Map for ${countryName}</p>
          <a href="https://www.google.com/maps/search/${encodeURIComponent(countryName)}" 
             target="_blank" 
             rel="noopener noreferrer"
             class="text-blue-600 hover:text-blue-800 text-sm underline">
            View on Google Maps
          </a>
        `;
        
        mapRef.current.appendChild(placeholder);
        setMapLoaded(true);
      }
    };

    try {
      createMap();
    } catch (error) {
      console.error('Error creating map:', error);
      setMapError(true);
    }
  }, [countryName, latitude, longitude, mapLoaded]);

  if (mapError) {
    return (
      <div className={`w-full h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center border ${className}`}>
        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="text-gray-500 text-sm mb-2">Map unavailable</p>
        <a 
          href={`https://www.google.com/maps/search/${encodeURIComponent(countryName)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm underline"
        >
          View on Google Maps
        </a>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div ref={mapRef} className="w-full h-64 rounded-lg overflow-hidden"></div>
      <div className="mt-2 text-xs text-gray-500 text-center">
        Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenStreetMap</a> contributors
      </div>
    </div>
  );
}

// Simple map component using Google Maps embed
interface SimpleMapProps {
  countryName: string;
  latitude?: number;
  longitude?: number;
  className?: string;
}

export function SimpleMap({ countryName, latitude, longitude, className = '' }: SimpleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    const createMap = () => {
      if (!mapRef.current) return;

      if (latitude && longitude) {
        // Create an iframe with OpenStreetMap
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-2},${latitude-2},${longitude+2},${latitude+2}&layer=mapnik&marker=${latitude},${longitude}`;
        iframe.width = '100%';
        iframe.height = '300';
        iframe.frameBorder = '0';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';
        iframe.loading = 'lazy';
        
        mapRef.current.appendChild(iframe);
        setMapLoaded(true);
      } else {
        // Show a placeholder with a link to Google Maps search
        const placeholder = document.createElement('div');
        placeholder.className = 'w-full h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300';
        placeholder.innerHTML = `
          <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <p class="text-gray-500 text-sm mb-2">Map for ${countryName}</p>
          <a href="https://www.google.com/maps/search/${encodeURIComponent(countryName)}" 
             target="_blank" 
             rel="noopener noreferrer"
             class="text-blue-600 hover:text-blue-800 text-sm underline">
            View on Google Maps
          </a>
        `;
        
        mapRef.current.appendChild(placeholder);
        setMapLoaded(true);
      }
    };

    try {
      createMap();
    } catch (error) {
      console.error('Error creating map:', error);
      setMapLoaded(true);
    }
  }, [countryName, latitude, longitude, mapLoaded]);

  return (
    <div className={`w-full ${className}`}>
      <div ref={mapRef} className="w-full h-64 rounded-lg overflow-hidden"></div>
    </div>
  );
}
