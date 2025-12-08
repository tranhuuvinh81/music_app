// // frontend/src/components/forms/ArtistForm.js
// import React, { useState, useEffect } from "react";
// import api from "../../api/api";

// function ArtistForm({ artistToEdit, onFormSubmit, onCancel }) {
//   const [formData, setFormData] = useState({
//     name: "",
//     birth_year: "",
//     field: "",
//     description: "",
//   });
//   const [artistImage, setArtistImage] = useState(null);
//   const [error, setError] = useState("");
//   const isEditing = !!artistToEdit;

//   useEffect(() => {
//     if (isEditing) {
//       setFormData({
//         name: artistToEdit.name || "",
//         birth_year: artistToEdit.birth_year || "",
//         field: artistToEdit.field || "",
//         description: artistToEdit.description || "",
//       });
//     }
//   }, [artistToEdit, isEditing]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     setArtistImage(e.target.files[0]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     const data = new FormData();
//     Object.keys(formData).forEach((key) => data.append(key, formData[key]));
//     if (artistImage) {
//       data.append("artistImage", artistImage);
//     }

//     try {
//       if (isEditing) {
//         await api.put(`/api/artists/${artistToEdit.id}`, data, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//       } else {
//         await api.post("/api/artists", data, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//       }
//       onFormSubmit();
//     } catch (err) {
//       setError(err.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại.");
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-xl font-semibold text-gray-900">
//             {isEditing ? "Chỉnh sửa nghệ sĩ" : "Thêm nghệ sĩ mới"}
//           </h3>
//           <button
//             onClick={onCancel}
//             className="text-gray-500 hover:text-gray-800 text-3xl"
//           >
//             &times;
//           </button>
//         </div>
//         <form onSubmit={handleSubmit}>
//           <div className="space-y-4">
//             {/* Tên nghệ sĩ */}
//             <div>
//               <label
//                 htmlFor="name"
//                 className="block text-sm font-medium text-gray-700"
//               >
//                 Tên nghệ sĩ
//               </label>
//               <input
//                 type="text"
//                 name="name"
//                 id="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
//               />
//             </div>
//             {/* Năm sinh */}
//             <div>
//               <label
//                 htmlFor="birth_year"
//                 className="block text-sm font-medium text-gray-700"
//               >
//                 Năm sinh
//               </label>
//               <input
//                 type="number"
//                 name="birth_year"
//                 id="birth_year"
//                 value={formData.birth_year}
//                 onChange={handleChange}
//                 className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
//               />
//             </div>
//             {/* Lĩnh vực */}
//             <div>
//               <label
//                 htmlFor="field"
//                 className="block text-sm font-medium text-gray-700"
//               >
//                 Lĩnh vực (vd: Ca sĩ, Nhạc sĩ)
//               </label>
//               <input
//                 type="text"
//                 name="field"
//                 id="field"
//                 value={formData.field}
//                 onChange={handleChange}
//                 className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
//               />
//             </div>
//             {/* Mô tả */}
//             <div>
//               <label
//                 htmlFor="description"
//                 className="block text-sm font-medium text-gray-700"
//               >
//                 Mô tả
//               </label>
//               <textarea
//                 name="description"
//                 id="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 rows="4"
//                 className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
//               />
//             </div>
//             {/* Ảnh nghệ sĩ */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Ảnh nghệ sĩ
//               </label>
//               <input
//                 type="file"
//                 name="artistImage"
//                 onChange={handleFileChange}
//                 accept="image/*"
//                 className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
//               />
//             </div>
//           </div>
//           {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
//           <div className="flex justify-end space-x-3 mt-6">
//             <button
//               type="button"
//               onClick={onCancel}
//               className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
//             >
//               Hủy
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
//             >
//               {isEditing ? "Lưu thay đổi" : "Thêm nghệ sĩ"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default ArtistForm;

// frontend/src/components/forms/ArtistForm.js
import React, { useState, useEffect } from "react";
import api from "../../api/api";

// Helper lấy link ảnh
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${api.defaults.baseURL}${url}`;
};

function ArtistForm({ artistToEdit, onFormSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    birth_year: "",
    field: "",
    description: "",
  });
  const [artistImage, setArtistImage] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // [NEW] Loading state
  
  const isEditing = !!artistToEdit;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        name: artistToEdit.name || "",
        birth_year: artistToEdit.birth_year || "",
        field: artistToEdit.field || "",
        description: artistToEdit.description || "",
      });
    }
  }, [artistToEdit, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setArtistImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true); // Bắt đầu loading

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    
    // Chỉ append ảnh nếu người dùng có chọn file mới
    if (artistImage) {
      data.append("artistImage", artistImage);
    }

    try {
      if (isEditing) {
        await api.put(`/api/artists/${artistToEdit.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/api/artists", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      onFormSubmit();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Chỉnh sửa nghệ sĩ" : "Thêm nghệ sĩ mới"}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-800 text-3xl leading-none"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Tên nghệ sĩ */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên nghệ sĩ</label>
              <input
                type="text" name="name" id="name"
                value={formData.name} onChange={handleChange} required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 outline-none"
              />
            </div>
            
            {/* Năm sinh */}
            <div>
              <label htmlFor="birth_year" className="block text-sm font-medium text-gray-700">Năm sinh</label>
              <input
                type="number" name="birth_year" id="birth_year"
                value={formData.birth_year} onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 outline-none"
              />
            </div>
            
            {/* Lĩnh vực */}
            <div>
              <label htmlFor="field" className="block text-sm font-medium text-gray-700">Lĩnh vực</label>
              <input
                type="text" name="field" id="field"
                value={formData.field} onChange={handleChange} placeholder="Vd: Ca sĩ, Rapper"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 outline-none"
              />
            </div>
            
            {/* Mô tả */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả</label>
              <textarea
                name="description" id="description"
                value={formData.description} onChange={handleChange} rows="4"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 outline-none resize-none"
              />
            </div>
            
            {/* Ảnh nghệ sĩ */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Ảnh nghệ sĩ</label>
              
              {/* [NEW] Hiển thị ảnh hiện tại nếu đang Edit */}
              {isEditing && artistToEdit.image_url && (
                 <div className="mt-2 mb-2 flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-200">
                    <img 
                        src={getImageUrl(artistToEdit.image_url)} 
                        alt="Current" 
                        className="w-12 h-12 object-cover rounded-full"
                    />
                    <span className="text-xs text-gray-500">Ảnh hiện tại</span>
                 </div>
              )}

              <input
                type="file" name="artistImage" onChange={handleFileChange} accept="image/*"
                className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button" onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit" disabled={isLoading}
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isLoading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
              )}
              {isEditing ? "Lưu thay đổi" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ArtistForm;