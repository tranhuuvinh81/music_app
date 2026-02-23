// backend/controllers/searchController.js
import db from "../config/db.js";

// Hàm này sẽ lấy danh sách nghệ sĩ đầy đủ cho một danh sách bài hát
const fetchArtistsForSongs = (songs) => {
  return new Promise((resolve, reject) => {
    if (!songs || songs.length === 0) {
      return resolve([]); 
    }

    const songIds = songs.map((song) => song.id);
    const query = `
      SELECT sa.song_id, a.id, a.name
      FROM song_artists sa
      JOIN artists a ON sa.artist_id = a.id
      WHERE sa.song_id IN (?)
    `;

    db.query(query, [songIds], (err, artistLinks) => {
      if (err) return reject(err);

      const songsWithArtists = songs.map((song) => {
        const artists = artistLinks
          .filter((link) => link.song_id === song.id)
          .map((link) => ({ id: link.id, name: link.name })); 

        const { artist, ...songData } = song; 
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
    // 1. Promise tìm kiếm BÀI HÁT (Thêm s.album LIKE ?)
    const searchSongsPromise = new Promise((resolve, reject) => {
      const query = `
        SELECT DISTINCT 
          s.id, s.title, s.album, s.genre, s.release_year, s.country, 
          s.file_url, s.image_url, s.lyrics_url, s.created_at, s.listen_count
        FROM songs s
        LEFT JOIN song_artists sa ON s.id = sa.song_id
        LEFT JOIN artists a ON sa.artist_id = a.id
        WHERE 
          s.title LIKE ? 
          OR a.name LIKE ?
          OR s.genre LIKE ?
          OR s.country LIKE ?
          OR s.album LIKE ?  -- [MỚI] Tìm kiếm theo Album
        ORDER BY 
          s.created_at DESC
      `;
      
      // Truyền 5 tham số searchTerm tương ứng với 5 dấu ?
      db.query(query, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    // 2. Promise tìm kiếm NGHỆ SĨ
    const searchArtistsPromise = new Promise((resolve, reject) => {
      const query = "SELECT * FROM artists WHERE name LIKE ?";
      db.query(query, [searchTerm], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    // 3. Promise tìm kiếm ALBUM [MỚI]
    // Gom nhóm (GROUP BY) theo tên album để lấy ra danh sách Album không trùng lặp,
    // kèm theo ảnh của bài hát đầu tiên thuộc album đó để làm ảnh bìa.
    const searchAlbumsPromise = new Promise((resolve, reject) => {
      const query = `
        SELECT album AS name, MIN(image_url) AS image_url
        FROM songs 
        WHERE album LIKE ? AND album IS NOT NULL AND album != ''
        GROUP BY album
      `;
      db.query(query, [searchTerm], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    // Chờ cả 3 promises hoàn thành
    let [songResults, artistResults, albumResults] = await Promise.all([
      searchSongsPromise,
      searchArtistsPromise,
      searchAlbumsPromise // Thêm album
    ]);

    // Lấy thông tin nghệ sĩ đầy đủ cho các bài hát tìm được
    const songsWithFullArtists = await fetchArtistsForSongs(songResults);

    // Trả về kết quả cuối cùng
    res.json({
      songs: songsWithFullArtists,
      artists: artistResults,
      albums: albumResults, // [MỚI] Trả về mảng albums
    });
  } catch (err) {
    console.error("Search Error:", err); 
    res.status(500).json({ error: "Lỗi khi thực hiện tìm kiếm", details: err.message });
  }
};