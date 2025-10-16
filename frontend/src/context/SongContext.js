// frontend/src/context/SongContext.js
import React, { createContext, useState, useEffect } from 'react';
import api from '../api/api';

export const SongContext = createContext();

export const SongProvider = ({ children }) => {
  const [songs, setSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');

  const performSearch = (query) => {
    setActiveQuery(query); // Cập nhật activeQuery với query được truyền vào
  };

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const endpoint = activeQuery ? `/api/songs/search?q=${encodeURIComponent(activeQuery)}` : '/api/songs';
        const res = await api.get(endpoint);
        setSongs(res.data);
      } catch (err) {
        console.error(err);
        setSongs([]); // Đặt songs là mảng rỗng nếu có lỗi, hỗ trợ hiển thị "Không tìm thấy kết quả"
      }
    };
    fetchSongs();
  }, [activeQuery]);

  return (
    <SongContext.Provider value={{ songs, searchQuery, setSearchQuery, performSearch }}>
      {children}
    </SongContext.Provider>
  );
};