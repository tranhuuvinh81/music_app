// // frontend/src/components/forms/EditPlaylistModal.js
// import React, { useState } from "react";
// import api from "../../api/api";

// function EditPlaylistModal({ playlist, onClose, onSuccess }) {
//   const [name, setName] = useState(playlist.name);
//   const [description, setDescription] = useState(playlist.description || "");
//   const [thumbnailFile, setThumbnailFile] = useState(null);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!name) {
//       setError("Tên playlist không được để trống");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("name", name);
//     formData.append("description", description);
//     if (thumbnailFile) {
//       formData.append("thumbnailFile", thumbnailFile);
//     }

//     try {
//       await api.put(`/api/playlists/${playlist.id}`, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       onSuccess(); // callback để tải lại danh sách
//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.message || "Có lỗi xảy ra");
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
//         <h2 className="text-2xl font-bold mb-4">Chỉnh sửa Playlist</h2>
//         <form onSubmit={handleSubmit}>
//           {error && <p className="text-red-500 mb-2">{error}</p>}
//           <div className="mb-4">
//             <label className="block text-gray-700 mb-2" htmlFor="playlistName">
//               Tên Playlist
//             </label>
//             <input
//               id="playlistName"
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-gray-700 mb-2" htmlFor="playlistDesc">
//               Mô tả (Không bắt buộc)
//             </label>
//             <textarea
//               id="playlistDesc"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
//               rows="3"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-gray-700 mb-2" htmlFor="thumbnail">
//               Thumbnail (Không bắt buộc)
//             </label>
//             <input
//               id="thumbnail"
//               type="file"
//               accept="image/*"
//               onChange={(e) => setThumbnailFile(e.target.files[0])}
//               className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
//             />
//           </div>
//           <div className="flex justify-end space-x-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
//             >
//               Hủy
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
//             >
//               Lưu
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default EditPlaylistModal;

//====================================================================

// frontend/src/components/forms/EditPlaylistModal.js
import React, { useState } from "react";
import api from "../../api/api";

// Helper lấy ảnh
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${api.defaults.baseURL}${url}`;
};

function EditPlaylistModal({ playlist, onClose, onSuccess }) {
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description || "");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  // [NEW] State preview ảnh
  const [previewThumbnail, setPreviewThumbnail] = useState(getImageUrl(playlist.thumbnail_url));
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setThumbnailFile(file);
          setPreviewThumbnail(URL.createObjectURL(file));
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setError("Tên playlist không được để trống");
      return;
    }
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (thumbnailFile) {
      formData.append("thumbnailFile", thumbnailFile);
    }

    try {
      await api.put(`/api/playlists/${playlist.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess(); 
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Chỉnh sửa Playlist</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-2xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-3 text-sm bg-red-50 p-2 rounded">{error}</p>}
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Tên Playlist</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Mô tả</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Thumbnail</label>
            
            <div className="flex items-center gap-4">
                {/* Preview Box */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                    {previewThumbnail ? (
                        <img src={previewThumbnail} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Img</div>
                    )}
                </div>
                
                <input
                    type="file" accept="image/*" onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 border-t pt-4">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit" disabled={isLoading}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 font-medium flex items-center disabled:opacity-70"
            >
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPlaylistModal;