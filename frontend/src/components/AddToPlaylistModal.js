// frontend/src/components/AddToPlaylistModal.js (new file)
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
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Thêm vào playlist</h2>
        </div>

        <div>
          <div className="modal-body">
            <div className="form-group">
                <table>
                  <tbody>
                    <tr>
                      <td>
                        {playlists.map((pl) => (
                          <div key={pl.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
                            <span>{pl.name}</span>
                            <button
                              className="btn btn-primary"
                              onClick={() => addToPlaylist(pl.id)}
                            >
                              Thêm
                            </button>
                          </div>
                        ))}
                      </td>
                    </tr>
                  </tbody>
                </table>
                {error && <p className="error">{error}</p>}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-cancel" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddToPlaylistModal;
