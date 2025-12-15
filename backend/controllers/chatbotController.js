// // // backend/controllers/chatbotController.js
// // import fetch from 'node-fetch';
// // import db from "../config/db.js";

// // // --- HÀM HELPER: LẤY VÀ FORMAT TẤT CẢ BÀI HÁT ---
// // const getFormattedSongList = () => {
// //   return new Promise((resolve, reject) => {
// //     const query = `
// //       SELECT 
// //         s.id, s.title, s.genre, s.country,
// //         GROUP_CONCAT(a.name SEPARATOR ', ') AS artists
// //       FROM songs s
// //       LEFT JOIN song_artists sa ON s.id = sa.song_id
// //       LEFT JOIN artists a ON sa.artist_id = a.id
// //       GROUP BY s.id;
// //     `;
// //     db.query(query, (err, songs) => {
// //       if (err) {
// //         console.error("Lỗi khi lấy danh sách bài hát cho chatbot:", err);
// //         return reject(new Error("Lỗi khi đọc database"));
// //       }
// //       const formattedList = songs.map(song => 
// //         `ID ${song.id}: ${song.title} - ${song.artists || 'N/A'} (Thể loại: ${song.genre || 'N/A'}, Quốc gia: ${song.country || 'N/A'})`
// //       ).join('\n');
// //       resolve(formattedList); // Chỉ cần chuỗi string
// //     });
// //   });
// // };

// // const fetchArtistsForSongs = (songs) => {
// //   return new Promise((resolve, reject) => {
// //     if (!songs || songs.length === 0) {
// //       return resolve([]);
// //     }
// //     const songIds = songs.map((song) => song.id);
// //     const query = `
// //       SELECT sa.song_id, a.id, a.name, a.image_url 
// //       FROM song_artists sa
// //       JOIN artists a ON sa.artist_id = a.id
// //       WHERE sa.song_id IN (?)
// //     `;
// //     db.query(query, [songIds], (err, artistLinks) => {
// //       if (err) return reject(err);
// //       const songsWithArtists = songs.map((song) => {
// //         const artists = artistLinks
// //           .filter((link) => link.song_id === song.id)
// //           .map((link) => ({
// //             id: link.id,
// //             name: link.name,
// //             image_url: link.image_url,
// //           }));
// //         return { ...song, artists: artists };
// //       });
// //       resolve(songsWithArtists);
// //     });
// //   });
// // };

// // // --- HÀM GỌI GEMINI ---
// // const fetchGeminiSuggestionsFromApi = async (userPrompt, songListString) => {
// //   const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
// //   if (!apiKey) {
// //     throw new Error("Chưa cấu hình API key cho chatbot.");
// //   }
  
// //   const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

// //   const systemPrompt = `
// //     Bạn là một DJ chuyên nghiệp. Nhiệm vụ của bạn là xem một DANH SÁCH BÀI HÁT CÓ SẴN và một YÊU CẦU CỦA NGƯỜI DÙNG.
// //     Bạn phải chọn ra tối đa 5 ID bài hát từ danh sách phù hợp nhất với yêu cầu.

// //     QUY TẮC TUYỆT ĐỐI:
// //     - KHÔNG trả lời bằng câu chat.
// //     - KHÔNG giải thích lựa chọn.
// //     - KHÔNG thêm bất kỳ chữ nào khác.
// //     - CHỈ trả về một danh sách các ID (ví dụ: "29, 8, 21").
// //     - Nếu không tìm thấy bài nào, trả về một chuỗi rỗng.
// //   `;
  
// //   // PROMT GHÉP DANH SÁCH VÀ YÊU CẦU
// //   const fullPrompt = `
// //     Đây là danh sách bài hát có sẵn:
// //     ---
// //     ${songListString}
// //     ---

// //     Yêu cầu của người dùng: "${userPrompt}"

// //     Chỉ trả về TỐI ĐA 5 ID bài hát phù hợp nhất, cách nhau bằng dấu phẩy:
// //   `;

