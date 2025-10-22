// // frontend/src/components/SongForm.js
// import React from "react";
// import { useState, useEffect } from "react";
// import api from "../api/api";

// function SongForm({ songToEdit, onFormSubmit, onCancel }) {
//   const [formData, setFormData] = useState({
//     title: "",
//     artist: "",
//     album: "",
//     genre: "",
//     release_year: "",
//   });
//   const [songFile, setSongFile] = useState(null);
//   const [imageFile, setImageFile] = useState(null);
//   const [lyricFile, setLyricFile] = useState(null);
//   const [error, setError] = useState("");
//   const isEditing = !!songToEdit; // Kiểm tra xem đây là form sửa hay thêm mới

//   useEffect(() => {
//     if (isEditing) {
//       setFormData({
//         title: songToEdit.title || "",
//         artist: songToEdit.artist || "",
//         album: songToEdit.album || "",
//         genre: songToEdit.genre || "",
//         release_year: songToEdit.release_year || "",
//       });
//     }
//   }, [songToEdit, isEditing]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSongFileChange = (e) => {
//     setSongFile(e.target.files[0]);
//   };

//   const handleImageFileChange = (e) => {
//     setImageFile(e.target.files[0]);
//   };

//   const handleLyricFileChange = (e) => {
//     setLyricFile(e.target.files[0]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const data = new FormData();
//     Object.keys(formData).forEach((key) => data.append(key, formData[key]));
//     if (songFile) {
//       data.append("songFile", songFile);
//     }
//     if (imageFile) {
//       data.append("imageFile", imageFile);
//     }

//     if (lyricFile) {
//       data.append("lyricFile", lyricFile);
//     }

//     try {
//       if (isEditing) {
//         // Chế độ sửa
//         await api.put(`/api/songs/${songToEdit.id}`, data, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//       } else {
//         // Chế độ thêm mới
//         await api.post("/api/songs", data, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//       }
//       onFormSubmit(); // Báo cho component cha biết form đã submit thành công
//     } catch (err) {
//       setError(err.response?.data?.message || "Có lỗi xảy ra");
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-xl p-3 w-full max-w-md max-h-screen overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold text-gray-900">
//             {isEditing ? "Chỉnh sửa bài hát" : "Thêm bài hát mới"}
//           </h3>
//           <button
//             onClick={onCancel}
//             className="text-gray-400 hover:text-gray-600 transition-colors"
//             aria-label="Close"
//           >
//             <svg
//               className="w-6 h-6"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M6 18L18 6M6 6l12 12"
//               ></path>
//             </svg>
//           </button>
//         </div>
//         <form onSubmit={handleSubmit}>
//           <div className="space-y-4">
//             <div>
//               <label
//                 htmlFor="title"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Tiêu đề
//               </label>
//               <input
//                 type="text"
//                 id="title"
//                 name="title"
//                 value={formData.title}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//             <div>
//               <label
//                 htmlFor="artist"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Nghệ sĩ
//               </label>
//               <input
//                 type="text"
//                 id="artist"
//                 name="artist"
//                 value={formData.artist}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//             <div>
//               <label
//                 htmlFor="album"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Album
//               </label>
//               <input
//                 type="text"
//                 id="album"
//                 name="album"
//                 value={formData.album}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//             <div>
//               <label
//                 htmlFor="genre"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Thể loại
//               </label>
//               <input
//                 type="text"
//                 id="genre"
//                 name="genre"
//                 value={formData.genre}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//             <div>
//               <label
//                 htmlFor="release_year"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Năm phát hành
//               </label>
//               <input
//                 type="number"
//                 id="release_year"
//                 name="release_year"
//                 value={formData.release_year}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 File bài hát (MP3):
//               </label>
//               <input
//                 type="file"
//                 name="songFile"
//                 onChange={handleSongFileChange}
//                 accept="audio/*"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Ảnh nền (nếu có):
//               </label>
//               <input
//                 type="file"
//                 name="imageFile"
//                 onChange={handleImageFileChange}
//                 accept="image/*"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 File LRC (nếu có):
//               </label>
//               <input
//                 type="file"
//                 name="lyricFile"
//                 onChange={handleLyricFileChange}
//                 accept=".lrc, text/plain"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
//               />
//             </div>
//           </div>
//           {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
//           <div className="flex justify-end space-x-3 mt-6">
//             <button
//               type="button"
//               onClick={onCancel}
//               className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
//             >
//               Hủy
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
//             >
//               {isEditing ? "Lưu thay đổi" : "Thêm bài hát"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default SongForm;
import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Select from 'react-select'; // 👈 1. IMPORT react-select

