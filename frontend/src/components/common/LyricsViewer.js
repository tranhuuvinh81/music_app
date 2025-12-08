// // frontend/src/components/common/LyricsViewer.js
// import React, {
//   useContext,
//   useMemo,
//   useEffect,
//   useLayoutEffect,
//   useRef,
//   useState,
// } from "react";
// import { AudioContext } from "../../context/AudioContext";
// import api from "../../api/api";

// // Hàm helper parseLRC
// const parseLRC = (lrcString) => {
//   if (!lrcString) return [];

//   const lines = lrcString.split("\n");
//   const parsed = [];
//   const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

//   for (const line of lines) {
//     const match = line.match(timeRegex);
//     if (match) {
//       const minutes = parseInt(match[1], 10);
//       const seconds = parseInt(match[2], 10);
//       const milliseconds = parseInt(match[3].padEnd(3, "0"), 10);
//       const time = minutes * 60 + seconds + milliseconds / 1000;
//       const text = line.substring(match[0].length).trim();

//       if (text || line.trim() === match[0]) {
//         parsed.push({ time, text: text || "..." });
//       }
//     }
//   }
//   return parsed.sort((a, b) => a.time - b.time);
// };

// function LyricsViewer() {
//   const { currentLyricsUrl, currentTime } = useContext(AudioContext);
//   const [lrcContent, setLrcContent] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const activeLineRef = useRef(null);
//   const containerRef = useRef(null);
//   const [translateY, setTranslateY] = useState(0);

//   // useEffect để tải file .lrc
//   useEffect(() => {
//     if (!currentLyricsUrl) {
//       setLrcContent(null);
//       return;
//     }
//     const fetchLyrics = async () => {
//       setIsLoading(true);
//       try {
//         const fullUrl = `${api.defaults.baseURL}${currentLyricsUrl}`;
//         const response = await fetch(fullUrl);
//         if (!response.ok) {
//           throw new Error(`Không tìm thấy file lyric (lỗi ${response.status})`);
//         }
//         const text = await response.text();
//         setLrcContent(text);
//       } catch (err) {
//         console.error("LyricsViewer: Lỗi khi tải file lyric:", err);
//         setLrcContent(null);
//       }
//       setIsLoading(false);
//     };
//     fetchLyrics();
//   }, [currentLyricsUrl]);

//   const parsedLyrics = useMemo(() => {
//     const result = parseLRC(lrcContent);
//     return result;
//   }, [lrcContent]);

//   const activeLineIndex = useMemo(() => {
//     if (parsedLyrics.length === 0) return -1;
//     let index = parsedLyrics.findIndex((line) => line.time > currentTime);
//     if (index === -1) {
//       return parsedLyrics.length - 1;
//     }
//     return Math.max(0, index - 1);
//   }, [currentTime, parsedLyrics]);

//   useLayoutEffect(() => {
//     if (
//       containerRef.current &&
//       activeLineRef.current &&
//       parsedLyrics.length > 0
//     ) {
//       const containerHeight = containerRef.current.clientHeight;
//       const activeLine = activeLineRef.current;

//       const activeLineHeight = activeLine.clientHeight;
//       const activeLineOffsetTop = activeLine.offsetTop;

//       // đưa dòng active vào chính giữa
//       const newTranslateY =
//         -activeLineOffsetTop + containerHeight / 2 - activeLineHeight / 2;
//       setTranslateY(newTranslateY);
//     }
//   }, [activeLineIndex, parsedLyrics]);

//   if (isLoading) {
//     return (
//       <div className="h-full w-full flex flex-col items-center justify-center text-zinc-400 animate-pulse">
//         <svg className="w-12 h-12 mb-4 text-[#7Ab2D3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//         </svg>
//         <p className="text-sm">Đang tải lời bài hát...</p>
//       </div>
//     );
//   }

//   if (!lrcContent || parsedLyrics.length === 0) {
//     return (
//       <div className="h-full w-full flex flex-col items-center justify-center text-zinc-500">
//         <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//         </svg>
//         <p className="text-sm">Không có lời bài hát cho bài này.</p>
//       </div>
//     );
//   }

//   return (
//     <div
//       ref={containerRef}
//       className="h-full w-full p-4 text-center relative overflow-hidden"
//     >
//       <ul
//         className="space-y-3 absolute left-0 right-0 px-4"
//         style={{
//           transform: `translateY(${translateY}px)`,
//           transition: "transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
//         }}
//       >
//         {/* Placeholder for centering effect */}
//         <li className="h-32" aria-hidden="true"></li>

//         {parsedLyrics.map((line, index) => {
//           const isActive = index === activeLineIndex;
//           const isUpcoming = index === activeLineIndex + 1;

//           // Base classes for all lines
//           let liClasses = "px-4 transition-all duration-500 ease-out w-full transform";

