// // frontend/src/components/modals/ChatbotModal.js
// import React, { useState, useContext, useRef, useEffect } from 'react';
// import { AudioContext } from '../../context/AudioContext';
// import { AuthContext } from '../../context/AuthContext';
// import api from '../../api/api';
// import { FiSend, FiX, FiMusic, FiUser } from 'react-icons/fi';
// import avt from '../../assets/images/onlylogo-removebg-preview.png'; // Logo mặc định cho Bot

// // --- HÀM GỌI BACKEND ---
// const fetchGeminiSuggestions = async (userPrompt) => {
//   try {
//     const response = await api.post('/api/chatbot/suggest', {
//       prompt: userPrompt
//     });

//     if (!response.data || !Array.isArray(response.data.songs)) {
//       throw new Error("Phản hồi từ server không hợp lệ.");
//     }
    
//     return response.data.songs;

//   } catch (error) {
//     console.error("Lỗi khi gọi API Chatbot:", error);
//     return []; 
//   }
// };

// // --- HÀM HELPER XỬ LÝ URL ẢNH ---
// const getImageUrl = (url) => {
//   if (!url) return 'https://via.placeholder.com/40';
//   if (url.startsWith('http')) return url;
//   return `${api.defaults.baseURL}${url}`;
// };

// function ChatbotModal({ onClose }) {
//   const { fullUser, user } = useContext(AuthContext);
//   const currentUser = fullUser || user;

