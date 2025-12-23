// // 📦 IMPORTS
// // ==============================
// import dotenv from "dotenv";
// import mysql from "mysql2/promise";
// import fetch from "node-fetch";

// dotenv.config();

// // ==============================
// // ⚙️ KẾT NỐI DATABASE
// // ==============================
// const connection = await mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// console.log("✅ Đã kết nối MySQL thành công!");

// // ==============================
// // 🎫 HÀM LẤY ACCESS TOKEN SPOTIFY
// // ==============================
// async function getSpotifyAccessToken() {
//   const clientId = process.env.SPOTIFY_CLIENT_ID;
//   const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

//   const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

//   // [FIX] Sử dụng URL chuẩn của Spotify Account Service
//   const response = await fetch("https://accounts.spotify.com/api/token", {
//     method: "POST",
//     headers: {
//       Authorization: `Basic ${credentials}`,
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     body: "grant_type=client_credentials",
//   });

//   if (!response.ok) {
//     throw new Error(`Lỗi lấy access token: ${response.statusText}`);
//   }

//   const data = await response.json();
//   console.log("🎫 Lấy mới Spotify Access Token thành công!");
//   return data.access_token;
// }

// // [NEW] HÀM LẤY GENRE TỪ NGHỆ SĨ (VÌ TRACK KO CÓ GENRE)
// async function getArtistGenre(token, artistId) {
//     try {
//         const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
//             headers: { Authorization: `Bearer ${token}` },
//         });
//         const artist = await res.json();
//         // Spotify trả về mảng genre (vd: ['vietnamese pop', 'v-pop'])
//         if (artist.genres && artist.genres.length > 0) {
//             // Lấy genre đầu tiên và viết hoa chữ cái đầu
//             const rawGenre = artist.genres[0]; 
//             return rawGenre.charAt(0).toUpperCase() + rawGenre.slice(1);
//         }
//         return null;
//     } catch (e) {
//         return null;
//     }
// }

// // ==============================
// // 🎵 HÀM IMPORT DỮ LIỆU SPOTIFY
// // ==============================
// // [FIX] Thêm tham số manualGenre để bạn có thể chủ động gán thể loại
// async function importSpotifyData(keyword = "pop", manualGenre = null) {
//   try {
//     const token = await getSpotifyAccessToken();
    
//     // [FIX] Sửa lại URL chuẩn v1/search và sửa lỗi cú pháp string interpolation
//     const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(keyword)}&type=track&limit=10`;

//     console.log(`🎧 Đang tìm kiếm "${keyword}"...`);

//     const res = await fetch(url, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     const data = await res.json();

//     const tracks = data.tracks?.items || [];

//     if (tracks.length === 0) {
//         console.log("⚠️ Không tìm thấy bài hát nào.");
//         return;
//     }

//     for (const track of tracks) {
//       // 1. Lấy Spotify ID & Title
//       const spotifyTrackId = track.id;
//       const title = track.name;

//       if (!spotifyTrackId) continue;

//       // 2. Kiểm tra trùng lặp
//       const [existingSong] = await connection.query(
//         `SELECT id FROM songs WHERE spotify_id = ? LIMIT 1`,
//         [spotifyTrackId]
//       );

//       if (existingSong.length > 0) {
//         console.log(`ℹ️ Đã tồn tại: ${title}`);
//         continue; 
//       }

//       // 3. XỬ LÝ GENRE (THỂ LOẠI) - QUAN TRỌNG
//       let genre = "Pop"; // Giá trị mặc định cuối cùng

//       if (manualGenre) {
//           // Ưu tiên 1: Nếu bạn truyền tham số lúc chạy hàm (ví dụ: "V-Pop")
//           genre = manualGenre;
//       } else {
//           // Ưu tiên 2: Tự động lấy từ Artist của Spotify
//           if (track.artists && track.artists.length > 0) {
//               const mainArtistId = track.artists[0].id;
//               const fetchedGenre = await getArtistGenre(token, mainArtistId);
//               if (fetchedGenre) {
//                   genre = fetchedGenre; 
//               }
//           }
//       }

//       // 4. Các thông tin khác
//       const album = track.album?.name || null;
//       const release_year = track.album?.release_date
//         ? parseInt(track.album.release_date.substring(0, 4))
//         : null;
//       const image_url = track.album?.images?.[0]?.url || null;
//       const file_url = track.preview_url;

