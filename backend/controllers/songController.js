// backend/controllers/songController.js
import db from "../config/db.js";

// [CRITICAL FIX] Ensure we have a promise-based wrapper
// If db is already a promise pool, this might be redundant but safe. 
// If db is a callback connection, this is required.
const promiseDb = db.promise ? db.promise() : db; 

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const fetchArtistsForSongs = async (songs) => {
  if (!songs || songs.length === 0) return [];

  const songIds = songs.map((song) => song.id);
  const query = `
    SELECT sa.song_id, a.id, a.name, a.image_url 
    FROM song_artists sa
    JOIN artists a ON sa.artist_id = a.id
    WHERE sa.song_id IN (?)
  `;

  // Use promiseDb here
  const [artistLinks] = await promiseDb.query(query, [songIds]);

  return songs.map((song) => {
    const artists = artistLinks
      .filter((link) => link.song_id === song.id)
      .map((link) => ({
        id: link.id,
        name: link.name,
        image_url: link.image_url,
      }));
    return { ...song, artists };
  });
};

// ==========================================
// READ OPERATIONS (GET)
// ==========================================

export const getAllSongs = async (req, res) => {
  try {
    const query = "SELECT id, title, album, genre, release_year, country, file_url, image_url, lyrics_url, listen_count, created_at FROM songs ORDER BY listen_count DESC";
    const [songs] = await promiseDb.query(query);
    const songsWithArtists = await fetchArtistsForSongs(songs);
    res.json(songsWithArtists);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi truy vấn bài hát", details: err.message });
  }
};

export const getSongById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = "SELECT id, title, album, genre, release_year, country, file_url, image_url, lyrics_url, listen_count, created_at FROM songs WHERE id = ?";
    const [results] = await promiseDb.query(query, [id]);
    
    if (results.length === 0) return res.status(404).json({ message: "Không tìm thấy bài hát" });

    const songsWithArtists = await fetchArtistsForSongs(results);
    res.json(songsWithArtists[0]);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy thông tin bài hát", details: err.message });
  }
};

// ... (Keep getGenres, getUniqueCountries, getSongsByCountry, getSongsByArtist, getSongsByAlbum as they were or convert them similarly if needed. The provided code below focuses on the CRUD that was failing) ...

