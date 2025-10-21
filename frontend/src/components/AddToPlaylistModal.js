// frontend/src/components/AddToPlaylistModal.js
import React, { useContext, useState, useEffect } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

function AddToPlaylistModal({ songId, onClose }) {
  const { user } = useContext(AuthContext);
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/api/playlists/user/${user.id}`)
      .then((res) => setPlaylists(res.data))
      .catch((err) => console.error(err));
  }, [user.id]);

  const addToPlaylist = async (playlistId) => {
    try {
      await api.post("/api/playlists/add-song", {
        playlist_id: playlistId,
        song_id: songId,
      });
      alert("Đã thêm vào playlist");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Thêm vào playlist
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {playlists.length > 0 ? (
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {playlists.map((pl) => (
                <li
                  key={pl.id}
                  className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100"
                >
                  <span className="text-gray-800">{pl.name}</span>
                  <button
                    className="px-3 py-1 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    onClick={() => addToPlaylist(pl.id)}
                  >
                    Thêm
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Bạn chưa có playlist nào.
            </p>
          )}
          {error && (
            <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddToPlaylistModal;