//   const [messages, setMessages] = useState([
//     {
//       sender: 'bot',
//       type: 'text',
//       text: 'Chào bạn! Bạn muốn nghe nhạc theo chủ đề gì hôm nay?'
//     }
//   ]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const { playSong } = useContext(AudioContext);
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const handleSend = async () => {
//     if (!input.trim() || isLoading) return;

//     const userMessage = { sender: 'user', type: 'text', text: input };
//     setMessages(prev => [...prev, userMessage]);
//     setInput('');
//     setIsLoading(true);

//     const foundSongs = await fetchGeminiSuggestions(input);
    
//     if (foundSongs.length > 0) {
//       setMessages(prev => [
//         ...prev,
//         {
//           sender: 'bot',
//           type: 'text',
//           text: `Dựa trên chủ đề "${userMessage.text}", tôi tìm thấy các bài hát này trong thư viện:`
//         },
//         {
//           sender: 'bot',
//           type: 'songs',
//           songs: foundSongs 
//         }
//       ]);
//     } else {
//       setMessages(prev => [
//         ...prev,
//         {
//           sender: 'bot',
//           type: 'text',
//           text: `Xin lỗi, tôi không tìm thấy bài hát nào phù hợp. Bạn thử chủ đề khác nhé?`
//         }
//       ]);
//     }
    
//     setIsLoading(false);
//   };

//   const displayArtistNames = (artistsArray) => {
//     if (!artistsArray || artistsArray.length === 0) {
//       return 'Nghệ sĩ không xác định';
//     }
//     return artistsArray.map(artist => artist.name).join(', ');
//   };

//   const handlePlaySuggestion = (song) => {
//     playSong(song, [song], 0); 
//   };

//   const userAvatarUrl = currentUser?.avatar_url 
//     ? getImageUrl(currentUser.avatar_url) 
//     : null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end md:items-center z-50 p-4">
//       <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-lg h-[70vh] flex flex-col overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] p-4 flex justify-between items-center">
//           <div className="flex items-center space-x-2">
//             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-sm">
//               <img src={avt} alt="Chatbot Logo" className="w-10 h-10 object-contain" />
//             </div>
//             <div>
//                 <h3 className="text-xl font-bold text-white leading-tight">Chatbot</h3>
//                 <p className="text-base text-blue-100 font-medium">Trợ lý âm nhạc AI</p>
//             </div>
//           </div>
//           <button 
//             onClick={onClose} 
//             className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
//           >
//             <FiX className="text-xl" />
//           </button>
//         </div>

//         {/* Chat Area */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-white to-[#f0f9ff]">
//           {messages.map((msg, index) => (
//             <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              
//               {msg.type === 'text' && (
//                 <div className={`flex items-end space-x-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
//                   {/* Avatar */}
//                   <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 ${
//                     msg.sender === 'user' ? 'border-[#7Ab2D3]' : 'border-gray-200'
//                   }`}>
//                     {msg.sender === 'user' ? (
//                       userAvatarUrl ? (
//                         <img src={userAvatarUrl} alt="User" className="w-full h-full object-cover" />
//                       ) : (
//                         <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
//                             <FiUser />
//                         </div>
//                       )
//                     ) : (
//                       <img src={avt} alt="Bot Avatar" className="w-full h-full object-contain p-1 bg-white" />
//                     )}
//                   </div>

//                   {/* Message Bubble */}
//                   <div className={`px-4 py-2 text-xl shadow-sm ${
//                     msg.sender === 'user' 
//                       ? 'bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white rounded-2xl rounded-br-none' 
//                       : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-none'
//                   }`}>
//                     {msg.text}
//                   </div>
//                 </div>
//               )}

//               {msg.type === 'songs' && (
//                 <div className="flex items-start space-x-2 max-w-[95%]">
//                     <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden border-2 border-gray-200 bg-white">
//                         <img src={avt} alt="Bot Avatar" className="w-full h-full object-contain p-1" />
//                     </div>
//                     <div className="w-full bg-white rounded-2xl rounded-bl-none shadow-md border border-gray-100 p-3">
//                         <ul className="space-y-2">
//                             {msg.songs.map(song => (
//                             <li key={song.id} className="flex items-center justify-between p-2 bg-gray-50 hover:bg-white hover:shadow-sm rounded-xl transition-all duration-200 border border-transparent hover:border-gray-100 group">
//                                 <div className="flex items-center min-w-0 mr-2">
//                                 <div className="relative w-10 h-10 flex-shrink-0 mr-3">
//                                     <img 
//                                         src={getImageUrl(song.image_url)} 
//                                         alt={song.title}
//                                         className="w-full h-full rounded-lg object-cover shadow-sm"
//                                     />
//                                     <div className="absolute inset-0 bg-black/10 rounded-lg"></div>
//                                 </div>
//                                 <div className="min-w-0">
//                                     <p className="font-semibold text-gray-800 text-sm truncate group-hover:text-[#4A90E2] transition-colors">{song.title}</p>
//                                     <p className="text-xs text-gray-500 truncate">
//                                     {displayArtistNames(song.artists)}
//                                     </p>
//                                 </div>
//                                 </div>
//                                 <button 
//                                 onClick={() => handlePlaySuggestion(song)}
//                                 className="p-2 rounded-full bg-white text-[#4A90E2] hover:bg-[#4A90E2] hover:text-white shadow-sm transition-all duration-200 flex-shrink-0 border border-gray-100 hover:border-[#4A90E2]"
//                                 aria-label="Play"
//                                 >
//                                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
//                                 </button>
//                             </li>
//                             ))}
//                         </ul>
//                     </div>
//                 </div>
//               )}

//             </div>
//           ))}
          
//           {isLoading && (
//             <div className="flex items-center space-x-2">
//                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 bg-white">
//                   <img src={avt} alt="Bot Avatar" className="w-full h-full object-contain p-1" />
//                </div>
//                <div className="px-4 py-2 rounded-2xl rounded-bl-none bg-white border border-gray-100 shadow-sm">
//                 <div className="flex space-x-1 items-center h-5">
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
//                 </div>
//               </div>
//             </div>
//           )}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input Area */}
//         <div className="p-4 bg-white border-t border-gray-100">
//           <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-[#7Ab2D3] focus-within:ring-2 focus-within:ring-[#7Ab2D3] focus-within:ring-opacity-20 transition-all duration-300">
//             <input
//                 type="text"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyPress={(e) => e.key === 'Enter' && handleSend()}
//                 placeholder="Nhập tin nhắn..."
//                 className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400"
//                 disabled={isLoading}
//             />
//             <button
//                 onClick={handleSend}
//                 disabled={isLoading || !input.trim()}
//                 className={`ml-2 p-2 rounded-full transition-all duration-300 ${
//                     input.trim() && !isLoading
//                     ? 'bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white shadow-md hover:shadow-lg transform hover:scale-105'
//                     : 'bg-gray-200 text-gray-400 cursor-not-allowed'
//                 }`}
//             >
//                 <FiSend className="text-lg" />
//             </button>
//           </div>
//           <div className="text-center mt-2">
//              <p className="text-[10px] text-gray-400">Chatbot có thể đưa ra thông tin không chính xác.</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ChatbotModal;

// frontend/src/components/modals/ChatbotModal.js
import React, { useState, useContext, useRef, useEffect } from 'react';
import { AudioContext } from '../../context/AudioContext';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/api';
// [UPDATE] Thêm icon FiTrash2 (Thùng rác) để xóa lịch sử
import { FiSend, FiX, FiUser, FiTrash2 } from 'react-icons/fi'; 
import avt from '../../assets/images/onlylogo-removebg-preview.png'; 

// --- HÀM GỌI BACKEND (GIỮ NGUYÊN) ---
const fetchGeminiSuggestions = async (userPrompt) => {
  try {
    const response = await api.post('/api/chatbot/suggest', {
      prompt: userPrompt
    });

    if (!response.data) {
      throw new Error("Phản hồi từ server không hợp lệ.");
    }
    
    return response.data; // { reply: "...", songs: [...] }

  } catch (error) {
    console.error("Lỗi khi gọi API Chatbot:", error);
    return { reply: "Xin lỗi, hệ thống đang gặp sự cố kết nối.", songs: [] }; 
  }
};

const getImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/40';
  if (url.startsWith('http')) return url;
  return `${api.defaults.baseURL}${url}`;
};

