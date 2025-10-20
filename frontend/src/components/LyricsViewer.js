// frontend/src/components/LyricsViewer.js
import React, { useContext, useMemo, useEffect, useRef, useState } from 'react';
import { AudioContext } from '../context/AudioContext';
import api from '../api/api';

// Hàm helper parseLRC không đổi
const parseLRC = (lrcString) => {
  if (!lrcString) return [];
  
  const lines = lrcString.split('\n');
  const parsed = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3].padEnd(3, '0'), 10); 
      const time = minutes * 60 + seconds + milliseconds / 1000;
      const text = line.substring(match[0].length).trim();
      
      if (text || line.trim() === match[0]) {
        parsed.push({ time, text: text || '...' });
      }
    }
  }
  return parsed.sort((a, b) => a.time - b.time);
};

function LyricsViewer() {
  const { currentLyricsUrl, currentTime } = useContext(AudioContext);
  const [lrcContent, setLrcContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const activeLineRef = useRef(null);
  const containerRef = useRef(null); 
  const [translateY, setTranslateY] = useState(0);

  // useEffect để tải file .lrc (không đổi)
  useEffect(() => {
    if (!currentLyricsUrl) {
      console.log("LyricsViewer: Không có lyrics_url, dừng lại.");
      setLrcContent(null);
      return;
    }
    const fetchLyrics = async () => {
      setIsLoading(true);
      try {
        const fullUrl = `${api.defaults.baseURL}${currentLyricsUrl}`;
        const response = await fetch(fullUrl); 
        if (!response.ok) {
          throw new Error(`Không tìm thấy file lyric (lỗi ${response.status})`);
        }
        const text = await response.text();
        setLrcContent(text);
      } catch (err) {
        console.error("LyricsViewer: Lỗi khi tải file lyric:", err);
        setLrcContent(null);
      }
      setIsLoading(false);
    };
    fetchLyrics();
  }, [currentLyricsUrl]);

  const parsedLyrics = useMemo(() => {
    const result = parseLRC(lrcContent);
    return result;
  }, [lrcContent]);

  const activeLineIndex = useMemo(() => {
    if (parsedLyrics.length === 0) return -1;
    let index = parsedLyrics.findIndex(line => line.time > currentTime);
    if (index === -1) {
      return parsedLyrics.length - 1;
    }
    return Math.max(0, index - 1);
  }, [currentTime, parsedLyrics]);
  
  // Effect tính toán và cập nhật translateY để tạo hiệu ứng trượt mượt mà (không đổi)
  useEffect(() => {
    if (containerRef.current && activeLineRef.current && parsedLyrics.length > 0) {
      const containerHeight = containerRef.current.clientHeight;
      const activeLine = activeLineRef.current;
      const activeLineHeight = activeLine.clientHeight;
      const activeLineOffsetTop = activeLine.offsetTop;
      const newTranslateY = -(activeLineOffsetTop) + (containerHeight / 2) - (activeLineHeight / 2);
      setTranslateY(newTranslateY);
    }
  }, [activeLineIndex, parsedLyrics]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Đang tải lời bài hát...
      </div>
    );
  }

  if (!lrcContent || parsedLyrics.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Không có lời bài hát cho bài này.
      </div>
    );
  }

  return (
    // Container chính, căn giữa và ẩn phần thừa
    <div ref={containerRef} className="h-full w-full p-4 text-center scrollbar-hide relative overflow-hidden">
      {/* Danh sách lời bài hát, được dịch chuyển bằng transform */}
      <ul 
        className="space-y-4 py-24 absolute left-0 right-0 transition-transform duration-700 ease-out" 
        style={{ transform: `translateY(${translateY}px)` }}
      >
        {parsedLyrics.map((line, index) => {
          const isActive = index === activeLineIndex;
          
          // 👉 THAY ĐỔI: Logic 3 trạng thái cho từng dòng lời
          let liClasses = 'px-4 transition-all duration-500 ease-in-out break-words'; // Thêm break-words và padding ngang

          if (isActive) {
            // Dòng đang hát: to nhất, đậm nhất, rõ nhất
            liClasses += ' text-lg md:text-base font-bold text-white scale-100 opacity-100';
          } else if (index < activeLineIndex) {
            // Dòng đã qua: nhỏ hơn, mờ hơn
            liClasses += ' text-sm md:text-xs text-gray-400 scale-90 opacity-60';
          } else {
            // Dòng sắp tới: nhỏ hơn, mờ hơn (màu nhạt hơn dòng đã qua một chút)
            liClasses += ' text-sm md:text-xs text-gray-500 scale-90 opacity-60';
          }

          return (
            <li
              key={`${line.time}-${index}`}
              ref={isActive ? activeLineRef : null} 
              className={liClasses}
            >
              {line.text}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default LyricsViewer;