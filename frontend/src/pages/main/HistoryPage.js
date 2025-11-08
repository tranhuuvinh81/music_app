import React, { useState, useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/api';
import { AudioContext } from '../../context/AudioContext';
import { AuthContext } from '../../context/AuthContext';
import { SongList } from './HomeSongsPage'; // Tái sử dụng component SongList

function HistoryPage() {
  const [recentSongs, setRecentSongs] = useState([]);
  const { playSong } = useContext(AudioContext);
  const { openAddModal } = useOutletContext();
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/api/users/history')
        .then(res => setRecentSongs(res.data))
        .catch(err => console.error(err));
    }
  }, [isAuthenticated]);

  const displayArtistNames = (artistsArray) => {
    if (!artistsArray || artistsArray.length === 0) return "Nghệ sĩ không xác định";
    return artistsArray.map((artist) => artist.name).join(", ");
  };

  return (
    <div className="p-6 flex-grow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Nhạc nghe gần đây</h2>
      {isAuthenticated ? (
        recentSongs.length > 0 ? (
          <SongList
            songs={recentSongs}
            onPlay={playSong}
            onOpenModal={openAddModal}
            displayArtistNames={displayArtistNames}
          />
        ) : (
          <p className="text-gray-500">Bạn chưa nghe bài hát nào gần đây.</p>
        )
      ) : (
         <p className="text-gray-500">Vui lòng <a href="/login" className="text-blue-600 hover:underline">đăng nhập</a> để xem lịch sử.</p>
      )}
    </div>
  );
}

export default HistoryPage;