// // frontend/src/components/SongForm.js
import React, { useState, useEffect } from "react";
import api from "../api/api";
import Select from "react-select"; // 👈 1. IMPORT react-select

function SongForm({ songToEdit, onFormSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    album: "",
    genre: "",
    release_year: "",
  });
  const [songFile, setSongFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [lyricFile, setLyricFile] = useState(null);
  const [error, setError] = useState("");
  const isEditing = !!songToEdit;

  const [allArtists, setAllArtists] = useState([]); // Danh sách tất cả nghệ sĩ [{ value: id, label: name }]
  const [selectedArtists, setSelectedArtists] = useState([]); // Danh sách nghệ sĩ đã chọn cho bài hát này

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const res = await api.get("/api/artists");
        const options = res.data.map((artist) => ({
          value: artist.id,
          label: artist.name,
        }));
        setAllArtists(options);
      } catch (err) {
        console.error("Lỗi khi tải danh sách nghệ sĩ:", err);
      }
    };
    fetchArtists();
  }, []);

  // Set giá trị mặc định khi edit
  useEffect(() => {
    if (isEditing && songToEdit) {
      setFormData({
        title: songToEdit.title || "",
        album: songToEdit.album || "",
        genre: songToEdit.genre || "",
        release_year: songToEdit.release_year || "",
      });
      // Set nghệ sĩ đã chọn nếu đang edit (songToEdit.artists là mảng object)
      const currentArtistOptions = (songToEdit.artists || []).map((artist) => ({
        value: artist.id,
        label: artist.name,
      }));
      setSelectedArtists(currentArtistOptions);
    } else {
      // Reset khi mở form thêm mới
      setFormData({ title: "", album: "", genre: "", release_year: "" });
      setSelectedArtists([]);
      setSongFile(null);
      setImageFile(null);
      setLyricFile(null);
    }
  }, [songToEdit, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArtistChange = (selectedOptions) => {
    setSelectedArtists(selectedOptions || []);
  };

  const handleSongFileChange = (e) => {
    setSongFile(e.target.files[0]);
  };
  const handleImageFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };
  const handleLyricFileChange = (e) => {
    setLyricFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (selectedArtists.length === 0) {
      setError("Vui lòng chọn ít nhất một nghệ sĩ.");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    // GỬI MẢNG ID NGHỆ SĨ LÊN SERVER
    const artistIds = selectedArtists.map((option) => option.value);
    data.append("artistIds", JSON.stringify(artistIds)); // Gửi dưới dạng chuỗi JSON

    if (songFile) data.append("songFile", songFile);
    if (imageFile) data.append("imageFile", imageFile);
    if (lyricFile) data.append("lyricFile", lyricFile);

    try {
      if (isEditing) {
        await api.put(`/api/songs/${songToEdit.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/api/songs", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      onFormSubmit();
    } catch (err) {
      setError(err.response?.data?.error || "Có lỗi xảy ra");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Chỉnh sửa bài hát" : "Thêm bài hát mới"}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Input Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Tiêu đề
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label
                htmlFor="artists"
                className="block text-sm font-medium text-gray-700"
              >
                Nghệ sĩ
              </label>
              <Select
                id="artists"
                isMulti // Cho phép chọn nhiều
                name="artists"
                options={allArtists} // Danh sách lựa chọn
                value={selectedArtists} // Giá trị đang chọn
                onChange={handleArtistChange} // Hàm xử lý khi thay đổi
                className="mt-1 basic-multi-select"
                classNamePrefix="select"
                placeholder="Chọn nghệ sĩ..."
                noOptionsMessage={() => "Không tìm thấy nghệ sĩ"}
              />
            </div>

            {/* Input Album, Genre, Release Year */}
            <div>
              <label
                htmlFor="album"
                className="block text-sm font-medium text-gray-700"
              >
                Album
              </label>
              <input
                type="text"
                id="album"
                name="album"
                value={formData.album}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="genre"
                className="block text-sm font-medium text-gray-700"
              >
                Thể loại
              </label>
              <input
                type="text"
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="release_year"
                className="block text-sm font-medium text-gray-700"
              >
                Năm phát hành
              </label>
              <input
                type="number"
                id="release_year"
                name="release_year"
                value={formData.release_year}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* File Inputs (Song, Image, Lyric) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                File bài hát (MP3)
              </label>
              <input
                type="file"
                name="songFile"
                onChange={handleSongFileChange}
                accept="audio/*"
                className="mt-1 w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ảnh bìa
              </label>
              <input
                type="file"
                name="imageFile"
                onChange={handleImageFileChange}
                accept="image/*"
                className="mt-1 w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                File Lyric (.lrc)
              </label>
              <input
                type="file"
                name="lyricFile"
                onChange={handleLyricFileChange}
                accept=".lrc, text/plain"
                className="mt-1 w-full text-sm"
              />
            </div>
          </div>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 rounded-md"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-600 text-white rounded-md"
            >
              {isEditing ? "Lưu" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SongForm;
