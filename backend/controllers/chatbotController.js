// // backend/controllers/chatbotController.js
// import fetch from 'node-fetch';
// import db from "../config/db.js";

// // --- HÀM HELPER: LẤY VÀ FORMAT TẤT CẢ BÀI HÁT ---
// const getFormattedSongList = () => {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT 
//         s.id, s.title, s.genre, s.country,
//         GROUP_CONCAT(a.name SEPARATOR ', ') AS artists
//       FROM songs s
//       LEFT JOIN song_artists sa ON s.id = sa.song_id
//       LEFT JOIN artists a ON sa.artist_id = a.id
//       GROUP BY s.id;
//     `;
//     db.query(query, (err, songs) => {
//       if (err) {
//         console.error("Lỗi khi lấy danh sách bài hát cho chatbot:", err);
//         return reject(new Error("Lỗi khi đọc database"));
//       }
//       const formattedList = songs.map(song => 
//         `ID ${song.id}: ${song.title} - ${song.artists || 'N/A'} (Thể loại: ${song.genre || 'N/A'}, Quốc gia: ${song.country || 'N/A'})`
//       ).join('\n');
//       resolve(formattedList); // Chỉ cần chuỗi string
//     });
//   });
// };

// const fetchArtistsForSongs = (songs) => {
//   return new Promise((resolve, reject) => {
//     if (!songs || songs.length === 0) {
//       return resolve([]);
//     }
//     const songIds = songs.map((song) => song.id);
//     const query = `
//       SELECT sa.song_id, a.id, a.name, a.image_url 
//       FROM song_artists sa
//       JOIN artists a ON sa.artist_id = a.id
//       WHERE sa.song_id IN (?)
//     `;
//     db.query(query, [songIds], (err, artistLinks) => {
//       if (err) return reject(err);
//       const songsWithArtists = songs.map((song) => {
//         const artists = artistLinks
//           .filter((link) => link.song_id === song.id)
//           .map((link) => ({
//             id: link.id,
//             name: link.name,
//             image_url: link.image_url,
//           }));
//         return { ...song, artists: artists };
//       });
//       resolve(songsWithArtists);
//     });
//   });
// };

// // --- HÀM GỌI GEMINI ---
// const fetchGeminiSuggestionsFromApi = async (userPrompt, songListString) => {
//   const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
//   if (!apiKey) {
//     throw new Error("Chưa cấu hình API key cho chatbot.");
//   }
  
//   const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

//   const systemPrompt = `
//     Bạn là một DJ chuyên nghiệp. Nhiệm vụ của bạn là xem một DANH SÁCH BÀI HÁT CÓ SẴN và một YÊU CẦU CỦA NGƯỜI DÙNG.
//     Bạn phải chọn ra tối đa 5 ID bài hát từ danh sách phù hợp nhất với yêu cầu.

//     QUY TẮC TUYỆT ĐỐI:
//     - KHÔNG trả lời bằng câu chat.
//     - KHÔNG giải thích lựa chọn.
//     - KHÔNG thêm bất kỳ chữ nào khác.
//     - CHỈ trả về một danh sách các ID (ví dụ: "29, 8, 21").
//     - Nếu không tìm thấy bài nào, trả về một chuỗi rỗng.
//   `;
  
//   // PROMT GHÉP DANH SÁCH VÀ YÊU CẦU
//   const fullPrompt = `
//     Đây là danh sách bài hát có sẵn:
//     ---
//     ${songListString}
//     ---

//     Yêu cầu của người dùng: "${userPrompt}"

//     Chỉ trả về TỐI ĐA 5 ID bài hát phù hợp nhất, cách nhau bằng dấu phẩy:
//   `;

//   const payload = {
//     contents: [{ parts: [{ text: fullPrompt }] }],
//     systemInstruction: { parts: [{ text: systemPrompt }] },
//     safetySettings: [
//         { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
//         { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
//         { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
//         { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
//     ]
//   };

//   try {
//     const response = await fetch(apiUrl, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload)
//     });

//     if (!response.ok) {
//       throw new Error(`API call failed with status: ${response.status}`);
//     }

//     const result = await response.json();
//     const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
//     if (!text && result.candidates?.[0]?.finishReason === "SAFETY") {
//         return ""; // Bị chặn vì an toàn, trả về rỗng
//     }
    
//     return (text || "").trim(); // Trả về chuỗi ID, vd: "29, 8, 21"

//   } catch (error) {
//     console.error("Lỗi khi gọi Gemini API từ Backend:", error);
//     throw new Error("Lỗi khi gọi Gemini");
//   }
// };

// export const getChatbotSuggestion = async (req, res) => {
//   const { prompt } = req.body;
//   if (!prompt) {
//     return res.status(400).json({ error: "Thiếu prompt" });
//   }

//   try {
//     // Bước A: Lấy danh sách bài hát (cho Gemini)
//     const songString = await getFormattedSongList(); // Chỉ cần chuỗi string
//     if (!songString) {
//       return res.json({ songs: [] }); // Không có bài hát nào trong DB
//     }

//     // Bước B & C: Gọi Gemini để lấy chuỗi ID (vd: "8, 29, 21")
//     const idString = await fetchGeminiSuggestionsFromApi(prompt, songString);
//     if (!idString) {
//       return res.json({ songs: [] }); // Gemini không tìm thấy
//     }

//     // Bước D: Parse ID
//     const suggestedIds = idString.split(',').map(id => parseInt(id.trim())).filter(Number.isInteger);
//     if (suggestedIds.length === 0) {
//       return res.json({ songs: [] });
//     }

//     // LẤY THÔNG TIN BÀI HÁT ĐẦY ĐỦ TỪ DB
//     const getFullSongsQuery = `
//       SELECT id, title, album, genre, release_year, country, file_url, image_url, lyrics_url, listen_count, created_at
//       FROM songs 
//       WHERE id IN (?)
//     `;
    
