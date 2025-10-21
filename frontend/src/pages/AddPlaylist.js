import React from "react";
import api from "../api/api";

function AddPlaylist() {
  const [menuOpenSongId, setMenuOpenSongId] = useState(null);
  const [modalSongId, setModalSongId] = useState(null);

  const openAddModal = (songId) => {
    setModalSongId(songId);
    setMenuOpenSongId(null);
  };

  const closeModal = () => {
    setModalSongId(null);
  };

  const [showSetPlaylistModal, setShowSetPlaylistModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const handleAddPlaylist = () => {
    setEditingPlaylist(null);
    setShowSetPlaylistModal(true);
  };
  return (
    <div className="modal-overlay">
      <button onClick={handleAddPlaylist}>Thêm Playlist</button>
      {showSetPlaylistModal && (
        <SetPlaylistModal
          onClose={() => setShowSetPlaylistModal(false)}
          playlist={editingPlaylist}
        />
      )}
    </div>
  );
}
