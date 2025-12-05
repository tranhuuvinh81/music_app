// backend/scripts/importSpotifyData.js
// 📦 IMPORTS
// ==============================
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import fetch from "node-fetch";

dotenv.config();

// ==============================
// ⚙️ KẾT NỐI DATABASE (Promise-based)
// ==============================
const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

console.log("✅ Đã kết nối MySQL thành công!");

// ==============================
// 🎫 HÀM LẤY ACCESS TOKEN SPOTIFY
// ==============================
async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Lỗi lấy access token: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("🎫 Lấy mới Spotify Access Token thành công!");
  return data.access_token;
}

// ==============================
// 🎵 HÀM IMPORT DỮ LIỆU SPOTIFY
// ==============================
async function importSpotifyData(keyword = "pop") {
  try {
    const token = await getSpotifyAccessToken();
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      keyword
    )}&type=track&limit=10`; // Tăng giới hạn nếu muốn, vd: 50

    console.log(`🎧 Đang import các bài hát cho từ khóa "${keyword}"...`);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const tracks = data.tracks?.items || [];

    for (const track of tracks) {
      // 1. Lấy Spotify ID
      const spotifyTrackId = track.id;
      const title = track.name;

      if (!spotifyTrackId) {
        console.log(`⚠️ Bỏ qua bài hát không có Spotify ID: ${title}`);
        continue;
      }

      // 2. Kiểm tra trùng lặp DỰA TRÊN spotify_id
      const [existingSong] = await connection.query(
        `SELECT id FROM songs WHERE spotify_id = ? LIMIT 1`,
        [spotifyTrackId]
      );

      if (existingSong.length > 0) {
        console.log(
          `ℹ️ Đã bỏ qua: ${title} (ID: ${existingSong[0].id}) đã tồn tại.`
        );
        continue; // Bỏ qua bài hát này và tiếp tục vòng lặp
      }

      // 3. Lấy thông tin (nếu bài hát là mới)
      const album = track.album?.name || null;
      const release_year = track.album?.release_date
        ? parseInt(track.album.release_date.substring(0, 4))
        : null;
      
      // Lấy ảnh bìa album (image_url)
      const image_url = track.album?.images?.[0]?.url || null; // Lấy ảnh đầu tiên (thường là ảnh lớn nhất)
      
      const file_url = track.preview_url; // Sẽ là NULL nếu không có
      
      // Lấy thể loại từ Spotify nếu có, không thì dùng keyword
      let genre = keyword;
      // Spotify track object không trả về genre trực tiếp, thường phải lấy từ artist hoặc album (nhưng album object trong track search cũng ko có genre đầy đủ)
      // Tạm thời dùng keyword làm genre
      
      // Lấy quốc gia (Giả định dựa trên keyword)
      let country = null;
      if (keyword.toLowerCase().includes('v-pop') || keyword.toLowerCase().includes('vietnam')) country = 'Việt Nam';
      if (keyword.toLowerCase().includes('k-pop')) country = 'Hàn Quốc';
      if (keyword.toLowerCase().includes('us-uk')) country = 'US-UK';

      const listen_count = Math.floor(Math.random() * 10000); 

      // 4. Thêm vào bảng songs (BAO GỒM spotify_id và image_url)
      const [result] = await connection.query(
        `INSERT INTO songs (title, album, genre, release_year, country, image_url, file_url, listen_count, spotify_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`, 
        [ 
          title,
          album,
          genre,
          release_year,
          country, 
          image_url, // Lưu link ảnh từ Spotify
          file_url,
          listen_count,
          spotifyTrackId,
        ]
      );

      const songId = result.insertId;
      console.log(`✅ Đã thêm: ${title} (ID: ${songId})`); 

      // Thêm nghệ sĩ
      for (const artist of track.artists) {
        const artistName = artist.name;
        const [existing] = await connection.query(
          `SELECT id FROM artists WHERE name = ? LIMIT 1`,
          [artistName]
        );

        let artistId;
        if (existing.length > 0) {
          artistId = existing[0].id;
        } else {
          const [artistResult] = await connection.query(
            `INSERT INTO artists (name, created_at) VALUES (?, NOW())`,
            [artistName]
          );
          artistId = artistResult.insertId;
        }

        await connection.query(
          `INSERT INTO song_artists (song_id, artist_id) VALUES (?, ?)`,
          [songId, artistId]
        );
      }
    }

    console.log(`🎉 Hoàn tất import từ khóa "${keyword}"!`);
  } catch (err) {
    console.error("❌ Lỗi import:", err.message, err.stack);
  }
}

// ==============================
// 🚀 CHẠY CHƯƠNG TRÌNH
// ==============================
(async () => {
  // Import một vài từ khóa để có dữ liệu đa dạng
  await importSpotifyData("nhạc tết"); 

  // ==============================
  // 🔚 ĐÓNG KẾT NỐI
  // ==============================
  await connection.end();
  console.log("👋 Đã đóng kết nối MySQL.");
})();
