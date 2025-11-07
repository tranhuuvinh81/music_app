import fetch from 'node-fetch';

const fetchGeminiSuggestionsFromApi = async (userPrompt) => {
  // 👇 SỬA LỖI: Đọc API key từ file .env
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Lỗi: GOOGLE_GEMINI_API_KEY chưa được set trong file .env của backend.");
    return "Xin lỗi, quản trị viên chưa cấu hình API key cho chatbot.";
  }
  
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const systemPrompt = `
    Bạn là một trợ lý gợi ý nhạc. 
    Nhiệm vụ của bạn là nhận một yêu cầu (prompt) từ người dùng và trả về 3-5 từ khóa tìm kiếm (keywords), thể loại (genres), hoặc quốc gia liên quan.
    
    NGHIÊM CẤM: Không trả lời bằng câu chat. Không giải thích. Không dùng Markdown.
    CHỈ trả lời bằng các từ khóa, cách nhau bằng dấu phẩy.
    
    Ví dụ 1:
    Prompt: "nhạc gì đó vui vẻ yêu đời của Việt Nam"
    Trả lời: "V-Pop, Vui vẻ, Yêu đời, Việt Nam"
    
    Ví dụ 2:
    Prompt: "tôi đang thất tình"
    Trả lời: "Ballad, Buồn, Thất tình, Lofi"
    
    Ví dụ 3:
    Prompt: "nhạc K-Pop sôi động"
    Trả lời: "K-Pop, Sôi động, Hàn Quốc"

    Ví dụ 4:
    Prompt: "nhạc Sơn Tùng M-TP"
    Trả lời: "Nơi này có anh, Chúng ta của hiện tại, Lạc trôi, V-Pop, Sơn Tùng M-TP"
  `;

  const payload = {
    contents: [{
      parts: [{ text: userPrompt }]
    }],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error("Không nhận được nội dung từ API.");
    }
    return text;

  } catch (error) {
    console.error("Lỗi khi gọi Gemini API từ Backend:", error);
    return "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.";
  }
};

export const getChatbotSuggestion = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Thiếu prompt" });
  }

  try {
    const suggestionText = await fetchGeminiSuggestionsFromApi(prompt);
    res.json({ text: suggestionText }); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};