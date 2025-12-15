// check_models.js (hoặc chạy tạm trong controller)
import fetch from 'node-fetch';

const apiKey = "AIzaSyAZPFv5Bqk3WRQO0ZMhuevonLgIm4QyXWI"; // Dán tạm key của bạn vào đây để test
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    if (data.models) {
      console.log("=== CÁC MODEL KHẢ DỤNG ===");
      data.models.forEach(m => {
        // Chỉ lấy các model hỗ trợ generateContent
        if (m.supportedGenerationMethods.includes("generateContent")) {
          console.log(`Model Name: ${m.name.replace("models/", "")}`);
        }
      });
    } else {
      console.error("Lỗi:", data);
    }
  })
  .catch(err => console.error("Lỗi kết nối:", err));