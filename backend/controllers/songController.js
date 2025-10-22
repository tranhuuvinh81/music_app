// backend/controllers/songController.js
import db from "../config/db.js";

// Hàm này sẽ lấy danh sách nghệ sĩ đầy đủ cho một danh sách bài hát
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
          })); // Chỉ lấy thông tin cần thiết
        return { ...song, artists: artists }; // Thêm mảng artists vào object song
      });
      resolve(songsWithArtists);
    });
  });
};

// Lấy tất cả bài hát (có kèm nghệ sĩ)
export const getAllSongs = async (req, res) => {
  // Bỏ cột 'artist' cũ nếu bạn chưa xóa
  const query =
    "SELECT id, title, album, genre, release_year, file_url, image_url, lyrics_url, created_at FROM songs ORDER BY created_at DESC";
  db.query(query, async (err, songs) => {
    // Thêm async ở đây
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
    "SELECT id, title, album, genre, release_year, file_url, image_url, lyrics_url, created_at FROM songs WHERE id = ?";
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

// Thêm bài hát mới (xử lý nhiều artistIds)
export const addSong = (req, res) => {
  const { title, artistIds, album, genre, release_year } = req.body;

  // Chuyển đổi chuỗi JSON thành mảng ID
  let parsedArtistIds = [];
  try {
    parsedArtistIds = JSON.parse(artistIds || "[]");
    if (!Array.isArray(parsedArtistIds) || parsedArtistIds.length === 0) {
      return res.status(400).json({ error: "Cần chọn ít nhất một nghệ sĩ" });
    }
  } catch (parseError) {
    return res
      .status(400)
      .json({ error: "Định dạng artistIds không hợp lệ (cần là mảng ID)" });
  }

  if (!title) {
    return res.status(400).json({ error: "Thiếu tiêu đề" });
  }
  if (!req.files || !req.files.songFile) {
    return res.status(400).json({ error: "Vui lòng upload file nhạc" });
  }

  const file_url = `/uploads/songs/${req.files.songFile[0].filename}`;
  const image_url = req.files.imageFile
    ? `/uploads/images/${req.files.imageFile[0].filename}`
    : null;
  const lyrics_url = req.files.lyricFile
    ? `/uploads/lyrics/${req.files.lyricFile[0].filename}`
    : null;

  const query = `INSERT INTO songs (title, album, genre, release_year, file_url, image_url, lyrics_url) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    query,
    [title, album, genre, release_year, file_url, image_url, lyrics_url],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Lỗi khi thêm bài hát", details: err.message });

      const newSongId = result.insertId;

      // Thêm các liên kết vào bảng song_artists
      const artistLinks = parsedArtistIds.map((artistId) => [
        newSongId,
        artistId,
      ]);
      if (artistLinks.length > 0) {
        const linkQuery =
          "INSERT INTO song_artists (song_id, artist_id) VALUES ?";
        db.query(linkQuery, [artistLinks], (linkErr) => {
          if (linkErr) {
            // Cân nhắc xóa bài hát vừa tạo nếu liên kết thất bại (rollback)
            console.error("Lỗi khi liên kết nghệ sĩ:", linkErr);
            return res.status(500).json({
              error: "Lỗi khi liên kết nghệ sĩ",
              details: linkErr.message,
            });
          }
          res.status(201).json({
            message: "Thêm bài hát và liên kết nghệ sĩ thành công",
            id: newSongId,
          });
        });
      } else {
        // Trường hợp này không nên xảy ra do đã check ở trên
        res.status(201).json({
          message: "Thêm bài hát thành công (không có nghệ sĩ liên kết)",
          id: newSongId,
        });
      }
    }
  );
};

// Cập nhật bài hát (xử lý nhiều artistIds)
export const updateSong = async (req, res) => {
  const { id: songId } = req.params;
  const { title, artistIds, album, genre, release_year } = req.body;

  let parsedArtistIds = [];
  try {
    parsedArtistIds = JSON.parse(artistIds || "[]");
    if (!Array.isArray(parsedArtistIds) || parsedArtistIds.length === 0) {
      return res.status(400).json({ error: "Cần chọn ít nhất một nghệ sĩ" });
    }
  } catch (parseError) {
    return res.status(400).json({ error: "Định dạng artistIds không hợp lệ" });
  }

  try {
    // Lấy thông tin file cũ
    const getOldSongQuery =
      "SELECT file_url, image_url, lyrics_url FROM songs WHERE id = ?";
    db.query(getOldSongQuery, [songId], (err, results) => {
      if (err)
        return res.status(500).json({ error: "Lỗi truy vấn bài hát cũ" });
      if (results.length === 0)
        return res.status(404).json({ message: "Không tìm thấy bài hát" });

      let { file_url, image_url, lyrics_url } = results[0];

      // Cập nhật file urls nếu có file mới
      if (req.files) {
        if (req.files.songFile)
          file_url = `/uploads/songs/${req.files.songFile[0].filename}`;
        if (req.files.imageFile)
          image_url = `/uploads/images/${req.files.imageFile[0].filename}`;
        if (req.files.lyricFile)
          lyrics_url = `/uploads/lyrics/${req.files.lyricFile[0].filename}`;
      }

      // 1. Cập nhật bảng songs (không còn cột artist)
      const updateSongQuery = `UPDATE songs SET title=?, album=?, genre=?, release_year=?, file_url=?, image_url=?, lyrics_url=? WHERE id=?`;
      db.query(
        updateSongQuery,
        [
          title,
          album,
          genre,
          release_year,
          file_url,
          image_url,
          lyrics_url,
          songId,
        ],
        (updateErr) => {
          if (updateErr)
            return res.status(500).json({
              error: "Lỗi khi cập nhật bài hát",
              details: updateErr.message,
            });

          // 2. Xóa liên kết nghệ sĩ cũ
          const deleteLinksQuery = "DELETE FROM song_artists WHERE song_id = ?";
          db.query(deleteLinksQuery, [songId], (deleteErr) => {
            if (deleteErr)
              return res.status(500).json({
                error: "Lỗi khi xóa liên kết nghệ sĩ cũ",
                details: deleteErr.message,
              });

            // 3. Thêm liên kết nghệ sĩ mới
            const newArtistLinks = parsedArtistIds.map((artistId) => [
              songId,
              artistId,
            ]);
            if (newArtistLinks.length > 0) {
              const insertLinksQuery =
                "INSERT INTO song_artists (song_id, artist_id) VALUES ?";
              db.query(insertLinksQuery, [newArtistLinks], (insertErr) => {
                if (insertErr)
                  return res.status(500).json({
                    error: "Lỗi khi thêm liên kết nghệ sĩ mới",
                    details: insertErr.message,
                  });
                res.json({
                  message: "Cập nhật bài hát và liên kết nghệ sĩ thành công",
                });
              });
            } else {
              res.json({
                message:
                  "Cập nhật bài hát thành công (không có nghệ sĩ liên kết)",
              });
            }
          });
        }
      );
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Lỗi server không xác định", details: error.message });
  }
};

// Xóa bài hát
export const deleteSong = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM songs WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Lỗi khi xóa bài hát" });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Không tìm thấy bài hát" });
    res.json({ message: "Xóa bài hát thành công" });
  });
};

// Lấy danh sách thể loại unique
export const getGenres = (req, res) => {
  const query =
    "SELECT DISTINCT genre FROM songs WHERE genre IS NOT NULL ORDER BY genre";
  db.query(query, (err, results) => {
    if (err)
      return res.status(500).json({ error: "Lỗi khi lấy danh sách thể loại" });
    res.json(results.map((row) => row.genre));
  });
};

// Lấy bài hát theo nghệ sĩ
export const getSongsByArtist = (req, res) => {
  const { artistName } = req.params; // Nhận tên nghệ sĩ
  const decodedArtistName = decodeURIComponent(artistName);

  // 1. Tìm artist_id từ tên
  const findArtistIdQuery = "SELECT id FROM artists WHERE name = ?";
  db.query(findArtistIdQuery, [decodedArtistName], (err, artistResults) => {
    if (err) return res.status(500).json({ error: "Lỗi tìm ID nghệ sĩ" });
    if (artistResults.length === 0) {
      return res.json([]); // Không tìm thấy nghệ sĩ -> trả về mảng rỗng
    }
    const artistId = artistResults[0].id;

    // 2. Tìm song_id từ artist_id trong bảng trung gian
    const findSongIdsQuery =
      "SELECT song_id FROM song_artists WHERE artist_id = ?";
    db.query(findSongIdsQuery, [artistId], (err, songLinks) => {
      if (err)
        return res.status(500).json({ error: "Lỗi tìm bài hát của nghệ sĩ" });
      if (songLinks.length === 0) {
        return res.json([]); // Nghệ sĩ này không có bài hát nào
      }
      const songIds = songLinks.map((link) => link.song_id);

      // 3. Lấy thông tin bài hát từ song_id
      const getSongsQuery =
        "SELECT id, title, album, genre, release_year, file_url, image_url, lyrics_url, created_at FROM songs WHERE id IN (?) ORDER BY title";
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
  const query =
    "SELECT id, title, album, genre, release_year, file_url, image_url, lyrics_url, created_at FROM songs WHERE genre = ? ORDER BY title";
  db.query(query, [decodeURIComponent(genre)], async (err, songs) => {
    // Thêm async
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
