// backend/controllers/songController.js
import db from "../config/db.js";

// lấy danh sách nghệ sĩ đầy đủ cho một danh sách bài hát
const fetchArtistsForSongs = (songs) => {
  return new Promise((resolve, reject) => {
    if (!songs || songs.length === 0) {
      return resolve([]); // Trả về mảng rỗng nếu không có bài hát
    }

    const songIds = songs.map((song) => song.id);
    const query = `
      SELECT sa.song_id, a.id, a.name, a.image_url 
      FROM song_artists sa
      JOIN artists a ON sa.artist_id = a.id
      WHERE sa.song_id IN (?)
    `;

    db.query(query, [songIds], (err, artistLinks) => {
      if (err) return reject(err);

      // Nhóm nghệ sĩ theo song_id
      const songsWithArtists = songs.map((song) => {
        const artists = artistLinks
          .filter((link) => link.song_id === song.id)
          .map((link) => ({
            id: link.id,
            name: link.name,
            image_url: link.image_url,
          }));
        return { ...song, artists: artists };
      });
      resolve(songsWithArtists);
    });
  });
};

// Lấy tất cả bài hát (có kèm nghệ sĩ)
export const getAllSongs = async (req, res) => {
  const query =
    "SELECT id, title, album, genre, release_year, country, file_url, image_url, lyrics_url, listen_count, created_at FROM songs ORDER BY listen_count DESC";
  db.query(query, async (err, songs) => {
    // Thêm async
    if (err) return res.status(500).json({ error: "Lỗi khi truy vấn bài hát" });
    try {
      // Lấy thêm thông tin nghệ sĩ cho các bài hát này
      const songsWithArtists = await fetchArtistsForSongs(songs);
      res.json(songsWithArtists);
    } catch (fetchErr) {
      res.status(500).json({
        error: "Lỗi khi lấy thông tin nghệ sĩ",
        details: fetchErr.message,
      });
    }
  });
};

// Lấy bài hát theo ID (có kèm nghệ sĩ)
export const getSongById = async (req, res) => {
  const { id } = req.params;
  const query =
    "SELECT id, title, album, genre, release_year, country, file_url, image_url, lyrics_url, listen_count, created_at FROM songs WHERE id = ?";
  db.query(query, [id], async (err, results) => {
    // Thêm async
    if (err) return res.status(500).json({ error: "Lỗi khi truy vấn bài hát" });
    if (results.length === 0)
      return res.status(404).json({ message: "Không tìm thấy bài hát" });

    try {
      const song = results[0];
      const songWithArtists = await fetchArtistsForSongs([song]); // fetchArtistsForSongs nhận mảng
      res.json(songWithArtists[0]); // Trả về object bài hát duy nhất
    } catch (fetchErr) {
      res.status(500).json({
        error: "Lỗi khi lấy thông tin nghệ sĩ",
        details: fetchErr.message,
      });
    }
  });
};

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

