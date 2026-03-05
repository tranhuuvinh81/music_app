//music-mobile-app/app/%28tabs%29/artists.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import api from '../../api/api';

export default function ArtistsScreen() {
  const [artistBlocks, setArtistBlocks] = useState<any[]>([]);
  const [trendingArtists, setTrendingArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      // Lưu ý: Đảm bảo route này trả về hàm getAllArtists ở Backend
      api.get("/api/artists"), 
      api.get("/api/settings/pinned_artist_ids")
    ]).then(([artistsRes, settingsRes]) => {
        const allArtists = artistsRes.data || [];
        const rawSettings = settingsRes.data || []; 
        
        let blocks: any[] = [];
        let allPinnedIds = new Set(); 

        if (Array.isArray(rawSettings) && rawSettings.length > 0) {
            if (typeof rawSettings[0] === 'object') {
                blocks = rawSettings.map((block: any) => {
                    const artistsInBlock = block.artistIds
                        .map((id: number) => allArtists.find((a: any) => a.id === id))
                        .filter(Boolean);
                    block.artistIds.forEach((id: number) => allPinnedIds.add(id));
                    return { ...block, artists: artistsInBlock };
                });
            } else {
                // Hỗ trợ mảng ID cũ nếu chưa migrate
                const pinned = allArtists.filter((artist: any) => rawSettings.includes(artist.id));
                pinned.sort((a: any, b: any) => rawSettings.indexOf(a.id) - rawSettings.indexOf(b.id));
                blocks = [{ id: 'legacy_artist', title: 'Ca sĩ "Hót"', artists: pinned }];
                rawSettings.forEach((id: number) => allPinnedIds.add(id));
            }
        }

        // Backend getAllArtists đã order by total_listens DESC, 
        // ta chỉ cần lọc bỏ các ID đã ghim và cắt lấy 20 người đầu tiên.
        const others = allArtists
            .filter((artist: any) => !allPinnedIds.has(artist.id))
            .slice(0, 20);

        setArtistBlocks(blocks);
        setTrendingArtists(others);
        setLoading(false);
    }).catch((err) => {
        console.error("Lỗi tải dữ liệu ca sĩ:", err);
        setLoading(false);
    });
  }, []);

  const getImageUrl = (url: string) => {
    if (!url) return "https://via.placeholder.com/150";
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7Ab2D3" />
        <Text style={{ marginTop: 10 }}>Đang tải danh sách ca sĩ...</Text>
      </View>
    );
  }

  // UI cho một thẻ ca sĩ dạng ngang (list)
  const renderArtistRow = (artist: any, index: number) => (
    <TouchableOpacity key={artist.id} style={styles.artistRow} activeOpacity={0.7}>
      <Text style={styles.rankNumber}>{index + 1}</Text>
      <Image source={{ uri: getImageUrl(artist.image_url) }} style={styles.artistRowImage} />
      <View style={styles.artistInfo}>
        <Text style={styles.artistName} numberOfLines={1}>{artist.name}</Text>
        <Text style={styles.artistStats}>
           {artist.total_listens ? `${artist.total_listens.toLocaleString()} lượt nghe` : 'Đang cập nhật'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // UI cho thẻ ca sĩ dạng ô vuông (grid) cho các Blocks
  const renderArtistCard = (artist: any) => (
    <TouchableOpacity key={artist.id} style={styles.artistCard} activeOpacity={0.7}>
      <Image source={{ uri: getImageUrl(artist.image_url) }} style={styles.artistCardImage} />
      <Text style={styles.artistCardName} numberOfLines={1}>{artist.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        
        {/* HIỂN THỊ CÁC KHỐI DYNAMIC BLOCKS TỪ ADMIN */}
        {artistBlocks.map((block, index) => {
          if (!block.artists || block.artists.length === 0) return null;
          return (
            <View key={block.id || index} style={styles.section}>
              <Text style={styles.headerTitle}>{block.title}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {block.artists.map(renderArtistCard)}
              </ScrollView>
            </View>
          );
        })}

        {/* HIỂN THỊ DANH SÁCH TOP TRENDING */}
        {trendingArtists.length > 0 && (
          <View style={[styles.section, { paddingBottom: 100 }]}>
            <Text style={styles.headerTitle}>Bảng xếp hạng Nghệ sĩ 🏆</Text>
            <View style={styles.listContainer}>
               {trendingArtists.map((artist, index) => renderArtistRow(artist, index))}
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f5f7fa', padding: 16 },
  section: { marginBottom: 30, marginTop: 10 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  
  // Styles cho danh sách cuộn ngang (Blocks)
  horizontalScroll: { flexDirection: 'row', overflow: 'visible' },
  artistCard: { width: 120, alignItems: 'center', marginRight: 16 },
  artistCardImage: { width: 110, height: 110, borderRadius: 55, marginBottom: 10, borderWidth: 2, borderColor: '#fff', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  artistCardName: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center' },
  
  // Styles cho danh sách dọc (Top Trending)
  listContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  artistRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  rankNumber: { width: 30, fontSize: 18, fontWeight: 'bold', color: '#7Ab2D3', textAlign: 'center', marginRight: 5 },
  artistRowImage: { width: 50, height: 50, borderRadius: 25 },
  artistInfo: { marginLeft: 15, flex: 1, justifyContent: 'center' },
  artistName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  artistStats: { fontSize: 13, color: '#888' },
});