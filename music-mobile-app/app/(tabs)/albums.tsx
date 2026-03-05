//music-mobile-app/app/%28tabs%29/albums.tsx
import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../api/api';
import { AudioContext } from '../../context/AudioContext';

// Lấy chiều rộng màn hình để chia cột
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 cột, lề 16px mỗi bên và khoảng cách giữa 2 cột 16px

export default function AlbumsScreen() {
  const router = useRouter();
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { getResourceUrl } = useContext(AudioContext);

  useEffect(() => {
    // Tải tất cả bài hát và tự động gom nhóm theo tên Album
    api.get("/api/songs")
      .then((res) => {
        const allSongs = res.data || [];
        const albumMap = new Map();

        allSongs.forEach((song: any) => {
          if (song.album && song.album.trim() !== '') {
            if (!albumMap.has(song.album)) {
              // Lấy ảnh của bài hát đầu tiên làm ảnh bìa Album
              albumMap.set(song.album, { 
                name: song.album, 
                image_url: song.image_url, 
                songCount: 1,
                listen_count: song.listen_count || 0  
              });
            } else {
              albumMap.get(song.album).songCount += 1;
              albumMap.get(song.album).listen_count += song.listen_count || 0;
            }
          }
        });

        

        // Chuyển Map thành Mảng và sắp xếp theo lượt nghe
        const albumArray = Array.from(albumMap.values());
        albumArray.sort((a, b) => b.listen_count - a.listen_count);
        setAlbums(albumArray);
        setLoading(false);

        // Lọc lấy 20 album nhiều lượt nghe nhất để hiển thị
        const topAlbums = albumArray.slice(0, 20);
        setAlbums(topAlbums);

      })
      .catch((err) => {
        console.error("Lỗi tải danh sách album:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7Ab2D3" />
        <Text style={{ marginTop: 10 }}>Đang tải danh sách Album...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.headerTitle}>Album Thịnh Hành</Text>
        
        {albums.length > 0 ? (
          <View style={styles.gridContainer}>
            {albums.map((album, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.albumCard}
                activeOpacity={0.7}
                // Nhấn vào sẽ chuyển sang trang chi tiết kèm theo tên Album
                onPress={() => router.push({ pathname: '/album-detail', params: { name: album.name, image_url: album.image_url } })}
              >
                <Image source={{ uri: getResourceUrl(album.image_url) }} style={styles.albumImage} />
                <Text style={styles.albumName} numberOfLines={1}>{album.name}</Text>
                <Text style={styles.songCount}>{album.songCount} bài hát</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.center}>
            <Text style={{ color: '#888' }}>Chưa có album nào được cập nhật.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f5f7fa', padding: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20, marginTop: 10 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  albumCard: { width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  albumImage: { width: '100%', aspectRatio: 1, borderRadius: 8, marginBottom: 10 },
  albumName: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  songCount: { fontSize: 13, color: '#7f8c8d' },
});