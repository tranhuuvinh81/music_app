//music-mobile-app/app/%28tabs%29/index.tsx
import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import api from '../../api/api';
import { AudioContext } from '../../context/AudioContext';

export default function HomeScreen() {
  const [songBlocks, setSongBlocks] = useState<any[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Lấy các state và hàm điều khiển từ AudioContext toàn cục
  const { activeSong, isPlaying, playSong, getResourceUrl } = useContext(AudioContext);

  useEffect(() => {
    Promise.all([
      api.get("/api/songs"),
      api.get("/api/settings/pinned_song_ids")
    ]).then(([songsRes, settingsRes]) => {
        const allSongs = songsRes.data;
        const rawSettings = settingsRes.data || []; 
        
        let blocks: any[] = [];
        let allPinnedIds = new Set(); 

        if (Array.isArray(rawSettings) && rawSettings.length > 0) {
            if (typeof rawSettings[0] === 'object') {
                blocks = rawSettings.map((block: any) => {
                    const songsInBlock = block.songIds
                        .map((id: number) => allSongs.find((s: any) => s.id === id))
                        .filter(Boolean);
                    block.songIds.forEach((id: number) => allPinnedIds.add(id));
                    return { ...block, songs: songsInBlock };
                });
            } else {
                const pinned = allSongs.filter((song: any) => rawSettings.includes(song.id));
                pinned.sort((a: any, b: any) => rawSettings.indexOf(a.id) - rawSettings.indexOf(b.id));
                blocks = [{ id: 'legacy', title: 'Bài hát nổi bật', songs: pinned }];
                rawSettings.forEach((id: number) => allPinnedIds.add(id));
            }
        }

        const others = allSongs
            .filter((song: any) => !allPinnedIds.has(song.id))
            .sort((a: any, b: any) => (b.listen_count || 0) - (a.listen_count || 0));

        setSongBlocks(blocks);
        setTrendingSongs(others);
        setLoading(false);
    }).catch((err) => {
        console.error("Lỗi tải dữ liệu:", err);
        setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7Ab2D3" />
        <Text style={{ marginTop: 10 }}>Đang tải dữ liệu âm nhạc...</Text>
      </View>
    );
  }

  // Thêm 2 tham số: currentPlaylist và index
  const renderSongItem = (song: any, currentPlaylist: any[], index: number) => {
    const isThisSongPlaying = activeSong?.id === song.id;

    return (
      <TouchableOpacity 
        key={song.id} 
        style={[styles.songCard, isThisSongPlaying && styles.songCardActive]}
        onPress={() => playSong(song, currentPlaylist, index)} // TRUYỀN DỮ LIỆU VÀO ĐÂY
        activeOpacity={0.7}
      >
        <Image source={{ uri: getResourceUrl(song.image_url) }} style={styles.coverImage} />
        {/* ... (Các thẻ View, Text bên trong giữ nguyên) ... */}
        <View style={styles.songInfo}>
          <Text style={[styles.songTitle, isThisSongPlaying && { color: '#7Ab2D3' }]} numberOfLines={1}>{song.title}</Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {song.artists && song.artists.length > 0 ? song.artists.map((a: any) => a.name).join(', ') : 'Unknown'}
          </Text>
        </View>
        {isThisSongPlaying && isPlaying && <Text style={styles.playingIndicator}>▶</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {songBlocks.map((block, index) => {
          if (!block.songs || block.songs.length === 0) return null;
          return (
            <View key={block.id || index} style={styles.section}>
              <Text style={styles.headerTitle}>{block.title}</Text>
              {/* Sửa dòng này */}
              {block.songs.map((song: any, idx: number) => renderSongItem(song, block.songs, idx))}
            </View>
          );
        })}

        <View style={[styles.section, { paddingBottom: 100 }]}>
            <Text style={styles.headerTitle}>Có thể bạn sẽ thích 🎵</Text>
            {/* Sửa dòng này */}
            {trendingSongs.slice(0, 10).map((song: any, idx: number) => renderSongItem(song, trendingSongs, idx))}
          </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f5f7fa', padding: 16 },
  section: { marginBottom: 24, marginTop: 10 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  songCard: {
    flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 12,
    marginBottom: 12, alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, 
  },
  songCardActive: { borderColor: '#7Ab2D3', borderWidth: 1, backgroundColor: '#f0f9ff' },
  coverImage: { width: 60, height: 60, borderRadius: 8 },
  songInfo: { marginLeft: 15, flex: 1 },
  songTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  artistName: { fontSize: 14, color: '#7f8c8d' },
  playingIndicator: { fontSize: 16, color: '#7Ab2D3', marginRight: 10 }
});