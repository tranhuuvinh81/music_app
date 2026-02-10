// frontend/src/components/ui/SongCard.js
import React from 'react';
import PlayPauseButton from './PlayPauseButton';

const SongCard = ({ 
  song, 
  isPlaying, 
  onPlay, 
  onAddToFavorites, 
  isFavorite = false,
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 ${className}`}>
      <div className="relative group aspect-square">
        {song.coverImage ? (
          <img 
            src={song.coverImage} 
            alt={song.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#7Ab2D3] to-[#4A90E2] flex items-center justify-center">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
            </svg>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayPauseButton 
            isPlaying={isPlaying} 
            onClick={onPlay}
            size="large"
            className="opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300"
          />
        </div>
        
        {/* Playing indicator */}
        {isPlaying && (
          <div className="absolute bottom-2 left-2 right-2 flex justify-center space-x-1">
            <div className="w-1 h-3 bg-white rounded-full animate-pulse"></div>
            <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></div>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 truncate">{song.title}</h3>
        <p className="text-gray-600 text-sm truncate">{song.artist}</p>
        {song.listenCount && (
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
            <span>{song.listenCount.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongCard;
