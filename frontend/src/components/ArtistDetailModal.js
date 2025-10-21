// frontend/src/components/ArtistDetailsModal.js
import React from "react";
import api from "../api/api";

function ArtistDetailsModal({ artist, onClose }) {
  if (!artist) return null;

  const imageSrc = artist.image_url
    ? `${api.defaults.baseURL}${artist.image_url}`
    : "https://via.placeholder.com/150?text=No+Image";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Nút đóng modal */}
        <div className="flex justify-end p-2">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

        {/* Nội dung Modal */}
        <div className="overflow-y-auto p-6 pt-0">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <img
              src={imageSrc}
              alt={artist.name}
              className="w-40 h-40 object-cover rounded-full shadow-md flex-shrink-0"
            />
            <div className="flex-1 text-left space-y-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {artist.name}
              </h2>
              <div className=" mb-4">
                {artist.birth_year && (
                  <span className="inline-block bg-gray-200 rounded-full mb-2 px-3 py-1 text-sm font-semibold text-gray-700">
                    Năm sinh: {artist.birth_year}
                  </span>
                )}
                {artist.field && (
                  <span className="inline-block bg-gray-100 rounded-full mb-2 px-3 py-1 text-sm font-semibold text-gray-700">
                    {artist.field}
                  </span>
                )}
              </div>
              <p className="text-gray-700 text-base whitespace-pre-wrap">
                {artist.description || "Chưa có mô tả cho nghệ sĩ này."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArtistDetailsModal;
