// frontend/src/pages/admin/AdminArtistPage.js
import React, { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api/api";

function AdminArtistPage() {
  const { artists, handleAddArtistClick, handleEditArtistClick, fetchArtists } = useOutletContext();
  const [artistCurrentPage, setArtistCurrentPage] = useState(1);
  const [artistsPerPage] = useState(5);
  const [artistSearchQuery, setArtistSearchQuery] = useState("");

  const filteredArtists = useMemo(() => {
    if (!Array.isArray(artists)) return [];
    if (!artistSearchQuery) return artists;
    const lowercasedQuery = artistSearchQuery.toLowerCase();
    return artists.filter((artist) =>
      artist.name?.toLowerCase().includes(lowercasedQuery)
    );
  }, [artists, artistSearchQuery]);

  const currentArtists = useMemo(() => {
    const indexOfLastArtist = artistCurrentPage * artistsPerPage;
    const indexOfFirstArtist = indexOfLastArtist - artistsPerPage;
    return filteredArtists.slice(indexOfFirstArtist, indexOfLastArtist);
  }, [filteredArtists, artistCurrentPage, artistsPerPage]);

  const artistTotalPages = Math.ceil(filteredArtists.length / artistsPerPage);

  useEffect(() => {
    if (artistCurrentPage > artistTotalPages && artistTotalPages > 0) {
      setArtistCurrentPage(artistTotalPages);
    } else if (artistTotalPages === 0 && artistCurrentPage !== 1) {
      setArtistCurrentPage(1);
    }
  }, [filteredArtists, artistTotalPages, artistCurrentPage]);

  const paginateArtists = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= artistTotalPages) {
      setArtistCurrentPage(pageNumber);
    }
  };

  const deleteArtist = (artistId) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá nghệ sĩ này?")) {
      api
        .delete(`/api/artists/${artistId}`)
        .then(() => {
          fetchArtists();
          if (currentArtists.length === 1 && artistCurrentPage > 1) {
            setArtistCurrentPage(artistCurrentPage - 1);
          }
        })
        .catch(console.error);
    }
  };

  return (
    <section className="bg-white rounded-lg shadow-md overflow-hidden">
      <header className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Artist Management
          </h2>
          <input
            type="text"
            placeholder="Tìm theo tên nghệ sĩ..."
            value={artistSearchQuery}
            onChange={(e) => setArtistSearchQuery(e.target.value)}
            className="px-3 py-2 w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <button
          className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700"
          onClick={handleAddArtistClick}
        >
          + Add new artist
        </button>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Birth Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tổng lượt nghe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentArtists.map((artist) => (
              <tr key={artist.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {artist.id}
                </td>
                <td className="px-6 py-4">
                  <img
                    src={
                      artist.image_url
                        ? `${api.defaults.baseURL}${artist.image_url}`
                        : "https://via.placeholder.com/40"
                    }
                    alt={artist.name}
                    className="w-10 h-10 object-cover rounded-full"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {artist.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {artist.birth_year || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(artist.total_listens || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    className="text-gray-600 hover:text-gray-900 mr-3"
                    onClick={() => handleEditArtistClick(artist)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => deleteArtist(artist.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {artistTotalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center space-x-2">
          <button
            onClick={() => paginateArtists(artistCurrentPage - 1)}
            disabled={artistCurrentPage === 1}
            className="px-3 py-1 text-sm font-medium text-gray-600 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          {Array.from({ length: artistTotalPages }, (_, i) => i + 1).map(
            (number) => (
              <button
                key={number}
                onClick={() => paginateArtists(number)}
                className={`px-3 py-1 text-sm font-medium rounded-md border ${
                  artistCurrentPage === number
                    ? "bg-gray-600 text-white border-gray-600"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {number}
              </button>
            )
          )}
          <button
            onClick={() => paginateArtists(artistCurrentPage + 1)}
            disabled={artistCurrentPage === artistTotalPages}
            className="px-3 py-1 text-sm font-medium text-gray-600 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      )}
    </section>
  );
}

export default AdminArtistPage;
