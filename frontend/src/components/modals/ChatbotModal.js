import React, { useState, useContext, useRef, useEffect } from 'react';
import { AudioContext } from '../../context/AudioContext';
import api from '../../api/api'; // API của backend (để search VÀ gọi chatbot)

// --- HÀM GỌI BACKEND ---
/**
 * Gửi prompt đến BACKEND của bạn để nhận gợi ý.
 * @param {string} userPrompt - Yêu cầu của người dùng, vd: "bài hát về mưa"
 * @returns {string} - Một chuỗi text thô từ backend (đã được xử lý bởi Gemini)
 */
const fetchGeminiSuggestions = async (userPrompt) => {
  try {
    // Gọi đến API backend CỦA BẠN
    const response = await api.post('/api/chatbot/suggest', {
      prompt: userPrompt
    });

    if (!response.data || !response.data.text) {
      throw new Error("Phản hồi từ server không hợp lệ.");
    }
    
    // Trả về text mà server của bạn đã lấy từ Gemini
    return response.data.text; 

  } catch (error) {
    console.error("Lỗi khi gọi API Chatbot (backend):", error);
    return "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.";
  }
};
// --- Kết thúc hàm ---


function ChatbotModal({ onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      type: 'text',
      text: 'Chào bạn! Bạn muốn nghe nhạc theo chủ đề gì hôm nay?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { playSong } = useContext(AudioContext);
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

 // 👇 BẮT ĐẦU SỬA: CẬP NHẬT LOGIC handleSend
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { sender: 'user', type: 'text', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // 1. GỌI GEMINI (thông qua backend) ĐỂ LẤY KEYWORDS
    // geminiResponseText sẽ là: "Lofi, Ballad, Buồn"
    const geminiResponseText = await fetchGeminiSuggestions(input);

    // Kiểm tra xem Gemini có trả về lỗi không
    if (geminiResponseText.startsWith("Xin lỗi")) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', type: 'text', text: geminiResponseText }
      ]);
      setIsLoading(false);
      return;
    }

    // 2. PHÂN TÍCH KEYWORDS VÀ TÌM KIẾM TRONG DATABASE
    // Tách chuỗi "Lofi, Ballad, Buồn" thành mảng ['Lofi', 'Ballad', 'Buồn']
    const keywords = geminiResponseText.split(',').map(kw => kw.trim()).filter(Boolean);
    
    // Tạo một promise tìm kiếm cho mỗi keyword
    const searchPromises = keywords.map(keyword => 
      api.get(`/api/search?q=${encodeURIComponent(keyword)}`) // Gọi API search của BẠN
        .then(res => res.data.songs) // Chỉ lấy kết quả bài hát
        .catch(() => []) 
    );
    
    const searchResults = await Promise.all(searchPromises);
    
    // Làm phẳng mảng kết quả và loại bỏ trùng lặp
    const foundSongsMap = new Map();
    searchResults.flat().forEach(song => {
      if (song && song.id) {
         foundSongsMap.set(song.id, song);
      }
    });
    const foundSongs = Array.from(foundSongsMap.values());

    // 3. TẠO TIN NHẮN TRẢ LỜI
    if (foundSongs.length > 0) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          type: 'text',
          text: `Dựa trên chủ đề "${userMessage.text}", tôi tìm thấy các bài hát này trong thư viện:`
        },
        {
          sender: 'bot',
          type: 'songs',
          songs: foundSongs 
        }
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          type: 'text',
          text: `Xin lỗi, tôi không tìm thấy bài hát nào trong thư viện khớp với các từ khóa (${geminiResponseText}). Bạn thử chủ đề khác nhé?`
        }
      ]);
    }
    
    setIsLoading(false);
  };
  // 👆 KẾT THÚC SỬA
  // Hàm helper để hiển thị tên nghệ sĩ
  const displayArtistNames = (artistsArray) => {
    if (!artistsArray || artistsArray.length === 0) {
      return 'Nghệ sĩ không xác định';
    }
    return artistsArray.map(artist => artist.name).join(', ');
  };

  const handlePlaySuggestion = (song) => {
    // Tạo một playlist tạm thời chỉ chứa bài hát này
    playSong(song, [song], 0); 
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end md:items-center z-50 p-4">
      <div className="bg-white rounded-t-lg md:rounded-lg shadow-xl w-full max-w-lg h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold text-gray-800">Chatbot DJ 🎧</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
        </div>

        {/* Khung chat */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* Tin nhắn Text */}
              {msg.type === 'text' && (
                <div className={`px-4 py-2 rounded-lg max-w-[80%] shadow-sm ${msg.sender === 'user' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {msg.text}
                </div>
              )}

              {/* Tin nhắn Gợi ý (Song) */}
              {msg.type === 'songs' && (
                <div className="w-full max-w-[90%] bg-gray-100 rounded-lg p-3">
                  <ul className="space-y-2">
                    {msg.songs.map(song => (
                      <li key={song.id} className="flex items-center justify-between p-2 bg-white rounded shadow-sm">
                        <div className="flex items-center min-w-0 mr-2">
                          <img 
                            src={song.image_url ? `${api.defaults.baseURL}${song.image_url}` : 'https://via.placeholder.com/40'} 
                            alt={song.title}
                            className="w-10 h-10 rounded object-cover mr-3 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate">{song.title}</p>
                            <p className="text-sm text-gray-500 truncate">
                              {/* Sử dụng hàm helper đã tạo */}
                              {displayArtistNames(song.artists)}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handlePlaySuggestion(song)}
                          className="p-2 rounded-full text-gray-600 hover:bg-gray-200 ml-2 flex-shrink-0"
                          aria-label="Play"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          ))}
          {/* Hiển thị "Bot đang gõ..." */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-500">
                <span className="animate-pulse">Bot đang tìm nhạc...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Khung nhập liệu */}
        <div className="p-4 border-t flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Gửi tin nhắn..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded-r-lg hover:bg-gray-700 disabled:bg-gray-400"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatbotModal;