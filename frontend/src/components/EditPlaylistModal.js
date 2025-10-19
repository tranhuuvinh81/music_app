// frontend/src/components/EditPlaylistModal.js
import React, { useState } from 'react';
import api from '../api/api';

function EditPlaylistModal({ playlist, onClose, onSuccess }) {
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description || '');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setError('Tên playlist không được để trống');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (thumbnailFile) {
      formData.append('thumbnailFile', thumbnailFile);
    }

    try {
      await api.put(`/api/playlists/${playlist.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onSuccess(); // Gọi callback để tải lại danh sách
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Chỉnh sửa Playlist</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="playlistName">
              Tên Playlist
            </label>
            <input
              id="playlistName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="playlistDesc">
              Mô tả (Không bắt buộc)
            </label>
            <textarea
              id="playlistDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              rows="3"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="thumbnail">
              Thumbnail (Không bắt buộc)
            </label>
            <input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPlaylistModal;