// frontend/src/components/LyricsViewer.js
import React, {
  useContext,
  useMemo,
  useEffect,
  useLayoutEffect, // 👈 1. Import useLayoutEffect
  useRef,
  useState,
} from "react";
import { AudioContext } from "../context/AudioContext";
import api from "../api/api";

// Hàm helper parseLRC (không đổi)
const parseLRC = (lrcString) => {
  if (!lrcString) return [];

  const lines = lrcString.split("\n");
  const parsed = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3].padEnd(3, "0"), 10);
      const time = minutes * 60 + seconds + milliseconds / 1000;
      const text = line.substring(match[0].length).trim();

      if (text || line.trim() === match[0]) {
        parsed.push({ time, text: text || "..." });
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
    let index = parsedLyrics.findIndex((line) => line.time > currentTime);
    if (index === -1) {
      return parsedLyrics.length - 1;
    }
    return Math.max(0, index - 1);
  }, [currentTime, parsedLyrics]);

  useLayoutEffect(() => {
    if (
      containerRef.current &&
      activeLineRef.current &&
      parsedLyrics.length > 0
    ) {
      const containerHeight = containerRef.current.clientHeight;
      const activeLine = activeLineRef.current;

      // Đọc layout (chiều cao, vị trí) sau khi các class CSS mới đã được áp dụng
      const activeLineHeight = activeLine.clientHeight;
      const activeLineOffsetTop = activeLine.offsetTop;

      // Tính toán để đưa dòng active vào chính giữa
      const newTranslateY =
        -(activeLineOffsetTop) + containerHeight / 2 - activeLineHeight / 2;
      setTranslateY(newTranslateY);
    }
  }, [activeLineIndex, parsedLyrics]); // Vẫn phụ thuộc vào activeLineIndex

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
    // Container chính, ẩn phần thừa
    <div
      ref={containerRef}
      className="h-full w-full p-4 text-center scrollbar-hide relative overflow-hidden"
    >
      {/* Danh sách lời bài hát, được dịch chuyển bằng transform */}
      <ul
        className="space-y-4 absolute left-0 right-0" // Giữ padding trên/dưới ở đây
        style={{
          transform: `translateY(${translateY}px)`,
          // Dùng transition mượt mà cho thuộc tính transform
          transition: "transform 0.5s ease-out",
        }}
      >
        {/* Thêm một khoảng đệm ở trên để dòng đầu tiên có thể cuộn vào giữa */}
        <li className="h-24" aria-hidden="true"></li>

        {parsedLyrics.map((line, index) => {
          const isActive = index === activeLineIndex;

          let liClasses = `
            px-4 transition-all duration-300 ease-in-out
            w-full
          `;

          if (isActive) {
            // Lời chính: To, rõ, sáng (font nhỏ hơn một chút so với trước)
            liClasses +=
              " text-lg md:text-base font-bold text-white scale-100 opacity-100";
          } else {
            // Lời phụ: Nhỏ hơn 1 cấp, mờ
            liClasses +=
              " text-base md:text-sm text-gray-500 scale-95 opacity-50";
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

        {/* Thêm một khoảng đệm ở dưới để dòng cuối cùng có thể cuộn vào giữa */}
        <li className="h-24" aria-hidden="true"></li>
      </ul>
    </div>
  );
}

export default LyricsViewer;