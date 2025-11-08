import React, { useState, useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/api';
import { AudioContext } from '../../context/AudioContext';
import { SongList } from './HomeSongsPage'; // Tái sử dụng component SongList

function ArtistsPage() {
  const [artists, setArtists] = useState([]);
  const [displaySongs, setDisplaySongs] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const { playSong } = useContext(AudioContext);
  const { openAddModal, openArtistModal } = useOutletContext(); // Lấy hàm từ MainLayout

  // Fetch danh sách nghệ sĩ
  useEffect(() => {
    api.get('/api/artists') 
      .then(res => setArtists(res.data))
      .catch(err => console.error(err));
  }, []);

  // Fetch bài hát khi chọn một nghệ sĩ
  useEffect(() => {
    if (selectedArtist) {
      api.get(`/api/songs/artist/${encodeURIComponent(selectedArtist)}`)
        .then(res => setDisplaySongs(res.data))
        .catch(err => console.error(err));
    } else {
      setDisplaySongs([]); // Xóa danh sách bài hát nếu không chọn nghệ sĩ
    }
  }, [selectedArtist]);

  const displayArtistNames = (artistsArray) => {
    if (!artistsArray || artistsArray.length === 0) return "Nghệ sĩ không xác định";
    return artistsArray.map((artist) => artist.name).join(", ");
  };

  return (
    <div className="p-6 flex-grow">
      {!selectedArtist ? (
        <>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Nghệ sĩ nổi bật</h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {artists.map((artist) => (
              <li key={artist.id} className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <img 
                  src={artist.image_url ? `${api.defaults.baseURL}${artist.image_url}` : 'https://via.placeholder.com/150?text=No+Image'}
                  alt={artist.name}
                  className="w-full h-40 object-cover cursor-pointer"
                  onClick={() => setSelectedArtist(artist.name)}
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 truncate cursor-pointer hover:text-gray-600" onClick={() => setSelectedArtist(artist.name)}>
                    {artist.name}
                  </h3>
                  <button onClick={() => openArtistModal(artist)} className="text-sm text-gray-500 hover:underline mt-2">
                    Xem chi tiết
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <div className="flex items-center mb-6">
            <button onClick={() => setSelectedArtist(null)} className="mr-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Quay lại
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              Những bài hát của {selectedArtist}
            </h2>
          </div>
          <SongList
            songs={displaySongs}
            onPlay={playSong}
            onOpenModal={openAddModal}
            displayArtistNames={displayArtistNames}
          />
        </>
      )}
    </div>
  );
}

export default ArtistsPage;