// //   const payload = {
// //     contents: [{ parts: [{ text: fullPrompt }] }],
// //     systemInstruction: { parts: [{ text: systemPrompt }] },
// //     safetySettings: [
// //         { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
// //         { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
// //         { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
// //         { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
// //     ]
// //   };

// //   try {
// //     const response = await fetch(apiUrl, {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify(payload)
// //     });

// //     if (!response.ok) {
// //       throw new Error(`API call failed with status: ${response.status}`);
// //     }

// //     const result = await response.json();
// //     const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
// //     if (!text && result.candidates?.[0]?.finishReason === "SAFETY") {
// //         return ""; // Bị chặn vì an toàn, trả về rỗng
// //     }
    
// //     return (text || "").trim(); // Trả về chuỗi ID, vd: "29, 8, 21"

// //   } catch (error) {
// //     console.error("Lỗi khi gọi Gemini API từ Backend:", error);
// //     throw new Error("Lỗi khi gọi Gemini");
// //   }
// // };

// // export const getChatbotSuggestion = async (req, res) => {
// //   const { prompt } = req.body;
// //   if (!prompt) {
// //     return res.status(400).json({ error: "Thiếu prompt" });
// //   }

// //   try {
// //     // Bước A: Lấy danh sách bài hát (cho Gemini)
// //     const songString = await getFormattedSongList(); // Chỉ cần chuỗi string
// //     if (!songString) {
// //       return res.json({ songs: [] }); // Không có bài hát nào trong DB
// //     }

// //     // Bước B & C: Gọi Gemini để lấy chuỗi ID (vd: "8, 29, 21")
// //     const idString = await fetchGeminiSuggestionsFromApi(prompt, songString);
// //     if (!idString) {
// //       return res.json({ songs: [] }); // Gemini không tìm thấy
// //     }

// //     // Bước D: Parse ID
// //     const suggestedIds = idString.split(',').map(id => parseInt(id.trim())).filter(Number.isInteger);
// //     if (suggestedIds.length === 0) {
// //       return res.json({ songs: [] });
// //     }

// //     // LẤY THÔNG TIN BÀI HÁT ĐẦY ĐỦ TỪ DB
// //     const getFullSongsQuery = `
// //       SELECT id, title, album, genre, release_year, country, file_url, image_url, lyrics_url, listen_count, created_at
// //       FROM songs 
// //       WHERE id IN (?)
// //     `;
    
// //     db.query(getFullSongsQuery, [suggestedIds], async (err, songResults) => {
// //         if (err) {
// //             console.error("Lỗi khi lấy thông tin bài hát đầy đủ:", err);
// //             return res.status(500).json({ error: "Lỗi khi lấy dữ liệu bài hát" });
// //         }

// //         // GẮN THÔNG TIN NGHỆ SĨ ĐẦY ĐỦ
// //         const songsWithArtists = await fetchArtistsForSongs(songResults);

// //         // Sắp xếp kết quả trả về theo đúng thứ tự Gemini đã gợi ý
// //         const sortedSongs = suggestedIds
// //             .map(id => songsWithArtists.find(song => song.id === id))
// //             .filter(Boolean); // Lọc ra những bài hát thực sự tìm thấy

// //         // Trả về mảng các object bài hát ĐẦY ĐỦ
// //         res.json({ songs: sortedSongs });
// //     });

// //   } catch (error) {
// //     console.error("Lỗi trong getChatbotSuggestion:", error.message);
// //     res.status(500).json({ error: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau." });
// //   }
// // };

// // backend/controllers/chatbotController.js
// import fetch from 'node-fetch'; 

// export const getChatbotSuggestion = async (req, res) => {
//   const { prompt } = req.body;
  
//   // 1. Log để biết request đã tới Server
//   console.log("📩 [TEST] Nhận Prompt:", prompt);

//   if (!prompt) return res.status(400).json({ error: "Thiếu nội dung chat" });

