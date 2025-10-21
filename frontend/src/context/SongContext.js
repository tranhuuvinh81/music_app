import React, { createContext, useState, useCallback } from 'react';
import api from "../api/api";

export const SongContext = createContext();

export const SongProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  // State holds both song and artist results
  const [searchResults, setSearchResults] = useState({ songs: [], artists: [] });
  const [isLoading, setIsLoading] = useState(false);

  // Function to call the combined search API
  const performSearch = useCallback(async (query) => {
    if (!query) {
      setSearchResults({ songs: [], artists: [] }); // Clear results if query is empty
      return;
    }
    setIsLoading(true);
    try {
      // Calls the backend endpoint /api/search?q=...
      const res = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
      setSearchResults(res.data); // Expects { songs: [...], artists: [...] }
    } catch (err) {
      console.error("Lỗi khi tìm kiếm:", err); // Log error from API call
      setSearchResults({ songs: [], artists: [] }); // Clear results on error
    }
    setIsLoading(false);
  }, []);

  // Removed the old useEffect that fetched /api/songs or /api/songs/search

  return (
    <SongContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        searchResults, // Provide the combined results
        isLoading,
        performSearch
      }}
    >
      {children}
    </SongContext.Provider>
  );
};