//       // Xử lý Quốc gia
//       let country = "Âu Mỹ"; // Mặc định
//       // Nếu genre hoặc keyword có chứa từ khóa Việt Nam
//       const checkStr = (keyword + " " + genre).toLowerCase();
//       if (checkStr.includes('viet') || checkStr.includes('v-pop')) country = 'Việt Nam';
//       if (checkStr.includes('k-pop') || checkStr.includes('korea')) country = 'Hàn Quốc';
//       if (checkStr.includes('china')) country = 'Trung Quốc';

//       const listen_count = Math.floor(Math.random() * 10000); 

//       // 5. Insert Song
//       const [result] = await connection.query(
//         `INSERT INTO songs (title, album, genre, release_year, country, image_url, file_url, listen_count, spotify_id, created_at)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`, 
//         [ title, album, genre, release_year, country, image_url, file_url, listen_count, spotifyTrackId ]
//       );

//       const songId = result.insertId;
//       console.log(`✅ Đã thêm: ${title} | Genre: ${genre} | Country: ${country}`); 

//       // 6. Insert Artists
//       for (const artist of track.artists) {
//         const artistName = artist.name;
//         // Kiểm tra artist tồn tại
//         const [existing] = await connection.query(`SELECT id FROM artists WHERE name = ? LIMIT 1`, [artistName]);
        
//         let artistId;
//         if (existing.length > 0) {
//           artistId = existing[0].id;
//         } else {
//           const [artistResult] = await connection.query(`INSERT INTO artists (name, created_at) VALUES (?, NOW())`, [artistName]);
//           artistId = artistResult.insertId;
//         }
//         // Link bảng trung gian
//         await connection.query(`INSERT INTO song_artists (song_id, artist_id) VALUES (?, ?)`, [songId, artistId]);
//       }
//     }

//     console.log(`🎉 Hoàn tất import "${keyword}"!`);
//   } catch (err) {
//     console.error("❌ Lỗi import:", err.message);
//   }
// }

// // ==============================
// // 🚀 CHẠY CHƯƠNG TRÌNH
// // ==============================
// (async () => {
//   // CÁCH DÙNG 1: Tự động tìm genre theo artist
//   // await importSpotifyData("Mono"); 

//   // CÁCH DÙNG 2: Ép cứng genre mong muốn (Khuyên dùng để dữ liệu sạch)
//   await importSpotifyData("Top 10 bảng xếp hạng 2025", "VPop");


//   // Đóng kết nối
//   await connection.end();
//   console.log("👋 Bye!");
// })();

// 📦 IMPORTS
// ==============================
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import fetch from "node-fetch";

dotenv.config();

// ==============================
// ⚙️ KẾT NỐI DATABASE (Đã sửa cho Aiven)
// ==============================
const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, // [NEW] Thêm Port vì Aiven dùng port động
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // [NEW] Quan trọng: Cấu hình SSL cho Aiven
  ssl: {
    rejectUnauthorized: false, // Chấp nhận kết nối bảo mật (Self-signed cert)
  },
});

console.log(`✅ Đã kết nối MySQL tại host: ${process.env.DB_HOST}`);

// ==============================
// 🎫 HÀM LẤY ACCESS TOKEN SPOTIFY
// ==============================
async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  // [FIX] Sử dụng URL chuẩn của Spotify Account Service
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

// [NEW] HÀM LẤY GENRE TỪ NGHỆ SĨ (VÌ TRACK KO CÓ GENRE)
async function getArtistGenre(token, artistId) {
    try {
        const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const artist = await res.json();
        // Spotify trả về mảng genre (vd: ['vietnamese pop', 'v-pop'])
        if (artist.genres && artist.genres.length > 0) {
            // Lấy genre đầu tiên và viết hoa chữ cái đầu
            const rawGenre = artist.genres[0]; 
            return rawGenre.charAt(0).toUpperCase() + rawGenre.slice(1);
        }
        return null;
    } catch (e) {
        return null;
    }
}

