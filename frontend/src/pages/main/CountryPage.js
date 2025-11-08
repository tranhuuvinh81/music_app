import React, { useState, useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/api';
import { AudioContext } from '../../context/AudioContext';
import { SongList } from './HomeSongsPage'; // Tái sử dụng component SongList

function CountryPage() {
  const [countries, setCountries] = useState([]);
  const [displaySongs, setDisplaySongs] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const { playSong } = useContext(AudioContext);
  const { openAddModal } = useOutletContext();

  // Fetch danh sách quốc gia
  useEffect(() => {
    api.get('/api/songs/countries')
      .then(res => setCountries(res.data))
      .catch(err => console.error(err));
  }, []);

  // Fetch bài hát khi chọn một quốc gia
  useEffect(() => {
    if (selectedCountry) {
      api.get(`/api/songs/country/${encodeURIComponent(selectedCountry)}`)
        .then(res => setDisplaySongs(res.data))
        .catch(err => console.error(err));
    } else {
      setDisplaySongs([]);
    }
  }, [selectedCountry]);

  const displayArtistNames = (artistsArray) => {
    if (!artistsArray || artistsArray.length === 0) return "Nghệ sĩ không xác định";
    return artistsArray.map((artist) => artist.name).join(", ");
  };

  return (
    <div className="p-6 flex-grow">
      {!selectedCountry ? (
        <>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Âm nhạc theo Quốc gia</h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {countries.map((country) => (
              <li
                key={country}
                onClick={() => setSelectedCountry(country)}
                className="p-4 bg-white rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow text-gray-700"
              >
                {country}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <div className="flex items-center mb-6">
            <button onClick={() => setSelectedCountry(null)} className="mr-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Quay lại
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              Bài hát: {selectedCountry}
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

export default CountryPage;