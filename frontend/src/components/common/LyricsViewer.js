// frontend/src/components/common/LyricsViewer.js
import React, {
  useContext,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AudioContext } from "../../context/AudioContext";
import api from "../../api/api";

// Hàm helper parseLRC (Giữ nguyên)
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

// Helper xử lý URL tài nguyên
const getResourceUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${api.defaults.baseURL}${url}`;
};

function LyricsViewer() {
  const { currentLyricsUrl, currentTime } = useContext(AudioContext);
  const [lrcContent, setLrcContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeLineRef = useRef(null);
  const containerRef = useRef(null);
  const [translateY, setTranslateY] = useState(0);

  // useEffect tải file .lrc (Giữ nguyên)
  useEffect(() => {
    if (!currentLyricsUrl) {
      setLrcContent(null);
      return;
    }

    const fetchLyrics = async () => {
      setIsLoading(true);
      try {
        const fullUrl = getResourceUrl(currentLyricsUrl);
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
      const activeLineOffsetTop = activeLine.offsetTop;
      const activeLineHeight = activeLine.clientHeight;

      const newTranslateY =
        -activeLineOffsetTop + containerHeight / 2 - activeLineHeight / 2;
      setTranslateY(newTranslateY);
    }
  }, [activeLineIndex, parsedLyrics]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-zinc-400 animate-pulse">
        <svg className="w-10 h-10 md:w-12 md:h-12 mb-4 text-[#7Ab2D3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-xs md:text-sm">Đang tải lời bài hát...</p>
      </div>
    );
  }

  if (!lrcContent || parsedLyrics.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-zinc-500">
        <svg className="w-10 h-10 md:w-12 md:h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs md:text-sm">Không có lời bài hát cho bài này.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full min-h-0 w-full p-2 md:p-4 text-center relative overflow-hidden mask-linear-fade"
    >
      <ul
        className="space-y-4 md:space-y-6 absolute left-0 right-0 px-2 md:px-4 will-change-transform"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        {parsedLyrics.map((line, index) => {
          const isActive = index === activeLineIndex;
          const isUpcoming = index === activeLineIndex + 1;

          // Responsive Text Classes
          let liClasses = "px-2 md:px-4 transition-all duration-500 ease-out w-full transform cursor-default leading-relaxed";

          if (isActive) {
            // Mobile: text-xl, Desktop: text-3xl
            liClasses += " text-white text-xl md:text-3xl font-bold scale-105 opacity-100 py-1 md:py-2";
            liClasses += " drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]";
          } else if (isUpcoming) {
            // Mobile: text-base, Desktop: text-xl
            liClasses += " text-zinc-400 text-base md:text-xl scale-100 opacity-60";
          } else {
            // Mobile: text-sm, Desktop: text-lg
            liClasses += " text-zinc-600 text-sm md:text-lg scale-95 opacity-30 blur-[0.5px]";
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
