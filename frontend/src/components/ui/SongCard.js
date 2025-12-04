// frontend/src/components/ui/SongCard.js
import React from 'react';
import PlayPauseButton from './PlayPauseButton';
import { FiHeart, FiMoreHorizontal } from 'react-icons/fi';

const SongCard = ({ 
  song, 
  isPlaying, 
  onPlay, 
  onAddToFavorites, 
  isFavorite = false,
  className = '' 
}) => {
  return (
    <div className={`bg-white bg-opacity-10 backdrop-blur-sm rounded-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 ${className}`}>
      <div className="relative group">
        <img 
          src={song.coverImage} 
          alt={song.title} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
          <PlayPauseButton 
            isPlaying={isPlaying} 
            onClick={onPlay}
            size="large"
            className="opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300"
          />
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold truncate">{song.title}</h3>
        <p className="text-white text-opacity-70 text-sm truncate">{song.artist}</p>
        <div className="flex justify-between items-center mt-3">
          <button
            onClick={onAddToFavorites}
            className={`p-2 rounded-full ${isFavorite ? 'text-red-500' : 'text-white text-opacity-70 hover:text-opacity-100'} transition-all duration-300`}
          >
            <FiHeart className={isFavorite ? 'fill-current' : ''} />
          </button>
          <button className="p-2 rounded-full text-white text-opacity-70 hover:text-opacity-100 transition-all duration-300">
            <FiMoreHorizontal />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SongCard;