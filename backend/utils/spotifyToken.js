// backend/utils/spotifyToken.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

let accessToken = null;
let expiresAt = 0;

export async function getSpotifyToken() {
  const now = Date.now();

  // Nếu token còn hạn, trả lại luôn
  if (accessToken && now < expiresAt) return accessToken;

  try {
    const res = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString("base64"),
        },
      }
    );

    accessToken = res.data.access_token;
    expiresAt = now + res.data.expires_in * 1000; // thường là 1 giờ

    console.log("🎫 Lấy mới Spotify Access Token thành công!");
    return accessToken;
  } catch (err) {
    console.error("❌ Lỗi lấy token Spotify:", err.response?.data || err.message);
    throw err;
  }
}
