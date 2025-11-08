import React, { useState, useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/api';
import { AudioContext } from '../../context/AudioContext';
import { SongList } from './HomeSongsPage'; // Tái sử dụng component SongList

function GenresPage() {
  const [genres, setGenres] = useState([]);
  const [displaySongs, setDisplaySongs] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const { playSong } = useContext(AudioContext);
  const { openAddModal } = useOutletContext();

  useEffect(() => {
    api.get('/api/songs/genres')
      .then(res => setGenres(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedGenre) {
      api.get(`/api/songs/genre/${encodeURIComponent(selectedGenre)}`)
        .then(res => setDisplaySongs(res.data))
        .catch(err => console.error(err));
    } else {
      setDisplaySongs([]);
    }
  }, [selectedGenre]);

  const displayArtistNames = (artistsArray) => {
    if (!artistsArray || artistsArray.length === 0) return "Nghệ sĩ không xác định";
    return artistsArray.map((artist) => artist.name).join(", ");
  };

  return (
    <div className="p-6 flex-grow">
      {!selectedGenre ? (
        <>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Thể loại âm nhạc</h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {genres.map((genre) => (
              <li
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className="p-4 bg-white rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow text-gray-700"
              >
                {genre}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <div className="flex items-center mb-6">
            <button onClick={() => setSelectedGenre(null)} className="mr-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Quay lại
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              Những bài hát thuộc thể loại {selectedGenre}
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

export default GenresPage;