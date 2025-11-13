// // backend/scripts/importSpotifyData.js
// import axios from "axios";
// import pool from "../config/db.js";
// import { getSpotifyToken } from "../utils/spotifyToken.js";

// async function importArtist(artist) {
//   const [rows] = await pool.query("SELECT id FROM artists WHERE spotify_id = ?", [artist.id]);
//   if (rows.length > 0) return rows[0].id;

//   const [result] = await pool.query(
//     `INSERT INTO artists (name, image_url, spotify_id, description, field, created_at)
//      VALUES (?, ?, ?, ?, ?, NOW())`,
//     [
//       artist.name,
//       artist.images?.[0]?.url || null,
//       artist.id,
//       artist.type || null,
//       artist.genres?.[0] || null,
//     ]
//   );
//   return result.insertId;
// }

// async function importTrack(track) {
//   const [exists] = await pool.query("SELECT id FROM songs WHERE spotify_id = ?", [track.id]);
//   if (exists.length > 0) return exists[0].id;

//   const [result] = await pool.query(
//     `INSERT INTO songs (title, album, genre, release_year, file_url, image_url, preview_url, spotify_id, created_at)
//      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
//     [
//       track.name,
//       track.album?.name || null,
//       track.album?.genres?.[0] || null,
//       track.album?.release_date ? parseInt(track.album.release_date.split("-")[0]) : null,
//       track.external_urls?.spotify || null,
//       track.album?.images?.[0]?.url || null,
//       track.preview_url || null,
//       track.id,
//     ]
//   );

//   const songId = result.insertId;

//   // liên kết nghệ sĩ
//   for (const artist of track.artists) {
//     const artistId = await importArtist(artist);
//     await pool.query("INSERT IGNORE INTO song_artists (song_id, artist_id) VALUES (?, ?)", [
//       songId,
//       artistId,
//     ]);
//   }

//   return songId;
// }

// async function importFromSpotify(query) {
//   try {
//     const token = await getSpotifyToken();
//     const res = await axios.get("https://api.spotify.com/v1/search", {
//       headers: { Authorization: `Bearer ${token}` },
//       params: { q: query, type: "track", limit: 10 },
//     });

//     const tracks = res.data.tracks.items;
//     console.log(`🎧 Đang import ${tracks.length} bài hát cho từ khóa "${query}"...`);

//     for (const track of tracks) {
//       const id = await importTrack(track);
//       console.log(`✅ Đã thêm: ${track.name} (ID: ${id})`);
//     }
//   } catch (err) {
//     console.error("❌ Lỗi import:", err.response?.data || err.message);
//   } finally {
//     await pool.end();
//   }
// }

// // chạy script
// importFromSpotify("chill");// ==============================
// 📦 IMPORTS
// ==============================
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import fetch from "node-fetch";

dotenv.config();

// ==============================
// ⚙️ KẾT NỐI DATABASE
// ==============================
const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
console.log("✅ Đã kết nối MySQL thành công!");

// ==============================
// 🎫 HÀM LẤY TOKEN SPOTIFY
// ==============================
async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) throw new Error(`Lỗi lấy token: ${response.statusText}`);
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
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(keyword)}&type=track&limit=10`;

    console.log(`🎧 Đang import 10 bài hát cho từ khóa "${keyword}"...`);

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();

    const tracks = data.tracks?.items || [];

    for (const track of tracks) {
      const spotifyTrackId = track.id;
      const title = track.name;

      if (!spotifyTrackId) continue;

      // 🧩 Kiểm tra bài hát theo spotify_id
      const [existingSong] = await connection.query(
        `SELECT id FROM songs WHERE spotify_id = ? LIMIT 1`,
        [spotifyTrackId]
      );
      if (existingSong.length > 0) {
        console.log(`ℹ️ Đã tồn tại bài hát: ${title}`);
        continue;
      }

      const album = track.album?.name || null;
      const release_year = track.album?.release_date
        ? parseInt(track.album.release_date.substring(0, 4))
        : null;
      const image_url = track.album?.images?.[0]?.url || null;
      const file_url = track.preview_url;
      const genre = keyword;
      const listen_count = Math.floor(Math.random() * 10000);

      const [result] = await connection.query(
        `INSERT INTO songs (title, album, genre, release_year, image_url, file_url, listen_count, spotify_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [title, album, genre, release_year, image_url, file_url, listen_count, spotifyTrackId]
      );

      const songId = result.insertId;
      console.log(`✅ Đã thêm bài hát: ${title} (ID: ${songId})`);

      // ====================================
      // 👩‍🎤 Xử lý nghệ sĩ
      // ====================================
      for (const artist of track.artists) {
        const artistSpotifyId = artist.id;
        const artistName = artist.name;

        // Kiểm tra trùng lặp theo spotify_id
        const [existingArtist] = await connection.query(
          `SELECT id FROM artists WHERE spotify_id = ? LIMIT 1`,
          [artistSpotifyId]
        );

        let artistId;
        if (existingArtist.length > 0) {
          artistId = existingArtist[0].id;
        } else {
          const [artistResult] = await connection.query(
            `INSERT INTO artists (name, spotify_id, created_at)
             VALUES (?, ?, NOW())`,
            [artistName, artistSpotifyId]
          );
          artistId = artistResult.insertId;
        }

        // Liên kết bài hát - nghệ sĩ
        await connection.query(
          `INSERT INTO song_artists (song_id, artist_id) VALUES (?, ?)`,
          [songId, artistId]
        );
      }
    }

    console.log(`🎉 Hoàn tất import từ khóa "${keyword}"!`);
  } catch (err) {
    console.error("❌ Lỗi import:", err.message);
  }
}

// ==============================
// 🚀 CHẠY SCRIPT
// ==============================
(async () => {
  await importSpotifyData("nhạc yêu đời");
  await connection.end();
  console.log("👋 Đã đóng kết nối MySQL.");
})();
