import db from "../config/db.js";

// --- Hàm HELPER (Copy từ songController.js) ---
// Hàm này sẽ lấy danh sách nghệ sĩ đầy đủ cho một danh sách bài hát
const fetchArtistsForSongs = (songs) => {
  return new Promise((resolve, reject) => {
    if (!songs || songs.length === 0) {
      return resolve([]); // Trả về mảng rỗng nếu không có bài hát
    }

    const songIds = songs.map(song => song.id);
    // Lấy ID và Tên nghệ sĩ
    const query = `
      SELECT sa.song_id, a.id, a.name
      FROM song_artists sa
      JOIN artists a ON sa.artist_id = a.id
      WHERE sa.song_id IN (?)
    `;

    db.query(query, [songIds], (err, artistLinks) => {
      if (err) return reject(err);

      // Nhóm nghệ sĩ theo song_id
      const songsWithArtists = songs.map(song => {
        // Lọc các nghệ sĩ thuộc bài hát hiện tại
        const artists = artistLinks
          .filter(link => link.song_id === song.id)
          .map(link => ({ id: link.id, name: link.name })); // Chỉ lấy id và name

        // Xóa cột artist cũ (nếu có) và thêm mảng artists mới
        const { artist, ...songData } = song; // Loại bỏ cột artist cũ nếu nó vẫn còn trong kết quả query ban đầu
        return { ...songData, artists: artists };
      });
      resolve(songsWithArtists);
    });
  });
};


// --- Hàm Search chính ---
export const searchAll = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Thiếu từ khóa tìm kiếm" });
  }

  const searchTerm = `%${q}%`;

  try {
    // Promise tìm kiếm bài hát (ĐÃ SỬA QUERY)
    const searchSongsPromise = new Promise((resolve, reject) => {
      // Query này tìm bài hát dựa trên:
      // 1. Tiêu đề bài hát (s.title)
      // 2. Tên nghệ sĩ liên kết (a.name)
      // Dùng DISTINCT để tránh trùng lặp bài hát nếu nhiều nghệ sĩ cùng khớp
      const query = `
        SELECT DISTINCT s.id, s.title, s.album, s.genre, s.release_year, s.file_url, s.image_url, s.lyrics_url, s.created_at
        FROM songs s
        LEFT JOIN song_artists sa ON s.id = sa.song_id
        LEFT JOIN artists a ON sa.artist_id = a.id
        WHERE s.title LIKE ? OR a.name LIKE ?
        ORDER BY s.created_at DESC
      `;
      db.query(query, [searchTerm, searchTerm], (err, results) => {
        if (err) return reject(err);
        resolve(results); // Kết quả chỉ chứa thông tin bài hát cơ bản
      });
    });

    // Promise tìm kiếm nghệ sĩ (giữ nguyên)
    const searchArtistsPromise = new Promise((resolve, reject) => {
      const query = "SELECT * FROM artists WHERE name LIKE ?";
      db.query(query, [searchTerm], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    // Chờ cả 2 promises hoàn thành
    let [songResults, artistResults] = await Promise.all([
      searchSongsPromise,
      searchArtistsPromise,
    ]);

    // Lấy thông tin nghệ sĩ đầy đủ cho các bài hát tìm được
    const songsWithFullArtists = await fetchArtistsForSongs(songResults);

    // Trả về kết quả cuối cùng
    res.json({
      songs: songsWithFullArtists, // Trả về bài hát đã có mảng artists đầy đủ
      artists: artistResults,
    });

  } catch (err) {
    console.error("Search Error:", err); // Log lỗi chi tiết ở backend
    res.status(500).json({ error: "Lỗi khi thực hiện tìm kiếm", details: err.message });
  }
};
