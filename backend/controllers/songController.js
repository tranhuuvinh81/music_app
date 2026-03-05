// backend/controllers/songController.js
import db from "../config/db.js";

const promiseDb = db.promise();

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
    "SELECT id, title, album, genre, release_year, country, file_url, image_url, lyrics_url, listen_count, created_at FROM songs ORDER BY id DESC";
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

// [NEW] API chuyên dụng cho Trang chủ (Gộp 2 request thành 1)
export const getHomeData = async (req, res) => {
  try {
    // 1. Lấy cấu hình pinned_song_ids từ bảng settings
    const [settingsResults] = await promiseDb.query(
      "SELECT setting_value FROM settings WHERE setting_key = 'pinned_song_ids'"
    );
    
    let rawSettings = [];
    if (settingsResults.length > 0) {
      try {
         rawSettings = JSON.parse(settingsResults[0].setting_value);
      } catch(e) {
         rawSettings = [];
      }
    }

    // 2. Lấy TOÀN BỘ bài hát (kèm theo thông tin liên kết với bảng artists)
    // Thay vì gọi fetchArtistsForSongs sau khi select (sẽ tạo thêm N query phụ),
    // Ta dùng LEFT JOIN và JSON_ARRAYAGG để MySQL gộp mảng nghệ sĩ ngay trong 1 lần query duy nhất!
    const query = `
      SELECT 
        s.id, s.title, s.album, s.genre, s.release_year, s.country, 
        s.file_url, s.image_url, s.lyrics_url, s.listen_count, s.created_at,
        JSON_ARRAYAGG(
          JSON_OBJECT('id', a.id, 'name', a.name)
        ) AS artists
      FROM songs s
      LEFT JOIN song_artists sa ON s.id = sa.song_id
      LEFT JOIN artists a ON sa.artist_id = a.id
      GROUP BY s.id
    `;
    const [results] = await promiseDb.query(query);

    // Chuẩn hóa mảng artists (Vì MySQL trả về JSON object có null bên trong nếu không có nghệ sĩ)
    const allSongs = results.map(song => {
        let parsedArtists = [];
        if (typeof song.artists === 'string') {
            parsedArtists = JSON.parse(song.artists);
        } else if (Array.isArray(song.artists)) {
            parsedArtists = song.artists;
        }
        // Xóa các object null (nếu bài hát chưa gán nghệ sĩ nào)
        parsedArtists = parsedArtists.filter(a => a && a.id !== null);
        
        return { ...song, artists: parsedArtists };
    });

    // 3. Phân loại và tạo cấu trúc trả về cho Frontend
    let blocks = [];
    let allPinnedIds = new Set(); 

    if (Array.isArray(rawSettings) && rawSettings.length > 0) {
        if (typeof rawSettings[0] === 'object') {
            // Định dạng mới (CMS Blocks)
            blocks = rawSettings.map(block => {
                const songsInBlock = block.songIds
                    .map(id => allSongs.find(s => s.id === id))
                    .filter(Boolean);
                block.songIds.forEach(id => allPinnedIds.add(id));
                return { id: block.id, title: block.title, songs: songsInBlock };
            });
        } else {
            // Fallback định dạng cũ (Mảng ID đơn)
            const pinnedSongs = allSongs.filter(song => rawSettings.includes(song.id));
            pinnedSongs.sort((a, b) => rawSettings.indexOf(a.id) - rawSettings.indexOf(b.id));
            blocks = [{ id: 'legacy', title: 'Bài hát nổi bật', songs: pinnedSongs }];
            rawSettings.forEach(id => allPinnedIds.add(id));
        }
    }

    // Trending: Các bài hát không nằm trong Blocks, xếp theo lượt nghe giảm dần
    const trending = allSongs
        .filter(song => !allPinnedIds.has(song.id))
        .sort((a, b) => (b.listen_count || 0) - (a.listen_count || 0));

    // Trả về duy nhất 1 cục JSON "dọn sẵn" cho Frontend
    res.json({ blocks, trending });

  } catch (error) {
    console.error("Lỗi getHomeData:", error);
    res.status(500).json({ error: "Lỗi server khi tải dữ liệu trang chủ" });
  }
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
// ==========================================
// CÁC HÀM LOGIC XỬ LÝ (ADD/UPDATE/DELETE/ETC)
// ==========================================

// Tăng lượt nghe
export const incrementListenCount = async (req, res) => {
  const { id } = req.params;
  const query = "UPDATE songs SET listen_count = listen_count + 1 WHERE id = ?";

  try {
    const [result] = await promiseDb.query(query, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài hát" });
    }
    // Gửi 204 No Content, client không cần dữ liệu trả về
    res.sendStatus(204);
  } catch (err) {
    console.error(`Lỗi khi tăng lượt nghe cho song ${id}:`, err.message);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// Thêm bài hát mới
export const addSong = async (req, res) => {
  try {
    const { title, artistIds, album, genre, release_year, country } = req.body;

    // 1. Lấy URL file từ Cloudinary (Dùng optional chaining an toàn)
    // Nếu không có file, gán null
    const songUrl = req.files?.['songFile']?.[0]?.path || null;
    const imageUrl = req.files?.['imageFile']?.[0]?.path || null;
    const lyricUrl = req.files?.['lyricFile']?.[0]?.path || null;

    // Validate dữ liệu bắt buộc
    if (!title) return res.status(400).json({ error: "Thiếu tiêu đề" });
    if (!songUrl) return res.status(400).json({ error: "Vui lòng upload file nhạc (songFile)" });

    // 2. Xử lý nghệ sĩ (Artist IDs) - Hỗ trợ cả JSON mảng lẫn chuỗi
    let parsedArtistIds = [];
    try {
      if (typeof artistIds === 'string') {
          // Nếu là chuỗi JSON "[1,2]" -> Parse JSON
          if (artistIds.trim().startsWith('[')) {
             parsedArtistIds = JSON.parse(artistIds);
          } else {
             // Nếu là chuỗi thường "1,2" -> Split
             parsedArtistIds = artistIds.split(',').map(Number);
          }
      } else if (typeof artistIds === 'number') {
          parsedArtistIds = [artistIds];
      }
      // Lọc bỏ các giá trị không phải số (NaN)
      parsedArtistIds = parsedArtistIds.filter(id => !isNaN(id));

      if (parsedArtistIds.length === 0) {
        return res.status(400).json({ error: "Cần chọn ít nhất một nghệ sĩ" });
      }
    } catch (parseError) {
       return res.status(400).json({ error: "Định dạng artistIds không hợp lệ" });
    }

    // 3. Chuẩn bị dữ liệu để Insert
    // [KỸ THUẬT QUAN TRỌNG]: Gom tất cả vào 1 object
    const songData = {
      title: title,
      album: album || null,
      genre: genre || null,
      release_year: release_year || null,
      country: country || null,
      file_url: songUrl,
      image_url: imageUrl,
      lyrics_url: lyricUrl,
      created_at: new Date(),
      listen_count: 0
    };

    // [FIX LỖI COLUMN COUNT] 
    // Thay vì viết VALUES (?,?,...), ta dùng cú pháp SET ?
    // MySQL sẽ tự động map: title -> songData.title, album -> songData.album...
    // Đảm bảo không bao giờ bị lệch cột
    const query = "INSERT INTO songs SET ?";

    // Thực thi
    const [result] = await promiseDb.query(query, songData);
    const newSongId = result.insertId;

    // 4. Liên kết nghệ sĩ vào bảng trung gian
    if (parsedArtistIds.length > 0) {
      // Tạo mảng lồng nhau: [[songId, artistId1], [songId, artistId2]]
      const artistLinks = parsedArtistIds.map((artistId) => [newSongId, artistId]);
      
      // Dùng cú pháp bulk insert của MySQL: VALUES ?
      await promiseDb.query("INSERT INTO song_artists (song_id, artist_id) VALUES ?", [artistLinks]);
    }

    res.status(201).json({ 
      message: "Thêm bài hát thành công!", 
      song: { id: newSongId, ...songData } 
    });

  } catch (err) {
    console.error("Lỗi thêm bài hát:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Cập nhật bài hát (xử lý nhiều artistIds và Cloudinary)
export const updateSong = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Kiểm tra bài hát tồn tại & Lấy thông tin cũ
    const [existingSongs] = await promiseDb.query("SELECT * FROM songs WHERE id = ?", [id]);
    if (existingSongs.length === 0) return res.status(404).json({ message: "Song not found" });
    const currentSong = existingSongs[0];

    // 2. Lấy URL mới từ Cloudinary (nếu có upload), ngược lại giữ nguyên URL cũ
    // Sử dụng optional chaining (?.) để tránh lỗi nếu req.files undefined
    const songUrl = req.files?.['songFile'] ? req.files['songFile'][0].path : currentSong.file_url;
    const imageUrl = req.files?.['imageFile'] ? req.files['imageFile'][0].path : currentSong.image_url;
    const lyricUrl = req.files?.['lyricFile'] ? req.files['lyricFile'][0].path : currentSong.lyrics_url;

    const { title, artistIds, album, genre, release_year, country } = req.body;

    // Xử lý artistIds tương tự hàm addSong
    let parsedArtistIds = [];
    try {
      parsedArtistIds = JSON.parse(artistIds || "[]");
      if (typeof parsedArtistIds === 'number') parsedArtistIds = [parsedArtistIds];
      // Nếu không có artistIds trong body (người dùng không sửa nghệ sĩ), ta có thể bỏ qua bước update nghệ sĩ
      // Nhưng logic ở đây giả định form luôn gửi artistIds lên
    } catch (parseError) {
       if (typeof artistIds === 'string') {
          parsedArtistIds = artistIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
       }
    }

    // 3. Update bảng songs
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

    // 4. Update liên kết nghệ sĩ (Xóa cũ -> Thêm mới)
    if (parsedArtistIds.length > 0) {
        // Xóa liên kết cũ
        await promiseDb.query("DELETE FROM song_artists WHERE song_id = ?", [id]);
        
        // Thêm liên kết mới
        const newArtistLinks = parsedArtistIds.map((artistId) => [id, artistId]);
        const insertLinksQuery = "INSERT INTO song_artists (song_id, artist_id) VALUES ?";
        await promiseDb.query(insertLinksQuery, [newArtistLinks]);
    }

    res.json({ message: "Cập nhật thành công!" });

  } catch (err) {
    console.error("Lỗi cập nhật bài hát:", err);
    res.status(500).json({ error: err.message });
  }
};

// Xóa bài hát
export const deleteSong = async (req, res) => {
  const { id } = req.params;
  try {
    // Xóa liên kết trong bảng phụ trước (song_artists, comments, playlists_songs...)
    // Lưu ý: Nếu DB đã set ON DELETE CASCADE thì chỉ cần xóa bảng songs là đủ.
    // Nếu chưa set cascade, cần xóa thủ công:
    await promiseDb.query("DELETE FROM song_artists WHERE song_id = ?", [id]);
    
    // Nếu có bảng comments hoặc playlist_songs thì xóa thêm ở đây
    // await promiseDb.query("DELETE FROM comments WHERE song_id = ?", [id]); 
    
    // Xóa bài hát
    const [result] = await promiseDb.query("DELETE FROM songs WHERE id = ?", [id]);
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Không tìm thấy bài hát" });
    }
    
    res.json({ message: "Xóa bài hát thành công" });
  } catch (err) {
    console.error("Lỗi xóa bài hát:", err);
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách thể loại unique
export const getGenres = async (req, res) => {
  try {
    const query = "SELECT genre FROM songs WHERE genre IS NOT NULL AND genre != ''";
    const [results] = await promiseDb.query(query);

    const allGenres = new Set();
    results.forEach((row) => {
      // Tách chuỗi "Pop, K-Pop" thành từng phần tử
      if(row.genre) {
          row.genre.split(',').forEach(g => allGenres.add(g.trim()));
      }
    });

    res.json(Array.from(allGenres).sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