function ChatbotModal({ onClose }) {
  const { fullUser, user } = useContext(AuthContext);
  const currentUser = fullUser || user;
  const { playSong } = useContext(AudioContext);
  const messagesEndRef = useRef(null);

  // [NEW] Key để lưu vào localStorage
  const STORAGE_KEY = 'music_app_chat_history';

  // [UPDATE] Khởi tạo state messages từ localStorage (nếu có)
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    if (savedMessages) {
        try {
            return JSON.parse(savedMessages);
        } catch (e) {
            console.error("Lỗi parse lịch sử chat:", e);
        }
    }
    // Mặc định nếu chưa có lịch sử
    return [{
      sender: 'bot',
      type: 'text',
      text: 'Chào bạn! Tôi là trợ lý AI. Chúng ta có thể trò chuyện hoặc tôi có thể giúp bạn tìm nhạc.'
    }];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // [NEW] Tự động cuộn xuống cuối mỗi khi messages thay đổi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]); // Thêm isLoading để cuộn khi đang loading

  // [NEW] Tự động lưu vào localStorage mỗi khi messages thay đổi
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // [NEW] Hàm xóa lịch sử chat
  const handleClearChat = () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ cuộc trò chuyện này không?")) {
        const defaultMessage = [{
            sender: 'bot',
            type: 'text',
            text: 'Chào bạn! Tôi là trợ lý AI. Chúng ta có thể trò chuyện hoặc tôi có thể giúp bạn tìm nhạc.'
        }];
        setMessages(defaultMessage);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMessage));
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setMessages(prev => [...prev, { sender: 'user', type: 'text', text: userText }]);
    setInput('');
    setIsLoading(true);

    const data = await fetchGeminiSuggestions(userText);
    
    // Logic xử lý phản hồi (GIỮ NGUYÊN NHƯ PHIÊN BẢN ỔN ĐỊNH)
    if (data.reply) {
        setMessages(prev => [
            ...prev,
            { sender: 'bot', type: 'text', text: data.reply }
        ]);
    }

    if (data.songs && data.songs.length > 0) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          type: 'text',
          text: `Dựa trên yêu cầu của bạn, tôi tìm thấy ${data.songs.length} bài hát:`
        },
        {
          sender: 'bot',
          type: 'songs',
          songs: data.songs 
        }
      ]);
    } 
    else if (!data.reply && (!data.songs || data.songs.length === 0)) {
       setMessages(prev => [
        ...prev,
        { sender: 'bot', type: 'text', text: "Hmm, tôi không hiểu ý bạn lắm hoặc không tìm thấy dữ liệu." }
       ]);
    }
    
    setIsLoading(false);
  };

  const displayArtistNames = (artistsArray) => {
    if (!artistsArray || artistsArray.length === 0) return 'Nghệ sĩ không xác định';
    if (typeof artistsArray === 'string') return artistsArray;
    return artistsArray.map(artist => artist.name).join(', ');
  };

  const handlePlaySuggestion = (song) => {
    playSong(song, [song], 0); 
  };

  const userAvatarUrl = currentUser?.avatar_url 
    ? getImageUrl(currentUser.avatar_url) 
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end md:items-center z-50 p-4">
      <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-lg h-[70vh] flex flex-col overflow-hidden animate-slide-up">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-sm">
              <img src={avt} alt="Chatbot" className="w-8 h-8 object-contain" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-white leading-tight">Trợ lý AI</h3>
                <p className="text-xs text-blue-100 font-medium">Online</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* [NEW] Nút Xóa Lịch Sử */}
            <button 
                onClick={handleClearChat}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
                title="Xóa đoạn chat"
            >
                <FiTrash2 size={20} />
            </button>

            <button 
                onClick={onClose} 
                className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
                title="Đóng"
            >
                <FiX size={20} />
            </button>
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc]">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* Text Message */}
              {msg.type === 'text' && (
                <div className={`flex items-end gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 overflow-hidden border border-gray-200 bg-white flex items-center justify-center`}>
                    {msg.sender === 'user' ? (
                      userAvatarUrl ? <img src={userAvatarUrl} alt="User" className="w-full h-full object-cover" /> : <FiUser className="text-gray-500"/>
                    ) : (
                      <img src={avt} alt="Bot" className="w-6 h-6 object-contain" />
                    )}
                  </div>

                  <div className={`px-4 py-2 text-sm shadow-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user' 
                      ? 'bg-[#7Ab2D3] text-white rounded-2xl rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              )}

              {/* Songs List Message */}
              {msg.type === 'songs' && (
                <div className="flex items-start gap-2 max-w-[90%]">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                        <img src={avt} alt="Bot" className="w-6 h-6 object-contain" />
                    </div>
                    <div className="w-full bg-white rounded-2xl rounded-bl-none shadow-md border border-gray-100 p-2">
                        <ul className="space-y-1">
                            {msg.songs.map(song => (
                            <li key={song.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group" onClick={() => handlePlaySuggestion(song)}>
                                <div className="flex items-center min-w-0 mr-2">
                                    <img 
                                        src={getImageUrl(song.image_url)} 
                                        alt={song.title}
                                        className="w-10 h-10 rounded-md object-cover shadow-sm flex-shrink-0 bg-gray-200"
                                    />
                                    <div className="ml-3 min-w-0">
                                        <p className="font-semibold text-gray-800 text-sm truncate group-hover:text-[#4A90E2] transition-colors">{song.title}</p>
                                        <p className="text-xs text-gray-500 truncate">{displayArtistNames(song.artists)}</p>
                                    </div>
                                </div>
                            </li>
                            ))}
                        </ul>
                    </div>
                </div>
              )}

            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center">
                  <img src={avt} alt="Loading" className="w-6 h-6 object-contain opacity-50" />
               </div>
               <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-white border border-gray-100 shadow-sm">
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA (GIỮ NGUYÊN) */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:border-[#7Ab2D3] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#7Ab2D3] focus-within:ring-opacity-20 transition-all duration-300">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400 text-sm md:text-base"
                disabled={isLoading}
            />
            <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className={`ml-2 p-2 rounded-full transition-all duration-300 ${
                    input.trim() && !isLoading
                    ? 'bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white shadow-md hover:scale-105'
                    : 'bg-gray-300 text-gray-400 cursor-not-allowed'
                }`}
            >
                <FiSend size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatbotModal;