// frontend/src/components/modals/ChatbotModal.js
import React, { useState, useContext, useRef, useEffect } from 'react';
import { AudioContext } from '../../context/AudioContext';
import api from '../../api/api';

const fetchGeminiSuggestions = async (userPrompt) => {
  try {
    const response = await api.post('/api/chatbot/suggest', {
      prompt: userPrompt
    });

    if (!response.data || !Array.isArray(response.data.songs)) {
      throw new Error("Phản hồi từ server không hợp lệ.");
    }
    
    return response.data.songs;

  } catch (error) {
    console.error("Lỗi khi gọi API Chatbot:", error);
    return []; 
  }
};

const getImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/40';
  if (url.startsWith('http')) return url; // Link Spotify/Online
  return `${api.defaults.baseURL}${url}`; // Link nội bộ
};

function ChatbotModal({ onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      type: 'text',
      text: 'Chào bạn! Bạn muốn nghe nhạc theo chủ đề gì hôm nay? (ví dụ: "nhạc chill để code", "bài hát về mưa", "sôi động lên nào!")'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { playSong } = useContext(AudioContext);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { sender: 'user', type: 'text', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const foundSongs = await fetchGeminiSuggestions(input);
    
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
          text: `Xin lỗi, tôi không tìm thấy bài hát nào phù hợp. Bạn thử chủ đề khác nhé?`
        }
      ]);
    }
    
    setIsLoading(false);
  };

  const displayArtistNames = (artistsArray) => {
    if (!artistsArray || artistsArray.length === 0) {
      return 'Nghệ sĩ không xác định';
    }
    return artistsArray.map(artist => artist.name).join(', ');
  };

  const handlePlaySuggestion = (song) => {
    playSong(song, [song], 0); 
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end md:items-center z-50 p-4">
      <div className="bg-white rounded-t-lg md:rounded-lg shadow-xl w-full max-w-lg h-[70vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold text-gray-800">Chatbot DJ 🎧</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {msg.type === 'text' && (
                <div className={`px-4 py-2 rounded-lg max-w-[80%] ${msg.sender === 'user' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {msg.text}
                </div>
              )}

              {msg.type === 'songs' && (
                <div className="w-full max-w-[90%] bg-gray-100 rounded-lg p-3">
                  <ul className="space-y-2">
                    {msg.songs.map(song => (
                      <li key={song.id} className="flex items-center justify-between p-2 bg-white rounded shadow-sm">
                        <div className="flex items-center min-w-0 mr-2">
                          <img 
                            src={getImageUrl(song.image_url)} 
                            alt={song.title}
                            className="w-10 h-10 rounded object-cover mr-3 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate">{song.title}</p>
                            <p className="text-sm text-gray-500 truncate">
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
          {isLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-500">
                <span className="animate-pulse">Bot đang tìm nhạc...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Gửi tin nhắn..."
            className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
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