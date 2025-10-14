// frontend/src/components/SongDetails.js (updated - add image display)
import React, { useContext } from 'react';
import { AudioContext } from '../context/AudioContext';
import api from '../api/api'; // Để lấy baseURL

function SongDetails() {
  const { currentPlaylist, currentIndex } = useContext(AudioContext);
  const currentSong = currentPlaylist[currentIndex];

  if (!currentSong) {
    return <div className="song-details">Chưa có bài hát đang phát</div>;
  }

  const imageSrc = currentSong.image_url ? `${api.defaults.baseURL}${currentSong.image_url}` : null;

  return (
    <div className="song-details">
      <h2>Thông tin bài hát đang phát</h2>
      {imageSrc && <img src={imageSrc} alt={currentSong.title} style={{ maxWidth: '100%', height: 'auto' }} />}
      <p><strong>Tiêu đề:</strong> {currentSong.title}</p>
      <p><strong>Nghệ sĩ:</strong> {currentSong.artist}</p>
      <p><strong>Album:</strong> {currentSong.album || 'Không có'}</p>
      <p><strong>Thể loại:</strong> {currentSong.genre || 'Không có'}</p>
      <p><strong>Năm phát hành:</strong> {currentSong.release_year || 'Không có'}</p>
    </div>
  );
}

export default SongDetails;