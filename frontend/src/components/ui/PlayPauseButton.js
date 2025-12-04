// frontend/src/components/ui/PlayPauseButton.js
import React from 'react';
import { FiPlay, FiPause } from 'react-icons/fi';

const PlayPauseButton = ({ isPlaying, onClick, size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };
  
  const iconSizes = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-2xl',
  };
  
  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white flex items-center justify-center hover:shadow-lg hover:scale-105 transition-all duration-300 ${className}`}
    >
      {isPlaying ? (
        <FiPause className={iconSizes[size]} />
      ) : (
        <FiPlay className={`${iconSizes[size]} ml-1`} />
      )}
    </button>
  );
};

export default PlayPauseButton;