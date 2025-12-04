// frontend/src/components/ui/HeroSection.js
import React from 'react';
import Button from './Button';
import { FiPlay } from 'react-icons/fi';

const HeroSection = ({ featuredAlbum, onPlayNow, className = '' }) => {
  return (
    <div className={`relative h-96 overflow-hidden ${className}`}>
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${featuredAlbum.coverImage})`,
          transform: 'scale(1.1)',
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#7Ab2D3] to-transparent opacity-30"></div>
      
      <div className="relative h-full flex items-center px-8 md:px-16">
        <div className="max-w-lg">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {featuredAlbum.title}
          </h1>
          <p className="text-xl text-white text-opacity-90 mb-6">
            {featuredAlbum.artist}
          </p>
          <p className="text-white text-opacity-80 mb-8">
            {featuredAlbum.description}
          </p>
          <Button
            variant="accent"
            size="large"
            onClick={onPlayNow}
            className="flex items-center"
          >
            <FiPlay className="mr-2" />
            Play Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;