// ==========================================
export const addSong = async (req, res) => {
  try {
    // 1. Lấy URL từ Cloudinary
    const songUrl = req.files['songFile'] ? req.files['songFile'][0].path : null;
    const imageUrl = req.files['imageFile'] ? req.files['imageFile'][0].path : null;
    const lyricUrl = req.files['lyricFile'] ? req.files['lyricFile'][0].path : null;

    if (!songUrl) {
      return res.status(400).json({ message: "Bắt buộc phải có file nhạc (songFile)" });
    }

    const { title, artist, album, genre, release_year, country } = req.body;

    // 2. Insert vào bảng songs (CHUẨN HÓA 10 CỘT - 10 GIÁ TRỊ)
    // Cột: 1.title, 2.album, 3.genre, 4.release_year, 5.country, 6.file_url, 7.image_url, 8.lyrics_url, 9.created_at, 10.listen_count
    const query = `
      INSERT INTO songs 
      (title, album, genre, release_year, country, file_url, image_url, lyrics_url, created_at, listen_count) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0)
    `;

    // Mảng giá trị (Phải đúng 8 phần tử tương ứng với 8 dấu ?)
    const values = [
      title,                        // 1
      album || null,                // 2
      genre || 'Chưa phân loại',    // 3
      release_year || null,         // 4
      country || 'Khác',            // 5
      songUrl,                      // 6
      imageUrl,                     // 7
      lyricUrl                      // 8
    ];

    // [FIX] Dùng promiseDb
    const [result] = await promiseDb.query(query, values);

    const newSongId = result.insertId;

    // 3. Xử lý Artist
    if (artist) {
        const artistNames = artist.split(',').map(n => n.trim());
        
        for (const name of artistNames) {
            const [existing] = await promiseDb.query(`SELECT id FROM artists WHERE name = ?`, [name]);
            let artistId;
            
            if (existing.length > 0) {
                artistId = existing[0].id;
            } else {
                const [newArtist] = await promiseDb.query(`INSERT INTO artists (name, created_at) VALUES (?, NOW())`, [name]);
                artistId = newArtist.insertId;
            }

            await promiseDb.query(`INSERT INTO song_artists (song_id, artist_id) VALUES (?, ?)`, [newSongId, artistId]);
        }
    }

    res.status(201).json({ message: "Thêm bài hát thành công!", songId: newSongId });
  } catch (err) {
    console.error("Lỗi thêm bài hát:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
// CẬP NHẬT BÀI HÁT (Admin)
export const updateSong = async (req, res) => {
  const { id } = req.params;
  try {
    const [existingSongs] = await promiseDb.query("SELECT * FROM songs WHERE id = ?", [id]);
    if (existingSongs.length === 0) return res.status(404).json({ message: "Song not found" });
    const currentSong = existingSongs[0];

    const songUrl = req.files['songFile'] ? req.files['songFile'][0].path : currentSong.file_url;
    const imageUrl = req.files['imageFile'] ? req.files['imageFile'][0].path : currentSong.image_url;
    const lyricUrl = req.files['lyricFile'] ? req.files['lyricFile'][0].path : currentSong.lyrics_url;

    const { title, album, genre, release_year, country } = req.body;

    const query = `
        UPDATE songs 
        SET title = ?, album = ?, genre = ?, release_year = ?, country = ?, 
            file_url = ?, image_url = ?, lyrics_url = ?
        WHERE id = ?
    `;

    await promiseDb.query(query, [
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

    res.json({ message: "Cập nhật thành công!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Xóa bài hát
export const deleteSong = async (req, res) => {
  const { id } = req.params;
  try {
    await promiseDb.query("DELETE FROM song_artists WHERE song_id = ?", [id]);
    await promiseDb.query("DELETE FROM songs WHERE id = ?", [id]);
    res.json({ message: "Xóa bài hát thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tăng lượt nghe
export const incrementListenCount = async (req, res) => {
  const { id } = req.params;
  try {
    await promiseDb.query("UPDATE songs SET listen_count = listen_count + 1 WHERE id = ?", [id]);
    res.json({ message: "Incremented" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách thể loại unique
export const getGenres = (req, res) => {
  // 1. Lấy TẤT CẢ các chuỗi genre
  const query =
    "SELECT genre FROM songs WHERE genre IS NOT NULL AND genre != ''";
  db.query(query, (err, results) => {
    if (err)
      return res.status(500).json({ error: "Lỗi khi lấy danh sách thể loại" });

    // 2. Tách chuỗi và tạo một Set (tập hợp) duy nhất
    const allGenres = new Set();
    results.forEach((row) => {
      // Tách chuỗi "Pop, K-Pop, Ballad" thành ["Pop", "K-Pop", "Ballad"]
      const genres = row.genre
        .split(",")
        .map((g) => g.trim()) // Xóa khoảng trắng
        .filter((g) => g); // Bỏ các chuỗi rỗng
      genres.forEach((g) => allGenres.add(g));
    });

    // 3. Chuyển Set thành mảng đã sắp xếp và trả về
    res.json(Array.from(allGenres).sort());
  });
};

// Lấy bài hát theo nghệ sĩ
export const getSongsByArtist = (req, res) => {
  const { artistName } = req.params; // Nhận tên nghệ sĩ
  const decodedArtistName = decodeURIComponent(artistName);

  // Tìm artist_id từ tên
  const findArtistIdQuery = "SELECT id FROM artists WHERE name = ?";
  db.query(findArtistIdQuery, [decodedArtistName], (err, artistResults) => {
    if (err) return res.status(500).json({ error: "Lỗi tìm ID nghệ sĩ" });
    if (artistResults.length === 0) {
      return res.json([]); // Không tìm thấy nghệ sĩ -> trả về mảng rỗng
    }
    const artistId = artistResults[0].id;

    // Tìm song_id từ artist_id trong bảng trung gian
    const findSongIdsQuery =
      "SELECT song_id FROM song_artists WHERE artist_id = ?";
    db.query(findSongIdsQuery, [artistId], (err, songLinks) => {
      if (err)
        return res.status(500).json({ error: "Lỗi tìm bài hát của nghệ sĩ" });
      if (songLinks.length === 0) {
        return res.json([]); // Nghệ sĩ này không có bài hát nào
      }
      const songIds = songLinks.map((link) => link.song_id);

      // lấy thông tin bài hát từ song_id
      const getSongsQuery =
        "SELECT id, title, album, genre, release_year, country, file_url, image_url, lyrics_url, listen_count, created_at FROM songs WHERE id IN (?) ORDER BY title";
      db.query(getSongsQuery, [songIds], async (err, songs) => {
        // Thêm async
        if (err)
          return res.status(500).json({ error: "Lỗi lấy thông tin bài hát" });
        try {
          // Lấy đầy đủ thông tin nghệ sĩ cho các bài hát này
          const songsWithArtists = await fetchArtistsForSongs(songs);
          res.json(songsWithArtists);
        } catch (fetchErr) {
          res.status(500).json({
            error: "Lỗi khi lấy thông tin nghệ sĩ",
            details: fetchErr.message,
          });
        }
      });
    });
  });
};

// Lấy bài hát theo thể loại
export const getSongsByGenre = (req, res) => {
  const { genre } = req.params;
  const decodedGenre = decodeURIComponent(genre);

  // 1. Thay vì "genre = ?", dùng "FIND_IN_SET" hoặc "LIKE"
  // FIND_IN_SET chính xác hơn LIKE
  // Nó sẽ tìm 'Pop' trong 'Pop,K-Pop' nhưng không tìm 'Pop' trong 'K-Pop'
  // Chúng ta phải xóa khoảng trắng nếu có: 'Pop, K-Pop' -> 'Pop,K-Pop'
  // Cách đơn giản và hiệu quả nhất vẫn là LIKE
  const searchTerm = `%${decodedGenre}%`;
  // 2. Cập nhật query (thêm listen_count và dùng LIKE)
  const query =
    "SELECT id, title, album, genre, release_year, country, file_url, image_url, lyrics_url, listen_count, created_at FROM songs WHERE genre LIKE ? ORDER BY title";
  db.query(query, [searchTerm], async (err, songs) => {
    // 3. Đổi tham số
    if (err)
      return res
        .status(500)
        .json({ error: "Lỗi khi lấy bài hát theo thể loại" });
    try {
      const songsWithArtists = await fetchArtistsForSongs(songs);
      res.json(songsWithArtists);
    } catch (fetchErr) {
      res.status(500).json({
        error: "Lỗi khi lấy thông tin nghệ sĩ",
        details: fetchErr.message,
      });
    }
  });
};

// --- Lấy danh sách quốc gia unique ---
export const getUniqueCountries = (req, res) => {
  const query =
    "SELECT country FROM songs WHERE country IS NOT NULL AND country != ''";
  db.query(query, (err, results) => {
    if (err)
      return res.status(500).json({ error: "Lỗi khi lấy danh sách quốc gia" });

    const allCountries = new Set();
    results.forEach((row) => {
      const countries = row.country
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c);
      countries.forEach((c) => allCountries.add(c));
    });
    res.json(Array.from(allCountries).sort());
  });
};

// Lấy bài hát theo quốc gia ---
export const getSongsByCountry = (req, res) => {
  const { countryName } = req.params;
  const decodedCountry = decodeURIComponent(countryName);
  const searchTerm = `%${decodedCountry}%`;
  const query =
    "SELECT id, title, album, genre, release_year, country, file_url, image_url, lyrics_url, listen_count, created_at FROM songs WHERE country LIKE ? ORDER BY title";
  db.query(query, [searchTerm], async (err, songs) => {
    if (err)
      return res
        .status(500)
        .json({ error: "Lỗi khi lấy bài hát theo quốc gia" });
    try {
      const songsWithArtists = await fetchArtistsForSongs(songs);
      res.json(songsWithArtists);
    } catch (fetchErr) {
      res.status(500).json({
        error: "Lỗi khi lấy thông tin nghệ sĩ",
        details: fetchErr.message,
      });
    }
  });
};

// Hàm lấy danh sách bài hát thuộc 1 Album cụ thể
export const getSongsByAlbum = (req, res) => {
  const { name } = req.params; // Lấy tên album từ URL

  if (!name) return res.status(400).json({ error: "Thiếu tên album" });

  const query = `
    SELECT s.*, a.id as artist_id, a.name as artist_name
    FROM songs s
    LEFT JOIN song_artists sa ON s.id = sa.song_id
    LEFT JOIN artists a ON sa.artist_id = a.id
    WHERE s.album = ?
  `;

  db.query(query, [name], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Xử lý dữ liệu: Gom nhóm nghệ sĩ vào mảng 'artists' cho từng bài hát
    // Vì LEFT JOIN sẽ tạo ra nhiều dòng nếu 1 bài có nhiều ca sĩ
    const songsMap = new Map();

    results.forEach(row => {
      // Nếu bài hát chưa có trong Map, thêm vào
      if (!songsMap.has(row.id)) {
        const { artist_id, artist_name, ...songData } = row;
        songsMap.set(row.id, {
          ...songData,
          artists: [] // Khởi tạo mảng nghệ sĩ
        });
      }

      // Nếu có thông tin nghệ sĩ, push vào mảng artists
      if (row.artist_id) {
        songsMap.get(row.id).artists.push({
          id: row.artist_id,
          name: row.artist_name
        });
      }
    });

    // Chuyển Map thành Array để trả về
    const songs = Array.from(songsMap.values());
    res.json(songs);
  });
};
