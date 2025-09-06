import React from 'react';
import Image from 'next/image';

interface PortalisLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const PortalisLogo: React.FC<PortalisLogoProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-[768px] h-[768px]'
  };

  const pixelSizes = {
    sm: 48,
    md: 64,
    lg: 96,
    xl: 768
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <Image
        src="/logo.png"
        alt={size === 'xl' ? "PORTALIS - Your perfect move worldwide" : "Portalis Logo"}
        title={size === 'xl' ? "PORTALIS - Your perfect move worldwide" : "Portalis"}
        width={pixelSizes[size]}
        height={pixelSizes[size]}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
};
