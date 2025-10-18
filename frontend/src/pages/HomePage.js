// frontend/src/pages/HomePage.js (gray theme)
import React, { useState, useContext, useEffect } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { AudioContext } from "../context/AudioContext";
import SongDetails from "../components/SongDetails";
import AddToPlaylistModal from "../components/AddToPlaylistModal";

function HomePage() {
  const [displaySongs, setDisplaySongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedTab, setSelectedTab] = useState("songs");
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const { user, isAuthenticated } = useContext(AuthContext);
  const { playSong } = useContext(AudioContext);
  const [menuOpenSongId, setMenuOpenSongId] = useState(null);
  const [modalSongId, setModalSongId] = useState(null);

  useEffect(() => {
    if (selectedTab === "songs") {
      api
        .get("/api/songs")
        .then((res) => setDisplaySongs(res.data))
        .catch((err) => console.error(err));
    }
    api
      .get("/api/songs/artists")
      .then((res) => setArtists(res.data))
      .catch((err) => console.error(err));

    api
      .get("/api/songs/genres")
      .then((res) => setGenres(res.data))
      .catch((err) => console.error(err));
  }, [selectedTab]);

  useEffect(() => {
    if (selectedTab === "artists" && selectedArtist) {
      api
        .get(`/api/songs/artist/${encodeURIComponent(selectedArtist)}`)
        .then((res) => setDisplaySongs(res.data))
        .catch((err) => console.error(err));
    } else if (selectedTab === "genres" && selectedGenre) {
      api
        .get(`/api/songs/genre/${encodeURIComponent(selectedGenre)}`)
        .then((res) => setDisplaySongs(res.data))
        .catch((err) => console.error(err));
    } else if (selectedTab === "songs") {
      api
        .get("/api/songs")
        .then((res) => setDisplaySongs(res.data))
        .catch((err) => console.error(err));
    } else {
      setDisplaySongs([]);
    }
  }, [selectedTab, selectedArtist, selectedGenre]);

  const handlePlaySong = (song, playlist, index) => {
    playSong(song, playlist, index);
  };

  const toggleMenu = (songId) => {
    setMenuOpenSongId(menuOpenSongId === songId ? null : songId);
  };

  const openAddModal = (songId) => {
    setModalSongId(songId);
    setMenuOpenSongId(null);
  };

  const closeModal = () => {
    setModalSongId(null);
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    setSelectedArtist(null);
    setSelectedGenre(null);
  };

  const handleSelectArtist = (artist) => {
    setSelectedArtist(artist);
  };

  const handleSelectGenre = (genre) => {
    setSelectedGenre(genre);
  };

  return (
    <div className="flex h-screen">
      {/* SIDEBAR */}
      <div className="flex flex-col w-60 bg-white">
        <div className="flex-1">
          <div className="p-4">
            <ul className="space-y-2">
              <li
                className={`px-4 py-2 rounded cursor-pointer hover:bg-gray-200 ${
                  selectedTab === "songs"
                }`}
                onClick={() => handleTabChange("songs")}
              >
                <span>Home</span>
              </li>
              <li
                className={`px-4 py-2 rounded cursor-pointer hover:bg-gray-200 ${
                  selectedTab === "artists" ? "bg-gray-100" : ""
                }`}
                onClick={() => handleTabChange("artists")}
              >
                <span>Singer</span>
              </li>
              <li
                className={`px-4 py-2 rounded cursor-pointer hover:bg-gray-200 ${
                  selectedTab === "genres" ? "bg-gray-100" : ""
                }`}
                onClick={() => handleTabChange("genres")}
              >
                <span>Genre</span>
              </li>
            </ul>
          </div>
          <div className="h-px bg-white"></div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1  p-6">
        {selectedTab === "songs" && (
          <>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">
              Khám phá âm nhạc
            </h1>
            <ul className="space-y-4">
              {displaySongs.map((song, index) => (
                <li
                  key={song.id}
                  className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
                >
                  <div>
                    <strong className="block text-gray-900">
                      {song.title}
                    </strong>
                    <p className="text-gray-600">{song.artist}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePlaySong(song, displaySongs, index)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {isAuthenticated && (
                      <div className="relative">
                        <button
                          onClick={() => toggleMenu(song.id)}
                          className="p-2 text-gray-600 hover:text-gray-800"
                        >
                          ...
                        </button>
                        {menuOpenSongId === song.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                            <button
                              onClick={() => openAddModal(song.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Thêm vào playlist
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* ARTISTS */}
        {selectedTab === "artists" && (
          <>
            {!selectedArtist ? (
              <>
                <h1 className="text-2xl font-bold mb-6 text-gray-800">
                  Danh sách nghệ sĩ
                </h1>
                <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {artists.map((artist) => (
                    <li
                      key={artist}
                      onClick={() => handleSelectArtist(artist)}
                      className="p-4 bg-white rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow text-gray-700"
                    >
                      {artist}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <div className="flex items-center mb-6">
                  <button
                    onClick={() => setSelectedArtist(null)}
                    className="mr-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Quay lại
                  </button>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Bài hát của {selectedArtist}
                  </h1>
                </div>
                <ul className="space-y-4">
                  {displaySongs.map((song, index) => (
                    <li
                      key={song.id}
                      className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
                    >
                      <div>
                        <strong className="block text-gray-900">
                          {song.title}
                        </strong>
                        <p className="text-gray-600">{song.artist}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                      onClick={() => handlePlaySong(song, displaySongs, index)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                        {isAuthenticated && (
                          <div className="relative">
                            <button
                              onClick={() => toggleMenu(song.id)}
                              className="p-2 text-gray-600 hover:text-gray-800"
                            >
                              ...
                            </button>
                            {menuOpenSongId === song.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                <button
                                  onClick={() => openAddModal(song.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Thêm vào playlist
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}

        {/* GENRES */}
        {selectedTab === "genres" && (
          <>
            {!selectedGenre ? (
              <>
                <h1 className="text-2xl font-bold mb-6 text-gray-800">
                  Danh sách thể loại
                </h1>
                <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {genres.map((genre) => (
                    <li
                      key={genre}
                      onClick={() => handleSelectGenre(genre)}
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
                  <button
                    onClick={() => setSelectedGenre(null)}
                    className="mr-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Quay lại
                  </button>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Bài hát thuộc thể loại {selectedGenre}
                  </h1>
                </div>
                <ul className="space-y-4">
                  {displaySongs.map((song, index) => (
                    <li
                      key={song.id}
                      className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
                    >
                      <div>
                        <strong className="block text-gray-900">
                          {song.title}
                        </strong>
                        <p className="text-gray-600">{song.artist}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                      onClick={() => handlePlaySong(song, displaySongs, index)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                        {isAuthenticated && (
                          <div className="relative">
                            <button
                              onClick={() => toggleMenu(song.id)}
                              className="p-2 text-gray-600 hover:text-gray-800"
                            >
                              ...
                            </button>
                            {menuOpenSongId === song.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                <button
                                  onClick={() => openAddModal(song.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Thêm vào playlist
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="w-80 bg-white p-4 ">
        <SongDetails />
      </div>

      {modalSongId && (
        <AddToPlaylistModal songId={modalSongId} onClose={closeModal} />
      )}
    </div>
  );
}

export default HomePage;
