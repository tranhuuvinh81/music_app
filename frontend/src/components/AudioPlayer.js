// frontend/src/components/AudioPlayer.js (updated)
import React, { useContext } from 'react';
import { AudioContext } from '../context/AudioContext';

function AudioPlayer() {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    nextSong,
    prevSong,
    volume,
    handleVolumeChange,
    progress,
    handleSeek,
    currentPlaylist,
    currentIndex
  } = useContext(AudioContext);

  if (!currentSong) return null;

  const currentSongObj = currentPlaylist[currentIndex] || {};
  const songTitle = currentSongObj.title || currentSong.split('/').pop();
  const songArtist = currentSongObj.artist || 'Unknown';

  return (
    <div className="audio-player fixed-bottom">
      <div className="player-controls">
        <button onClick={prevSong} disabled={currentIndex <= 0}>Previous</button>
        <button onClick={togglePlay}>{isPlaying ? 'Tạm dừng' : 'Phát'}</button>
        <button onClick={nextSong} disabled={currentIndex >= currentPlaylist.length - 1}>Next</button>
        <div className="song-info">
          <span>Đang phát: {songTitle} - {songArtist}</span>
        </div>
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

export default AudioPlayer;