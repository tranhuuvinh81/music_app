// frontend/src/pages/HomePage.js
import React, { useState, useContext, useEffect, useRef } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { AudioContext } from "../context/AudioContext";
import SongDetails from "../components/SongDetails";
import AddToPlaylistModal from "../components/AddToPlaylistModal";
import ArtistDetailsModal from "../components/ArtistDetailModal";
import Footer from "../components/Footer";
import bannerImg from "../images/116d710d1e61b0cc8debc32470695fff.jpg";

function HomePage() {
  const [displaySongs, setDisplaySongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [recentSongs, setRecentSongs] = useState([]);
  const [selectedTab, setSelectedTab] = useState("songs");
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const { user, isAuthenticated } = useContext(AuthContext);
  const { playSong } = useContext(AudioContext);
  const [menuOpenSongId, setMenuOpenSongId] = useState(null);
  const [modalSongId, setModalSongId] = useState(null);
  const recentSectionRef = useRef(null);
  const [artistModalData, setArtistModalData] = useState(null);

  const [isListExpanded, setIsListExpanded] = useState(false);

  useEffect(() => {
    if (selectedTab === "songs") {
      api
        .get("/api/songs")
        .then((res) => setDisplaySongs(res.data))
        .catch((err) => console.error(err));
    }
    api
      .get("/api/artists")
      .then((res) => setArtists(res.data))
      .catch((err) => console.error(err));

    api
      .get("/api/songs/genres")
      .then((res) => setGenres(res.data))
      .catch((err) => console.error(err));

    if (isAuthenticated) {
      api
        .get("/api/users/history")
        .then((res) => setRecentSongs(res.data))
        .catch((err) => console.error(err));
    }
  }, [selectedTab, isAuthenticated]);

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
    } else if (selectedTab === "recently") {
      setDisplaySongs(recentSongs);
      if (recentSectionRef.current) {
        recentSectionRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      setDisplaySongs([]);
    }
  }, [selectedTab, selectedArtist, selectedGenre, recentSongs]);

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
    setIsListExpanded(false);
  };

  const handleSelectArtist = (artistName) => {
    setSelectedArtist(artistName);
  };

  const displayArtistNames = (artistsArray) => {
    if (!artistsArray || artistsArray.length === 0) {
      return "Nghệ sĩ không xác định";
    }
    return artistsArray.map((artist) => artist.name).join(", ");
  };

  const handleSelectGenre = (genre) => {
    setSelectedGenre(genre);
  };

  // Hàm để đảo ngược state mở rộng/thu gọn
  const toggleListExpansion = () => {
    setIsListExpanded(!isListExpanded);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <div className="flex flex-col w-80 bg-white shadow-md">
        <div className="flex-1">
          <div className="p-4">
            <ul className="space-y-2">
              <li
                className={`px-4 py-2 rounded cursor-pointer hover:bg-gray-200 ${
                  selectedTab === "songs" ? "bg-gray-100" : ""
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
              <li
                className={`px-4 py-2 rounded cursor-pointer hover:bg-gray-200 ${
                  selectedTab === "recently" ? "bg-gray-100" : ""
                }`}
                onClick={() => handleTabChange("recently")}
              >
                <span>Recently</span>
              </li>
            </ul>
          </div>
          <div className="h-px bg-gray-200"></div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* BANNER */}
        <div className="relative h-64 md:h-80 lg:h-96 flex-shrink-0">
          <img
            src={bannerImg}
            alt="Music Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Khám phá âm nhạc
            </h1>
            <p className="text-white/80 text-lg">
              Tìm kiếm và thưởng thức những bài hát yêu thích của bạn
            </p>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="p-6 flex-grow">
          {(selectedTab === "songs" || selectedTab === "recently") && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                {selectedTab === "songs"
                  ? " Bài hát nổi bật"
                  : "Nhạc nghe gần đây"}
              </h2>
              <ul className="space-y-4">
                {(isListExpanded
                  ? displaySongs
                  : displaySongs.slice(0, 10)
                ).map((song, index) => (
                  <li
                    key={song.id}
                    className="bg-white p-4 rounded-lg shadow flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      {song.image_url && (
                        <img
                          src={`${api.defaults.baseURL}${song.image_url}`}
                          alt={`${song.title} thumbnail`}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <strong className="block text-gray-900">
                          {song.title}
                        </strong>
                        <p className="text-gray-600">
                          {displayArtistNames(song.artists)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handlePlaySong(song, displaySongs, index)
                        }
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

              {displaySongs.length > 10 && (
                <button
                  onClick={toggleListExpansion}
                  className="mt-4 w-full py-2 text-center text-gray-500 hover:text-gray-600 font-medium transition-colors"
                >
                  {isListExpanded ? "Thu gọn" : "Xem thêm..."}
                </button>
              )}
            </>
          )}

          {/* ARTISTS */}
          {selectedTab === "artists" && (
            <>
              {!selectedArtist ? (
                <>
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    Nghệ sĩ nổi bật
                  </h2>
                  <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {artists.map((artist) => (
                      <li
                        key={artist.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                      >
                        <img
                          src={
                            artist.image_url
                              ? `${api.defaults.baseURL}${artist.image_url}`
                              : "https://via.placeholder.com/150?text=No+Image"
                          }
                          alt={artist.name}
                          className="w-full h-40 object-cover cursor-pointer"
                          onClick={() => handleSelectArtist(artist.name)}
                        />
                        <div className="p-4">
                          <h3
                            className="font-bold text-lg text-gray-800 truncate cursor-pointer hover:text-gray-600"
                            onClick={() => handleSelectArtist(artist.name)}
                          >
                            {artist.name}
                          </h3>
                          <button
                            onClick={() => setArtistModalData(artist)}
                            className="text-sm text-gray-500 hover:underline mt-2"
                          >
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
                    <button
                      onClick={() => setSelectedArtist(null)}
                      className="mr-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Quay lại
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Những bài hát của {selectedArtist}
                    </h2>
                  </div>
                  <ul className="space-y-4">
                    {displaySongs.map((song, index) => (
                      <li
                        key={song.id}
                        className="bg-white p-4 rounded-lg shadow flex items-center justify-between hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-4">
                          {song.image_url && (
                            <img
                              src={`${api.defaults.baseURL}${song.image_url}`}
                              alt={`${song.title} thumbnail`}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <strong className="block text-gray-900">
                              {song.title}
                            </strong>
                            <p className="text-gray-600">
                              {displayArtistNames(song.artists)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              handlePlaySong(song, displaySongs, index)
                            }
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
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    Thể loại âm nhạc
                  </h2>
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
                    <h2 className="text-2xl font-bold text-gray-800">
                      Những bài hát thuộc thể loại {selectedGenre}
                    </h2>
                  </div>
                  <ul className="space-y-4">
                    {displaySongs.map((song, index) => (
                      <li
                        key={song.id}
                        className="bg-white p-4 rounded-lg shadow flex items-center justify-between hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-4">
                          {song.image_url && (
                            <img
                              src={`${api.defaults.baseURL}${song.image_url}`}
                              alt={`${song.title} thumbnail`}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <strong className="block text-gray-900">
                              {song.title}
                            </strong>
                            <p className="text-gray-600">
                              {displayArtistNames(song.artists)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              handlePlaySong(song, displaySongs, index)
                            }
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

        <Footer />
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="w-80 bg-white shadow-md p-4 overflow-y-auto flex-shrink-0">
        <SongDetails />
      </div>

      {modalSongId && (
        <AddToPlaylistModal songId={modalSongId} onClose={closeModal} />
      )}

      {artistModalData && (
        <ArtistDetailsModal
          artist={artistModalData}
          onClose={() => setArtistModalData(null)}
        />
      )}
    </div>
  );
}

export default HomePage;
