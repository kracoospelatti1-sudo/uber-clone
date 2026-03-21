'use client';

/**
 * Componente Avatar - Muestra foto de perfil o iniciales
 * Ultima actualizacion: 2026-03-21
 * Mobile-first responsive design
 */

import { useState } from 'react';

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
};

export function Avatar({ 
  name, 
  imageUrl, 
  size = 'md', 
  className = '',
  onClick 
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  // Obtener iniciales del nombre
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Colores aleatorios basados en el nombre
  const getColor = (name: string): string => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const showInitials = !imageUrl || imageError;

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${showInitials ? getColor(name) : ''}
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
        rounded-full overflow-hidden flex items-center justify-center
        text-white font-semibold flex-shrink-0
        transition-opacity
        ${className}
      `}
      onClick={onClick}
    >
      {showInitials ? (
        <span>{getInitials(name)}</span>
      ) : (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
}

interface AvatarGroupProps {
  users: Array<{ name: string; imageUrl?: string | null }>;
  max?: number;
  size?: 'sm' | 'md';
}

export function AvatarGroup({ users, max = 3, size = 'sm' }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((user, i) => (
        <Avatar
          key={i}
          name={user.name}
          imageUrl={user.imageUrl}
          size={size}
          className="border-2 border-white"
        />
      ))}
      {remaining > 0 && (
        <div
          className={`
            ${size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'}
            bg-gray-300 rounded-full flex items-center justify-center
            text-gray-600 font-semibold border-2 border-white
          `}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
