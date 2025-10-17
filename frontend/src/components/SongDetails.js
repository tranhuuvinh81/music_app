// frontend/src/components/SongDetails.js (updated - add image display)
import React, { useContext } from 'react';
import { AudioContext } from '../context/AudioContext';
import api from '../api/api'; // Để lấy baseURL

function SongDetails() {
  const { currentPlaylist, currentIndex } = useContext(AudioContext);
  const currentSong = currentPlaylist[currentIndex];
  const { isPlaying, setIsPlaying } = useContext(AudioContext);

  const {
    
    togglePlay,
    nextSong,
    prevSong,
    volume,
    handleVolumeChange,
    progress,
    handleSeek,
    
  } = useContext(AudioContext);
  if (!currentSong) return null;

  const currentSongObj = currentPlaylist[currentIndex] || {};
  const songTitle = currentSongObj.title || currentSong.split('/').pop();
  const songArtist = currentSongObj.artist || 'Unknown';


  if (!currentSong) {
    return <div className="song-details">Chưa có bài hát đang phát</div>;
  }

  const imageSrc = currentSong.image_url ? `${api.defaults.baseURL}${currentSong.image_url}` : null;

  return (
    <div className="now-playing">
      <h2>Cùng nghe nào</h2>
      <div className='now-playing-corver'>
        {imageSrc && <img className='image-container' src={imageSrc} alt={currentSong.title}/>}
      </div>
      <div className='now-playing-title'>{currentSong.title}</div>
      <div className='now-playing-artist'>{currentSong.artist}</div>
      <div className='audio-controls'>
        <button onClick={prevSong} disabled={currentIndex <=0} className='control-btn'>&lt;</button>
        <button onClick={togglePlay} className='control-btn control-btn.play'>
          {isPlaying ? (
            <span>&#10074;&#10074;</span> // Pause icon
          ) : (
            <span>&#9654;</span> // Play icon
          )}
        </button>
        <button onClick={nextSong} disabled={currentIndex>= currentPlaylist.length - 1} className='control-btn'>&gt;</button>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="seek-bar"
        />
        <div className="volume-control">
          <label>Âm lượng:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
          />
        </div>
      </div>
      
    </div>
  );
}

export default SongDetails;