import React from 'react';
import Image from 'next/image';

interface XandhoppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const XandhoppLogo: React.FC<XandhoppLogoProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-24 h-24',
    lg: 'w-40 h-40',
    xl: 'w-auto h-auto'
  };

  const pixelSizes = {
    sm: 80,
    md: 96,
    lg: 160,
    xl: 1024
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <Image
        src="/logo.png"
        alt={size === 'xl' ? "Xandhopp - Your perfect move worldwide" : "Xandhopp Logo"}
        title={size === 'xl' ? "Xandhopp - Your perfect move worldwide" : "Xandhopp"}
        width={pixelSizes[size]}
        height={size === 'xl' ? 425 : pixelSizes[size]}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
};
