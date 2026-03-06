import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';
import { AudioContext } from '../../context/AudioContext';
import SongActionModal from '../../components/SongActionModal';

export default function ExploreScreen() {
  const [leaderboards, setLeaderboards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSongForModal, setSelectedSongForModal] = useState<any>(null);

  const { activeSong, isPlaying, playSong, getResourceUrl } = useContext(AudioContext);

  useEffect(() => {
    api.get('/api/songs').then(res => {
      const allSongs = res.data || [];
      const countryMap = new Map<string, any[]>();

      // Phân nhóm bài hát theo quốc gia
      allSongs.forEach((song: any) => {
        if (song.country && song.country.trim() !== '') {
          const countries = song.country.split(',').map((c: string) => c.trim()).filter(Boolean);
          countries.forEach((c: string) => {
            if (!countryMap.has(c)) {
              countryMap.set(c, []);
            }
            countryMap.get(c)?.push(song);
          });
        }
      });

      const boards: any[] = [];
      countryMap.forEach((songsList, countryName) => {
        // Sắp xếp bài hát theo lượt nghe giảm dần
        const sortedSongs = songsList.sort((a, b) => (b.listen_count || 0) - (a.listen_count || 0));
        
        // Chỉ lấy Top 5
        boards.push({
          country: countryName,
          songs: sortedSongs.slice(0, 5)
        });
      });

      // Sắp xếp các Block quốc gia theo bảng chữ cái
      boards.sort((a, b) => a.country.localeCompare(b.country));
      setLeaderboards(boards);
      setLoading(false);
    }).catch(err => {
      console.error("Lỗi tải bảng xếp hạng:", err);
      setLoading(false);
    });
  }, []);

  // Đổi màu số hạng: Top 1 (Vàng), Top 2 (Bạc), Top 3 (Đồng)
  const getRankColor = (index: number) => {
    if (index === 0) return '#ffd700';
    if (index === 1) return '#c0c0c0';
    if (index === 2) return '#cd7f32';
    return '#888';
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7Ab2D3" />
        <Text style={{marginTop: 10}}>Đang tải Bảng Xếp Hạng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Khám phá</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {leaderboards.map((board, bIndex) => (
          <View key={`board-${bIndex}`} style={styles.boardSection}>
            <Text style={styles.boardTitle}>Top {board.songs.length} - {board.country}</Text>
            
            {board.songs.map((song: any, index: number) => {
              const isThisSongPlaying = activeSong?.id === song.id;
              return (
                <View key={`song-${song.id}`} style={[styles.songCard, isThisSongPlaying && styles.songCardActive]}>
                  {/* Số thứ tự xếp hạng */}
                  <Text style={[styles.rankNumber, { color: getRankColor(index) }]}>{index + 1}</Text>
                  
                  {/* Khu vực bấm phát nhạc */}
                  <TouchableOpacity 
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => playSong(song, board.songs, index)}
                    activeOpacity={0.7}
                  >
                    <Image source={{ uri: getResourceUrl(song.image_url) }} style={styles.coverImage} />
                    <View style={styles.songInfo}>
                      <Text style={[styles.songTitle, isThisSongPlaying && { color: '#7Ab2D3' }]} numberOfLines={1}>{song.title}</Text>
                      <Text style={styles.songArtist} numberOfLines={1}>
                        {song.artists?.map((a: any) => a.name).join(', ') || 'Unknown'}
                      </Text>
                    </View>
                    {isThisSongPlaying && isPlaying && <Text style={styles.playingIndicator}>▶</Text>}
                  </TouchableOpacity>

                  {/* Nút 3 chấm mở Option */}
                  <TouchableOpacity style={{ padding: 10 }} onPress={() => setSelectedSongForModal(song)}>
                    <Ionicons name="ellipsis-vertical" size={20} color="#888" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ))}
        
        {leaderboards.length === 0 && (
          <Text style={{textAlign: 'center', color: '#888', marginTop: 50}}>Chưa có dữ liệu bài hát.</Text>
        )}
      </ScrollView>

      {/* MODAL TÙY CHỌN DÙNG CHUNG */}
      <SongActionModal 
        visible={!!selectedSongForModal} 
        song={selectedSongForModal} 
        onClose={() => setSelectedSongForModal(null)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fa' },
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: { 
    paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, 
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  
  scrollContent: { padding: 16, paddingBottom: 100 },
  boardSection: { marginBottom: 30, backgroundColor: '#fff', padding: 15, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  boardTitle: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  songCard: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center' },
  songCardActive: { backgroundColor: '#f0f9ff', borderRadius: 8 },
  rankNumber: { width: 35, fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginRight: 10 },
  coverImage: { width: 50, height: 50, borderRadius: 8 },
  songInfo: { marginLeft: 15, flex: 1, justifyContent: 'center' },
  songTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  songArtist: { fontSize: 14, color: '#7f8c8d' },
  playingIndicator: { fontSize: 16, color: '#7Ab2D3', marginRight: 10 },
});