function SongForm({ songToEdit, onFormSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    // artist: '', // Bỏ field này
    album: '',
    genre: '',
    release_year: '',
  });
  const [songFile, setSongFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [lyricFile, setLyricFile] = useState(null);
  const [error, setError] = useState('');
  const isEditing = !!songToEdit;

  // 👈 2. STATE MỚI ĐỂ LƯU DANH SÁCH NGHỆ SĨ VÀ NGHỆ SĨ ĐÃ CHỌN
  const [allArtists, setAllArtists] = useState([]); // Danh sách tất cả nghệ sĩ [{ value: id, label: name }]
  const [selectedArtists, setSelectedArtists] = useState([]); // Danh sách nghệ sĩ đã chọn cho bài hát này

  // Fetch danh sách nghệ sĩ khi component mount
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const res = await api.get('/api/artists'); // Lấy danh sách từ API nghệ sĩ
        const options = res.data.map(artist => ({ value: artist.id, label: artist.name }));
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
        title: songToEdit.title || '',
        album: songToEdit.album || '',
        genre: songToEdit.genre || '',
        release_year: songToEdit.release_year || '',
      });
      // Set nghệ sĩ đã chọn nếu đang edit (songToEdit.artists là mảng object)
      const currentArtistOptions = (songToEdit.artists || []).map(artist => ({
        value: artist.id,
        label: artist.name
      }));
      setSelectedArtists(currentArtistOptions);
    } else {
        // Reset khi mở form thêm mới
        setFormData({ title: '', album: '', genre: '', release_year: '' });
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

  // 👈 3. HÀM HANDLER KHI CHỌN NGHỆ SĨ TỪ SELECT
  const handleArtistChange = (selectedOptions) => {
    setSelectedArtists(selectedOptions || []);
  };

  const handleSongFileChange = (e) => { setSongFile(e.target.files[0]); };
  const handleImageFileChange = (e) => { setImageFile(e.target.files[0]); };
  const handleLyricFileChange = (e) => { setLyricFile(e.target.files[0]); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedArtists.length === 0) {
      setError("Vui lòng chọn ít nhất một nghệ sĩ.");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    // 👈 4. GỬI MẢNG ID NGHỆ SĨ LÊN SERVER
    const artistIds = selectedArtists.map(option => option.value);
    data.append('artistIds', JSON.stringify(artistIds)); // Gửi dưới dạng chuỗi JSON

    if (songFile) data.append("songFile", songFile);
    if (imageFile) data.append("imageFile", imageFile);
    if (lyricFile) data.append("lyricFile", lyricFile);

    try {
      if (isEditing) {
        await api.put(`/api/songs/${songToEdit.id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("/api/songs", data, { headers: { "Content-Type": "multipart/form-data" } });
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
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Input Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tiêu đề</label>
              <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>

            {/* 👇 5. THAY THẾ INPUT TEXT ARTIST BẰNG REACT-SELECT */}
            <div>
              <label htmlFor="artists" className="block text-sm font-medium text-gray-700">Nghệ sĩ</label>
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
                noOptionsMessage={() => 'Không tìm thấy nghệ sĩ'}
              />
            </div>

            {/* Input Album, Genre, Release Year */}
            {/* ... (giữ nguyên các input này) ... */}
             <div>
              <label htmlFor="album" className="block text-sm font-medium text-gray-700">Album</label>
              <input type="text" id="album" name="album" value={formData.album} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
             <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-700">Thể loại</label>
              <input type="text" id="genre" name="genre" value={formData.genre} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="release_year" className="block text-sm font-medium text-gray-700">Năm phát hành</label>
              <input type="number" id="release_year" name="release_year" value={formData.release_year} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>


            {/* File Inputs (Song, Image, Lyric) */}
            {/* ... (giữ nguyên các input file này) ... */}
            <div>
              <label className="block text-sm font-medium text-gray-700">File bài hát (MP3)</label>
              <input type="file" name="songFile" onChange={handleSongFileChange} accept="audio/*" className="mt-1 w-full text-sm"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Ảnh bìa</label>
              <input type="file" name="imageFile" onChange={handleImageFileChange} accept="image/*" className="mt-1 w-full text-sm"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">File Lyric (.lrc)</label>
              <input type="file" name="lyricFile" onChange={handleLyricFileChange} accept=".lrc, text/plain" className="mt-1 w-full text-sm"/>
            </div>

          </div>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-md">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-gray-600 text-white rounded-md">{isEditing ? "Lưu" : "Thêm"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SongForm;