// frontend/src/components/ui/MusicPlayer.js
import React, { useState, useRef, useEffect } from 'react';
import PlayPauseButton from './PlayPauseButton';
import Button from './Button';
import { FiSkipBack, FiSkipForward, FiVolume2, FiRepeat, FiShuffle } from 'react-icons/fi';

const MusicPlayer = ({ 
  currentSong, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious, 
  onRepeat,
  onShuffle,
  isRepeat,
  isShuffle,
  className = '' 
}) => {
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressBarRef = useRef(null);
  
  // Simulate progress update
  useEffect(() => {
    if (isPlaying && currentSong) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            clearInterval(interval);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentSong, duration]);
  
  useEffect(() => {
    if (currentSong) {
      // Simulate song duration (in seconds)
      setDuration(Math.floor(Math.random() * 120) + 180); // 3-5 minutes
      setCurrentTime(0);
      setProgress(0);
    }
  }, [currentSong]);
  
  useEffect(() => {
    if (duration > 0) {
      setProgress((currentTime / duration) * 100);
    }
  }, [currentTime, duration]);
  
  const handleProgressChange = (e) => {
    const newProgress = e.target.value;
    setProgress(newProgress);
    setCurrentTime((newProgress / 100) * duration);
  };
  
  const handleVolumeChange = (e) => {
    setVolume(e.target.value);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  if (!currentSong) {
    return (
      <div className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] p-4 ${className}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <p className="text-white">No song selected</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] p-4 backdrop-blur-lg bg-opacity-90 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <img 
              src={currentSong.coverImage} 
              alt={currentSong.title} 
              className="w-12 h-12 rounded-md mr-3"
            />
            <div>
              <h4 className="text-white font-medium truncate max-w-xs">{currentSong.title}</h4>
              <p className="text-white text-opacity-70 text-sm truncate max-w-xs">{currentSong.artist}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="small"
              onClick={onShuffle}
              className={`${isShuffle ? 'text-white' : 'text-white text-opacity-70'}`}
            >
              <FiShuffle className={isShuffle ? 'fill-current' : ''} />
            </Button>
            
            <Button
              variant="ghost"
              size="small"
              onClick={onPrevious}
            >
              <FiSkipBack />
            </Button>
            
            <PlayPauseButton 
              isPlaying={isPlaying} 
              onClick={onPlayPause}
            />
            
            <Button
              variant="ghost"
              size="small"
              onClick={onNext}
            >
              <FiSkipForward />
            </Button>
            
            <Button
              variant="ghost"
              size="small"
              onClick={onRepeat}
              className={`${isRepeat ? 'text-white' : 'text-white text-opacity-70'}`}
            >
              <FiRepeat className={isRepeat ? 'fill-current' : ''} />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <FiVolume2 className="text-white text-opacity-70" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-white bg-opacity-30 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, white 0%, white ${volume * 100}%, rgba(255, 255, 255, 0.3) ${volume * 100}%, rgba(255, 255, 255, 0.3) 100%)`
              }}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-white text-opacity-70 text-xs">{formatTime(currentTime)}</span>
          <div className="flex-1 relative">
            <div className="h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md"></div>
              </div>
            </div>
            <input
              ref={progressBarRef}
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleProgressChange}
              className="absolute top-0 left-0 w-full h-1 opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-white text-opacity-70 text-xs">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;