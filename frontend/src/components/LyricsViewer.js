// frontend/src/components/LyricsViewer.js
import React, { useContext, useMemo, useEffect, useRef, useState } from 'react';
import { AudioContext } from '../context/AudioContext';
import api from '../api/api'; // Dùng để lấy baseURL

// 1. Hàm helper để phân tích chuỗi LRC
// Input: "[00:10.75]Dòng lyric..."
// Output: { time: 10.75, text: "Dòng lyric..." }
const parseLRC = (lrcString) => {
  if (!lrcString) return [];
  
  const lines = lrcString.split('\n');
  const parsed = [];

  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/; // [mm:ss.xx] hoặc [mm:ss.xxx]

  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      // Xử lý 2 hoặc 3 số miligiây
      const milliseconds = parseInt(match[3].padEnd(3, '0'), 10); 
      
      const time = minutes * 60 + seconds + milliseconds / 1000;
      
      const text = line.substring(match[0].length).trim();
      
      if (text || line.trim() === match[0]) { // Giữ cả dòng trống (nếu có nhạc dạo)
        parsed.push({ time, text: text || '...' }); // Thay dòng trống bằng '...'
      }
    }
  }
  return parsed.sort((a, b) => a.time - b.time);
};

function LyricsViewer() {
  // Lấy URL và currentTime từ Context
  const { currentLyricsUrl, currentTime } = useContext(AudioContext);
  
  // State nội bộ để lưu nội dung file .lrc
  const [lrcContent, setLrcContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const activeLineRef = useRef(null); // Ref cho dòng lyric đang active

  // 2. useEffect để TẢI file .lrc khi URL thay đổi
  // 👇 THAY THẾ TOÀN BỘ useEffect NÀY BẰNG ĐOẠN CODE BÊN DƯỚI
  useEffect(() => {
    if (!currentLyricsUrl) {
      console.log("LyricsViewer: Không có lyrics_url, dừng lại.");
      setLrcContent(null);
      return;
    }

    const fetchLyrics = async () => {
      setIsLoading(true);
      console.log("LyricsViewer: Bắt đầu tải lyrics từ:", currentLyricsUrl);
      
      try {
        const fullUrl = `${api.defaults.baseURL}${currentLyricsUrl}`;
        console.log("LyricsViewer: URL đầy đủ là:", fullUrl);

        const response = await fetch(fullUrl); 
        
        console.log("LyricsViewer: Trạng thái fetch:", response.status, response.statusText);

        if (!response.ok) {
          throw new Error(`Không tìm thấy file lyric (lỗi ${response.status})`);
        }
        
        const text = await response.text();
        console.log("LyricsViewer: Tải thành công! Nội dung file (100 ký tự đầu):", text.substring(0, 100));
        
        setLrcContent(text); // Kích hoạt useMemo để parse

      } catch (err) {
        console.error("LyricsViewer: Lỗi khi tải file lyric:", err);
        setLrcContent(null);
      }
      setIsLoading(false);
    };

    fetchLyrics();
  }, [currentLyricsUrl]);// Chạy lại khi đổi bài (url thay đổi)

  // 3. Phân tích LRC (Phụ thuộc vào lrcContent)
// 👇 THÊM CONSOLE LOG NÀY VÀO SAU useMemo
  const parsedLyrics = useMemo(() => {
    const result = parseLRC(lrcContent);
    // Log kết quả của việc parse
    console.log("LyricsViewer: Kết quả parse:", result);
    return result;
  }, [lrcContent]);
  // 4. Tìm dòng active
  const activeLineIndex = useMemo(() => {
    if (parsedLyrics.length === 0) return -1;
    
    // Tìm index của dòng lyric ĐẦU TIÊN có 'time' > 'currentTime'
    let index = parsedLyrics.findIndex(line => line.time > currentTime);
    
    if (index === -1) {
      // Nếu không tìm thấy (đang ở cuối bài), active dòng cuối
      return parsedLyrics.length - 1;
    }
    // Nếu không, active dòng ngay TRƯỚC ĐÓ
    return Math.max(0, index - 1);

  }, [currentTime, parsedLyrics]);
  
  // 5. Tự động cuộn
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center', // Cuộn vào giữa
      });
    }
  }, [activeLineIndex]); // Kích hoạt mỗi khi dòng active thay đổi

  // 6. Render
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
    <div className="h-full overflow-y-auto p-4 text-center scrollbar-hide">
      <ul className="space-y-5 py-24"> 
        {/* Thêm padding trên dưới để dòng đầu/cuối có thể cuộn vào giữa */}
        {parsedLyrics.map((line, index) => {
          const isActive = index === activeLineIndex;
          return (
            <li
              key={`${line.time}-${index}`}
              ref={isActive ? activeLineRef : null} 
              className={`
                text-xl md:text-2xl transition-all duration-300 ease-in-out
                ${isActive 
                  ? 'font-bold text-white scale-105' // Nổi bật dòng active
                  : 'text-gray-500' // Làm mờ dòng không active
                }
              `}
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