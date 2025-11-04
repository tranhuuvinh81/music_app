import React, { createContext, useState, useCallback } from 'react';
import api from "../api/api";

export const SongContext = createContext();

export const SongProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ songs: [], artists: [] });
  const [isLoading, setIsLoading] = useState(false);

  const performSearch = useCallback(async (query) => {
    if (!query) {
      setSearchResults({ songs: [], artists: [] });
      return;
    }
    setIsLoading(true);
    try {
      // gọi API tìm kiếm
      const res = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
      setSearchResults(res.data); // mong đợi dữ liệu có dạng { songs: [...], artists: [...] }
    } catch (err) {
      console.error("Lỗi khi tìm kiếm:", err);
      setSearchResults({ songs: [], artists: [] });
    }
    setIsLoading(false);
  }, []);

  return (
    <SongContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        searchResults, // cung cấp kết quả tìm kiếm
        isLoading,
        performSearch
      }}
    >
      {children}
    </SongContext.Provider>
  );
};