//   const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
//   if (!apiKey) {
//     console.error("❌ LỖI: Chưa có API Key trong biến môi trường");
//     return res.status(500).json({ error: "Server chưa cấu hình API Key" });
//   }

//   // 2. Cấu hình URL gọi Gemini 1.5 Flash (Bản ổn định nhất)
//   const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

//   // 3. Payload đơn giản nhất: Chỉ gửi text, không system instruction phức tạp
//   const payload = {
//     contents: [{
//       parts: [{ text: prompt }]
//     }]
//   };

//   try {
//     console.log(`📡 Đang gọi Gemini API...`);
    
//     const response = await fetch(API_URL, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload)
//     });

//     const data = await response.json();

//     // 4. Kiểm tra lỗi từ Google trả về
//     if (!response.ok) {
//       console.error("❌ Google API Error Full:", JSON.stringify(data, null, 2));
//       return res.status(response.status).json({ 
//         error: `Lỗi Google: ${data.error?.message || response.statusText}` 
//       });
//     }

//     // 5. Lấy câu trả lời
//     const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Gemini không trả lời gì.";
//     console.log("✅ Kết nối THÀNH CÔNG! Gemini trả lời:", replyText);

//     // 6. Trả về Frontend
//     // Lưu ý: Frontend hiện tại đang mong đợi key "songs", nên ta trả về songs rỗng 
//     // kèm theo key "reply" để bạn kiểm tra trong Network Tab hoặc Log
//     res.json({ 
//         reply: replyText, 
//         songs: [] // Để frontend không bị crash vì thiếu mảng này
//     });

//   } catch (error) {
//     console.error("🔥 Lỗi Server (Fetch):", error.message);
//     res.status(500).json({ error: "Lỗi kết nối server: " + error.message });
//   }
// };

// backend/controllers/chatbotController.js
import fetch from 'node-fetch';
import db from "../config/db.js";

const promiseDb = db.promise();

// --- 1. HÀM HELPER: LẤY VÀ FORMAT DANH SÁCH BÀI HÁT TỪ DB ---
const getFormattedSongList = async () => {
  try {
    const query = `
      SELECT 
        s.id, s.title, s.genre, s.country, s.release_year,
        GROUP_CONCAT(a.name SEPARATOR ', ') AS artists
      FROM songs s
      LEFT JOIN song_artists sa ON s.id = sa.song_id
      LEFT JOIN artists a ON sa.artist_id = a.id
      GROUP BY s.id;
    `;
    const [songs] = await promiseDb.query(query);
    
    if (!songs || songs.length === 0) return null;

    return songs.map(song => 
      `ID:${song.id}|Tên:${song.title}|Ca sĩ:${song.artists}|Thể loại:${song.genre}|Quốc gia:${song.country}`
    ).join('\n');
  } catch (err) {
    console.error("❌ Lỗi DB:", err.message);
    throw new Error("Lỗi đọc database");
  }
};