export const getGenres = async (req, res) => {
  try {
    const query = "SELECT genre FROM songs WHERE genre IS NOT NULL AND genre != ''";
    const [results] = await promiseDb.query(query);
    const allGenres = new Set();
    results.forEach((row) => {
      if(row.genre) row.genre.split(',').forEach(g => allGenres.add(g.trim()));
    });
    res.json(Array.from(allGenres).sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUniqueCountries = async (req, res) => {
    try {
        const query = "SELECT country FROM songs WHERE country IS NOT NULL AND country != ''";
        const [results] = await promiseDb.query(query);
        const allCountries = new Set();
        results.forEach((row) => {
            if (row.country) {
                row.country.split(',').map(c => c.trim()).filter(c => c).forEach(c => allCountries.add(c));
            }
        });
        res.json(Array.from(allCountries).sort());
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi lấy danh sách quốc gia" });
    }
};

export const getSongsByArtist = async (req, res) => {
    const { artistName } = req.params;
    const decodedArtistName = decodeURIComponent(artistName);
    try {
        const [artistResults] = await promiseDb.query("SELECT id FROM artists WHERE name = ?", [decodedArtistName]);
        if (artistResults.length === 0) return res.json([]);
        
        const artistId = artistResults[0].id;
        const [songLinks] = await promiseDb.query("SELECT song_id FROM song_artists WHERE artist_id = ?", [artistId]);
        if (songLinks.length === 0) return res.json([]);

        const songIds = songLinks.map(link => link.song_id);
        const [songs] = await promiseDb.query("SELECT * FROM songs WHERE id IN (?) ORDER BY title", [songIds]);
        const finalSongs = await fetchArtistsForSongs(songs);
        res.json(finalSongs);
    } catch (err) {
        res.status(500).json({ error: "Lỗi server", details: err.message });
    }
};

export const getSongsByGenre = async (req, res) => {
    const { genre } = req.params;
    const decodedGenre = decodeURIComponent(genre);
    const searchTerm = `%${decodedGenre}%`;
    try {
        const [songs] = await promiseDb.query("SELECT * FROM songs WHERE genre LIKE ? ORDER BY title", [searchTerm]);
        const finalSongs = await fetchArtistsForSongs(songs);
        res.json(finalSongs);
    } catch (err) {
        res.status(500).json({ error: "Lỗi server", details: err.message });
    }
};

export const getSongsByCountry = async (req, res) => {
    const { countryName } = req.params;
    const decodedCountry = decodeURIComponent(countryName);
    const searchTerm = `%${decodedCountry}%`;
    try {
        const [songs] = await promiseDb.query("SELECT * FROM songs WHERE country LIKE ? ORDER BY title", [searchTerm]);
        const finalSongs = await fetchArtistsForSongs(songs);
        res.json(finalSongs);
    } catch (err) {
        res.status(500).json({ error: "Lỗi server", details: err.message });
    }
};

export const getSongsByAlbum = async (req, res) => {
    const { name } = req.params;
    if (!name) return res.status(400).json({ error: "Thiếu tên album" });
    try {
        const query = `
            SELECT s.*, a.id as artist_id, a.name as artist_name
            FROM songs s
            LEFT JOIN song_artists sa ON s.id = sa.song_id
            LEFT JOIN artists a ON sa.artist_id = a.id
            WHERE s.album = ?
        `;
        const [results] = await promiseDb.query(query, [name]);
        
        const songsMap = new Map();
        results.forEach(row => {
            if (!songsMap.has(row.id)) {
                const { artist_id, artist_name, ...songData } = row;
                songsMap.set(row.id, { ...songData, artists: [] });
            }
            if (row.artist_id) {
                songsMap.get(row.id).artists.push({ id: row.artist_id, name: row.artist_name });
            }
        });
        res.json(Array.from(songsMap.values()));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// ==========================================
// WRITE OPERATIONS (ADD/UPDATE/DELETE)
// ==========================================

export const incrementListenCount = async (req, res) => {
  const { id } = req.params;
  try {
    await promiseDb.query("UPDATE songs SET listen_count = listen_count + 1 WHERE id = ?", [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error(`Lỗi listen count song ${id}:`, err.message);
    // Don't crash client for this
    res.sendStatus(500); 
  }
};

export const addSong = async (req, res) => {
  try {
    const { title, artistIds, album, genre, release_year, country } = req.body;

    // [FIX] Handling Cloudinary Files
    // Using optional chaining to safely access files
    const songUrl = req.files?.['songFile']?.[0]?.path || null;
    const imageUrl = req.files?.['imageFile']?.[0]?.path || null;
    const lyricUrl = req.files?.['lyricFile']?.[0]?.path || null;

    if (!title) return res.status(400).json({ error: "Thiếu tiêu đề" });
    if (!songUrl) return res.status(400).json({ error: "Vui lòng upload file nhạc (songFile)" });

    // [FIX] Parse artistIds safely
    let parsedArtistIds = [];
    try {
      // If it's a JSON string, parse it. If it's already an array/number (unlikely with FormData), handle it.
      if (typeof artistIds === 'string') {
          if (artistIds.trim().startsWith('[')) {
              parsedArtistIds = JSON.parse(artistIds);
          } else {
              // Handle comma-separated string "1,2"
              parsedArtistIds = artistIds.split(',').map(Number);
          }
      } else if (typeof artistIds === 'number') {
          parsedArtistIds = [artistIds];
      }
      
      // Filter out invalid IDs (NaN)
      parsedArtistIds = parsedArtistIds.filter(id => !isNaN(id));

      if (parsedArtistIds.length === 0) {
        return res.status(400).json({ error: "Cần chọn ít nhất một nghệ sĩ" });
      }
    } catch (parseError) {
       return res.status(400).json({ error: "Định dạng artistIds không hợp lệ" });
    }

    // [FIX] SQL Query - Explicitly listing columns to match values
    // Using default 0 for listen_count if not provided
    const query = `
      INSERT INTO songs 
      (title, album, genre, release_year, country, file_url, image_url, lyrics_url, created_at, listen_count) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0)
    `;

    // Values array must have EXACTLY 8 items + NOW() + 0 = 10 columns total
    const [result] = await promiseDb.query(query, [
      title,
      album || null,
      genre || null,
      release_year || null,
      country || null,
      songUrl, 
      imageUrl,
      lyricUrl
    ]);

    const newSongId = result.insertId;

    // Insert Song-Artist Links
    if (parsedArtistIds.length > 0) {
      const artistLinks = parsedArtistIds.map((artistId) => [newSongId, artistId]);
      const linkQuery = "INSERT INTO song_artists (song_id, artist_id) VALUES ?";
      await promiseDb.query(linkQuery, [artistLinks]);
    }

    res.status(201).json({ 
      message: "Thêm bài hát thành công!", 
      song: { id: newSongId, title, file_url: songUrl, image_url: imageUrl } 
    });

  } catch (err) {
    console.error("Lỗi thêm bài hát:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

export const updateSong = async (req, res) => {
  const { id } = req.params;
  try {
    const [existingSongs] = await promiseDb.query("SELECT * FROM songs WHERE id = ?", [id]);
    if (existingSongs.length === 0) return res.status(404).json({ message: "Song not found" });
    const currentSong = existingSongs[0];

    // Handle Files: New file path OR existing file path
    const songUrl = req.files?.['songFile']?.[0]?.path || currentSong.file_url;
    const imageUrl = req.files?.['imageFile']?.[0]?.path || currentSong.image_url;
    const lyricUrl = req.files?.['lyricFile']?.[0]?.path || currentSong.lyrics_url;

    const { title, artistIds, album, genre, release_year, country } = req.body;

    // Parse Artist IDs
    let parsedArtistIds = [];
    try {
        if (typeof artistIds === 'string') {
            if (artistIds.trim().startsWith('[')) {
                parsedArtistIds = JSON.parse(artistIds);
            } else {
                parsedArtistIds = artistIds.split(',').map(Number);
            }
        } else if (typeof artistIds === 'number') {
            parsedArtistIds = [artistIds];
        }
        parsedArtistIds = parsedArtistIds.filter(id => !isNaN(id));
    } catch (e) {
        console.log("Error parsing artistIds in update", e);
    }

    const updateQuery = `
        UPDATE songs 
        SET title = ?, album = ?, genre = ?, release_year = ?, country = ?, 
            file_url = ?, image_url = ?, lyrics_url = ?
        WHERE id = ?
    `;

    await promiseDb.query(updateQuery, [
        title || currentSong.title,
        album || currentSong.album,
        genre || currentSong.genre,
        release_year || currentSong.release_year,
        country || currentSong.country,
        songUrl,
        imageUrl,
        lyricUrl,
        id
    ]);

    // Update Artists if provided
    if (parsedArtistIds.length > 0) {
        await promiseDb.query("DELETE FROM song_artists WHERE song_id = ?", [id]);
        const newArtistLinks = parsedArtistIds.map((artistId) => [id, artistId]);
        await promiseDb.query("INSERT INTO song_artists (song_id, artist_id) VALUES ?", [newArtistLinks]);
    }

    res.json({ message: "Cập nhật thành công!" });

  } catch (err) {
    console.error("Lỗi cập nhật bài hát:", err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteSong = async (req, res) => {
  const { id } = req.params;
  try {
    await promiseDb.query("DELETE FROM song_artists WHERE song_id = ?", [id]);
    // Optional: Delete comments if you have that table
    // await promiseDb.query("DELETE FROM comments WHERE song_id = ?", [id]);
    
    const [result] = await promiseDb.query("DELETE FROM songs WHERE id = ?", [id]);
    
    if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy bài hát" });
    
    res.json({ message: "Xóa bài hát thành công" });
  } catch (err) {
    console.error("Lỗi xóa bài hát:", err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------

// // Tăng lượt nghe
// export const incrementListenCount = (req, res) => {
//   const { id } = req.params;
//   const query = "UPDATE songs SET listen_count = listen_count + 1 WHERE id = ?";

//   db.query(query, [id], (err, result) => {
//     if (err) {
//       // Ghi log lỗi nhưng không cần báo về client
//       console.error(`Lỗi khi tăng lượt nghe cho song ${id}:`, err.message);
//       return res.status(500).json({ error: "Lỗi server" });
//     }
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Không tìm thấy bài hát" });
//     }
//     // Gửi 204 No Content, client không cần dữ liệu trả về
//     res.sendStatus(204);
//   });
// };

// // Thêm bài hát mới (xử lý nhiều artistIds)
// export const addSong = (req, res) => {
//   const { title, artistIds, album, genre, release_year, country } = req.body;

//   // Chuyển đổi chuỗi JSON thành mảng ID
//   let parsedArtistIds = [];
//   try {
//     parsedArtistIds = JSON.parse(artistIds || "[]");
//     if (!Array.isArray(parsedArtistIds) || parsedArtistIds.length === 0) {
//       return res.status(400).json({ error: "Cần chọn ít nhất một nghệ sĩ" });
//     }
//   } catch (parseError) {
//     return res
//       .status(400)
//       .json({ error: "Định dạng artistIds không hợp lệ (cần là mảng ID)" });
//   }

//   if (!title) {
//     return res.status(400).json({ error: "Thiếu tiêu đề" });
//   }
//   if (!req.files || !req.files.songFile) {
//     return res.status(400).json({ error: "Vui lòng upload file nhạc" });
//   }

//   const file_url = `/uploads/songs/${req.files.songFile[0].filename}`;
//   const image_url = req.files.imageFile
//     ? `/uploads/images/${req.files.imageFile[0].filename}`
//     : null;
//   const lyrics_url = req.files.lyricFile
//     ? `/uploads/lyrics/${req.files.lyricFile[0].filename}`
//     : null;

//   const query = `INSERT INTO songs (title, album, genre, release_year, country, file_url, image_url, lyrics_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
//   db.query(
//     query,
//     [
//       title,
//       album,
//       genre,
//       release_year,
//       country || null,
//       file_url,
//       image_url,
//       lyrics_url,
//     ],
//     (err, result) => {
//       if (err)
//         return res
//           .status(500)
//           .json({ error: "Lỗi khi thêm bài hát", details: err.message });

//       const newSongId = result.insertId;

//       // Thêm các liên kết vào bảng song_artists
//       const artistLinks = parsedArtistIds.map((artistId) => [
//         newSongId,
//         artistId,
//       ]);
//       if (artistLinks.length > 0) {
//         const linkQuery =
//           "INSERT INTO song_artists (song_id, artist_id) VALUES ?";
//         db.query(linkQuery, [artistLinks], (linkErr) => {
//           if (linkErr) {
//             // Cân nhắc xóa bài hát vừa tạo nếu liên kết thất bại (rollback)
//             console.error("Lỗi khi liên kết nghệ sĩ:", linkErr);
//             return res.status(500).json({
//               error: "Lỗi khi liên kết nghệ sĩ",
//               details: linkErr.message,
//             });
//           }
//           res.status(201).json({
//             message: "Thêm bài hát và liên kết nghệ sĩ thành công",
//             id: newSongId,
//           });
//         });
//       } else {
//         // Trường hợp này không nên xảy ra do đã check ở trên
//         res.status(201).json({
//           message: "Thêm bài hát thành công (không có nghệ sĩ liên kết)",
//           id: newSongId,
//         });
//       }
//     }
//   );
// };

// // Cập nhật bài hát (xử lý nhiều artistIds)
// export const updateSong = async (req, res) => {
//   const { id: songId } = req.params;
//   const { title, artistIds, album, genre, release_year, country } = req.body;

//   let parsedArtistIds = [];
//   try {
//     parsedArtistIds = JSON.parse(artistIds || "[]");
//     if (!Array.isArray(parsedArtistIds) || parsedArtistIds.length === 0) {
//       return res.status(400).json({ error: "Cần chọn ít nhất một nghệ sĩ" });
//     }
//   } catch (parseError) {
//     return res.status(400).json({ error: "Định dạng artistIds không hợp lệ" });
//   }

//   try {
//     const getOldSongQuery =
//       "SELECT file_url, image_url, lyrics_url FROM songs WHERE id = ?";
//     db.query(getOldSongQuery, [songId], (err, results) => {
//       if (err)
//         return res.status(500).json({ error: "Lỗi truy vấn bài hát cũ" });
//       if (results.length === 0)
//         return res.status(404).json({ message: "Không tìm thấy bài hát" });

//       let { file_url, image_url, lyrics_url } = results[0];

//       if (req.files) {
//         if (req.files.songFile)
//           file_url = `/uploads/songs/${req.files.songFile[0].filename}`;
//         if (req.files.imageFile)
//           image_url = `/uploads/images/${req.files.imageFile[0].filename}`;
//         if (req.files.lyricFile)
//           lyrics_url = `/uploads/lyrics/${req.files.lyricFile[0].filename}`;
//       }

//       const updateSongQuery = `UPDATE songs SET title=?, album=?, genre=?, release_year=?, country=?, file_url=?, image_url=?, lyrics_url=? WHERE id=?`;
//       db.query(
//         updateSongQuery,
//         [
//           title,
//           album,
//           genre,
//           release_year,
//           country || null,
//           file_url,
//           image_url,
//           lyrics_url,
//           songId,
//         ],
//         (updateErr) => {
//           if (updateErr)
//             return res.status(500).json({
//               error: "Lỗi khi cập nhật bài hát",
//               details: updateErr.message,
//             });
//           const deleteLinksQuery = "DELETE FROM song_artists WHERE song_id = ?";
//           db.query(deleteLinksQuery, [songId], (deleteErr) => {
//             if (deleteErr)
//               return res.status(500).json({
//                 error: "Lỗi khi xóa liên kết nghệ sĩ cũ",
//                 details: deleteErr.message,
//               });

//             const newArtistLinks = parsedArtistIds.map((artistId) => [
//               songId,
//               artistId,
//             ]);
//             if (newArtistLinks.length > 0) {
//               const insertLinksQuery =
//                 "INSERT INTO song_artists (song_id, artist_id) VALUES ?";
//               db.query(insertLinksQuery, [newArtistLinks], (insertErr) => {
//                 if (insertErr)
//                   return res.status(500).json({
//                     error: "Lỗi khi thêm liên kết nghệ sĩ mới",
//                     details: insertErr.message,
//                   });
//                 res.json({
//                   message: "Cập nhật bài hát và liên kết nghệ sĩ thành công",
//                 });
//               });
//             } else {
//               res.json({
//                 message:
//                   "Cập nhật bài hát thành công (không có nghệ sĩ liên kết)",
//               });
//             }
//           });
//         }
//       );
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "Lỗi server không xác định", details: error.message });
//   }
// };

// // Xóa bài hát
// export const deleteSong = (req, res) => {
//   const { id } = req.params;
//   db.query("DELETE FROM songs WHERE id = ?", [id], (err, result) => {
//     if (err) return res.status(500).json({ error: "Lỗi khi xóa bài hát" });
//     if (result.affectedRows === 0)
//       return res.status(404).json({ message: "Không tìm thấy bài hát" });
//     res.json({ message: "Xóa bài hát thành công" });
//   });
// };

// // Lấy danh sách thể loại unique
// export const getGenres = (req, res) => {
//   // 1. Lấy TẤT CẢ các chuỗi genre
//   const query =
//     "SELECT genre FROM songs WHERE genre IS NOT NULL AND genre != ''";
//   db.query(query, (err, results) => {
//     if (err)
//       return res.status(500).json({ error: "Lỗi khi lấy danh sách thể loại" });

//     // 2. Tách chuỗi và tạo một Set (tập hợp) duy nhất
//     const allGenres = new Set();
//     results.forEach((row) => {
//       // Tách chuỗi "Pop, K-Pop, Ballad" thành ["Pop", "K-Pop", "Ballad"]
//       const genres = row.genre
//         .split(",")
//         .map((g) => g.trim()) // Xóa khoảng trắng
//         .filter((g) => g); // Bỏ các chuỗi rỗng
//       genres.forEach((g) => allGenres.add(g));
//     });

//     // 3. Chuyển Set thành mảng đã sắp xếp và trả về
//     res.json(Array.from(allGenres).sort());
//   });
// };