// ==============================
// 🎵 HÀM IMPORT DỮ LIỆU SPOTIFY
// ==============================
// [FIX] Thêm tham số manualGenre để bạn có thể chủ động gán thể loại
async function importSpotifyData(keyword = "pop", manualGenre = null) {
  try {
    const token = await getSpotifyAccessToken();
    
    // [FIX] Sửa lại URL chuẩn v1/search và sửa lỗi cú pháp string interpolation
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(keyword)}&type=track&limit=20`;

    console.log(`🎧 Đang tìm kiếm "${keyword}"...`);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const tracks = data.tracks?.items || [];

    if (tracks.length === 0) {
        console.log("⚠️ Không tìm thấy bài hát nào.");
        return;
    }

    for (const track of tracks) {
      // 1. Lấy Spotify ID & Title
      const spotifyTrackId = track.id;
      const title = track.name;

      if (!spotifyTrackId) continue;

      // 2. Kiểm tra trùng lặp
      const [existingSong] = await connection.query(
        `SELECT id FROM songs WHERE spotify_id = ? LIMIT 1`,
        [spotifyTrackId]
      );

      if (existingSong.length > 0) {
        console.log(`ℹ️ Đã tồn tại: ${title}`);
        continue; 
      }

      // 3. XỬ LÝ GENRE (THỂ LOẠI) - QUAN TRỌNG
      let genre = "Pop"; // Giá trị mặc định cuối cùng

      if (manualGenre) {
          // Ưu tiên 1: Nếu bạn truyền tham số lúc chạy hàm (ví dụ: "V-Pop")
          genre = manualGenre;
      } else {
          // Ưu tiên 2: Tự động lấy từ Artist của Spotify
          if (track.artists && track.artists.length > 0) {
              const mainArtistId = track.artists[0].id;
              const fetchedGenre = await getArtistGenre(token, mainArtistId);
              if (fetchedGenre) {
                  genre = fetchedGenre; 
              }
          }
      }

      // 4. Các thông tin khác
      const album = track.album?.name || null;
      const release_year = track.album?.release_date
        ? parseInt(track.album.release_date.substring(0, 4))
        : null;
      const image_url = track.album?.images?.[0]?.url || null;
      const file_url = track.preview_url;

      // Xử lý Quốc gia
      let country = "Hàn Quốc"; // Mặc định
      // Nếu genre hoặc keyword có chứa từ khóa Việt Nam
      const checkStr = (keyword + " " + genre).toLowerCase();
      if (checkStr.includes('viet') || checkStr.includes('v-pop')) country = 'Việt Nam';
      if (checkStr.includes('k-pop') || checkStr.includes('korea')) country = 'Hàn Quốc';
      if (checkStr.includes('c-pop') || checkStr.includes('china')) country = 'Trung Quốc';
      if (checkStr.includes('j-pop') || checkStr.includes('japan')) country = 'Nhật Bản';


      const listen_count = Math.floor(Math.random() * 10000); 

      // 5. Insert Song
      const [result] = await connection.query(
        `INSERT INTO songs (title, album, genre, release_year, country, image_url, file_url, listen_count, spotify_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`, 
        [ title, album, genre, release_year, country, image_url, file_url, listen_count, spotifyTrackId ]
      );

      const songId = result.insertId;
      console.log(`✅ Đã thêm: ${title} | Genre: ${genre} | Country: ${country}`); 

      // 6. Insert Artists
      for (const artist of track.artists) {
        const artistName = artist.name;
        // Kiểm tra artist tồn tại
        const [existing] = await connection.query(`SELECT id FROM artists WHERE name = ? LIMIT 1`, [artistName]);
        
        let artistId;
        if (existing.length > 0) {
          artistId = existing[0].id;
        } else {
          const [artistResult] = await connection.query(`INSERT INTO artists (name, created_at) VALUES (?, NOW())`, [artistName]);
          artistId = artistResult.insertId;
        }
        // Link bảng trung gian
        await connection.query(`INSERT INTO song_artists (song_id, artist_id) VALUES (?, ?)`, [songId, artistId]);
      }
    }

    console.log(`🎉 Hoàn tất import "${keyword}"!`);
  } catch (err) {
    console.error("❌ Lỗi import:", err.message);
  }
}

// ==============================
// 🚀 CHẠY CHƯƠNG TRÌNH
// ==============================
(async () => {
  // CÁCH DÙNG 1: Tự động tìm genre theo artist
  // await importSpotifyData("Mono"); 

  // CÁCH DÙNG 2: Ép cứng genre mong muốn (Khuyên dùng để dữ liệu sạch)
  await importSpotifyData("", "Kpop");


  // Đóng kết nối
  await connection.end();
  console.log("👋 Bye!");
})();