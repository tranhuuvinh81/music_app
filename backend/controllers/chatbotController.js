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
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${apiKey}`;

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