//     db.query(getFullSongsQuery, [suggestedIds], async (err, songResults) => {
//         if (err) {
//             console.error("Lỗi khi lấy thông tin bài hát đầy đủ:", err);
//             return res.status(500).json({ error: "Lỗi khi lấy dữ liệu bài hát" });
//         }

//         // GẮN THÔNG TIN NGHỆ SĨ ĐẦY ĐỦ
//         const songsWithArtists = await fetchArtistsForSongs(songResults);

//         // Sắp xếp kết quả trả về theo đúng thứ tự Gemini đã gợi ý
//         const sortedSongs = suggestedIds
//             .map(id => songsWithArtists.find(song => song.id === id))
//             .filter(Boolean); // Lọc ra những bài hát thực sự tìm thấy

//         // Trả về mảng các object bài hát ĐẦY ĐỦ
//         res.json({ songs: sortedSongs });
//     });

//   } catch (error) {
//     console.error("Lỗi trong getChatbotSuggestion:", error.message);
//     res.status(500).json({ error: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau." });
//   }
// };

// backend/controllers/chatbotController.js
import fetch from 'node-fetch'; // Đảm bảo đã cài: npm install node-fetch
import db from "../config/db.js";

// Wrapper Promise cho DB
const promiseDb = db.promise();

// --- 1. HÀM HELPER: LẤY DANH SÁCH BÀI HÁT ---
const getFormattedSongList = async () => {
  try {
    const query = `
      SELECT s.id, s.title, s.genre, s.country, GROUP_CONCAT(a.name SEPARATOR ', ') AS artists
      FROM songs s
      LEFT JOIN song_artists sa ON s.id = sa.song_id
      LEFT JOIN artists a ON sa.artist_id = a.id
      GROUP BY s.id;
    `;
    const [songs] = await promiseDb.query(query);
    
    if (!songs || songs.length === 0) return null;

    // Format dữ liệu text để gửi cho AI
    return songs.map(song => 
      `ID:${song.id}|${song.title}|${song.artists}|${song.genre}`
    ).join('\n');
  } catch (err) {
    console.error("❌ Lỗi DB:", err.message);
    throw new Error("Lỗi đọc database");
  }
};

// --- 2. HÀM GỌI GEMINI (DIRECT REST API) ---
// Cách này không dùng SDK, tránh được lỗi version mapping
const fetchGeminiDirect = async (userPrompt, songListString) => {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ Thiếu API Key");
    throw new Error("Server chưa cấu hình API Key");
  }

  // [QUAN TRỌNG] URL Cứng của Google (v1beta + model 1.5-flash)
  // Đây là endpoint chuẩn nhất hiện tại cho tài khoản Free
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{
        text: `
          Bạn là một DJ âm nhạc chuyên nghiệp.
          NHIỆM VỤ: Chọn ra 5 bài hát từ danh sách dưới đây phù hợp nhất với yêu cầu: "${userPrompt}".
          
          DANH SÁCH BÀI HÁT:
          ${songListString}

          YÊU CẦU ĐẦU RA:
          1. CHỈ trả về các con số ID, cách nhau bởi dấu phẩy. Ví dụ: "10, 25, 3".
          2. KHÔNG giải thích, KHÔNG chào hỏi, KHÔNG markdown.
          3. Nếu không tìm thấy, chọn ngẫu nhiên 3 ID.
        `
      }]
    }],
    generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 100,
    }
  };

  try {
    console.log(`📡 Đang gửi request tới URL: .../models/gemini-1.5-flash:generateContent`);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // Xử lý lỗi từ Google trả về
    if (!response.ok) {
      console.error("❌ Google API Error Detail:", JSON.stringify(data, null, 2));
      throw new Error(`Google API lỗi: ${data.error?.message || response.statusText}`);
    }

    // Lấy text trả về an toàn
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("✅ Gemini Response:", text);
    
    return text || "";

  } catch (error) {
    console.error("❌ Lỗi Fetch Gemini:", error.message);
    throw error;
  }
};

// --- 3. CONTROLLER CHÍNH ---
export const getChatbotSuggestion = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Thiếu prompt" });

  try {
    // A. Lấy Data Nhạc
    const songString = await getFormattedSongList();
    if (!songString) return res.json({ songs: [] });

    // B. Gọi AI
    const idString = await fetchGeminiDirect(prompt, songString);

    // C. Parse ID (Chỉ lấy số)
    const matches = idString.match(/\d+/g);
    const suggestedIds = matches ? matches.map(Number) : [];

    if (suggestedIds.length === 0) {
        console.warn("⚠️ AI không trả về ID hợp lệ.");
        return res.json({ songs: [] });
    }

    // D. Query chi tiết bài hát từ ID
    const [songs] = await promiseDb.query(`
      SELECT s.*, GROUP_CONCAT(a.name SEPARATOR ', ') as artist_names
      FROM songs s
      LEFT JOIN song_artists sa ON s.id = sa.song_id
      LEFT JOIN artists a ON sa.artist_id = a.id
      WHERE s.id IN (?)
      GROUP BY s.id
    `, [suggestedIds]);

    // E. Format & Sort
    const formattedSongs = songs.map(s => ({
        ...s,
        artists: s.artist_names ? s.artist_names.split(', ').map(name => ({ name })) : []
    }));

    const sortedSongs = suggestedIds
        .map(id => formattedSongs.find(s => s.id === id))
        .filter(Boolean);

    res.json({ songs: sortedSongs });

  } catch (error) {
    console.error("🔥 Controller Error:", error.message);
    res.status(500).json({ error: "Lỗi xử lý server: " + error.message });
  }
};