// --- 2. HÀM GỌI GEMINI (LOGIC PHÂN LOẠI CHAT/NHẠC) ---
const fetchGeminiResponse = async (userPrompt, songListString) => {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Server chưa cấu hình API Key");

  // Sử dụng model đang hoạt động tốt (2.5-flash hoặc 1.5-flash-latest)
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  // [QUAN TRỌNG] SYSTEM PROMPT ĐỂ PHÂN LOẠI YÊU CẦU
  const systemPrompt = `
    Bạn là một trợ lý âm nhạc thân thiện của website "Nghe & Khen".
    
    DỮ LIỆU CỦA BẠN (KHO NHẠC):
    ---
    ${songListString}
    ---

    NHIỆM VỤ CỦA BẠN:
    Phân tích yêu cầu của người dùng: "${userPrompt}"

    KỊCH BẢN XỬ LÝ:
    1. TRƯỜNG HỢP GIAO TIẾP XÃ GIAO (Chào hỏi, hỏi tên, nói chuyện phiếm...):
       - Trả lời thân thiện, ngắn gọn.
       - TRẢ VỀ DANH SÁCH ID RỖNG ([]).

    2. TRƯỜNG HỢP TÌM KIẾM NHẠC (Tìm bài hát, thể loại, tâm trạng, ca sĩ...):
       - Chọn ra tối đa 5 ID bài hát từ KHO NHẠC phù hợp nhất.
       - Viết một câu giới thiệu ngắn gọn về các bài hát đó.

    YÊU CẦU ĐẦU RA (BẮT BUỘC JSON):
    Bạn chỉ được trả về một chuỗi JSON duy nhất theo định dạng sau:
    {
      "reply": "Câu trả lời của bạn (văn bản)",
      "ids": [Danh sách số nguyên ID, hoặc rỗng nếu là xã giao]
    }
    
    VÍ DỤ 1 (Xã giao):
    Input: "Chào bạn"
    Output: { "reply": "Chào bạn! Mình là trợ lý âm nhạc. Bạn muốn nghe gì hôm nay? 🎵", "ids": [] }

    VÍ DỤ 2 (Tìm nhạc):
    Input: "Có nhạc gì buồn không?"
    Output: { "reply": "Dưới đây là vài bài nhạc tâm trạng cho bạn đây 😢", "ids": [10, 2, 5] }
  `;

  const payload = {
    contents: [{
      parts: [{ text: systemPrompt }]
    }],
    generationConfig: {
        response_mime_type: "application/json" // Ép trả về JSON chuẩn
    }
  };

  try {
    console.log(`📡 Đang gửi prompt tới Gemini...`);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Google API Error:", JSON.stringify(data));
      throw new Error("Lỗi kết nối Google AI");
    }

    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("✅ Gemini Raw Response:", textResponse);

    try {
        const parsedData = JSON.parse(textResponse);
        return parsedData; // { reply: "...", ids: [...] }
    } catch (e) {
        console.error("❌ Lỗi Parse JSON:", e);
        return { reply: "Hệ thống đang bối rối, bạn hỏi lại nhé! 😅", ids: [] };
    }

  } catch (error) {
    console.error("❌ Lỗi Fetch:", error.message);
    throw error;
  }
};

// --- 3. CONTROLLER CHÍNH ---
export const getChatbotSuggestion = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Thiếu prompt" });

  try {
    // A. Lấy danh sách nhạc
    const songString = await getFormattedSongList();
    if (!songString) {
        return res.json({ reply: "Kho nhạc đang trống trơn bạn ơi!", songs: [] });
    }

    // B. Gửi cho Gemini phân tích
    const aiData = await fetchGeminiResponse(prompt, songString);
    // aiData = { reply: "...", ids: [...] }

    const suggestedIds = aiData.ids || [];

    // C. Nếu không có ID nào (Chat xã giao), trả về luôn
    if (suggestedIds.length === 0) {
        return res.json({ 
            reply: aiData.reply, 
            songs: [] 
        });
    }

    // D. Nếu có ID (Tìm nhạc), truy vấn DB lấy thông tin chi tiết
    const [songs] = await promiseDb.query(`
      SELECT s.*, GROUP_CONCAT(a.name SEPARATOR ', ') as artist_names
      FROM songs s
      LEFT JOIN song_artists sa ON s.id = sa.song_id
      LEFT JOIN artists a ON sa.artist_id = a.id
      WHERE s.id IN (?)
      GROUP BY s.id
    `, [suggestedIds]);

    // Format
    const formattedSongs = songs.map(s => ({
        ...s,
        artists: s.artist_names ? s.artist_names.split(', ').map(name => ({ name })) : []
    }));

    // Sắp xếp
    const sortedSongs = suggestedIds
        .map(id => formattedSongs.find(s => s.id === id))
        .filter(Boolean);

    // E. Trả về kết quả
    res.json({ 
        reply: aiData.reply, 
        songs: sortedSongs 
    });

  } catch (error) {
    console.error("🔥 Controller Error:", error.message);
    res.status(500).json({ error: "Lỗi hệ thống: " + error.message });
  }
};