//           if (isActive) {
//             // Active line styling
//             liClasses += " text-white text-xl font-bold scale-100 opacity-100";
//             // Add a glow effect
//             liClasses += " [text-shadow:0_0_15px_rgba(122,178,211,0.8)]";
//           } else if (isUpcoming) {
//             // Upcoming line styling (subtle hint)
//             liClasses += " text-zinc-300 text-base scale-100 opacity-70";
//           } else {
//             // Inactive lines styling
//             liClasses += " text-zinc-500 text-sm scale-95 opacity-50";
//           }
          
//           return (
//             <li
//               key={`${line.time}-${index}`}
//               ref={isActive ? activeLineRef : null}
//               className={liClasses}
//             >
//               {line.text}
//             </li>
//           );
//         })}

//         {/* Placeholder for centering effect */}
//         <li className="h-32" aria-hidden="true"></li>
//       </ul>
//     </div>
//   );
// }

// export default LyricsViewer;

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

// [NEW] Helper xử lý URL tài nguyên (tương tự AudioContext)
const getResourceUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url; // Link Cloudinary/Online
  return `${api.defaults.baseURL}${url}`; // Link Local
};

function LyricsViewer() {
  const { currentLyricsUrl, currentTime } = useContext(AudioContext);
  const [lrcContent, setLrcContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeLineRef = useRef(null);
  const containerRef = useRef(null);
  const [translateY, setTranslateY] = useState(0);

  // useEffect để tải file .lrc
  useEffect(() => {
    if (!currentLyricsUrl) {
      setLrcContent(null);
      return;
    }

    const fetchLyrics = async () => {
      setIsLoading(true);
      try {
        // [FIX] Sử dụng hàm helper để lấy URL đúng
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
    // Tìm dòng có thời gian > currentTime, dòng đang hát là dòng ngay trước đó
    let index = parsedLyrics.findIndex((line) => line.time > currentTime);
    
    if (index === -1) {
      // Nếu không tìm thấy dòng nào lớn hơn (đang ở cuối bài), highlight dòng cuối
      return parsedLyrics.length - 1;
    }
    // Trả về index - 1 (dòng hiện tại)
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

      const activeLineHeight = activeLine.clientHeight;
      const activeLineOffsetTop = activeLine.offsetTop;

      // Tính toán để đưa dòng active vào chính giữa container
      const newTranslateY =
        -activeLineOffsetTop + containerHeight / 2 - activeLineHeight / 2;
      setTranslateY(newTranslateY);
    }
  }, [activeLineIndex, parsedLyrics]); // Phụ thuộc vào index thay đổi để cuộn

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-zinc-400 animate-pulse">
        <svg className="w-12 h-12 mb-4 text-[#7Ab2D3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">Đang tải lời bài hát...</p>
      </div>
    );
  }

  if (!lrcContent || parsedLyrics.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-zinc-500">
        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm">Không có lời bài hát cho bài này.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full p-4 text-center relative overflow-hidden mask-linear-fade" // Thêm class mask nếu cần hiệu ứng mờ trên dưới
    >
      <ul
        className="space-y-6 absolute left-0 right-0 px-4 will-change-transform" // Tăng space-y để thoáng hơn
        style={{
          transform: `translateY(${translateY}px)`,
          transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)", // Giảm time chút cho mượt
        }}
      >
        {/* Placeholder trên cùng để có thể cuộn dòng đầu tiên vào giữa */}
        {/* <li className="h-[40vh]" aria-hidden="true"></li> */} 
        {/* Logic tính toán translateY đã xử lý center nên ko cần placeholder lớn, 
            nhưng giữ padding an toàn */}
        
        {parsedLyrics.map((line, index) => {
          const isActive = index === activeLineIndex;
          const isUpcoming = index === activeLineIndex + 1;

          // Style cơ bản
          let liClasses = "px-4 transition-all duration-500 ease-out w-full transform cursor-default";

          if (isActive) {
            // Dòng đang hát: To, Sáng, Đậm
            liClasses += " text-white text-2xl md:text-3xl font-bold scale-105 opacity-100 py-2";
            liClasses += " drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]";
          } else if (isUpcoming) {
            // Dòng sắp tới: Hơi sáng
            liClasses += " text-zinc-400 text-lg md:text-xl scale-100 opacity-60";
          } else {
            // Dòng xa: Mờ, Nhỏ
            liClasses += " text-zinc-600 text-base md:text-lg scale-95 opacity-30 blur-[0.5px]";
          }
          
          return (
            <li
              key={`${line.time}-${index}`}
              ref={isActive ? activeLineRef : null}
              className={liClasses}
              // onClick={() => { /* Có thể thêm tính năng click để tua nhạc tại đây */ }}
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